interface Env {
  SESSIONS: KVNamespace;
  USERS: KVNamespace;
  DISCORD_CLIENT_ID: string;
  DISCORD_CLIENT_SECRET: string;
  FRONTEND_URL: string;
}

interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  global_name: string | null;
  avatar: string | null;
}

interface StoredUser {
  id: string;
  username: string;
  discriminator: string;
  global_name: string | null;
  avatar: string | null;
  bio: string;
  marker_id: number;
}

const DISCORD_API = 'https://discord.com/api/v10';
const DISCORD_OAUTH_URL = 'https://discord.com/api/oauth2/authorize';
const DISCORD_TOKEN_URL = 'https://discord.com/api/oauth2/token';

function corsHeaders(origin: string): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

function json(data: unknown, status = 200, extra: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...extra },
  });
}

async function randomToken(): Promise<string> {
  const buf = new Uint8Array(32);
  crypto.getRandomValues(buf);
  return Array.from(buf, b => b.toString(16).padStart(2, '0')).join('');
}

async function resolveSession(request: Request, env: Env): Promise<string | null> {
  const auth = request.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  const token = auth.slice(7).trim();
  return env.SESSIONS.get(`session:${token}`);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const frontendOrigin = new URL(env.FRONTEND_URL).origin;
    const cors = corsHeaders(frontendOrigin);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    // GET /auth/login — Discord OAuth へリダイレクト
    if (url.pathname === '/auth/login' && request.method === 'GET') {
      const params = new URLSearchParams({
        client_id: env.DISCORD_CLIENT_ID,
        redirect_uri: `${url.origin}/auth/callback`,
        response_type: 'code',
        scope: 'identify',
      });
      return Response.redirect(`${DISCORD_OAUTH_URL}?${params}`, 302);
    }

    // GET /auth/callback — コード交換 → セッション生成
    if (url.pathname === '/auth/callback' && request.method === 'GET') {
      const code = url.searchParams.get('code');
      if (!code) {
        return Response.redirect(`${env.FRONTEND_URL}?error=missing_code`, 302);
      }

      const tokenRes = await fetch(DISCORD_TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: env.DISCORD_CLIENT_ID,
          client_secret: env.DISCORD_CLIENT_SECRET,
          grant_type: 'authorization_code',
          code,
          redirect_uri: `${url.origin}/auth/callback`,
        }),
      });

      if (!tokenRes.ok) {
        const errBody = await tokenRes.text();
        console.error('Discord token exchange failed', tokenRes.status, errBody);
        return Response.redirect(`${env.FRONTEND_URL}?error=token_exchange`, 302);
      }

      const { access_token } = await tokenRes.json() as { access_token: string };

      const userRes = await fetch(`${DISCORD_API}/users/@me`, {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      if (!userRes.ok) {
        return Response.redirect(`${env.FRONTEND_URL}?error=user_fetch`, 302);
      }

      const discordUser = await userRes.json() as DiscordUser;
      const existing = await env.USERS.get(`user:${discordUser.id}`, 'json') as StoredUser | null;

      let marker_id = existing?.marker_id;
      if (!marker_id) {
        const counter = parseInt(await env.USERS.get('counter:marker') ?? '0') + 1;
        marker_id = counter;
        await env.USERS.put('counter:marker', String(counter));
        await env.USERS.put(`marker:${counter}`, discordUser.id);
      }

      const userData: StoredUser = {
        id: discordUser.id,
        username: discordUser.username,
        discriminator: discordUser.discriminator,
        global_name: discordUser.global_name,
        avatar: discordUser.avatar,
        bio: existing?.bio ?? '',
        marker_id,
      };
      await env.USERS.put(`user:${discordUser.id}`, JSON.stringify(userData));

      const sessionToken = await randomToken();
      await env.SESSIONS.put(`session:${sessionToken}`, discordUser.id, {
        expirationTtl: 60 * 60 * 24 * 30,
      });

      return Response.redirect(
        `${env.FRONTEND_URL}/callback?token=${sessionToken}`,
        302,
      );
    }

    // DELETE /auth/logout
    if (url.pathname === '/auth/logout' && request.method === 'DELETE') {
      const auth = request.headers.get('Authorization');
      if (auth?.startsWith('Bearer ')) {
        const token = auth.slice(7).trim();
        await env.SESSIONS.delete(`session:${token}`);
      }
      return json({ ok: true }, 200, cors);
    }

    // GET /api/me — 認証済みユーザーの自分のプロフィール
    if (url.pathname === '/api/me' && request.method === 'GET') {
      const discordId = await resolveSession(request, env);
      if (!discordId) return json({ error: 'Unauthorized' }, 401, cors);

      const user = await env.USERS.get(`user:${discordId}`, 'json') as StoredUser | null;
      if (!user) return json({ error: 'User not found' }, 404, cors);

      return json(user, 200, cors);
    }

    // PUT /api/me/bio — 自己紹介文を更新
    if (url.pathname === '/api/me/bio' && request.method === 'PUT') {
      const discordId = await resolveSession(request, env);
      if (!discordId) return json({ error: 'Unauthorized' }, 401, cors);

      const body = await request.json() as { bio?: unknown };
      const bio = String(body.bio ?? '').slice(0, 200);

      const user = await env.USERS.get(`user:${discordId}`, 'json') as StoredUser | null;
      if (!user) return json({ error: 'User not found' }, 404, cors);

      user.bio = bio;
      await env.USERS.put(`user:${discordId}`, JSON.stringify(user));
      return json({ ok: true }, 200, cors);
    }

    // GET /api/user/:id — 公開プロフィール
    const userMatch = url.pathname.match(/^\/api\/user\/([^/]+)$/);
    if (userMatch && request.method === 'GET') {
      const user = await env.USERS.get(`user:${userMatch[1]}`, 'json') as StoredUser | null;
      if (!user) return json({ error: 'User not found' }, 404, cors);

      return json({
        id: user.id,
        username: user.username,
        global_name: user.global_name,
        avatar: user.avatar,
        bio: user.bio,
        marker_id: user.marker_id,
      }, 200, cors);
    }

    // GET /api/marker/:id — マーカーIDからユーザーを検索
    const markerMatch = url.pathname.match(/^\/api\/marker\/(\d+)$/);
    if (markerMatch && request.method === 'GET') {
      const discordId = await env.USERS.get(`marker:${markerMatch[1]}`);
      if (!discordId) return json({ error: 'Marker not found' }, 404, cors);

      const user = await env.USERS.get(`user:${discordId}`, 'json') as StoredUser | null;
      if (!user) return json({ error: 'User not found' }, 404, cors);

      return json({
        id: user.id,
        username: user.username,
        global_name: user.global_name,
        avatar: user.avatar,
        bio: user.bio,
        marker_id: user.marker_id,
      }, 200, cors);
    }

    return new Response('Not Found', { status: 404 });
  },
};

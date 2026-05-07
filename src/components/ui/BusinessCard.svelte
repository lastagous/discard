<script lang="ts">
  import { base } from '../../lib/base.js';
  import { onMount } from 'svelte';
  import { avatarUrl, displayName, updateBio, getToken, WORKER_URL } from '../../lib/api.js';
  import type { UserProfile } from '../../lib/api.js';

  export let user: UserProfile;
  export let readonly = false;

  let qrCanvas: HTMLCanvasElement;
  let editing = false;
  let bio = user.bio ?? '';
  let saving = false;
  let saveError = '';

  $: name = displayName(user);
  $: avatar = avatarUrl(user, 256);
  $: arCameraUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${base}/ar?user=${user.id}`
    : '';

  onMount(async () => {
    if (!qrCanvas || !arCameraUrl) return;
    const QRCode = (await import('qrcode')).default;
    QRCode.toCanvas(qrCanvas, arCameraUrl, {
      width: 140,
      margin: 1,
      color: { dark: '#e0e0ff', light: '#0f0f1f' },
      errorCorrectionLevel: 'M',
    });
  });

  async function saveBio() {
    saving = true;
    saveError = '';
    const token = getToken();
    if (!token) { saveError = '再ログインしてください'; saving = false; return; }
    const ok = await updateBio(token, bio);
    if (ok) {
      user = { ...user, bio };
      editing = false;
    } else {
      saveError = '保存に失敗しました';
    }
    saving = false;
  }

  function cancelEdit() {
    bio = user.bio ?? '';
    editing = false;
    saveError = '';
  }
</script>

<!-- 名刺カード本体 -->
<div class="business-card-wrap">
  <div class="business-card scanline-overlay" role="article">
    <!-- 上部 グロウライン -->
    <div class="card-top-glow"></div>

    <!-- 左カラム: アバター -->
    <div class="card-avatar-col">
      <div class="avatar-ring">
        <img
          src={avatar}
          alt="{name} のアバター"
          class="avatar-img"
          crossorigin="anonymous"
        />
      </div>
      <!-- ステータスドット -->
      <div class="status-dot" title="Discord ユーザー"></div>
    </div>

    <!-- 右カラム: 情報 -->
    <div class="card-info-col">
      <!-- ラベル -->
      <p class="section-label mb-1">DISCORD CARD</p>

      <!-- 表示名 -->
      <h2 class="card-name">{name}</h2>
      <p class="card-handle">@{user.username}</p>

      <!-- 区切り線 -->
      <div class="card-divider"></div>

      <!-- 自己紹介 -->
      {#if !readonly && editing}
        <textarea
          bind:value={bio}
          maxlength="200"
          rows="3"
          class="input-field resize-none text-xs mb-2"
          placeholder="自己紹介を入力..."
          disabled={saving}
        ></textarea>
        {#if saveError}
          <p class="text-xs text-red mb-1">{saveError}</p>
        {/if}
        <div class="flex gap-2">
          <button class="btn-primary text-xs py-1.5 px-3" on:click={saveBio} disabled={saving}>
            {#if saving}<span class="spinner w-3 h-3"></span>{:else}保存{/if}
          </button>
          <button class="btn-ghost text-xs py-1.5 px-3" on:click={cancelEdit} disabled={saving}>
            キャンセル
          </button>
        </div>
      {:else}
        <p class="card-bio">
          {user.bio || (readonly ? '（自己紹介なし）' : '自己紹介を追加...')}
        </p>
        {#if !readonly}
          <button
            class="mt-2 text-xs text-muted hover:text-cyan transition-colors"
            on:click={() => editing = true}
          >
            ✏️ 編集
          </button>
        {/if}
      {/if}
    </div>

    <!-- 下部: AR マーカー + QR コード -->
    <div class="card-bottom">
      <div class="card-bottom-inner">
        <!-- Hiro AR マーカー -->
        <div class="marker-section">
          <p class="text-xs text-muted mb-1.5 font-mono">AR MARKER</p>
          <div class="hiro-marker-wrap">
            <img
              src="https://raw.githubusercontent.com/nicholasdcampbell/aframe-ar/master/images/hiro.png"
              alt="Hiro AR マーカー"
              class="hiro-marker-img"
            />
          </div>
          <p class="text-xs text-dim mt-1.5 text-center font-mono">No.{user.marker_id}</p>
        </div>

        <!-- 矢印 -->
        <div class="flex flex-col items-center gap-1 text-dim">
          <div class="w-px h-8 bg-gradient-to-b from-transparent via-dim to-transparent"></div>
          <p class="text-xs rotate-90 font-mono">→</p>
          <div class="w-px h-8 bg-gradient-to-b from-transparent via-dim to-transparent"></div>
        </div>

        <!-- AR カメラ QR -->
        <div class="qr-section">
          <p class="text-xs text-muted mb-1.5 font-mono">AR CAMERA URL</p>
          <div class="qr-wrap">
            <canvas bind:this={qrCanvas}></canvas>
          </div>
          <p class="text-xs text-dim mt-1.5 text-center">スキャンして AR 体験</p>
        </div>
      </div>
    </div>

    <!-- コーナーデコレーション -->
    <div class="corner corner-tl"></div>
    <div class="corner corner-tr"></div>
    <div class="corner corner-bl"></div>
    <div class="corner corner-br"></div>
  </div>
</div>

<style>
  .business-card-wrap {
    display: flex;
    justify-content: center;
  }

  .business-card {
    position: relative;
    width: 100%;
    max-width: 640px;
    background: linear-gradient(135deg, #1a1a2e 0%, #0f0f24 60%, #1a1a2e 100%);
    border: 1px solid rgba(88, 101, 242, 0.3);
    border-radius: 20px;
    padding: 28px;
    box-shadow:
      0 0 0 1px rgba(88, 101, 242, 0.15),
      0 20px 60px rgba(0, 0, 0, 0.5),
      inset 0 1px 0 rgba(255, 255, 255, 0.04);
    overflow: hidden;
    display: grid;
    grid-template-columns: auto 1fr;
    grid-template-rows: auto auto;
    gap: 20px 24px;
  }

  .card-top-glow {
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(0, 212, 255, 0.5), rgba(88, 101, 242, 0.5), transparent);
  }

  .card-avatar-col {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .avatar-ring {
    width: 88px;
    height: 88px;
    border-radius: 50%;
    padding: 3px;
    background: linear-gradient(135deg, #5865F2, #00d4ff);
    box-shadow: 0 0 20px rgba(0, 212, 255, 0.3);
    animation: glow-pulse 3s ease-in-out infinite;
  }

  .avatar-img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
    display: block;
  }

  .status-dot {
    position: absolute;
    bottom: 0; right: 0;
    width: 14px; height: 14px;
    border-radius: 50%;
    background: #57F287;
    border: 2px solid #1a1a2e;
    box-shadow: 0 0 6px rgba(87, 242, 135, 0.6);
  }

  .card-info-col {
    min-width: 0;
  }

  .card-name {
    font-size: 1.5rem;
    font-weight: 700;
    color: #ffffff;
    letter-spacing: -0.02em;
    line-height: 1.2;
    word-break: break-all;
  }

  .card-handle {
    font-size: 0.8rem;
    color: #5865F2;
    font-family: 'JetBrains Mono', monospace;
    margin-top: 2px;
  }

  .card-divider {
    height: 1px;
    background: linear-gradient(90deg, rgba(88,101,242,0.3), transparent);
    margin: 10px 0;
  }

  .card-bio {
    font-size: 0.82rem;
    color: #9999bb;
    line-height: 1.6;
    word-break: break-word;
  }

  .card-bottom {
    grid-column: 1 / -1;
    border-top: 1px solid rgba(88, 101, 242, 0.2);
    padding-top: 20px;
  }

  .card-bottom-inner {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20px;
  }

  .marker-section, .qr-section {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .hiro-marker-wrap {
    width: 100px; height: 100px;
    padding: 4px;
    background: #fff;
    border-radius: 6px;
    box-shadow: 0 0 12px rgba(0, 212, 255, 0.2);
  }

  .hiro-marker-img {
    width: 100%; height: 100%;
    display: block;
    image-rendering: pixelated;
  }

  .qr-wrap {
    padding: 4px;
    background: #0f0f1f;
    border-radius: 6px;
    border: 1px solid rgba(0, 212, 255, 0.2);
    box-shadow: 0 0 12px rgba(0, 212, 255, 0.15);
  }

  .qr-wrap canvas {
    display: block;
    border-radius: 4px;
  }

  .corner {
    position: absolute;
    width: 12px; height: 12px;
    border-color: rgba(0, 212, 255, 0.5);
    border-style: solid;
  }
  .corner-tl { top: 8px; left: 8px; border-width: 1px 0 0 1px; border-radius: 2px 0 0 0; }
  .corner-tr { top: 8px; right: 8px; border-width: 1px 1px 0 0; border-radius: 0 2px 0 0; }
  .corner-bl { bottom: 8px; left: 8px; border-width: 0 0 1px 1px; border-radius: 0 0 0 2px; }
  .corner-br { bottom: 8px; right: 8px; border-width: 0 1px 1px 0; border-radius: 0 0 2px 0; }
</style>

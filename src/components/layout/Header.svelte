<script>
  export let base = '';

  let menuOpen = false;

  function toggleMenu() {
    menuOpen = !menuOpen;
  }
</script>

<header class="fixed top-0 left-0 right-0 z-50 border-b border-border bg-bg/80 backdrop-blur-md">
  <div class="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
    <!-- ロゴ -->
    <a href="{base}/" class="flex items-center gap-2 group">
      <span class="font-mono font-bold text-lg tracking-tight">
        <span class="text-text">disc</span><span
          class="text-cyan"
          style="text-shadow: 0 0 12px rgba(0,212,255,0.5)">AR</span><span class="text-text">d</span>
      </span>
    </a>

    <!-- デスクトップナビ -->
    <nav class="hidden md:flex items-center gap-6 text-sm">
      <a href="{base}/" class="text-muted hover:text-text transition-colors">ホーム</a>
      <a href="{base}/card" class="text-muted hover:text-text transition-colors">マイ名刺</a>
      <a href="{base}/ar" class="text-cyan hover:text-text transition-colors font-medium">
        <span class="inline-block w-2 h-2 rounded-full bg-cyan animate-pulse mr-1.5"></span>AR カメラ
      </a>
    </nav>

    <!-- モバイルメニューボタン -->
    <button
      class="md:hidden p-2 text-muted hover:text-text transition-colors"
      on:click={toggleMenu}
      aria-label="メニュー"
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
        {#if menuOpen}
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
        {:else}
          <path fill-rule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
        {/if}
      </svg>
    </button>
  </div>

  <!-- モバイルメニュー -->
  {#if menuOpen}
    <nav class="md:hidden border-t border-border bg-surface px-4 py-3 flex flex-col gap-3 text-sm">
      <a href="{base}/" class="text-muted hover:text-text py-1" on:click={toggleMenu}>ホーム</a>
      <a href="{base}/card" class="text-muted hover:text-text py-1" on:click={toggleMenu}>マイ名刺</a>
      <a href="{base}/ar" class="text-cyan py-1 font-medium" on:click={toggleMenu}>AR カメラ</a>
    </nav>
  {/if}
</header>

/* 安装引导：Service Worker 注册 + Android/IOS 两套“添加到桌面”提示
 * 这个文件只做安装相关的事，不碰主页面逻辑。
 */
(function () {
  'use strict';

  /* ---------- 1. 注册 Service Worker ---------- */
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('./sw.js').then(function (reg) {
        // 发现新版本时提示一次
        reg.addEventListener('updatefound', function () {
          var sw = reg.installing;
          if (!sw) return;
          sw.addEventListener('statechange', function () {
            if (sw.state === 'installed' && navigator.serviceWorker.controller) {
              toast('新版本已就绪，下次打开生效');
            }
          });
        });
      }).catch(function (err) {
        console.warn('[PWA] Service Worker 注册失败：', err);
      });
    });
  }

  /* ---------- 2. 判断运行环境 ---------- */
  var ua = navigator.userAgent || '';
  var isIOS = /iphone|ipad|ipod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var isStandalone =
    (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
    (window.matchMedia && window.matchMedia('(display-mode: fullscreen)').matches) ||
    navigator.standalone === true;

  var KEY = 'led-install-hint-dismissed';

  /* ---------- 3. 轻量提示条 ---------- */
  function toast(msg) {
    var t = document.createElement('div');
    t.textContent = msg;
    t.style.cssText =
      'position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:9999;' +
      'background:rgba(0,0,0,.85);border:1px solid rgba(255,255,255,.15);color:#fff;' +
      'font-size:13px;padding:10px 16px;border-radius:10px;font-family:inherit;' +
      'transition:opacity .3s;pointer-events:none';
    document.body.appendChild(t);
    setTimeout(function () { t.style.opacity = '0'; }, 1600);
    setTimeout(function () { t.remove(); }, 2000);
  }

  function showBar(text, actionLabel, onAction, ms) {
    if (document.getElementById('pwa-bar')) return;
    var bar = document.createElement('div');
    bar.id = 'pwa-bar';
    bar.style.cssText =
      'position:fixed;left:12px;right:12px;bottom:calc(env(safe-area-inset-bottom) + 12px);z-index:9998;' +
      'display:flex;align-items:center;gap:10px;padding:12px 14px;border-radius:14px;' +
      'background:rgba(24,24,28,.96);border:1px solid rgba(255,255,255,.14);' +
      'color:#f2f2f5;font-size:13px;line-height:1.4;font-family:inherit;' +
      'box-shadow:0 8px 30px rgba(0,0,0,.6);opacity:0;transition:opacity .3s';

    var span = document.createElement('div');
    span.textContent = text;
    span.style.flex = '1';
    bar.appendChild(span);

    if (actionLabel && onAction) {
      var btn = document.createElement('button');
      btn.textContent = actionLabel;
      btn.style.cssText =
        'flex:0 0 auto;background:#ff3b3b;color:#111;border:0;border-radius:9px;' +
        'padding:8px 14px;font-size:13px;font-weight:700;font-family:inherit';
      btn.onclick = onAction;
      bar.appendChild(btn);
    }

    var close = document.createElement('button');
    close.textContent = '×';
    close.setAttribute('aria-label', '关闭');
    close.style.cssText =
      'flex:0 0 auto;background:none;border:0;color:#9a9aa5;font-size:20px;line-height:1;padding:0 2px';
    close.onclick = function () {
      bar.remove();
      try { localStorage.setItem(KEY, '1'); } catch (e) {}
    };
    bar.appendChild(close);

    document.body.appendChild(bar);
    requestAnimationFrame(function () { bar.style.opacity = '1'; });

    if (ms) {
      setTimeout(function () {
        if (!bar.isConnected) return;
        bar.style.opacity = '0';
        setTimeout(function () { bar.remove(); }, 300);
      }, ms);
    }
  }

  /* ---------- 4. Android：系统安装弹窗 ---------- */
  var deferredPrompt = null;

  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferredPrompt = e;
    if (isStandalone) return;
    showBar('把「LED 滚动字幕」装到桌面，离线也能用', '安装', function () {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(function (choice) {
        if (choice.outcome === 'accepted') toast('已添加到桌面');
        deferredPrompt = null;
        var b = document.getElementById('pwa-bar');
        if (b) b.remove();
      });
    }, 9000);
  });

  window.addEventListener('appinstalled', function () {
    var b = document.getElementById('pwa-bar');
    if (b) b.remove();
  });

  /* ---------- 5. iOS：没有安装 API，只能教操作 ---------- */
  function maybeShowIOSHint() {
    if (!isIOS || isStandalone) return;
    var dismissed = false;
    try { dismissed = localStorage.getItem(KEY) === '1'; } catch (e) {}
    if (dismissed) return;
    setTimeout(function () {
      showBar('想全屏使用？点底部「分享」→「添加到主屏幕」', null, null, 12000);
    }, 2500);
  }

  if (document.readyState === 'complete') maybeShowIOSHint();
  else window.addEventListener('load', maybeShowIOSHint);
})();

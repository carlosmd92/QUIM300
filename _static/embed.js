/* Incrusta los widgets interactivos (carpeta app/) y ajusta la altura de cada iframe.
   Las rutas son relativas, de modo que funcionan igual en local y publicadas. */
(function () {
  function montar() {
    document.querySelectorAll('iframe.quim-embed[data-src]').forEach(function (f) {
      if (!f.getAttribute('src')) f.setAttribute('src', f.getAttribute('data-src'));
    });
    document.querySelectorAll('a[data-pdf]').forEach(function (a) {
      a.setAttribute('href', a.getAttribute('data-pdf'));
    });
  }
  window.addEventListener('message', function (e) {
    if (!e.data || !e.data.quimH) return;
    document.querySelectorAll('iframe.quim-embed').forEach(function (f) {
      if (f.contentWindow === e.source) f.style.height = (e.data.quimH + 6) + 'px';
    });
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', montar); else montar();
})();

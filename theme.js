/* Applies the stored theme before first paint.
   Loaded blocking in <head>, not deferred, and external rather than inline
   because the CSP allows 'self' scripts but no 'unsafe-inline'. */
(function () {
  try {
    var q = new URLSearchParams(location.search).get('theme');
    if (q === 'dark' || q === 'light') localStorage.setItem('yg-theme', q);
    document.documentElement.setAttribute('data-theme', localStorage.getItem('yg-theme') || 'light');
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'light');
  }
})();

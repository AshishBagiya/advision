(function() {
  function executeScripts(container) {
    var scripts = container.querySelectorAll('script');
    scripts.forEach(function(oldScript) {
      var s = document.createElement('script');
      // Copy inline content
      if (oldScript.textContent) s.textContent = oldScript.textContent;
      // Copy attributes (e.g., src, type)
      Array.from(oldScript.attributes).forEach(function(attr) {
        s.setAttribute(attr.name, attr.value);
      });
      // Replace old script to trigger execution
      oldScript.parentNode.replaceChild(s, oldScript);
    });
  }

  function include(el) {
    var src = el.getAttribute('data-include');
    if (!src) return Promise.resolve();
    return fetch(src, { cache: 'no-cache' })
      .then(function(r) {
        if (!r.ok) throw new Error('HTTP ' + r.status + ' for ' + src);
        return r.text();
      })
      .then(function(html) {
        el.innerHTML = html;
        executeScripts(el);
      })
      .catch(function(err) {
        console.error('Include failed:', src, err);
        el.innerHTML = '<!-- include failed: ' + src + ' -->';
      });
  }

  function processIncludes() {
    var nodes = Array.from(document.querySelectorAll('[data-include]'));
    return Promise.all(nodes.map(include)).then(function() {
      // Post-include hooks (e.g., footer year)
      var yearEl = document.getElementById('year');
      if (yearEl) yearEl.textContent = new Date().getFullYear();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', processIncludes);
  } else {
    processIncludes();
  }
})();



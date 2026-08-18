(function() {
  function getPreferredTheme() {
    // Light is the default; dark applies only when explicitly chosen
    return localStorage.getItem('theme') === 'dark' ? 'dark' : 'light';
  }

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    updateToggleButton(theme);
  }

  function updateToggleButton(theme) {
    const btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.textContent = theme === 'dark' ? '☀️' : '🌙';
      btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    }
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || getPreferredTheme();
    const next = current === 'dark' ? 'light' : 'dark';
    setTheme(next);
  }

  // Set theme immediately to prevent flash
  document.documentElement.setAttribute('data-theme', getPreferredTheme());

  // Initialize when DOM is ready
  document.addEventListener('DOMContentLoaded', function() {
    updateToggleButton(getPreferredTheme());

    const btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.addEventListener('click', toggleTheme);
    }
  });
})();

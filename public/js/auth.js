const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async e => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include', // ✅ important
      });
      const data = await res.json();
      const msg = document.getElementById('loginMessage');

      if (res.ok) {
        window.location.href = '/dashboard'; // ✅ go to protected route
      } else {
        msg.textContent = data.error || 'Login failed.';
      }
    } catch (err) {
      console.error(err);
      document.getElementById('loginMessage').textContent = 'Network error. Try again.';
    }
  });
}

// Logout
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    await fetch('/api/admin/logout', { method: 'POST', credentials: 'include' });
    window.location.href = '/';
  });
}

// -------------------------
// Login Page Logic
// -------------------------
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async e => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    const msg = document.getElementById('loginMessage');

    if (res.ok) {
      // Save JWT in localStorage (or cookie)
      localStorage.setItem('token', data.token);
      window.location.href = 'dashboard.html';
    } else {
      msg.textContent = data.error;
    }
  });
}

// -------------------------
// Dashboard Page Logic
// -------------------------
const token = localStorage.getItem('token'); // JWT

async function fetchTable(endpoint, tableId) {
  if (!token) return window.location.href = 'index.html';

  const res = await fetch(`/api/admin/${endpoint}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  const tbody = document.querySelector(`#${tableId} tbody`);
  tbody.innerHTML = '';

  if (res.ok) {
    data.forEach(row => {
      const tr = document.createElement('tr');
      for (const key in row) {
        const td = document.createElement('td');
        td.textContent = row[key];
        tr.appendChild(td);
      }
      tbody.appendChild(tr);
    });
  } else {
    alert(data.error);
  }
}

// On dashboard load
if (document.getElementById('usersTable')) {
  fetchTable('users', 'usersTable');
  fetchTable('deliveries', 'deliveriesTable');
  // fetch bots, logs, locations similarly
}

// Logout
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
  });
}

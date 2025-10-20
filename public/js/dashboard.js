// dashboard.js
// ----------------------
// Secure Admin Dashboard with HttpOnly cookie auth
// ----------------------
import { apiGet } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Test access by hitting a protected endpoint (e.g., users)
    await apiGet('users'); // will throw 401 if no valid session
  } catch (err) {
    console.warn('Not authenticated or session expired:', err.message);
    window.location.href = 'index.html'; // redirect to login
    return;
  }

  // Only render tables if session is valid
  if (document.getElementById('usersTable')) {
    await renderTable('users', 'usersTable');
    await renderTable('deliveries', 'deliveriesTable');
    await renderTable('bots', 'botsTable');
    await renderTable('logs', 'logsTable');
  }

  // Logout button
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        await fetch('/api/admin/logout', { method: 'POST' });
      } catch (err) {
        console.error('Logout error:', err);
      }
      window.location.href = 'index.html';
    });
  }
});

// ----------------------
// Render Table Helper
// ----------------------
async function renderTable(endpoint, tableId) {
  try {
    const data = await apiGet(endpoint);
    const tbody = document.querySelector(`#${tableId} tbody`);
    tbody.innerHTML = '';

    data.forEach(row => {
      const tr = document.createElement('tr');
      for (const key in row) {
        const td = document.createElement('td');
        td.textContent = row[key];
        tr.appendChild(td);
      }
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error(`Error loading ${endpoint}:`, err.message);
  }
}




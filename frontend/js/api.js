const BASE = '/api';

const getToken = () => localStorage.getItem('token');
const getUser  = () => JSON.parse(localStorage.getItem('user') || 'null');

const api = async (path, options = {}) => {
  const token = getToken();
  const headers = { ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!(options.body instanceof FormData)) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.msg || data.message || data.errors?.[0]?.msg || 'Request failed');
  return data;
};

const logout = window.logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/pages/login.html';
};

const renderNav = () => {
  const user = getUser();
  const navAuth = document.getElementById('nav-auth');
  if (!navAuth) return;
  if (user) {
    navAuth.innerHTML = `
      <span style="font-size:.85rem">Hi, ${user.name}</span>
      ${user ? '<a href="/pages/post-form.html">New Post</a>' : ''}
      <button class="btn btn-outline" onclick="logout()" style="color:#fff;border-color:#fff">Logout</button>`;
  } else {
    navAuth.innerHTML = `
      <a href="/pages/login.html">Login</a>
      <a href="/pages/register.html">Register</a>`;
  }
};

const BASE_URL = '/api';

export async function get(endpoint) {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`);
    return res.json();
  } catch { return { error: 'Error de conexión' }; }
}

export async function post(endpoint, data) {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  } catch { return { error: 'Error de conexión' }; }
}

export async function put(endpoint, data) {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  } catch { return { error: 'Error de conexión' }; }
}

export async function del(endpoint) {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, { method: 'DELETE' });
    return res.json();
  } catch { return { error: 'Error de conexión' }; }
}

import { LOGIN_URL } from '../config/constants';
import { maybeDecrypt } from './fhir';

export async function doLogin(email, password) {
  const res = await fetch(LOGIN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  if (!res.ok) {
    if (res.status === 401 || res.status === 400) throw new Error('Invalid credentials. Please try again.');
    throw new Error(`Login failed (${res.status}). Please try again.`);
  }

  const raw = await res.json();
  const data = await maybeDecrypt(raw);
  const token = data.idToken || data.token || data.access_token;
  if (!token) throw new Error('Login failed: no token received.');

  const name = data.displayName || data.name || email.split('@')[0];
  localStorage.setItem('cb_token', token);
  localStorage.setItem('cb_user', name);
  localStorage.setItem('cb_email', email);
  return name;
}

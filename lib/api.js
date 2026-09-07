const BASE = 'https://celebra-production.up.railway.app';

export const getToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('celebra_token');
};

export const setToken = (t) => localStorage.setItem('celebra_token', t);
export const removeToken = () => localStorage.removeItem('celebra_token');

const req = async (method, path, body) => {
  const token = getToken();
  const res = await fetch(BASE + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error');
  return data;
};

export const api = {
  login: (email, password) => req('POST', '/auth/login', { email, password }),
  register: (email, password, name) => req('POST', '/auth/register', { email, password, name }),
  me: () => req('GET', '/auth/me'),
  updateProfile: (data) => req('PUT', '/auth/profile', data),

  getEvents: () => req('GET', '/events'),
  createEvent: (data) => req('POST', '/events', data),
  deleteEvent: (id) => req('DELETE', `/events/${id}`),

  getFriends: () => req('GET', '/friends'),
  searchFriends: (q) => req('GET', `/friends/search?q=${encodeURIComponent(q)}`),
  follow: (id) => req('POST', `/friends/${id}/follow`),
  unfollow: (id) => req('DELETE', `/friends/${id}/unfollow`),
  getBirthdays: () => req('GET', '/friends/birthdays'),

  getCollection: (id) => req('GET', `/collections/${id}`),
  contribute: (id, amount) => req('POST', `/collections/${id}/contribute`, { amount, payment_method: 'manual' }),
  checkout: (id, amount) => req('POST', `/collections/${id}/checkout`, { amount }),

  getGift: (eventId, token) => req('GET', `/gift/${eventId}${token ? '?token=' + encodeURIComponent(token) : ''}`),
  redeemGift: (eventId, data) => req('POST', `/gift/${eventId}/redeem`, data),

  getProviders: () => req('GET', '/giftcard-providers'),
  getNotifications: () => req('GET', '/notifications'),

  getCircles: () => req('GET', '/circles'),
  createCircle: (data) => req('POST', '/circles', data),
  getCircle: (id) => req('GET', `/circles/${id}`),
  addPersonToCircle: (id, data) => req('POST', `/circles/${id}/people`, data),
  joinCircle: (invite_code) => req('POST', `/circles/join/${invite_code}`),

  getSuggestedEvents: () => req('GET', '/suggested-events'),
};

export const activateSuggestedEvent = (id, suggested_amount) => req('POST', `/suggested-events/${id}/activate`, { suggested_amount });

export const deleteCircle = (id) => req('DELETE', `/circles/${id}`);
export const deleteEvent = (id) => req('DELETE', `/events/${id}`);

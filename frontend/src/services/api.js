const API_BASE = '/api';

function getAuthHeader() {
  const token = localStorage.getItem('lasdo_admin_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchSchedule(date) {
  const res = await fetch(`${API_BASE}/schedules?date=${encodeURIComponent(date)}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal memuat jadwal.');
  return data.data;
}

export async function createBooking(payload) {
  const res = await fetch(`${API_BASE}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    const error = new Error(data.message || 'Gagal membuat pesanan.');
    error.status = res.status;
    error.conflictDetails = data.conflictDetails;
    throw error;
  }
  return data;
}

export async function lookupBooking(query) {
  const res = await fetch(`${API_BASE}/bookings/lookup?q=${encodeURIComponent(query)}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Pesanan tidak ditemukan.');
  return data.data;
}

export async function adminLogin(username, password) {
  const res = await fetch(`${API_BASE}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Login gagal.');
  return data.data;
}

export async function fetchAdminBookings(filters = {}) {
  const params = new URLSearchParams();
  if (filters.status) params.append('status', filters.status);
  if (filters.payment) params.append('payment', filters.payment);
  if (filters.search) params.append('search', filters.search);
  if (filters.date) params.append('date', filters.date);

  const res = await fetch(`${API_BASE}/admin/bookings?${params.toString()}`, {
    headers: getAuthHeader(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal mengambil data pesanan.');
  return data.data;
}

export async function updateAdminBookingStatus(id, updateData) {
  const res = await fetch(`${API_BASE}/admin/bookings/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(updateData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal memperbarui status.');
  return data.data;
}

export async function fetchPricing() {
  const res = await fetch(`${API_BASE}/admin/pricing`, {
    headers: getAuthHeader(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal mengambil master tarif.');
  return data.data;
}

export async function updatePricing(pricingData) {
  const res = await fetch(`${API_BASE}/admin/pricing`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(pricingData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal memperbarui tarif.');
  return data.data;
}

export async function fetchCrowdPrediction(date, hour = null) {
  let url = `${API_BASE}/admin/crowd-prediction?date=${encodeURIComponent(date)}`;
  if (hour !== null && hour !== undefined) {
    url += `&hour=${encodeURIComponent(hour)}`;
  }
  const res = await fetch(url, {
    headers: getAuthHeader(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal memuat prediksi keramaian.');
  return data.data;
}

export async function classifyIntent(text) {
  const res = await fetch(`${API_BASE}/admin/classify-intent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify({ text }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal mengklasifikasikan pesan.');
  return data.data;
}

export async function fetchAnalytics() {
  const res = await fetch(`${API_BASE}/admin/analytics`, {
    headers: getAuthHeader(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal memuat analitik.');
  return data.data;
}

export async function sendChatMessage(message) {
  const res = await fetch(`${API_BASE}/chatbot`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal mengirim pesan.');
  return data.data;
}

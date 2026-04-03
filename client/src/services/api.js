const BASE = 'http://localhost:5000/api';

async function call(path, method = 'GET', body = null) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  const res  = await fetch(`${BASE}${path}`, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Server error');
  return data;
}

export const sendOTP            = (phone)    => call('/auth/send-otp',      'POST', { phone });
export const verifyOTP          = (payload)  => call('/auth/verify-otp',    'POST', payload);
export const getWorker          = (phone)    => call(`/auth/worker/${phone}`);
export const getPolicy          = (wId)      => call(`/policy/active/${wId}`);
export const createPolicy       = (payload)  => call('/policy/create',       'POST', payload);
export const createOrder        = (payload)  => call('/payout/create-order', 'POST', payload);
export const getClaims          = (wId)      => call(`/claims/${wId}`);
export const simulateDisruption = (zone, scenario) => call('/admin/simulate','POST',{ zone, scenario });
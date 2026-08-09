// Placeholder data for local development / design preview.
// Replace with real API calls once the backend is wired up — endpoints are
// noted next to each export below (see 01-BACKEND-PROMPT.md for full list).

export const COUNTIES = {
  Kiambu: ['Ruiru', 'Thika Town', 'Kikuyu', 'Limuru'],
  Nakuru: ['Naivasha', 'Molo', 'Njoro', 'Gilgil'],
  'Uasin Gishu': ['Turbo', 'Kesses', 'Soy'],
  Kisumu: ['Nyando', 'Muhoroni', 'Kisumu Central'],
  Machakos: ['Athi River', 'Kangundo', 'Matungulu'],
};

// GET /api/admin/dashboard/top-vets
export const vetPerformance = [
];

// GET /api/admin/dashboard/requests-by-county
export const countyRequests = [
];

// GET /api/admin/service-requests
export const recentRequests = [

];

// GET /api/admin/vets
export const vetsList = [

];

// GET /api/admin/farmers
export const farmersList = [
];

// GET /api/admin/reports/earnings-per-vet
export const earningsPerVet = [

];

// GET /api/admin/reports/earnings-by-county
export const earningsByCounty = [
];

// GET /api/service-requests/my (farmer's own requests)
export const myFarmerRequests = [
];

// GET /api/vet/requests (vet's assigned + nearby pending requests)
export const myVetRequests = [

];

// GET /api/vet/earnings
export const vetEarningsHistory = [
  
];

// GET /api/payments (farmer's payment history)
export const farmerPaymentsHistory = [
  { id: 'PAY-9001', requestId: 'REQ-3391', amount: 1500, status: 'success', receipt: 'QK7X8Y2ZP1', date: '2026-07-28T14:31:00Z' },
];

// GET /api/chat/:requestId/messages — sample thread for REQ-3402
export const sampleChatMessages = [
];

export function statusStyle(status, c) {
  return {
    completed: { bg: c.tealSoft, text: c.tealText, label: 'Completed' },
    in_progress: { bg: c.goldSoft, text: c.goldText, label: 'In progress' },
    accepted: { bg: c.goldSoft, text: c.goldText, label: 'Accepted' },
    pending: { bg: c.dangerSoft, text: c.danger, label: 'Pending' },
    suspended: { bg: c.dangerSoft, text: c.danger, label: 'Suspended' },
    approved: { bg: c.tealSoft, text: c.tealText, label: 'Approved' },
    pending_verification: { bg: c.goldSoft, text: c.goldText, label: 'Pending review' },
    success: { bg: c.tealSoft, text: c.tealText, label: 'Paid' },
    failed: { bg: c.dangerSoft, text: c.danger, label: 'Failed' },
  }[status] ?? { bg: c.surfaceHover, text: c.textMuted, label: status };
}

// GET /api/farmer/subscriptions (not yet in backend spec — add if/when subscriptions ship)
export const farmerSubscriptions = [
  
];

export function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDateTime(iso) {
  return new Date(iso).toLocaleString('en-KE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export function formatKes(amount) {
  return `KES ${amount.toLocaleString('en-KE')}`;
}

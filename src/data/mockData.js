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
  { name: 'Dr. Achieng', completed: 132 },
  { name: 'Dr. Kiptoo', completed: 118 },
  { name: 'Dr. Wanjiru', completed: 104 },
  { name: 'Dr. Otieno', completed: 97 },
  { name: 'Dr. Chebet', completed: 85 },
  { name: 'Dr. Mwangi', completed: 76 },
];

// GET /api/admin/dashboard/requests-by-county
export const countyRequests = [
  { county: 'Kiambu', count: 210 },
  { county: 'Nakuru', count: 185 },
  { county: 'Uasin Gishu', count: 160 },
  { county: 'Kisumu', count: 140 },
  { county: 'Machakos', count: 120 },
  { county: 'Meru', count: 95 },
];

// GET /api/admin/service-requests
export const recentRequests = [
  { id: 'REQ-3391', farmer: 'J. Mutua', vet: 'Dr. Achieng', county: 'Kiambu', status: 'completed', amount: 'KES 1,800' },
  { id: 'REQ-3390', farmer: 'S. Naliaka', vet: 'Dr. Kiptoo', county: 'Uasin Gishu', status: 'in_progress', amount: '—' },
  { id: 'REQ-3389', farmer: 'P. Kamau', vet: 'Dr. Wanjiru', county: 'Kiambu', status: 'accepted', amount: '—' },
  { id: 'REQ-3388', farmer: 'F. Chepkoech', vet: '—', county: 'Nakuru', status: 'pending', amount: '—' },
  { id: 'REQ-3387', farmer: 'M. Odhiambo', vet: 'Dr. Otieno', county: 'Kisumu', status: 'completed', amount: 'KES 2,200' },
];

// GET /api/admin/vets
export const vetsList = [
  { id: 'VET-01', fullName: 'Dr. Achieng', phone: '254700000001', county: 'Kiambu', subCounty: 'Ruiru', status: 'approved', completed: 132, profileImageUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzJhMmEyYSIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iNDAiIHI9IjE1IiBmaWxsPSIjNDVBNkZBIi8+PC9zdmc+' },
  { id: 'VET-02', fullName: 'Dr. Kiptoo', phone: '254700000011', county: 'Uasin Gishu', subCounty: 'Turbo', status: 'approved', completed: 118, profileImageUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzJhMmEyYSIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iNDAiIHI9IjE1IiBmaWxsPSIjNDVBNkZBIi8+PC9zdmc+' },
  { id: 'VET-03', fullName: 'Dr. Wanjiru', phone: '254700000021', county: 'Kiambu', subCounty: 'Kikuyu', status: 'approved', completed: 104, profileImageUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzJhMmEyYSIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iNDAiIHI9IjE1IiBmaWxsPSIjNDVBNkZBIi8+PC9zdmc+' },
  { id: 'VET-04', fullName: 'Dr. Otieno', phone: '254700000031', county: 'Kisumu', subCounty: 'Nyando', status: 'suspended', completed: 97, profileImageUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzJhMmEyYSIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iNDAiIHI9IjE1IiBmaWxsPSIjNDVBNkZBIi8+PC9zdmc+' },
  { id: 'VET-05', fullName: 'Dr. Chebet', phone: '254700000041', county: 'Nakuru', subCounty: 'Molo', status: 'approved', completed: 85, profileImageUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzJhMmEyYSIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iNDAiIHI9IjE1IiBmaWxsPSIjNDVBNkZBIi8+PC9zdmc+' },
  { id: 'VET-06', fullName: 'Dr. Njeri', phone: '254700000051', county: 'Machakos', subCounty: 'Athi River', status: 'pending_verification', completed: 0, profileImageUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzJhMmEyYSIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iNDAiIHI9IjE1IiBmaWxsPSIjNDVBNkZBIi8+PC9zdmc+' },
];

// GET /api/admin/farmers
export const farmersList = [
  { id: 'FARM-01', fullName: 'James Mutua', phone: '254700000002', county: 'Kiambu', subCounty: 'Ruiru', joined: '2026-03-14' },
  { id: 'FARM-02', fullName: 'Susan Naliaka', phone: '254700000012', county: 'Uasin Gishu', subCounty: 'Turbo', joined: '2026-04-02' },
  { id: 'FARM-03', fullName: 'Peter Kamau', phone: '254700000022', county: 'Kiambu', subCounty: 'Kikuyu', joined: '2026-04-19' },
  { id: 'FARM-04', fullName: 'Faith Chepkoech', phone: '254700000032', county: 'Nakuru', subCounty: 'Molo', joined: '2026-05-01' },
  { id: 'FARM-05', fullName: 'Michael Odhiambo', phone: '254700000042', county: 'Kisumu', subCounty: 'Nyando', joined: '2026-05-22' },
];

// GET /api/admin/reports/earnings-per-vet
export const earningsPerVet = [
  { fullName: 'Dr. Achieng', total: 198400 },
  { fullName: 'Dr. Kiptoo', total: 172200 },
  { fullName: 'Dr. Wanjiru', total: 151800 },
  { fullName: 'Dr. Otieno', total: 140900 },
  { fullName: 'Dr. Chebet', total: 121300 },
];

// GET /api/admin/reports/earnings-by-county
export const earningsByCounty = [
  { county: 'Kiambu', total: 312000 },
  { county: 'Nakuru', total: 264500 },
  { county: 'Uasin Gishu', total: 231800 },
  { county: 'Kisumu', total: 198700 },
  { county: 'Machakos', total: 165200 },
];

// GET /api/service-requests/my (farmer's own requests)
export const myFarmerRequests = [
  {
    id: 'REQ-3391', vetName: 'Dr. Achieng', county: 'Kiambu', subCounty: 'Ruiru',
    animalOrCropType: 'Cattle', description: 'Cow has a swollen leg and is limping.',
    status: 'completed', requestedAt: '2026-07-28T09:12:00Z',
  },
  {
    id: 'REQ-3402', vetName: 'Dr. Wanjiru', county: 'Kiambu', subCounty: 'Ruiru',
    animalOrCropType: 'Poultry', description: 'Several chickens showing signs of respiratory illness.',
    status: 'accepted', requestedAt: '2026-08-01T07:40:00Z',
  },
  {
    id: 'REQ-3405', vetName: null, county: 'Kiambu', subCounty: 'Ruiru',
    animalOrCropType: 'Maize crop', description: 'Leaves turning yellow with brown spots.',
    status: 'pending', requestedAt: '2026-08-02T06:05:00Z',
  },
];

// GET /api/vet/requests (vet's assigned + nearby pending requests)
export const myVetRequests = [
  {
    id: 'REQ-3402', farmerName: 'James Mutua', farmerPhone: '254700000002', county: 'Kiambu', subCounty: 'Ruiru',
    animalOrCropType: 'Poultry', description: 'Several chickens showing signs of respiratory illness.',
    status: 'accepted', requestedAt: '2026-08-01T07:40:00Z',
  },
  {
    id: 'REQ-3406', farmerName: 'Grace Wambui', farmerPhone: '254700000062', county: 'Kiambu', subCounty: 'Ruiru',
    animalOrCropType: 'Cattle', description: 'New calf not feeding well since birth yesterday.',
    status: 'pending', requestedAt: '2026-08-02T05:50:00Z',
  },
  {
    id: 'REQ-3391', farmerName: 'James Mutua', farmerPhone: '254700000002', county: 'Kiambu', subCounty: 'Ruiru',
    animalOrCropType: 'Cattle', description: 'Cow has a swollen leg and is limping.',
    status: 'completed', requestedAt: '2026-07-28T09:12:00Z', earned: 1500,
  },
];

// GET /api/vet/earnings
export const vetEarningsHistory = [
  { id: 'REQ-3391', farmerName: 'James Mutua', completedAt: '2026-07-28T14:30:00Z', amount: 1500 },
  { id: 'REQ-3320', farmerName: 'Susan Naliaka', completedAt: '2026-07-20T11:15:00Z', amount: 2200 },
  { id: 'REQ-3280', farmerName: 'Peter Kamau', completedAt: '2026-07-11T09:00:00Z', amount: 1800 },
];

// GET /api/payments (farmer's payment history)
export const farmerPaymentsHistory = [
  { id: 'PAY-9001', requestId: 'REQ-3391', amount: 1500, status: 'success', receipt: 'QK7X8Y2ZP1', date: '2026-07-28T14:31:00Z' },
];

// GET /api/chat/:requestId/messages — sample thread for REQ-3402
export const sampleChatMessages = [
  { id: 'M1', senderRole: 'farmer', message: 'Hi doctor, thank you for accepting. The chickens started coughing two days ago.', sentAt: '2026-08-01T07:45:00Z' },
  { id: 'M2', senderRole: 'vet', message: 'Thanks for the details. Are they eating and drinking normally?', sentAt: '2026-08-01T07:52:00Z' },
  { id: 'M3', senderRole: 'farmer', message: 'Eating less than usual, still drinking water fine.', sentAt: '2026-08-01T07:55:00Z' },
  { id: 'M4', senderRole: 'vet', message: "That sounds like it could be a respiratory infection. I'll come by this afternoon to check them.", sentAt: '2026-08-01T08:00:00Z' },
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
  {
    id: 'SUB-01', plan: 'Basic', status: 'active', price: 0,
    renewsOn: '2026-09-01', features: ['1 free request review per month', 'Standard vet matching', 'Chat support'],
  },
  {
    id: 'SUB-02', plan: 'Pro Farmer', status: 'expired', price: 500,
    renewsOn: '2026-06-15', features: ['Priority vet matching', 'Unlimited requests', 'Discounted call-out fees'],
  },
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

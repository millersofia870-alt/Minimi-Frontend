import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X, ChevronRight, Stethoscope, Star, Loader2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';
import { useSession } from '../context/SessionContext.jsx';
import { api, tryApi } from '../lib/api.js';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import { Field } from '../components/ui/Field.jsx';
import FarmerLayout from '../components/farmer/FarmerLayout.jsx';
import Pagination from '../components/ui/Pagination.jsx';
import { myFarmerRequests, vetsList, formatDateTime } from '../data/mockData.js';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'accepted', label: 'Accepted' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'completed', label: 'Completed' },
];

export default function FarmerDashboard() {
  const { c } = useTheme();
  const { user } = useSession();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [step, setStep] = useState('vets');
  const [vets, setVets] = useState([]);
  const [selectedVetId, setSelectedVetId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ animalOrCropType: '', description: '' });
  const [requests, setRequests] = useState(myFarmerRequests);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const limit = 10;

  const county = user?.county || 'Kiambu';
  const subCounty = user?.subCounty || 'Ruiru';

  useEffect(() => {
    tryApi(async () => (await api.get('/service-requests/my')).data.requests, null).then((r) => r && setRequests(r));
  }, []);

  const loadVets = async () => {
    setLoading(true);
    const found = await tryApi(
      async () => (await api.get('/vets/nearby', { params: { county, subCounty } })).data.vets,
      vetsList.filter((v) => v.status === 'approved' && v.county === county)
    );
    setVets(found);
    setLoading(false);
  };

  const open = () => {
    setShowForm(true);
    setStep('vets');
    setSelectedVetId(null);
    loadVets();
  };

  const submit = async () => {
    if (!selectedVetId || !form.animalOrCropType.trim() || !form.description.trim()) return;
    setSubmitting(true);
    const created = await tryApi(
      async () => (await api.post('/service-requests', { county, subCounty, ...form, vetId: selectedVetId })).data.request,
      { id: `REQ-${Date.now()}`, vetName: vets.find((v) => v.id === selectedVetId)?.fullName, county, subCounty, ...form, status: 'pending', requestedAt: new Date().toISOString() }
    );
    setRequests((p) => [created, ...p]);
    setSubmitting(false);
    setShowForm(false);
    setForm({ animalOrCropType: '', description: '' });
  };

  const inputStyle = { background: c.bgElevated, border: `1px solid ${c.border}`, color: c.text };

  const filtered = filter === 'all' ? requests : requests.filter((r) => r.status === filter);
  const totalPages = Math.max(1, Math.ceil(filtered.length / limit));
  const pageRequests = filtered.slice((page - 1) * limit, page * limit);

  return (
    <FarmerLayout title="My requests" subtitle="Track and manage your service requests.">
      <div className="flex justify-end -mt-2 mb-2">
        <Button variant="primary" onClick={showForm ? () => setShowForm(false) : open}>
          {showForm ? <><X size={15} /> Cancel</> : <><Plus size={15} /> Request a vet</>}
        </Button>
      </div>

      {showForm && (
        <Card className="p-5 sm:p-6 mb-6">
          {step === 'vets' ? (
            <>
              <h3 className="font-semibold">1. Choose a vet near you</h3>
              <p className="text-sm mb-4" style={{ color: c.textMuted }}>
                Approved vets in your registered area: {county} · {subCounty}
              </p>
              {loading ? (
                <div className="py-8 text-center"><Loader2 className="animate-spin inline" /></div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {vets.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVetId(v.id)}
                      className="rounded-xl p-4 text-left"
                      style={selectedVetId === v.id ? { background: c.goldSoft, border: `1px solid ${c.gold}` } : { border: `1px solid ${c.border}` }}
                    >
                      <div className="w-20 h-20 rounded-full flex items-center justify-center mb-3" style={{ background: c.tealSoft }}>
                        {v.profileImageUrl ? <img src={v.profileImageUrl} className="w-full h-full rounded-full object-cover" /> : <Stethoscope size={24} color={c.teal} />}
                      </div>
                      <p className="font-medium text-sm truncate">{v.fullName}</p>
                      <p className="text-xs" style={{ color: c.textFaint }}>{v.subCounty}</p>
                      {v.rating && <p className="text-xs mt-2 flex gap-1"><Star size={12} fill={c.gold} color={c.gold} />{v.rating}</p>}
                    </button>
                  ))}
                </div>
              )}
              {!loading && !vets.length && (
                <p className="text-sm py-5" style={{ color: c.textFaint }}>
                  No approved vets are currently available in your area.
                </p>
              )}
              <Button className="mt-4" variant="primary" disabled={!selectedVetId} onClick={() => setStep('details')}>
                Continue <ChevronRight size={15} />
              </Button>
            </>
          ) : (
            <>
              <h3 className="font-semibold mb-4">2. Request service</h3>
              <div className="mb-4">
                <Field label="Livestock / crop type" placeholder="e.g. Cattle, Poultry, Maize" value={form.animalOrCropType} onChange={(e) => setForm((f) => ({ ...f, animalOrCropType: e.target.value }))} />
              </div>
              <label className="block mb-4">
                <span className="text-xs font-semibold mb-1.5 block" style={{ color: c.textMuted }}>Describe the issue</span>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none resize-none"
                  style={inputStyle}
                />
              </label>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep('vets')}>Back</Button>
                <Button variant="primary" disabled={submitting} onClick={submit}>
                  {submitting ? <Loader2 size={15} className="animate-spin" /> : 'Send request'}
                </Button>
              </div>
            </>
          )}
        </Card>
      )}

      <Card className="overflow-hidden">
        <div className="flex items-center gap-1 p-1.5 border-b" style={{ borderColor: c.border, background: c.bgElevated }}>
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => { setFilter(f.id); setPage(1); }}
              className="px-3 py-1.5 text-xs font-medium rounded-md transition-colors"
              style={{
                background: filter === f.id ? c.border : 'transparent',
                color: filter === f.id ? c.text : c.textMuted,
              }}
              onMouseEnter={(e) => { if (filter !== f.id) e.currentTarget.style.background = c.border + '40'; }}
              onMouseLeave={(e) => { if (filter !== f.id) e.currentTarget.style.background = 'transparent'; }}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="mf-mono text-[10px] uppercase" style={{ color: c.textFaint }}>
                {['Request', 'Type', 'Vet', 'County', 'Status', 'Fee', 'Date'].map((h) => (
                  <th key={h} className="text-left font-semibold px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-sm" style={{ color: c.textFaint }}>
                    No requests match this filter.
                  </td>
                </tr>
              ) : (
                pageRequests.map((r) => (
                  <tr
                    key={r.id}
                    className="border-t hover:bg-surfaceHover transition-colors cursor-pointer"
                    style={{ borderColor: c.border }}
                    onClick={() => navigate(`/farmer/requests/${r.id}`)}
                  >
                    <td className="px-5 py-3">
                      <span className="mf-mono text-xs" style={{ color: c.textFaint }}>{r.id.substring(0, 8)}…</span>
                    </td>
                    <td className="px-5 py-3 font-medium capitalize">{r.animalOrCropType}</td>
                    <td className="px-5 py-3 text-xs" style={{ color: c.textMuted }}>{r.vetName || 'Awaiting a vet'}</td>
                    <td className="px-5 py-3 text-xs" style={{ color: c.textMuted }}>{r.county} · {r.subCounty}</td>
                    <td className="px-5 py-3"><StatusBadge status={r.status} /></td>
                    <td className="px-5 py-3 mf-mono text-xs">
                      {r.serviceFee != null ? `KES ${r.serviceFee.toLocaleString()}` : '—'}
                    </td>
                    <td className="px-5 py-3 text-xs" style={{ color: c.textFaint }}>
                      {formatDateTime(r.requestedAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-4 border-t" style={{ borderColor: c.border }}>
          <Pagination
            page={page}
            totalPages={totalPages}
            onPrevious={() => setPage((prev) => Math.max(1, prev - 1))}
            onNext={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={loading}
          />
        </div>
      </Card>
    </FarmerLayout>
  );
}

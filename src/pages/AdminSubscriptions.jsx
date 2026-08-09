import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, Power, Loader2, Search, AlertCircle, RefreshCw } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';
import { api } from '../lib/api.js';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import Pagination from '../components/ui/Pagination.jsx';
import AdminLayout from '../components/admin/AdminLayout.jsx';
import { formatDate, formatKes } from '../data/mockData.js';

export default function AdminSubscriptions() {
  const { c } = useTheme();
  const [activeTab, setActiveTab] = useState('packages'); // 'packages' | 'farmer_subscriptions'

  const [packages, setPackages] = useState([]);
  const [farmerSubs, setFarmerSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Pagination & Search for farmer subscriptions
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, limit: 10 });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Package Modal State
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [editingPkg, setEditingPkg] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', durationDays: 30 });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async (currentPage = page) => {
    setLoading(true);
    setError('');
    try {
      const [pkgRes, subRes] = await Promise.all([
        api.get('/subscriptions/packages?all=true'),
        api.get(`/subscriptions/admin/all?page=${currentPage}&limit=10`),
      ]);
      setPackages(pkgRes.data.packages || []);
      setFarmerSubs(subRes.data.subscriptions || []);
      if (subRes.data.pagination) {
        setPagination(subRes.data.pagination);
      }
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to fetch subscription data');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchData(page);
  }, [fetchData, page]);

  const openCreateModal = () => {
    setEditingPkg(null);
    setForm({ name: '', description: '', price: '', durationDays: 30 });
    setShowPackageModal(true);
  };

  const openEditModal = (pkg) => {
    setEditingPkg(pkg);
    setForm({
      name: pkg.name,
      description: pkg.description,
      price: pkg.price,
      durationDays: pkg.durationDays,
    });
    setShowPackageModal(true);
  };

  const handleSavePackage = async (e) => {
    e.preventDefault();
    if (!form.price || Number(form.price) < 1) {
      setError('Price must be at least 1 KES.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        durationDays: Number(form.durationDays),
      };

      if (editingPkg) {
        await api.patch(`/subscriptions/packages/${editingPkg.id}`, payload);
      } else {
        await api.post('/subscriptions/packages', payload);
      }

      setShowPackageModal(false);
      fetchData();
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to save subscription package');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (pkg) => {
    try {
      await api.patch(`/subscriptions/packages/${pkg.id}/toggle-active`, {
        isActive: !pkg.isActive,
      });
      fetchData();
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to toggle package state');
    }
  };

  const handleDeletePackage = async (id) => {
    if (!window.confirm('Are you sure you want to delete this subscription package?')) return;
    try {
      await api.delete(`/subscriptions/packages/${id}`);
      fetchData();
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to delete package');
    }
  };

  // Filtered Farmer Subscriptions
  const safeFarmerSubs = Array.isArray(farmerSubs) ? farmerSubs : [];
  const filteredFarmerSubs = safeFarmerSubs.filter((sub) => {
    const matchesSearch =
      (sub.farmerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sub.farmerPhone || '').includes(searchTerm) ||
      (sub.packageName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <AdminLayout title="Subscription Management" subtitle="Manage packages and view all farmer subscriptions across the platform.">
      {error && (
        <div className="mb-4 text-sm rounded-lg p-3 flex items-center gap-2" style={{ background: c.dangerSoft, color: c.danger }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex gap-2 mb-6 border-b pb-2" style={{ borderColor: c.border }}>
        <button
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
            activeTab === 'packages' ? 'bg-goldSoft text-goldText' : 'text-muted hover:text-text'
          }`}
          style={activeTab === 'packages' ? { background: c.goldSoft, color: c.goldText } : { color: c.textMuted }}
          onClick={() => setActiveTab('packages')}
        >
          Packages Management ({packages.length})
        </button>
        <button
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
            activeTab === 'farmer_subscriptions' ? 'bg-goldSoft text-goldText' : 'text-muted hover:text-text'
          }`}
          style={activeTab === 'farmer_subscriptions' ? { background: c.goldSoft, color: c.goldText } : { color: c.textMuted }}
          onClick={() => setActiveTab('farmer_subscriptions')}
        >
          All Farmer Subscriptions ({farmerSubs.length})
        </button>
      </div>

      {/* Packages Tab */}
      {activeTab === 'packages' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-semibold">Subscription Packages</h2>
            <Button variant="primary" size="sm" onClick={openCreateModal} className="flex items-center gap-1.5">
              <Plus size={16} /> Create New Package
            </Button>
          </div>

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-5 h-40 animate-pulse" />
              ))}
            </div>
          ) : packages.length === 0 ? (
            <Card className="p-8 text-center text-sm" style={{ color: c.textMuted }}>
              No subscription packages created yet. Click "Create New Package" to get started.
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {packages.map((pkg) => (
                <Card key={pkg.id} className="p-5 flex flex-col justify-between" style={{ opacity: pkg.isActive ? 1 : 0.65 }}>
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="mf-display font-semibold text-lg">{pkg.name}</h3>
                      <StatusBadge status={pkg.isActive ? 'approved' : 'suspended'} label={pkg.isActive ? 'Active' : 'Disabled'} />
                    </div>
                    <div className="mf-display text-2xl font-bold mt-2">
                      {formatKes(pkg.price)}
                      <span className="text-xs font-normal" style={{ color: c.textFaint }}> / {pkg.durationDays} days</span>
                    </div>
                    <p className="text-sm mt-3 line-clamp-3" style={{ color: c.textMuted }}>
                      {pkg.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-end gap-2 mt-6 pt-3 border-t" style={{ borderColor: c.border }}>
                    <Button
                      variant={pkg.isActive ? 'ghost' : 'outline'}
                      size="sm"
                      onClick={() => handleToggleActive(pkg)}
                      title={pkg.isActive ? 'Disable Package' : 'Enable Package'}
                    >
                      <Power size={14} color={pkg.isActive ? c.danger : c.teal} />
                      <span className="text-xs">{pkg.isActive ? 'Disable' : 'Enable'}</span>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => openEditModal(pkg)} title="Edit Package">
                      <Edit2 size={14} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeletePackage(pkg.id)} title="Delete Package">
                      <Trash2 size={14} color={c.danger} />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Farmer Subscriptions Tab */}
      {activeTab === 'farmer_subscriptions' && (
        <div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
            <div className="relative w-full sm:w-72">
              <Search size={16} className="absolute left-3 top-2.5" color={c.textFaint} />
              <input
                type="text"
                placeholder="Search farmer name, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-sm rounded-lg outline-none border"
                style={{ background: c.bgElevated, borderColor: c.border, color: c.text }}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium" style={{ color: c.textMuted }}>Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs rounded-lg px-2.5 py-1.5 outline-none border"
                style={{ background: c.bgElevated, borderColor: c.border, color: c.text }}
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="expired">Expired</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <Button variant="ghost" size="sm" onClick={fetchData} title="Refresh">
                <RefreshCw size={14} />
              </Button>
            </div>
          </div>

          <Card className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase border-b" style={{ borderColor: c.border, color: c.textFaint }}>
                <tr>
                  <th className="p-3">Farmer</th>
                  <th className="p-3">Package</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Start Date</th>
                  <th className="p-3">Expiry Date</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: c.border }}>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center">
                      <Loader2 size={24} className="animate-spin mx-auto" color={c.gold} />
                    </td>
                  </tr>
                ) : filteredFarmerSubs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-xs" style={{ color: c.textMuted }}>
                      No farmer subscriptions found.
                    </td>
                  </tr>
                ) : (
                  filteredFarmerSubs.map((sub) => (
                    <tr key={sub.id} className="hover:bg-surfaceHover transition-colors">
                      <td className="p-3">
                        <div className="font-semibold">{sub.farmerName || 'Farmer'}</div>
                        <div className="text-xs mf-mono" style={{ color: c.textFaint }}>{sub.farmerPhone}</div>
                      </td>
                      <td className="p-3">
                        <span className="font-medium">{sub.packageName}</span>
                      </td>
                      <td className="p-3 font-semibold">{formatKes(sub.amount)}</td>
                      <td className="p-3 text-xs mf-mono" style={{ color: c.textMuted }}>
                        {sub.startDate ? formatDate(sub.startDate) : '—'}
                      </td>
                      <td className="p-3 text-xs mf-mono font-medium">
                        {sub.endDate ? formatDate(sub.endDate) : '—'}
                      </td>
                      <td className="p-3">
                        <StatusBadge status={sub.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination Footer */}
            {pagination.totalPages > 1 && (
              <div className="p-4 border-t" style={{ borderColor: c.border }}>
                <Pagination
                  page={pagination.page}
                  totalPages={pagination.totalPages}
                  onPrevious={() => setPage((p) => Math.max(1, p - 1))}
                  onNext={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={loading}
                />
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Package Create / Edit Modal */}
      {showPackageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <Card className="w-full max-w-md p-6 relative">
            <h3 className="text-lg font-bold mb-4">
              {editingPkg ? 'Edit Package' : 'Create New Subscription Package'}
            </h3>
            <form onSubmit={handleSavePackage} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Package Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Pro Farmer Monthly"
                  className="w-full px-3 py-2 text-sm rounded-lg outline-none border"
                  style={{ background: c.bgElevated, borderColor: c.border, color: c.text }}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe package benefits and features..."
                  className="w-full px-3 py-2 text-sm rounded-lg outline-none border resize-none"
                  style={{ background: c.bgElevated, borderColor: c.border, color: c.text }}
                  required
                />
                <p className="text-[10px] mt-1" style={{ color: c.textFaint }}>Tip: Separate points or statements with commas (e.g. "Priority vet dispatch, Discounted fees, Farm health support")</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Price (KES)</label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="1"
                    className="w-full px-3 py-2 text-sm rounded-lg outline-none border mf-mono"
                    style={{ background: c.bgElevated, borderColor: c.border, color: c.text }}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Duration (Days)</label>
                  <input
                    type="number"
                    min="1"
                    value={form.durationDays}
                    onChange={(e) => setForm({ ...form, durationDays: e.target.value })}
                    placeholder="30"
                    className="w-full px-3 py-2 text-sm rounded-lg outline-none border mf-mono"
                    style={{ background: c.bgElevated, borderColor: c.border, color: c.text }}
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end mt-6">
                <Button type="button" variant="ghost" onClick={() => setShowPackageModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={submitting}>
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : editingPkg ? 'Update Package' : 'Create Package'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </AdminLayout>
  );
}

import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../context/ThemeContext.jsx';
import Card from '../components/ui/Card.jsx';
import AdminLayout from '../components/admin/AdminLayout.jsx';
import { earningsPerVet as initialEarningsPerVet, earningsByCounty as initialEarningsByCounty, formatKes } from '../data/mockData.js';
import { api, tryApi } from '../lib/api.js';

function dateToInputString(date) {
  return date.toISOString().slice(0, 10);
}

function dateInputToISOString(dateString, endOfDay = false) {
  const date = new Date(`${dateString}T00:00:00.000Z`);
  if (endOfDay) {
    date.setUTCHours(23, 59, 59, 999);
  }
  return date.toISOString();
}

export default function AdminReports() {
  const { c } = useTheme();
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [fromDate, setFromDate] = useState(dateToInputString(today));
  const [toDate, setToDate] = useState(dateToInputString(tomorrow));
  const [earningsPerVet, setEarningsPerVet] = useState(initialEarningsPerVet);
  const [earningsByCounty, setEarningsByCounty] = useState(initialEarningsByCounty);
  const [revenueByCounty, setRevenueByCounty] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadReports() {
      setLoading(true);
      const params = {
        from: dateInputToISOString(fromDate),
        to: dateInputToISOString(toDate, true),
      };

      const vetData = await tryApi(
        async () => (await api.get('/admin/reports/earnings-per-vet', { params })).data,
        { report: initialEarningsPerVet },
      );

      const countyData = await tryApi(
        async () => (await api.get('/admin/reports/earnings-by-county', { params })).data,
        { report: initialEarningsByCounty },
      );

      const revenueData = await tryApi(
        async () => (await api.get('/admin/reports/revenue-by-county', { params })).data,
        { report: [] },
      );

      if (!cancelled) {
        setEarningsPerVet(vetData.report ?? initialEarningsPerVet);
        setEarningsByCounty(countyData.report ?? initialEarningsByCounty);
        setRevenueByCounty(revenueData.report ?? []);
        setLoading(false);
      }
    }

    loadReports();
    return () => { cancelled = true; };
  }, [fromDate, toDate]);

  const inputStyle = { background: c.bgElevated, border: `1px solid ${c.border}`, color: c.text };

  return (
    <AdminLayout title="Reports" subtitle="Earnings breakdown, date range filters coming from the backend">
      <div className="flex flex-wrap gap-3 mb-4">
        <div>
          <label className="block text-xs uppercase tracking-wide mb-1" style={{ color: c.textFaint }}>From</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="rounded-lg px-3.5 py-2.5 text-sm outline-none"
            style={inputStyle}
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wide mb-1" style={{ color: c.textFaint }}>To</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="rounded-lg px-3.5 py-2.5 text-sm outline-none"
            style={inputStyle}
          />
        </div>
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <h3 className="font-semibold text-sm mb-4">Earnings per vet</h3>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={earningsPerVet} layout="vertical" margin={{ left: 10, right: 16, top: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={c.border} horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: c.textFaint }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="fullName" width={90} tick={{ fontSize: 11, fill: c.textMuted }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: c.bgElevated, border: `1px solid ${c.border}`, borderRadius: 8, fontSize: 12 }} cursor={{ fill: c.surfaceHover }}
                  formatter={(v) => formatKes(v)} />
                <Bar dataKey="total" radius={[0, 6, 6, 0]} fill={c.gold} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <table className="w-full text-sm mt-4">
            <tbody>
              {earningsPerVet.map((v) => (
                <tr key={v.fullName} className="border-t" style={{ borderColor: c.border }}>
                  <td className="py-2 text-sm">{v.fullName}</td>
                  <td className="py-2 text-right mf-mono text-xs font-semibold">{formatKes(v.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold text-sm mb-4">Earnings by county</h3>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={earningsByCounty} margin={{ left: -16, right: 8, top: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={c.border} vertical={false} />
                <XAxis dataKey="county" tick={{ fontSize: 10, fill: c.textFaint }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: c.textFaint }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: c.bgElevated, border: `1px solid ${c.border}`, borderRadius: 8, fontSize: 12 }} cursor={{ fill: c.surfaceHover }}
                  formatter={(v) => formatKes(v)} />
                <Bar dataKey="total" radius={[6, 6, 0, 0]} barSize={28} fill={c.teal} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <table className="w-full text-sm mt-4">
            <tbody>
              {earningsByCounty.map((v) => (
                <tr key={v.county} className="border-t" style={{ borderColor: c.border }}>
                  <td className="py-2 text-sm">{v.county}</td>
                  <td className="py-2 text-right mf-mono text-xs font-semibold">{formatKes(v.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      {/* Revenue by County — includes subscriptions */}
      <Card className="p-5">
        <h3 className="font-semibold text-sm mb-1">Revenue by County</h3>
        <p className="text-xs mb-4" style={{ color: c.textFaint }}>Includes both vet service payments and subscription payments.</p>
        {revenueByCounty.length === 0 ? (
          <p className="text-sm text-center py-6" style={{ color: c.textFaint }}>No revenue data for this period.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="mf-mono text-[10px] uppercase border-b" style={{ borderColor: c.border, color: c.textFaint }}>
                <th className="text-left py-2 pr-4">County</th>
                <th className="text-right py-2 pr-4">Vet Services</th>
                <th className="text-right py-2 pr-4">Subscriptions</th>
                <th className="text-right py-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {revenueByCounty.map((row) => (
                <tr key={row.county} className="border-t" style={{ borderColor: c.border }}>
                  <td className="py-2.5 pr-4 font-medium">{row.county}</td>
                  <td className="py-2.5 pr-4 text-right mf-mono text-xs" style={{ color: c.textMuted }}>{formatKes(row.vetServiceTotal)}</td>
                  <td className="py-2.5 pr-4 text-right mf-mono text-xs" style={{ color: c.gold }}>{formatKes(row.subscriptionTotal)}</td>
                  <td className="py-2.5 text-right mf-mono text-xs font-semibold">{formatKes(row.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </AdminLayout>
  );
}

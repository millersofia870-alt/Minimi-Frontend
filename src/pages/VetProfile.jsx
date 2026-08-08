import React from 'react';
import { User, Phone, Fingerprint, MapPin, LogOut, BadgeCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext.jsx';
import { useSession } from '../context/SessionContext.jsx';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import VetLayout from '../components/vet/VetLayout.jsx';

export default function VetProfile() {
  const { c } = useTheme();
  const { user, logout } = useSession();
  const navigate = useNavigate();

  const vet = user ?? {
    fullName: 'Dr. Achieng', phone: '254700000001', idNumber: '30000001',
    county: 'Kiambu', subCounty: 'Ruiru', status: 'approved',
  };

  const rows = [
    { icon: User, label: 'Full name', value: vet.fullName },
    { icon: Fingerprint, label: 'National ID', value: vet.idNumber },
    { icon: Phone, label: 'Phone', value: vet.phone },
    { icon: MapPin, label: 'Location', value: `${vet.county} · ${vet.subCounty}` },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <VetLayout title="Profile" subtitle="Your registered details">
      <Card className="p-6 max-w-lg">
        <div className="flex items-center gap-4 mb-6">
          {vet.passportImageUrl || vet.profileImageUrl ? (
            <img src={vet.passportImageUrl || vet.profileImageUrl} alt="Passport" className="w-20 h-20 rounded-full object-cover shrink-0" style={{ border: `2px solid ${c.teal}40` }} />
          ) : (
            <div className="w-20 h-20 rounded-full flex items-center justify-center mf-display text-2xl font-semibold shrink-0"
              style={{ background: c.tealSoft, color: c.tealText }}>
              {vet.fullName?.charAt(0) ?? 'V'}
            </div>
          )}
          <div className="min-w-0">
            <div className="font-semibold text-lg truncate">{vet.fullName}</div>
            <div className="flex items-center gap-1.5 text-xs mf-mono" style={{ color: c.textFaint }}>
              <BadgeCheck size={12} /> Vet account
            </div>
          </div>
          <div className="ml-auto shrink-0"><StatusBadge status={vet.status} /></div>
        </div>

        <div className="space-y-4">
          {rows.map((r) => (
            <div key={r.label} className="flex items-center gap-3 py-2 border-t" style={{ borderColor: c.border }}>
              <r.icon size={16} color={c.textFaint} className="shrink-0" />
              <div className="min-w-0">
                <div className="text-xs" style={{ color: c.textFaint }}>{r.label}</div>
                <div className="text-sm mf-mono">{r.value}</div>
              </div>
            </div>
          ))}
        </div>

        <Button variant="outline" className="w-full mt-6" onClick={handleLogout}>
          <LogOut size={15} /> Sign out
        </Button>
      </Card>
    </VetLayout>
  );
}

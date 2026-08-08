import React from 'react';
import { User, Phone, Fingerprint, MapPin, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext.jsx';
import { useSession } from '../context/SessionContext.jsx';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import FarmerLayout from '../components/farmer/FarmerLayout.jsx';

export default function FarmerProfile() {
  const { c } = useTheme();
  const { user, logout } = useSession();
  const navigate = useNavigate();

  // Fallback so the page still renders sensibly in the standalone/preview
  // case where no real session exists yet.
  const farmer = user ?? {
    fullName: 'James Mutua', phone: '254700000002', idNumber: '30000002', county: 'Kiambu', subCounty: 'Ruiru',
  };

  const rows = [
    { icon: User, label: 'Full name', value: farmer.fullName },
    { icon: Fingerprint, label: 'National ID', value: farmer.idNumber },
    { icon: Phone, label: 'Phone', value: farmer.phone },
    { icon: MapPin, label: 'Location', value: `${farmer.county} · ${farmer.subCounty}` },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <FarmerLayout title="Profile" subtitle="Your registered details">
      <Card className="p-6 max-w-lg">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mf-display text-xl font-semibold shrink-0"
            style={{ background: c.goldSoft, color: c.goldText }}>
            {farmer.fullName?.charAt(0) ?? 'F'}
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-lg truncate">{farmer.fullName}</div>
            <div className="text-xs mf-mono" style={{ color: c.textFaint }}>Farmer account</div>
          </div>
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
    </FarmerLayout>
  );
}

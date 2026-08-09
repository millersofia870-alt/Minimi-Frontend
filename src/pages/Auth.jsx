import React, { useState } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Leaf, Stethoscope, ShieldCheck, ArrowRight, Loader2, Camera, Upload } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';
import { useSession } from '../context/SessionContext.jsx';
import Button from '../components/ui/Button.jsx';
import Card from '../components/ui/Card.jsx';
import ThemeToggle from '../components/ui/ThemeToggle.jsx';
import { Field, SelectField } from '../components/ui/Field.jsx';
import { PhoneInput, COUNTRIES } from '../components/ui/PhoneInput.jsx';
import { COUNTIES } from '../data/mockData.js';

export default function Auth() {
  const { c } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { requestOtp, register, verifyOtp, adminLogin } = useSession();

  const initialMode = location.pathname === '/register' ? 'register' : 'login';
  const [mode, setMode] = useState(initialMode);
  const [role, setRole] = useState(searchParams.get('role') || 'farmer');
  const [otpStep, setOtpStep] = useState(false);
  const [county, setCounty] = useState('Kiambu');
  const [subCounty, setSubCounty] = useState(COUNTIES.Kiambu[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [devCode, setDevCode] = useState('');

  const [form, setForm] = useState({ fullName: '', idNumber: '', phone: '', username: '', password: '' });
  const [passportImage, setPassportImage] = useState(null);
  const [passportPreview, setPassportPreview] = useState('');
  const [code, setCode] = useState('');

  const roles = [
    { id: 'farmer', label: 'Farmer', icon: Leaf },
    { id: 'vet', label: 'Vet', icon: Stethoscope },
    { id: 'admin', label: 'Admin', icon: ShieldCheck },
  ];

  const inputStyle = { background: c.bgElevated, border: `1px solid ${c.border}`, color: c.text };
  const setField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const setPhone = (val) => setForm((f) => ({ ...f, phone: val }));

  const handleCountyChange = (val) => {
    setCounty(val);
    setSubCounty(COUNTIES[val][0]);
  };

  const handlePrimarySubmit = async () => {
    setError('');
    setLoading(true);
    try {
      const fullPhone = COUNTRIES[0].code.replace('+', '') + form.phone;
      if (mode === 'register') {
        const payload = { ...form, phone: fullPhone, county, subCounty };
        if (role === 'vet' && passportImage) {
          payload.passportImage = passportImage;
        }
        await register(role, payload);
      }
      const res = await requestOtp(role, fullPhone, form.idNumber);
      if (res?.devCode) setDevCode(res.devCode);
      setOtpStep(true);
    } catch (err) {
      setError(err?.response?.data?.error || 'Something went wrong — check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setError('');
    setLoading(true);
    try {
      const fullPhone = COUNTRIES[0].code.replace('+', '') + form.phone;
      await verifyOtp(role, fullPhone, form.idNumber, code);
      const redirect = searchParams.get('redirect');
      if (redirect) {
        const params = new URLSearchParams(searchParams);
        params.delete('redirect');
        params.delete('role');
        const qs = params.toString();
        navigate(`${redirect}${qs ? `?${qs}` : ''}`);
      } else {
        navigate(role === 'vet' ? '/vet' : '/farmer');
      }
    } catch (err) {
      setError(err?.response?.data?.error || 'Invalid or expired code.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await adminLogin(form.username, form.password);
      navigate('/admin');
    } catch (err) {
      setError(err?.response?.data?.error || 'Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mf-body min-h-screen flex flex-col" style={{ background: c.bg, color: c.text }}>
      <div className="flex items-center justify-between px-4 sm:px-6 md:px-10 py-5">
        <button onClick={() => navigate('/')} className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: c.goldSoft }}>
            <Leaf size={14} color={c.gold} />
          </div>
          <span className="mf-display font-semibold">Minimi Agri</span>
        </button>
        <ThemeToggle />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 pb-16">
        <Card className="w-full max-w-md p-6 sm:p-7 mf-fadeup">
          <div className="flex rounded-lg p-1 mb-6" style={{ background: c.bgElevated }}>
            {['login', 'register'].map((m) => (
              <button key={m} onClick={() => { setMode(m); setOtpStep(false); setError(''); navigate(`/${m}?${searchParams.toString()}`); }}
                className="flex-1 text-sm font-semibold py-2 rounded-md capitalize transition-colors"
                style={mode === m ? { background: c.surface, color: c.text, border: `1px solid ${c.border}` } : { color: c.textMuted }}>
                {m === 'login' ? 'Log in' : 'Register'}
              </button>
            ))}
          </div>

          <div className="flex gap-2 mb-6">
            {roles.map((r) => (
              <button key={r.id} onClick={() => { setRole(r.id); setOtpStep(false); setError(''); }}
                className="flex-1 flex flex-col items-center gap-1.5 rounded-lg py-2.5 text-xs font-semibold transition-colors"
                style={role === r.id
                  ? { background: r.id === 'vet' ? c.tealSoft : c.goldSoft, color: r.id === 'vet' ? c.tealText : c.goldText, border: `1px solid ${r.id === 'vet' ? c.teal : c.gold}` }
                  : { border: `1px solid ${c.border}`, color: c.textMuted }}>
                <r.icon size={15} /> {r.label}
              </button>
            ))}
          </div>

          {error && (
            <div className="mb-4 text-xs rounded-lg px-3 py-2" style={{ background: c.dangerSoft, color: c.danger }}>
              {error}
            </div>
          )}

          {role === 'admin' ? (
            <div className="space-y-4">
              <Field label="Username" placeholder="admin" value={form.username} onChange={setField('username')} />
              <Field label="Password" placeholder="••••••••" type="password" value={form.password} onChange={setField('password')} />
              <Button variant="primary" className="w-full mt-2" disabled={loading} onClick={handleAdminLogin}>
                {loading ? <Loader2 size={15} className="animate-spin" /> : <>Log in <ArrowRight size={15} /></>}
              </Button>
            </div>
          ) : !otpStep ? (
            <div className="space-y-4">
              {mode === 'register' && <Field label="Full name" placeholder="e.g. Jane Wanjiru" value={form.fullName} onChange={setField('fullName')} />}
              <Field label="National ID number" placeholder="e.g. 32145678" mono value={form.idNumber} onChange={setField('idNumber')} />
              <PhoneInput label="Phone number" placeholder="712345678" mono value={form.phone} onChange={setPhone} prefix={COUNTRIES[0].code} />
              {mode === 'register' && (
                <div className="grid grid-cols-2 gap-3">
                  <SelectField label="County" value={county} onChange={handleCountyChange} options={Object.keys(COUNTIES)} />
                  <SelectField label="Sub-county" value={subCounty} onChange={setSubCounty} options={COUNTIES[county]} />
                </div>
              )}
              {mode === 'register' && role === 'vet' && (
                <div>
                  <span className="text-xs font-semibold mb-1.5 block" style={{ color: c.textMuted }}>Passport photo</span>
                  <label className="flex flex-col items-center justify-center w-full h-28 rounded-lg cursor-pointer transition-colors" style={{ background: c.bgElevated, border: `1px dashed ${c.border}` }}>
                    {passportPreview ? (
                      <img src={passportPreview} alt="Passport preview" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <div className="flex flex-col items-center gap-1.5" style={{ color: c.textMuted }}>
                        <Upload size={20} />
                        <span className="text-xs font-medium">Click to upload passport photo</span>
                        <span className="text-[10px]" style={{ color: c.textFaint }}>JPG, PNG up to 5MB</span>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setPassportImage(file);
                        if (file) {
                          setPassportPreview(URL.createObjectURL(file));
                        } else {
                          setPassportPreview('');
                        }
                      }}
                    />
                  </label>
                </div>
              )}
              <Button variant={role === 'vet' ? 'teal' : 'primary'} className="w-full mt-2" disabled={loading} onClick={handlePrimarySubmit}>
                {loading ? <Loader2 size={15} className="animate-spin" /> : <>{mode === 'login' ? 'Send code' : 'Create account'} <ArrowRight size={15} /></>}
              </Button>
              <p className="text-xs text-center" style={{ color: c.textFaint }}>
                We'll text a 6-digit code to confirm it's you — no password needed.
              </p>
            </div>
          ) : (
            <div className="space-y-4 text-center">
              <p className="text-sm" style={{ color: c.textMuted }}>Enter the 6-digit code sent to your phone</p>
              {devCode && (
                <p className="mf-mono text-xs" style={{ color: c.goldText }}>
                  Dev mode — your code is <button className="underline" onClick={() => setCode(devCode)}>{devCode}</button>
                </p>
              )}
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                placeholder="••••••"
                className="mf-mono w-full text-center text-2xl tracking-[0.5em] rounded-lg py-3 outline-none"
                style={inputStyle}
              />
              <Button variant={role === 'vet' ? 'teal' : 'primary'} className="w-full mt-2" disabled={loading || code.length !== 6} onClick={handleVerify}>
                {loading ? <Loader2 size={15} className="animate-spin" /> : 'Verify & continue'}
              </Button>
              <button className="text-xs" style={{ color: c.textFaint }} onClick={handlePrimarySubmit} disabled={loading}>
                Resend code
              </button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

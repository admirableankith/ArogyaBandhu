import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  HeartHandshake, 
  ArrowRight, 
  Sparkles, 
  User, 
  Stethoscope, 
  Pill, 
  Shield, 
  AlertCircle 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import DisclaimerBanner from '../components/DisclaimerBanner';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();

  const handleCustomLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
  };

  const handleDemo = async (role) => {
    setError('');
    setLoading(true);
    const result = await demoLogin(role);
    setLoading(false);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
  };

  const demoAccounts = [
    {
      role: 'patient',
      title: 'Citizen / Patient',
      name: 'Sunita Devi (Rampur Village)',
      desc: 'View Ayushman ABHA Card, track pregnancy vitals, book tele-OPD.',
      badge: 'High-Risk ANC',
      icon: '👤',
      bg: 'hover:border-emerald-500 hover:bg-emerald-50/40',
      tagColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      role: 'asha',
      title: 'ASHA Sangini',
      name: 'Rekha Devi (Rampur Sector)',
      desc: 'Doorstep vitals screening, register villagers, track high-risk mothers.',
      badge: 'Field Worker',
      icon: '👩‍⚕️',
      bg: 'hover:border-pink-500 hover:bg-pink-50/40',
      tagColor: 'bg-pink-100 text-pink-800',
    },
    {
      role: 'doctor',
      title: 'Medical Officer (PHC)',
      name: 'Dr. Arvind Mishra (MBBS, DNB)',
      desc: 'Conduct teleconsultations, review vitals history, issue digital Rx.',
      badge: 'PHC Doctor',
      icon: '🩺',
      bg: 'hover:border-blue-500 hover:bg-blue-50/40',
      tagColor: 'bg-blue-100 text-blue-800',
    },
    {
      role: 'pharmacist',
      title: 'Jan Aushadhi Pharmacist',
      name: 'Manoj Sharma (Dispensary)',
      desc: 'Manage essential drugs, check low stock alerts, dispense medicines.',
      badge: 'Pharmacy Store',
      icon: '💊',
      bg: 'hover:border-amber-500 hover:bg-amber-50/40',
      tagColor: 'bg-amber-100 text-amber-800',
    },
    {
      role: 'admin',
      title: 'Chief Medical Officer',
      name: 'Dr. S. P. Verma (DHO)',
      desc: 'District health surveillance, PHC bed occupancy, emergency dispatch.',
      badge: 'District Admin',
      icon: '🏛️',
      bg: 'hover:border-purple-500 hover:bg-purple-50/40',
      tagColor: 'bg-purple-100 text-purple-800',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-emerald-50/30 to-slate-100 py-10 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-4xl mx-auto w-full space-y-8">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-500/25 mb-1">
            <HeartHandshake className="w-10 h-10" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            ArogyaBandhu
          </h1>
          <p className="text-sm sm:text-base text-slate-600 font-medium max-w-lg mx-auto">
            Ayushman Rural Healthcare, Community Health Worker Coordination & AI Triage Support Platform
          </p>
        </div>

        <DisclaimerBanner />

        {/* 1-Click Demo Profiles (Hackathon evaluation ready) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <span>Quick 1-Click Demo Logins</span>
              </h2>
              <p className="text-xs text-slate-500">Select any pre-configured role to immediately explore the system</p>
            </div>
            <span className="text-xs bg-emerald-50 text-emerald-700 font-extrabold px-3 py-1 rounded-full border border-emerald-200">
              Zero Config Demo
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {demoAccounts.map((acc) => (
              <button
                key={acc.role}
                onClick={() => handleDemo(acc.role)}
                disabled={loading}
                className={`text-left p-4 rounded-2xl border-2 border-slate-100 transition-all transform hover:-translate-y-0.5 hover:shadow-md ${acc.bg} flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{acc.icon}</span>
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${acc.tagColor}`}>
                      {acc.badge}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">{acc.title}</h3>
                  <p className="text-xs font-semibold text-slate-600 mt-0.5">{acc.name}</p>
                  <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">{acc.desc}</p>
                </div>

                <div className="mt-4 pt-2 border-t border-slate-100/60 flex items-center justify-between text-xs font-bold text-emerald-700">
                  <span>Enter as {acc.title.split(' ')[0]}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Standard Credentials Form */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 max-w-md mx-auto w-full space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 text-center">
            Or Sign In with Email / Phone
          </h3>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleCustomLogin} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email or Phone</label>
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. patient@arogya.in"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-colors shadow-md shadow-emerald-600/20 text-sm disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <div className="text-center pt-2 text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-emerald-700 hover:underline">
              Register New Citizen / ASHA Profile
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

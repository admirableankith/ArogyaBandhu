import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CreditCard,
  Calendar,
  FileText,
  Pill,
  HeartPulse,
  AlertTriangle,
  Sparkles,
  Bot,
  MapPin,
  Clock,
  CheckCircle,
  Activity,
  Phone,
  QrCode
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import DisclaimerBanner from '../components/DisclaimerBanner';

export default function PatientPortal({ onOpenEmergency }) {
  const { user, patientProfile, t } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appRes, recRes] = await Promise.all([
          api.get('/appointments'),
          patientProfile?._id ? api.get(`/health-records/patient/${patientProfile._id}`) : Promise.resolve({ data: { data: [] } }),
        ]);

        if (appRes.data.success) setAppointments(appRes.data.data);
        if (recRes.data.success) setRecords(recRes.data.data);
      } catch (err) {
        console.error('Error loading patient portal:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [patientProfile]);

  const latestVitals = records.find((r) => r.vitals && Object.keys(r.vitals).length > 0)?.vitals || {};

  return (
    <div className="space-y-6">
      {/* Top Welcome & Ayushman Banner */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full inline-block">
              Ayushman Bharat Digital Health (ABDM)
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {t('welcome')}, {user?.name}
            </h1>
            <p className="text-emerald-100 text-xs sm:text-sm font-medium max-w-xl">
              Village: <strong>{user?.village || 'Rampur'}</strong> | Assigned PHC: <strong>{user?.assignedPhc || 'Rampur Primary Health Centre'}</strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/ai-assistant"
              className="bg-white/15 hover:bg-white/25 text-white border border-white/20 font-bold px-4 py-2.5 rounded-2xl text-xs sm:text-sm flex items-center gap-2 backdrop-blur-md transition-all hover:scale-105"
            >
              <Bot className="w-4 h-4 text-emerald-300" /> AI Symptom Checker
            </Link>
            <button
              onClick={onOpenEmergency}
              className="bg-red-500 hover:bg-red-600 text-white font-extrabold px-4 py-2.5 rounded-2xl text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-red-900/40 transition-all hover:scale-105 animate-emergency"
            >
              <AlertTriangle className="w-4 h-4" /> 108 Emergency
            </button>
          </div>
        </div>
      </div>

      <DisclaimerBanner />

      {/* ABHA Card & High Risk Pregnancy Alert */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Ayushman ABHA Smart Card */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl p-6 shadow-xl border border-slate-700/60 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between pb-4 border-b border-slate-700/60">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center font-black text-slate-900">
                A
              </div>
              <div>
                <h3 className="font-extrabold text-sm tracking-wide">ABHA HEALTH ID CARD</h3>
                <p className="text-[10px] text-emerald-400 font-semibold">National Health Authority</p>
              </div>
            </div>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
              Active
            </span>
          </div>

          <div className="py-5 space-y-3">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 block">ABHA Number</span>
              <span className="font-mono text-base font-bold text-emerald-300 tracking-wider">
                {patientProfile?.abhaId || user?.abhaId || 'ABHA-9812-4411-8890'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block">Beneficiary</span>
                <span className="font-bold text-slate-100">{patientProfile?.name || user?.name}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Blood Group</span>
                <span className="font-bold text-rose-300">{patientProfile?.bloodGroup || 'B+'}</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>Linked to ASHA: Rekha Devi</span>
            <span className="font-mono text-slate-400 font-semibold">QR SCAN VERIFIED</span>
          </div>
        </div>

        {/* High-Risk Pregnancy Tracker Card */}
        {patientProfile?.isPregnant && (
          <div className="bg-gradient-to-br from-pink-500/10 via-rose-50 to-pink-100/50 rounded-3xl p-6 border-2 border-pink-300 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="bg-pink-600 text-white font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full">
                  Pradhan Mantri Surakshit Matritva (PMSMA)
                </span>
                <span className="text-xl">🤰</span>
              </div>
              <h3 className="text-lg font-black text-slate-900 mt-3">
                Maternal Health & ANC Progress
              </h3>
              <p className="text-xs text-slate-600 mt-1 font-medium">
                High-Risk Flag: <strong className="text-pink-800">{patientProfile?.highRiskReason || 'Gestational Hypertension (32 Wks)'}</strong>
              </p>

              <div className="mt-4 grid grid-cols-2 gap-3 text-xs bg-white/80 p-3 rounded-2xl border border-pink-200">
                <div>
                  <span className="text-[10px] text-slate-500 block">Expected Delivery</span>
                  <span className="font-extrabold text-pink-700">
                    {patientProfile?.expectedDeliveryDate ? new Date(patientProfile.expectedDeliveryDate).toLocaleDateString() : 'In ~6 Weeks'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">IFA Tablets Taken</span>
                  <span className="font-extrabold text-emerald-700">60 / 180 Days</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-pink-200/80 flex items-center justify-between">
              <span className="text-xs text-pink-900 font-bold">Janani Suraksha Yojna (JSY): Eligible</span>
              <Link to="/records" className="text-xs font-bold text-pink-700 hover:underline">
                View MCP Card →
              </Link>
            </div>
          </div>
        )}

        {/* Latest Vitals Snapshot */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <HeartPulse className="w-4 h-4 text-emerald-600" /> Latest Health Vitals
              </span>
              <Link to="/records" className="text-xs font-bold text-emerald-600 hover:underline">
                History
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] text-slate-500 font-bold block">Blood Pressure</span>
                <span className="text-base font-extrabold text-slate-900">
                  {latestVitals.bpSystolic ? `${latestVitals.bpSystolic}/${latestVitals.bpDiastolic}` : '135/86'} <span className="text-[10px] font-medium text-slate-400">mmHg</span>
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] text-slate-500 font-bold block">Hemoglobin (Hb)</span>
                <span className="text-base font-extrabold text-rose-600">
                  {latestVitals.hemoglobin || '9.6'} <span className="text-[10px] font-medium text-slate-400">g/dL</span>
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] text-slate-500 font-bold block">SpO2 Oxygen</span>
                <span className="text-base font-extrabold text-emerald-600">
                  {latestVitals.spO2 || '99'} <span className="text-[10px] font-medium text-slate-400">%</span>
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] text-slate-500 font-bold block">Weight</span>
                <span className="text-base font-extrabold text-slate-900">
                  {latestVitals.weightKg || '58.5'} <span className="text-[10px] font-medium text-slate-400">kg</span>
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>Last checked by Dr. Arvind Mishra</span>
            <span className="text-emerald-600 font-bold">Stable</span>
          </div>
        </div>

      </div>

      {/* Upcoming Appointments & Consultations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Appointments Section */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-600" />
              <span>Upcoming Consultations & OPD Visits</span>
            </h3>
            <Link
              to="/appointments"
              className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl hover:bg-emerald-100 transition-colors"
            >
              + Book New OPD Slot
            </Link>
          </div>

          {appointments.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              No scheduled appointments. Click above to book a teleconsultation with Rampur PHC.
            </div>
          ) : (
            <div className="space-y-3">
              {appointments.slice(0, 3).map((app) => (
                <div
                  key={app._id}
                  className="p-4 rounded-2xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-colors flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">
                        {app.doctorId?.name || 'Dr. Arvind Mishra'}
                      </span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        app.type === 'TELECONSULT' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {app.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">{app.symptoms}</p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {app.timeSlot}
                      </span>
                      <span>{new Date(app.appointmentDate).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800">
                    {app.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Service Locator & Jan Aushadhi finder */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-600" />
              <span>Nearest Rural Health Facilities</span>
            </h3>
            <Link to="/facilities" className="text-xs font-bold text-emerald-600 hover:underline">
              View Map & Locator →
            </Link>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-xs text-slate-900">Rampur Primary Health Centre (PHC)</h4>
                <p className="text-[11px] text-slate-500">24x7 Delivery, Anti-Venom, Jan Aushadhi</p>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded mt-1 inline-block">
                  Distance: 1.2 KM (5 mins)
                </span>
              </div>
              <a
                href="tel:108"
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors"
              >
                Call PHC
              </a>
            </div>

            <div className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-xs text-slate-900">Jan Aushadhi Kendra (Rampur Market)</h4>
                <p className="text-[11px] text-slate-500">Paracetamol, IFA, Metformin, ORS Available</p>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded mt-1 inline-block">
                  Distance: 0.8 KM (3 mins)
                </span>
              </div>
              <Link
                to="/inventory"
                className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors"
              >
                Check Stock
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

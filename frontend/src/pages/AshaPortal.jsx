import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Users,
  HeartPulse,
  Plus,
  AlertTriangle,
  Search,
  CheckCircle,
  FileText,
  Activity,
  Calendar,
  Sparkles,
  Phone,
  Baby,
  Stethoscope
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import DisclaimerBanner from '../components/DisclaimerBanner';

export default function AshaPortal() {
  const { user } = useAuth();
  const location = useLocation();
  const [patients, setPatients] = useState([]);
  const [highRiskCohort, setHighRiskCohort] = useState({ highRiskMothers: [], chronicPatients: [] });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(
    location.pathname.includes('screening') ? 'screening' : 'registry'
  ); // 'registry', 'screening', 'high-risk'

  useEffect(() => {
    if (location.pathname.includes('screening')) {
      setActiveTab('screening');
    } else if (location.pathname.includes('registry')) {
      setActiveTab('registry');
    }
  }, [location.pathname]);

  // Screening form state
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [bpSystolic, setBpSystolic] = useState('');
  const [bpDiastolic, setBpDiastolic] = useState('');
  const [bloodSugar, setBloodSugar] = useState('');
  const [spO2, setSpO2] = useState('98');
  const [pulseRate, setPulseRate] = useState('76');
  const [hemoglobin, setHemoglobin] = useState('11.5');
  const [weightKg, setWeightKg] = useState('55');
  const [symptoms, setSymptoms] = useState('');
  const [screeningSuccess, setScreeningSuccess] = useState('');
  const [savingScreening, setSavingScreening] = useState(false);

  // New Patient Registration State
  const [showNewPatientModal, setShowNewPatientModal] = useState(false);
  const [newPatient, setNewPatient] = useState({
    name: '',
    age: '',
    gender: 'Female',
    phone: '',
    village: 'Rampur',
    bloodGroup: 'B+',
    isPregnant: false,
    expectedDeliveryDate: '',
    chronicConditions: '',
  });

  const fetchData = async () => {
    try {
      const [pRes, cohortRes] = await Promise.all([
        api.get(`/patients?search=${encodeURIComponent(search)}`),
        api.get('/patients/cohorts/high-risk'),
      ]);

      if (pRes.data.success) setPatients(pRes.data.data);
      if (cohortRes.data.success) setHighRiskCohort(cohortRes.data.data);
    } catch (err) {
      console.error('Error fetching ASHA portal data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search]);

  const handleScreeningSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPatientId) {
      alert('Please select a patient to record screening vitals.');
      return;
    }

    setSavingScreening(true);
    setScreeningSuccess('');

    try {
      const payload = {
        patientId: selectedPatientId,
        recordType: 'VITALS',
        vitals: {
          bpSystolic: Number(bpSystolic),
          bpDiastolic: Number(bpDiastolic),
          bloodSugar: bloodSugar ? Number(bloodSugar) : undefined,
          sugarType: 'Random',
          pulseRate: Number(pulseRate),
          spO2: Number(spO2),
          hemoglobin: Number(hemoglobin),
          weightKg: Number(weightKg),
        },
        clinicalNotes: {
          symptoms: symptoms || 'Routine doorstep community screening by ASHA Sangini',
          recommendations: 'Advised balanced diet, clean water, and timely PHC immunization.',
        },
      };

      const res = await api.post('/health-records', payload);
      if (res.data.success) {
        setScreeningSuccess('Doorstep vitals saved to Ayushman EMR! Database updated.');
        // Reset
        setBpSystolic('');
        setBpDiastolic('');
        setBloodSugar('');
        setSymptoms('');
        fetchData();
      }
    } catch (err) {
      alert('Failed to save screening: ' + (err.response?.data?.message || err.message));
    } finally {
      setSavingScreening(false);
    }
  };

  const handleCreatePatient = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/patients', {
        ...newPatient,
        age: Number(newPatient.age),
        chronicConditions: newPatient.chronicConditions
          ? newPatient.chronicConditions.split(',').map((s) => s.trim())
          : [],
      });

      if (res.data.success) {
        alert('Patient registered successfully in Gram Panchayat Health Register!');
        setShowNewPatientModal(false);
        setNewPatient({
          name: '',
          age: '',
          gender: 'Female',
          phone: '',
          village: 'Rampur',
          bloodGroup: 'B+',
          isPregnant: false,
          expectedDeliveryDate: '',
          chronicConditions: '',
        });
        fetchData();
      }
    } catch (err) {
      alert('Registration failed: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-pink-700 via-rose-700 to-pink-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="bg-white/20 text-pink-100 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full inline-block mb-2">
            National Health Mission (NHM) • ASHA Sangini Field Station
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            {user?.name}
          </h1>
          <p className="text-xs sm:text-sm text-pink-100 mt-1">
            Assigned Village Sector: <strong>Rampur Gram Panchayat (2,400 Population)</strong>
          </p>
        </div>

        <button
          onClick={() => setShowNewPatientModal(true)}
          className="bg-white text-pink-700 hover:bg-pink-50 font-black px-4 py-3 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" /> Register New Villager
        </button>
      </div>

      <DisclaimerBanner />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Village Registry"
          value={patients.length}
          subtitle="Registered Villagers"
          icon={Users}
          color="emerald"
        />
        <StatCard
          title="High-Risk Mothers (ANC)"
          value={highRiskCohort.highRiskMothers?.length || 1}
          subtitle="Flagged for institutional delivery"
          icon={Baby}
          color="rose"
        />
        <StatCard
          title="Chronic NCD Patients"
          value={highRiskCohort.chronicPatients?.length || 2}
          subtitle="Diabetes & BP Monitoring"
          icon={HeartPulse}
          color="amber"
        />
        <StatCard
          title="ASHA Drug Kit"
          value="12 Items"
          subtitle="ORS, IFA, PCM, Zinc in stock"
          icon={Activity}
          color="blue"
        />
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('registry')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'registry'
              ? 'bg-pink-600 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Village Health Register ({patients.length})
        </button>
        <button
          onClick={() => setActiveTab('screening')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'screening'
              ? 'bg-pink-600 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Doorstep Vitals Screening Form
        </button>
        <button
          onClick={() => setActiveTab('high-risk')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'high-risk'
              ? 'bg-pink-600 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          High-Risk Pregnancy Cohort ({highRiskCohort.highRiskMothers?.length || 0})
        </button>
      </div>

      {/* TAB 1: Village Health Registry */}
      {activeTab === 'registry' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Users className="w-5 h-5 text-pink-600" />
              <span>Rampur Village Citizen Registry</span>
            </h3>

            <div className="relative max-w-xs w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, phone, ABHA..."
                className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-pink-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider">
                  <th className="p-3">Villager Name & ABHA</th>
                  <th className="p-3">Age / Gender</th>
                  <th className="p-3">Village</th>
                  <th className="p-3">Health Status</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3 text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {patients.map((pat) => (
                  <tr key={pat._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{pat.name}</div>
                      <div className="font-mono text-[10px] text-slate-400">{pat.abhaId || 'ABHA-NOT-SET'}</div>
                    </td>
                    <td className="p-3 font-semibold text-slate-600">
                      {pat.age} yrs • {pat.gender}
                    </td>
                    <td className="p-3 text-slate-600">{pat.village}</td>
                    <td className="p-3">
                      {pat.isHighRisk ? (
                        <span className="bg-rose-100 text-rose-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-rose-200">
                          High Risk: {pat.highRiskReason || 'Monitor'}
                        </span>
                      ) : pat.isPregnant ? (
                        <span className="bg-pink-100 text-pink-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                          Pregnant (ANC Active)
                        </span>
                      ) : (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                          Routine Healthy
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-slate-600 font-mono">{pat.phone || 'N/A'}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => {
                          setSelectedPatientId(pat._id);
                          setActiveTab('screening');
                        }}
                        className="bg-pink-50 hover:bg-pink-100 text-pink-700 font-bold px-3 py-1.5 rounded-xl text-xs transition-colors"
                      >
                        Record Vitals
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Doorstep Screening Entry */}
      {activeTab === 'screening' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 max-w-3xl">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <HeartPulse className="w-5 h-5 text-pink-600" />
              <span>Doorstep Health & Vitals Screening (ASHA NCD App)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter non-invasive screening vitals taken during your village doorstep rounds. Automatic high-risk triggers apply.
            </p>
          </div>

          {screeningSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>{screeningSuccess}</span>
            </div>
          )}

          <form onSubmit={handleScreeningSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Select Patient / Villager</label>
              <select
                required
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-pink-500 focus:outline-none bg-white"
              >
                <option value="">-- Choose Patient from Rampur Registry --</option>
                {patients.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} ({p.age}y {p.gender}) - {p.village} [{p.abhaId}]
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Blood Pressure (Systolic / Diastolic mmHg)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    required
                    value={bpSystolic}
                    onChange={(e) => setBpSystolic(e.target.value)}
                    placeholder="120"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-pink-500"
                  />
                  <span className="text-slate-400 font-bold">/</span>
                  <input
                    type="number"
                    required
                    value={bpDiastolic}
                    onChange={(e) => setBpDiastolic(e.target.value)}
                    placeholder="80"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Blood Sugar (Random mg/dL)</label>
                <input
                  type="number"
                  value={bloodSugar}
                  onChange={(e) => setBloodSugar(e.target.value)}
                  placeholder="e.g. 110"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-pink-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Hemoglobin (Hb g/dL)</label>
                <input
                  type="number"
                  step="0.1"
                  value={hemoglobin}
                  onChange={(e) => setHemoglobin(e.target.value)}
                  placeholder="e.g. 11.5"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-pink-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">SpO2 Oxygen (%)</label>
                <input
                  type="number"
                  value={spO2}
                  onChange={(e) => setSpO2(e.target.value)}
                  placeholder="98"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-pink-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Weight (kg)</label>
                <input
                  type="number"
                  step="0.5"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  placeholder="55"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-pink-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Observed Symptoms / High Risk Notes</label>
              <textarea
                rows={2}
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="e.g. Complaining of dizziness, mild swelling on feet, missed IFA tablets..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={savingScreening}
              className="w-full bg-pink-600 hover:bg-pink-700 text-white font-black py-3 rounded-xl transition-colors shadow-md shadow-pink-600/20 text-sm disabled:opacity-50"
            >
              {savingScreening ? 'Saving to Database...' : 'Save Doorstep Vitals & Check Red Flags'}
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: High-Risk Cohort */}
      {activeTab === 'high-risk' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              <span>High-Risk Maternal & NCD Cohort (Priority Tracking)</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {highRiskCohort.highRiskMothers?.map((mother) => (
              <div
                key={mother._id}
                className="p-4 rounded-2xl border-2 border-rose-200 bg-rose-50/50 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900 text-sm">{mother.name}</span>
                  <span className="bg-rose-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full">
                    HIGH RISK ANC
                  </span>
                </div>
                <p className="text-xs text-rose-900 font-semibold">{mother.highRiskReason}</p>
                <div className="text-[11px] text-slate-600 grid grid-cols-2 gap-2 pt-1 border-t border-rose-100">
                  <div>EDD: <strong>{mother.expectedDeliveryDate ? new Date(mother.expectedDeliveryDate).toLocaleDateString() : 'Next Month'}</strong></div>
                  <div>Phone: <strong>{mother.phone}</strong></div>
                </div>
              </div>
            ))}

            {highRiskCohort.chronicPatients?.map((patient) => (
              <div
                key={patient._id}
                className="p-4 rounded-2xl border border-amber-200 bg-amber-50/40 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{patient.name}</span>
                  <span className="bg-amber-500 text-white font-bold text-[10px] px-2 py-0.5 rounded-full">
                    CHRONIC NCD
                  </span>
                </div>
                <p className="text-xs text-slate-700">Conditions: {patient.chronicConditions?.join(', ')}</p>
                <div className="text-[11px] text-slate-500 pt-1 border-t border-amber-100">
                  Village: <strong>{patient.village}</strong> | Phone: <strong>{patient.phone}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Patient Registration Modal */}
      {showNewPatientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-lg font-black text-slate-900">Register New Villager</h3>
            <form onSubmit={handleCreatePatient} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={newPatient.name}
                    onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border text-xs"
                    placeholder="Name"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Age</label>
                  <input
                    type="number"
                    required
                    value={newPatient.age}
                    onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border text-xs"
                    placeholder="Age"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Gender</label>
                  <select
                    value={newPatient.gender}
                    onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border text-xs bg-white"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Phone</label>
                  <input
                    type="tel"
                    value={newPatient.phone}
                    onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border text-xs"
                    placeholder="10-digit phone"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="pregCheck"
                  checked={newPatient.isPregnant}
                  onChange={(e) => setNewPatient({ ...newPatient, isPregnant: e.target.checked })}
                  className="rounded text-pink-600 focus:ring-pink-500 w-4 h-4"
                />
                <label htmlFor="pregCheck" className="text-xs font-bold text-slate-700">
                  Currently Pregnant (ANC Beneficiary)
                </label>
              </div>

              {newPatient.isPregnant && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Expected Delivery Date (EDD)</label>
                  <input
                    type="date"
                    value={newPatient.expectedDeliveryDate}
                    onChange={(e) => setNewPatient({ ...newPatient, expectedDeliveryDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border text-xs"
                  />
                </div>
              )}

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowNewPatientModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-pink-600 hover:bg-pink-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-md"
                >
                  Save & Generate ABHA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

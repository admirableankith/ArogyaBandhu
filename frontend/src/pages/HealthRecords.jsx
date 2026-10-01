import React, { useState, useEffect } from 'react';
import {
  FileText,
  HeartPulse,
  Pill,
  Baby,
  Activity,
  Plus,
  Calendar,
  User,
  ShieldCheck,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import DisclaimerBanner from '../components/DisclaimerBanner';

export default function HealthRecords() {
  const { user, patientProfile } = useAuth();
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState(patientProfile?._id || '');
  const [records, setRecords] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Load patients list if health worker
  useEffect(() => {
    const fetchPatients = async () => {
      if (user?.role !== 'patient') {
        try {
          const res = await api.get('/patients');
          if (res.data.success && res.data.data.length > 0) {
            setPatients(res.data.data);
            if (!selectedPatientId) {
              setSelectedPatientId(res.data.data[0]._id);
            }
          }
        } catch (err) {
          console.error('Error fetching patients:', err);
        }
      } else if (patientProfile?._id) {
        setSelectedPatientId(patientProfile._id);
      }
    };
    fetchPatients();
  }, [user, patientProfile]);

  // Fetch health records when selected patient changes
  useEffect(() => {
    const fetchRecords = async () => {
      if (!selectedPatientId) return;
      setLoading(true);
      try {
        const typeQuery = activeTab === 'ALL' ? '' : `?type=${activeTab}`;
        const res = await api.get(`/health-records/patient/${selectedPatientId}${typeQuery}`);
        if (res.data.success) {
          setRecords(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching records:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, [selectedPatientId, activeTab]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="bg-white/20 text-emerald-200 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full inline-block mb-2">
            Ayushman Bharat Digital Health Records (ABDM EMR)
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Patient Electronic Health Records
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100 mt-1">
            Vitals timelines, maternal ANC checkup logs, digital prescriptions & Universal Immunization cards.
          </p>
        </div>

        {/* Patient Picker for Doctors/ASHAs */}
        {user?.role !== 'patient' && (
          <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-700 max-w-xs w-full">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Select Patient Record
            </label>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="w-full bg-slate-800 text-white text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {patients.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} ({p.village}) [{p.abhaId}]
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <DisclaimerBanner />

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        {[
          { key: 'ALL', label: 'All Records', icon: FileText },
          { key: 'VITALS', label: 'Vitals History', icon: HeartPulse },
          { key: 'PRESCRIPTION', label: 'Prescriptions', icon: Pill },
          { key: 'ANC_CHECKUP', label: 'Maternal ANC', icon: Baby },
          { key: 'IMMUNIZATION', label: 'Child Immunizations', icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all ${
                activeTab === tab.key
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Records Timeline */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-16 text-xs text-slate-400">Loading medical records...</div>
        ) : records.length === 0 ? (
          <div className="text-center py-16 text-xs text-slate-400 bg-white rounded-3xl border border-slate-200">
            No health records recorded under this category yet.
          </div>
        ) : (
          records.map((rec) => (
            <div
              key={rec._id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className={`p-2 rounded-xl text-xs font-bold ${
                    rec.recordType === 'ANC_CHECKUP'
                      ? 'bg-pink-100 text-pink-800'
                      : rec.recordType === 'PRESCRIPTION'
                      ? 'bg-blue-100 text-blue-800'
                      : rec.recordType === 'IMMUNIZATION'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {rec.recordType.replace(/_/g, ' ')}
                  </span>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      Recorded by {rec.recordedBy?.name || 'Healthcare Worker'} ({rec.recordedByRole?.toUpperCase()})
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      Facility / Sector: {rec.recordedBy?.assignedPhc || 'Rampur PHC'}
                    </span>
                  </div>
                </div>

                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(rec.date || rec.createdAt).toLocaleDateString()}
                </span>
              </div>

              {/* Vitals Display */}
              {rec.vitals && Object.keys(rec.vitals).length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {rec.vitals.bpSystolic && (
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-bold block">Blood Pressure</span>
                      <span className="text-sm font-black text-slate-900">
                        {rec.vitals.bpSystolic}/{rec.vitals.bpDiastolic} <span className="text-[10px] text-slate-400 font-normal">mmHg</span>
                      </span>
                    </div>
                  )}
                  {rec.vitals.hemoglobin && (
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-bold block">Hemoglobin</span>
                      <span className="text-sm font-black text-rose-600">
                        {rec.vitals.hemoglobin} <span className="text-[10px] text-slate-400 font-normal">g/dL</span>
                      </span>
                    </div>
                  )}
                  {rec.vitals.bloodSugar && (
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-bold block">Blood Sugar ({rec.vitals.sugarType || 'Random'})</span>
                      <span className="text-sm font-black text-amber-600">
                        {rec.vitals.bloodSugar} <span className="text-[10px] text-slate-400 font-normal">mg/dL</span>
                      </span>
                    </div>
                  )}
                  {rec.vitals.spO2 && (
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-bold block">SpO2 Oxygen</span>
                      <span className="text-sm font-black text-emerald-600">
                        {rec.vitals.spO2}%
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Prescription Items */}
              {rec.prescription?.medications?.length > 0 && (
                <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-200 space-y-2">
                  <h4 className="font-bold text-xs text-blue-900 flex items-center gap-1.5">
                    <Pill className="w-4 h-4 text-blue-600" /> Prescribed Medications:
                  </h4>
                  <div className="space-y-1.5">
                    {rec.prescription.medications.map((m, i) => (
                      <div key={i} className="flex items-center justify-between text-xs bg-white p-2.5 rounded-xl border border-blue-100">
                        <span className="font-bold text-slate-900">{m.name}</span>
                        <span className="text-slate-600">{m.dosage} • {m.frequency} • {m.duration}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Maternal ANC Checkup */}
              {rec.ancCheckup && (
                <div className="p-4 bg-pink-50/60 rounded-2xl border border-pink-200 space-y-2 text-xs">
                  <h4 className="font-bold text-pink-900 flex items-center gap-1.5">
                    <Baby className="w-4 h-4 text-pink-600" /> ANC Checkup Findings:
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-700">
                    <div>Trimester: <strong>{rec.ancCheckup.trimester}</strong></div>
                    <div>Fundal Height: <strong>{rec.ancCheckup.fundalHeight}</strong></div>
                    <div>Fetal Heart: <strong>{rec.ancCheckup.fetalHeartSound}</strong></div>
                    <div>IFA Given: <strong>{rec.ancCheckup.ironFolicAcidGiven} Tablets</strong></div>
                  </div>
                </div>
              )}

              {/* Immunization Card */}
              {rec.immunization && (
                <div className="p-4 bg-purple-50/60 rounded-2xl border border-purple-200 text-xs space-y-1">
                  <h4 className="font-bold text-purple-900">Vaccine Administered: {rec.immunization.vaccineName} (Dose {rec.immunization.doseNumber})</h4>
                  <p className="text-purple-800">Administered at: {rec.immunization.administeredLocation}</p>
                </div>
              )}

              {/* Clinical Notes */}
              {rec.clinicalNotes && (
                <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  {rec.clinicalNotes.diagnosis && <p><strong>Diagnosis:</strong> {rec.clinicalNotes.diagnosis}</p>}
                  {rec.clinicalNotes.recommendations && <p><strong>Recommendations:</strong> {rec.clinicalNotes.recommendations}</p>}
                </div>
              )}

            </div>
          ))
        )}
      </div>
    </div>
  );
}

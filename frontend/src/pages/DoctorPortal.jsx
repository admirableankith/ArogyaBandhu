import React, { useState, useEffect } from 'react';
import {
  Stethoscope,
  Calendar,
  Clock,
  User,
  HeartPulse,
  FileText,
  Plus,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Send,
  Video,
  Activity,
  Pill
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import DisclaimerBanner from '../components/DisclaimerBanner';

export default function DoctorPortal() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [patientRecords, setPatientRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  // Consultation Room Form State
  const [diagnosis, setDiagnosis] = useState('');
  const [doctorNotes, setDoctorNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [medicines, setMedicines] = useState([
    { name: 'Paracetamol 500mg', genericName: 'Paracetamol IP', dosage: '500mg', frequency: '1-0-1 (After Meals)', duration: '5 days', instructions: 'For fever/pain' }
  ]);
  const [completing, setCompleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/appointments');
      if (res.data.success) {
        setAppointments(res.data.data);
        if (res.data.data.length > 0 && !selectedAppointment) {
          handleSelectAppointment(res.data.data[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching doctor queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleSelectAppointment = async (app) => {
    setSelectedAppointment(app);
    setDiagnosis(app.diagnosis || '');
    setDoctorNotes(app.doctorNotes || '');
    if (app.prescribedMedicines && app.prescribedMedicines.length > 0) {
      setMedicines(app.prescribedMedicines);
    }
    setSuccessMessage('');

    if (app.patientId?._id) {
      try {
        const res = await api.get(`/health-records/patient/${app.patientId._id}`);
        if (res.data.success) {
          setPatientRecords(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching patient records:', err);
      }
    }
  };

  const handleAddMedicine = () => {
    setMedicines([
      ...medicines,
      { name: '', genericName: '', dosage: '500mg', frequency: '1-0-1', duration: '5 days', instructions: '' }
    ]);
  };

  const handleRemoveMedicine = (idx) => {
    setMedicines(medicines.filter((_, i) => i !== idx));
  };

  const handleMedicineChange = (idx, field, val) => {
    const updated = [...medicines];
    updated[idx][field] = val;
    setMedicines(updated);
  };

  const handleCompleteConsultation = async (e) => {
    e.preventDefault();
    if (!selectedAppointment) return;

    setCompleting(true);
    setSuccessMessage('');

    try {
      const res = await api.put(`/appointments/${selectedAppointment._id}`, {
        status: 'COMPLETED',
        diagnosis: diagnosis || 'Clinical Teleconsultation Completed',
        doctorNotes: doctorNotes || 'Patient advised routine follow-up with ASHA worker.',
        prescribedMedicines: medicines.filter(m => m.name.trim() !== ''),
        followUpDate: followUpDate || undefined,
      });

      if (res.data.success) {
        setSuccessMessage('Consultation finalized! Digital prescription saved to Ayushman EMR and notified to patient.');
        fetchAppointments();
      }
    } catch (err) {
      alert('Error updating consultation: ' + (err.response?.data?.message || err.message));
    } finally {
      setCompleting(false);
    }
  };

  const activeQueue = appointments.filter(a => a.status !== 'CANCELLED');

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="bg-white/20 text-blue-100 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full inline-block mb-2">
            eSanjeevani Teleconsultation & PHC OPD Station
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            {user?.name}
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 mt-1">
            {user?.specialization || 'Medical Officer (MBBS, DNB)'} | {user?.assignedPhc || 'Rampur Primary Health Centre'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            Tele-OPD Room Active
          </span>
        </div>
      </div>

      <DisclaimerBanner />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Tele-OPD Consultations"
          value={appointments.length}
          subtitle="Scheduled Today"
          icon={Calendar}
          color="blue"
        />
        <StatCard
          title="Urgent Triage Cases"
          value={appointments.filter(a => a.triageLevel === 'URGENT' || a.triageLevel === 'EMERGENCY').length}
          subtitle="Priority Review"
          icon={AlertTriangle}
          color="rose"
        />
        <StatCard
          title="Completed Consults"
          value={appointments.filter(a => a.status === 'COMPLETED').length}
          subtitle="EMR Prescriptions Issued"
          icon={CheckCircle}
          color="emerald"
        />
        <StatCard
          title="PHC Pharmacy Link"
          value="Online"
          subtitle="Direct Jan Aushadhi Dispense"
          icon={Pill}
          color="amber"
        />
      </div>

      {/* Main Workspace: Patient Queue on Left, Active Consultation Workspace on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Patient Queue */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Patient Consultation Queue ({activeQueue.length})</span>
            </h3>
          </div>

          <div className="space-y-2.5 max-h-[600px] overflow-y-auto">
            {activeQueue.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                No patients in queue at the moment.
              </div>
            ) : (
              activeQueue.map((app) => {
                const isSelected = selectedAppointment?._id === app._id;
                return (
                  <div
                    key={app._id}
                    onClick={() => handleSelectAppointment(app)}
                    className={`p-3.5 rounded-2xl border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/70 shadow-sm'
                        : 'border-slate-100 bg-slate-50 hover:bg-slate-100/70'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-bold text-slate-900 block text-sm">
                          {app.patientId?.name || 'Villager'}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {app.patientId?.age}y {app.patientId?.gender} • {app.patientId?.village || 'Rampur'}
                        </span>
                      </div>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                        app.triageLevel === 'URGENT' || app.triageLevel === 'EMERGENCY'
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : 'bg-slate-200 text-slate-700'
                      }`}>
                        {app.triageLevel}
                      </span>
                    </div>

                    <p className="text-slate-600 mt-1 line-clamp-1 font-medium text-[11px]">
                      {app.symptoms}
                    </p>

                    <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-400 font-semibold">
                      <span>{app.timeSlot}</span>
                      <span className={app.status === 'COMPLETED' ? 'text-emerald-600 font-bold' : 'text-blue-600'}>
                        {app.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Active Teleconsultation & Prescription Station */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          {selectedAppointment ? (
            <div className="space-y-6">
              
              {/* Patient Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-blue-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black">{selectedAppointment.patientId?.name}</span>
                    <span className="text-xs bg-blue-500/30 text-blue-300 font-mono px-2 py-0.5 rounded font-bold">
                      {selectedAppointment.patientId?.abhaId || 'ABHA-PATIENT'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {selectedAppointment.patientId?.age} Years • {selectedAppointment.patientId?.gender} • Village: {selectedAppointment.patientId?.village}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href="tel:9876543210"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors"
                  >
                    <Video className="w-4 h-4" /> Start Video Tele-OPD
                  </a>
                </div>
              </div>

              {successMessage && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Patient Recent Vitals & EMR History */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <HeartPulse className="w-4 h-4 text-emerald-600" /> Patient Reported Symptoms & Vitals
                </h4>
                <p className="text-xs text-slate-800 font-semibold bg-white p-2.5 rounded-xl border border-slate-200">
                  <strong>Chief Complaint:</strong> {selectedAppointment.symptoms}
                </p>

                {patientRecords.length > 0 && (
                  <div className="pt-2 text-[11px] text-slate-500">
                    <span>Recent History: {patientRecords.length} recorded visits in Ayushman EMR (BP, ANC, Immunizations).</span>
                  </div>
                )}
              </div>

              {/* Doctor Consultation & Prescription Form */}
              <form onSubmit={handleCompleteConsultation} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Clinical Diagnosis / Provisional Assessment
                  </label>
                  <input
                    type="text"
                    required
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    placeholder="e.g. Mild Gestational Hypertension / Acute Febrile Illness / Type 2 DM"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Digital Prescription Table */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5">
                      <Pill className="w-4 h-4 text-blue-600" /> Digital Prescription (Jan Aushadhi Drugs)
                    </label>
                    <button
                      type="button"
                      onClick={handleAddMedicine}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Medicine
                    </button>
                  </div>

                  <div className="space-y-2">
                    {medicines.map((med, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs items-center">
                        <div className="sm:col-span-4">
                          <input
                            type="text"
                            placeholder="Medicine Name (e.g. Paracetamol 500mg)"
                            value={med.name}
                            onChange={(e) => handleMedicineChange(idx, 'name', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border text-xs bg-white font-semibold"
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <input
                            type="text"
                            placeholder="Dosage (e.g. 500mg / 1 tablet)"
                            value={med.dosage}
                            onChange={(e) => handleMedicineChange(idx, 'dosage', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border text-xs bg-white"
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <input
                            type="text"
                            placeholder="Frequency (e.g. 1-0-1)"
                            value={med.frequency}
                            onChange={(e) => handleMedicineChange(idx, 'frequency', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border text-xs bg-white"
                          />
                        </div>
                        <div className="sm:col-span-2 flex items-center justify-end gap-1">
                          <input
                            type="text"
                            placeholder="Days"
                            value={med.duration}
                            onChange={(e) => handleMedicineChange(idx, 'duration', e.target.value)}
                            className="w-16 px-2 py-1.5 rounded-lg border text-xs bg-white"
                          />
                          {medicines.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveMedicine(idx)}
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Doctor Advice & Clinical Instructions
                  </label>
                  <textarea
                    rows={2}
                    value={doctorNotes}
                    onChange={(e) => setDoctorNotes(e.target.value)}
                    placeholder="Diet advice, salt restriction, when to report to PHC emergency..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Recommended Follow-Up Date</label>
                    <input
                      type="date"
                      value={followUpDate}
                      onChange={(e) => setFollowUpDate(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={completing}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3.5 rounded-2xl transition-all shadow-lg shadow-blue-600/25 text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  {completing ? 'Issuing EMR Prescription...' : 'Finalize Teleconsultation & Save Prescription'}
                </button>
              </form>

            </div>
          ) : (
            <div className="text-center py-16 text-slate-400 text-xs">
              Select a patient from the queue to start teleconsultation.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

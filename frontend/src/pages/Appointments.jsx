import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  User,
  Plus,
  Video,
  CheckCircle2,
  AlertTriangle,
  Stethoscope,
  Building2
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import DisclaimerBanner from '../components/DisclaimerBanner';

export default function Appointments() {
  const { user, patientProfile } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBookModal, setShowBookModal] = useState(false);

  // New Booking State
  const [symptoms, setSymptoms] = useState('');
  const [appointmentDate, setAppointmentDate] = useState(new Date().toISOString().split('T')[0]);
  const [timeSlot, setTimeSlot] = useState('10:00 AM - 10:30 AM');
  const [type, setType] = useState('TELECONSULT');
  const [triageLevel, setTriageLevel] = useState('ROUTINE');
  const [facilityId, setFacilityId] = useState('');
  const [booking, setBooking] = useState(false);

  const fetchData = async () => {
    try {
      const [appRes, facRes] = await Promise.all([
        api.get('/appointments'),
        api.get('/facilities'),
      ]);

      if (appRes.data.success) setAppointments(appRes.data.data);
      if (facRes.data.success) {
        setFacilities(facRes.data.data);
        if (facRes.data.data.length > 0) setFacilityId(facRes.data.data[0]._id);
      }
    } catch (err) {
      console.error('Error fetching appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    setBooking(true);
    try {
      // Find a doctor user
      const res = await api.post('/appointments', {
        appointmentDate,
        timeSlot,
        type,
        symptoms,
        triageLevel,
        facilityId: facilityId || undefined,
      });

      if (res.data.success) {
        alert('Appointment successfully booked! Confirmed in database.');
        setShowBookModal(false);
        setSymptoms('');
        fetchData();
      }
    } catch (err) {
      alert('Booking failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setBooking(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-800 via-emerald-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="bg-white/20 text-emerald-200 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full inline-block mb-2">
            eSanjeevani Teleconsultation & PHC OPD System
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Consultations & Tele-OPD Appointments
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100 mt-1">
            Connect villagers directly with PHC Medical Officers and specialists.
          </p>
        </div>

        <button
          onClick={() => setShowBookModal(true)}
          className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold px-5 py-3 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" /> Book New Consultation
        </button>
      </div>

      <DisclaimerBanner />

      {/* Appointment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-16 text-center text-xs text-slate-400">Loading appointments...</div>
        ) : appointments.length === 0 ? (
          <div className="col-span-full py-16 text-center text-xs text-slate-400 bg-white rounded-3xl border border-slate-200">
            No consultations scheduled. Click "Book New Consultation" to schedule one.
          </div>
        ) : (
          appointments.map((app) => (
            <div
              key={app._id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                    app.type === 'TELECONSULT' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {app.type}
                  </span>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                    app.status === 'COMPLETED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : app.status === 'CONFIRMED'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {app.status}
                  </span>
                </div>

                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">
                    {app.patientId?.name || 'Citizen'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Doctor: <strong>{app.doctorId?.name || 'Dr. Arvind Mishra'}</strong>
                  </p>
                </div>

                <p className="text-xs text-slate-700 font-medium bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <strong>Reason:</strong> {app.symptoms}
                </p>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-1 font-semibold">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{new Date(app.appointmentDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1 font-semibold">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{app.timeSlot}</span>
                  </div>
                </div>

                {app.diagnosis && (
                  <div className="text-xs text-emerald-900 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                    <strong>Doctor Assessment:</strong> {app.diagnosis}
                  </div>
                )}
              </div>

              {app.status !== 'COMPLETED' && (
                <div className="pt-2 border-t border-slate-100">
                  <a
                    href="tel:9876543230"
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
                  >
                    <Video className="w-4 h-4 text-emerald-400" /> Join Tele-OPD Call
                  </a>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Booking Modal */}
      {showBookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-lg font-black text-slate-900">Book PHC Consultation Slot</h3>
            <form onSubmit={handleBookSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Health Center / PHC</label>
                <select
                  value={facilityId}
                  onChange={(e) => setFacilityId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border text-xs bg-white font-semibold"
                >
                  {facilities.map((f) => (
                    <option key={f._id} value={f._id}>
                      {f.name} ({f.village})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Symptoms / Reason for Visit *</label>
                <textarea
                  rows={2}
                  required
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="e.g. Fever for 3 days / Routine Pregnancy ANC Checkup / Diabetes refill..."
                  className="w-full px-3.5 py-2 rounded-xl border text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Preferred Date</label>
                  <input
                    type="date"
                    required
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Time Slot</label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border text-xs bg-white"
                  >
                    <option value="10:00 AM - 10:30 AM">10:00 AM - 10:30 AM</option>
                    <option value="10:30 AM - 11:00 AM">10:30 AM - 11:00 AM</option>
                    <option value="11:00 AM - 11:30 AM">11:00 AM - 11:30 AM</option>
                    <option value="02:00 PM - 02:30 PM">02:00 PM - 02:30 PM</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Consultation Mode</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border text-xs bg-white"
                  >
                    <option value="TELECONSULT">Online Teleconsultation</option>
                    <option value="IN_PERSON">In-Person at PHC OPD</option>
                    <option value="ASHA_VISIT">Doorstep ASHA Visit</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Triage Priority</label>
                  <select
                    value={triageLevel}
                    onChange={(e) => setTriageLevel(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border text-xs bg-white"
                  >
                    <option value="ROUTINE">ROUTINE</option>
                    <option value="URGENT">URGENT</option>
                    <option value="EMERGENCY">EMERGENCY</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowBookModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={booking}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-md disabled:opacity-50"
                >
                  {booking ? 'Scheduling Slot...' : 'Confirm Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

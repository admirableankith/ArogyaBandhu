import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  PhoneCall,
  Clock,
  CheckCircle,
  MapPin,
  Car,
  Shield,
  Plus,
  Activity,
  Send
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import DisclaimerBanner from '../components/DisclaimerBanner';

export default function EmergencyCenter({ onOpenEmergency }) {
  const { user } = useAuth();
  const [emergencies, setEmergencies] = useState([]);
  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const [newNote, setNewNote] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchEmergencies = async () => {
    try {
      const res = await api.get('/emergency');
      if (res.data.success) {
        setEmergencies(res.data.data);
        if (res.data.data.length > 0 && !selectedEmergency) {
          setSelectedEmergency(res.data.data[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching emergencies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmergencies();
    const interval = setInterval(fetchEmergencies, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (status) => {
    if (!selectedEmergency) return;
    setUpdatingStatus(true);
    try {
      const res = await api.put(`/emergency/${selectedEmergency._id}/status`, {
        status,
        note: newNote || `Status changed to ${status}`,
      });

      if (res.data.success) {
        setNewNote('');
        fetchEmergencies();
        setSelectedEmergency(res.data.data);
      }
    } catch (err) {
      alert('Error updating status: ' + (err.response?.data?.message || err.message));
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim() || !selectedEmergency) return;
    setUpdatingStatus(true);
    try {
      const res = await api.put(`/emergency/${selectedEmergency._id}/status`, {
        status: selectedEmergency.status,
        note: newNote,
      });

      if (res.data.success) {
        setNewNote('');
        fetchEmergencies();
        setSelectedEmergency(res.data.data);
      }
    } catch (err) {
      alert('Error adding note: ' + (err.response?.data?.message || err.message));
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-700 via-rose-700 to-red-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="bg-white/20 text-red-100 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full inline-block mb-2">
            National Health Helpline 108 • Rural Emergency Command
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Emergency SOS Response Center
          </h1>
          <p className="text-xs sm:text-sm text-red-100 mt-1">
            Real-time ambulance dispatch, snakebite/maternal distress tracking, and village ASHA coordination.
          </p>
        </div>

        <button
          onClick={onOpenEmergency}
          className="bg-white text-red-700 hover:bg-red-50 font-black px-5 py-3.5 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-2xl transition-all hover:scale-105 animate-emergency"
        >
          <AlertTriangle className="w-5 h-5 text-red-600" /> 🚨 Trigger New 108 SOS
        </button>
      </div>

      <DisclaimerBanner />

      {/* Main Grid: Active SOS List on Left, Selected Emergency Detail & Live Dispatch Timeline on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left List */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-red-600" />
              <span>Active SOS Alerts ({emergencies.length})</span>
            </h3>
          </div>

          <div className="space-y-2.5 max-h-[600px] overflow-y-auto">
            {emergencies.length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-400">
                No emergency calls at this time.
              </div>
            ) : (
              emergencies.map((em) => {
                const isSelected = selectedEmergency?._id === em._id;
                return (
                  <div
                    key={em._id}
                    onClick={() => setSelectedEmergency(em)}
                    className={`p-4 rounded-2xl border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'border-red-500 bg-red-50/70 shadow-sm'
                        : 'border-slate-100 bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-extrabold text-slate-900 text-sm block">
                          {em.emergencyType.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[11px] text-slate-600">
                          {em.patientName || em.callerName} • {em.village}
                        </span>
                      </div>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                        em.status === 'RESOLVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-600 text-white animate-pulse'
                      }`}>
                        {em.status}
                      </span>
                    </div>

                    <p className="text-slate-600 text-[11px] mt-1.5 line-clamp-2">
                      {em.description}
                    </p>

                    <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>Ambulance: {em.assignedAmbulance?.vehicleNumber || 'UP-65-AMB-108'}</span>
                      <span>{new Date(em.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Detail Card */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          {selectedEmergency ? (
            <div className="space-y-6">
              
              {/* Emergency Banner Header */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-700 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded">
                    SEVERITY: {selectedEmergency.severity}
                  </span>
                  <h3 className="text-xl font-black mt-1">
                    {selectedEmergency.emergencyType.replace(/_/g, ' ')}
                  </h3>
                  <p className="text-xs text-red-100">
                    Caller: {selectedEmergency.callerName} ({selectedEmergency.callerPhone}) • Village: {selectedEmergency.village}
                  </p>
                </div>

                <a
                  href={`tel:${selectedEmergency.callerPhone}`}
                  className="bg-white text-red-700 hover:bg-red-50 font-black text-xs px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-lg"
                >
                  <PhoneCall className="w-4 h-4" /> Call Caller
                </a>
              </div>

              {/* Status Update Pipeline Buttons */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase block">
                  Update Live Emergency Dispatch State:
                </label>
                <div className="flex flex-wrap gap-2">
                  {['REPORTED', 'DISPATCHED', 'EN_ROUTE', 'ARRIVED', 'RESOLVED'].map((st) => (
                    <button
                      key={st}
                      disabled={updatingStatus}
                      onClick={() => handleUpdateStatus(st)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        selectedEmergency.status === st
                          ? 'bg-slate-900 text-white shadow-md'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Assigned Ambulance Card */}
              {selectedEmergency.assignedAmbulance && (
                <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2">
                      <Car className="w-4 h-4" /> 108 Emergency Ambulance Assigned
                    </span>
                    <span className="text-xs font-black bg-rose-500/20 text-rose-300 px-2.5 py-0.5 rounded-full">
                      ETA: {selectedEmergency.assignedAmbulance.etaMinutes} mins
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs border-t border-slate-800 pt-2">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Ambulance Reg. No.</span>
                      <span className="font-bold text-slate-200 font-mono">{selectedEmergency.assignedAmbulance.vehicleNumber}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Ambulance Pilot / Driver</span>
                      <span className="font-bold text-slate-200">{selectedEmergency.assignedAmbulance.driverName}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Log Timeline */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Dispatch & Clinical Action Log
                </h4>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedEmergency.actionNotes?.map((n, i) => (
                    <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span className="font-bold text-slate-700">{n.updatedBy}</span>
                        <span>{new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-slate-800 font-medium">{n.note}</p>
                    </div>
                  ))}
                </div>

                {/* Add new action note form */}
                <form onSubmit={handleAddNote} className="flex gap-2 pt-2">
                  <input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add dispatch note (e.g. ASVS administered, patient transferred)..."
                    className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={updatingStatus || !newNote.trim()}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" /> Post Note
                  </button>
                </form>
              </div>

            </div>
          ) : (
            <div className="text-center py-16 text-slate-400 text-xs">
              Select an emergency call to view details and update dispatch status.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

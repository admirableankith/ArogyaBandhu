import React, { useState } from 'react';
import { AlertTriangle, PhoneCall, MapPin, CheckCircle, Clock, Shield, Car, X } from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

export default function EmergencyModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const { fetchNotifications } = useNotifications();
  const [callerName, setCallerName] = useState(user?.name || '');
  const [callerPhone, setCallerPhone] = useState(user?.phone || '');
  const [village, setVillage] = useState(user?.village || 'Rampur');
  const [landmark, setLandmark] = useState('');
  const [emergencyType, setEmergencyType] = useState('MATERNAL_COMPLICATION');
  const [severity, setSeverity] = useState('CRITICAL');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [activeEmergency, setActiveEmergency] = useState(null);

  if (!isOpen) return null;

  const handleTriggerSOS = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/emergency/trigger', {
        callerName: callerName || 'Citizen Emergency SOS',
        callerPhone: callerPhone || '9876543210',
        patientName: callerName,
        village: village || 'Rampur',
        landmark: landmark || 'Near Village Centre',
        emergencyType,
        severity,
        description: description || `Urgent ${emergencyType.replace(/_/g, ' ')} SOS triggered from mobile portal. Immediate 108 ambulance requested.`,
        location: { lat: 25.3176, lng: 82.9739 },
      });

      if (res.data.success) {
        setActiveEmergency(res.data.data);
        fetchNotifications();
      }
    } catch (err) {
      alert('Could not trigger emergency SOS: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border-4 border-red-500 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white p-1.5 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-2xl animate-emergency">
              <AlertTriangle className="w-8 h-8 text-yellow-300" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight">EMERGENCY SOS (108)</h2>
              <p className="text-red-100 text-xs font-medium">National Rural Health Emergency Dispatch Protocol</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeEmergency ? (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900">
                <div className="flex items-center gap-2 font-bold text-emerald-800 text-lg">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                  <span>Ambulance Dispatched!</span>
                </div>
                <p className="text-sm mt-1">
                  Alert registered in Central PHC/CHC network with Emergency ID <code className="bg-emerald-100 px-1.5 py-0.5 rounded font-mono text-xs font-bold">{activeEmergency._id?.slice(-6)}</code>.
                </p>
              </div>

              {/* Real-time Ambulance Card */}
              <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-xs uppercase font-bold tracking-wider text-rose-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping inline-block" />
                    Ambulance En Route
                  </span>
                  <span className="bg-rose-500/20 text-rose-300 font-extrabold text-sm px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Clock className="w-4 h-4" /> ETA: {activeEmergency.assignedAmbulance?.etaMinutes || 10} Mins
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 text-sm border-t border-slate-800">
                  <div>
                    <span className="text-xs text-slate-400 block">Vehicle No.</span>
                    <span className="font-bold text-slate-100">{activeEmergency.assignedAmbulance?.vehicleNumber || 'UP-65-AMB-1082'}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Pilot (Driver)</span>
                    <span className="font-bold text-slate-100">{activeEmergency.assignedAmbulance?.driverName || 'Rajesh Kumar'}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <a
                    href="tel:108"
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-red-900/40"
                  >
                    <PhoneCall className="w-5 h-5" /> Call Driver ({activeEmergency.assignedAmbulance?.driverPhone || '108'})
                  </a>
                </div>
              </div>

              <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1.5">
                <p className="font-bold flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-amber-600" /> Immediate Rural First Aid Steps:
                </p>
                <ul className="list-disc list-inside space-y-1 pl-1 text-amber-800">
                  <li>Keep the patient in a calm, shaded area with clear ventilation.</li>
                  <li>In case of snake bite: Keep limb immobilized below heart level. DO NOT apply tight tourniquets.</li>
                  <li>In case of maternal labor: Keep mother in Left Lateral position.</li>
                </ul>
              </div>

              <button
                onClick={onClose}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 rounded-xl transition-colors"
              >
                Close & Monitor Status in Emergency Center
              </button>
            </div>
          ) : (
            <form onSubmit={handleTriggerSOS} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Your Name / Caller</label>
                  <input
                    type="text"
                    required
                    value={callerName}
                    onChange={(e) => setCallerName(e.target.value)}
                    placeholder="Enter full name"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    required
                    value={callerPhone}
                    onChange={(e) => setCallerPhone(e.target.value)}
                    placeholder="Phone number"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Emergency Nature</label>
                <select
                  value={emergencyType}
                  onChange={(e) => setEmergencyType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-red-500 focus:outline-none bg-white"
                >
                  <option value="SNAKE_BITE">🐍 Venomous Snake Bite (Urgent Anti-Venom)</option>
                  <option value="MATERNAL_COMPLICATION">🤰 Maternal Labor / Obstetric Emergency</option>
                  <option value="CARDIAC_CHEST_PAIN">❤️ Severe Chest Pain / Cardiac Event</option>
                  <option value="SEVERE_TRAUMA_ACCIDENT">🩹 Severe Road Trauma / Heavy Bleeding</option>
                  <option value="RESPIRATORY_DISTRESS">🫁 Severe Breathing Difficulty / Low Oxygen</option>
                  <option value="HIGH_FEVER_CONVULSION">🌡️ Infant High Fever with Fits / Convulsions</option>
                  <option value="OTHER">⚠️ Other Life Threatening Crisis</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Village / Gram Panchayat</label>
                  <input
                    type="text"
                    required
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    placeholder="e.g. Rampur"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nearby Landmark / Location</label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="e.g. Near Primary School / Canal"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Additional Symptoms / Details</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe patient condition, consciousness, visible bleeding..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black py-3 rounded-xl transition-colors shadow-lg shadow-red-500/30 flex items-center justify-center gap-2 text-sm uppercase tracking-wider disabled:opacity-50"
                >
                  {submitting ? 'Connecting 108...' : '🚨 Trigger 108 SOS'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

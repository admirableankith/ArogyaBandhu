import React, { useState, useEffect } from 'react';
import {
  Activity,
  Building2,
  Users,
  AlertTriangle,
  HeartPulse,
  Package,
  CheckCircle,
  Clock,
  MapPin,
  TrendingUp
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import DisclaimerBanner from '../components/DisclaimerBanner';

export default function AdminPortal() {
  const { user } = useAuth();
  const [facilities, setFacilities] = useState([]);
  const [emergencies, setEmergencies] = useState([]);
  const [patients, setPatients] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fRes, eRes, pRes, invRes] = await Promise.all([
          api.get('/facilities'),
          api.get('/emergency'),
          api.get('/patients'),
          api.get('/inventory/alerts/low-stock'),
        ]);

        if (fRes.data.success) setFacilities(fRes.data.data);
        if (eRes.data.success) setEmergencies(eRes.data.data);
        if (pRes.data.success) setPatients(pRes.data.data);
        if (invRes.data.success) setLowStock(invRes.data.data);
      } catch (err) {
        console.error('Error fetching admin data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalBeds = facilities.reduce((acc, f) => acc + (f.totalBeds || 0), 0);
  const availableBeds = facilities.reduce((acc, f) => acc + (f.availableBeds || 0), 0);
  const occupiedBeds = totalBeds - availableBeds;
  const highRiskCount = patients.filter((p) => p.isHighRisk).length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-800 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="bg-white/20 text-purple-200 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full inline-block mb-2">
            Integrated Disease Surveillance Programme (IDSP) • District Health Command
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            {user?.name}
          </h1>
          <p className="text-xs sm:text-sm text-purple-200 mt-1">
            District: <strong>Varanasi Central</strong> | Supervised Facilities: <strong>{facilities.length} PHCs/CHCs/Sub-Centres</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="bg-purple-500/30 text-purple-200 border border-purple-400/30 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2">
            <Activity className="w-4 h-4 text-purple-300" /> Real-Time Sync
          </span>
        </div>
      </div>

      <DisclaimerBanner />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="District Bed Occupancy"
          value={`${occupiedBeds}/${totalBeds}`}
          subtitle={`${availableBeds} Emergency Beds Free`}
          icon={Building2}
          color="purple"
          trend="64% Occupied"
        />
        <StatCard
          title="High-Risk Cohort (ANC/NCD)"
          value={highRiskCount}
          subtitle="Priority ASHA Follow-up"
          icon={HeartPulse}
          color="rose"
        />
        <StatCard
          title="Active 108 Emergency SOS"
          value={emergencies.filter(e => e.status !== 'RESOLVED').length}
          subtitle="Live Ambulances Dispatched"
          icon={AlertTriangle}
          color="amber"
        />
        <StatCard
          title="Medicine Supply Health"
          value={`${lowStock.length} Low`}
          subtitle="Dist. Warehouse Indent"
          icon={Package}
          color="emerald"
        />
      </div>

      {/* Facilities Bed & Ambulance Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Facilities Status */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <Building2 className="w-5 h-5 text-purple-600" />
              <span>District Health Facilities & Bed Readiness</span>
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider">
                  <th className="p-3">Facility Name</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Beds (Avail / Total)</th>
                  <th className="p-3">Doctors</th>
                  <th className="p-3">108 Ambulance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {facilities.map((fac) => (
                  <tr key={fac._id} className="hover:bg-slate-50/70">
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{fac.name}</div>
                      <div className="text-[11px] text-slate-500">{fac.village}, {fac.district}</div>
                    </td>
                    <td className="p-3 font-semibold">
                      <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded text-[10px] font-bold">
                        {fac.facilityType}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-slate-800">
                      {fac.availableBeds} / {fac.totalBeds}
                    </td>
                    <td className="p-3 text-slate-600 font-semibold">{fac.doctorCount} on duty</td>
                    <td className="p-3">
                      {fac.hasAmbulance ? (
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-bold">
                          Ready (108)
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[10px]">No unit</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Emergency Dispatch Logs */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span>108 Emergency Dispatch Stream</span>
            </h3>
          </div>

          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {emergencies.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                No active emergencies reported.
              </div>
            ) : (
              emergencies.map((em) => (
                <div
                  key={em._id}
                  className={`p-3.5 rounded-2xl border text-xs space-y-2 ${
                    em.status === 'RESOLVED'
                      ? 'border-slate-100 bg-slate-50 opacity-80'
                      : 'border-red-200 bg-red-50/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-extrabold text-slate-900">{em.emergencyType.replace(/_/g, ' ')}</span>
                      <div className="text-[11px] text-slate-500">Village: {em.village} | Caller: {em.callerName}</div>
                    </div>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                      em.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-600 text-white animate-pulse'
                    }`}>
                      {em.status}
                    </span>
                  </div>

                  <p className="text-slate-700 text-[11px] bg-white/80 p-2 rounded-xl border border-slate-100">
                    {em.description}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>Vehicle: {em.assignedAmbulance?.vehicleNumber || 'UP-65-AMB-108'}</span>
                    <span>{new Date(em.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

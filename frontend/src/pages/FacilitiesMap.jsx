import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Search,
  Navigation,
  PhoneCall,
  Clock,
  Building2,
  Bed,
  Stethoscope,
  ShieldCheck,
  CheckCircle2,
  Filter
} from 'lucide-react';
import api from '../api/client';
import DisclaimerBanner from '../components/DisclaimerBanner';

export default function FacilitiesMap() {
  const [facilities, setFacilities] = useState([]);
  const [radiusKm, setRadiusKm] = useState(25);
  const [selectedType, setSelectedType] = useState('');
  const [userCoords, setUserCoords] = useState({ lat: 25.3176, lng: 82.9739 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchNearest = async () => {
    setLoading(true);
    try {
      const res = await api.get(
        `/facilities/nearest?lat=${userCoords.lat}&lng=${userCoords.lng}&radiusKm=${radiusKm}&type=${selectedType}`
      );
      if (res.data.success) {
        setFacilities(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch nearest facilities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNearest();
  }, [radiusKm, selectedType]);

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          fetchNearest();
        },
        (err) => {
          console.warn('Geolocation denied or unavailable, using Rampur default GPS coordinates.');
        }
      );
    }
  };

  const filteredFacilities = facilities.filter(
    (f) =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.village.toLowerCase().includes(search.toLowerCase()) ||
      f.services.some((s) => s.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-800 via-emerald-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="bg-white/20 text-emerald-200 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full inline-block mb-2">
            Location-Based Rural Healthcare Directory
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Find Nearest PHC, CHC & Jan Aushadhi
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100 mt-1">
            Real-time geospatial distance, bed occupancy, doctor on duty & emergency ambulance status.
          </p>
        </div>

        <button
          onClick={handleGetCurrentLocation}
          className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold px-4 py-3 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all hover:scale-105"
        >
          <Navigation className="w-4 h-4" /> Use My GPS Location
        </button>
      </div>

      <DisclaimerBanner />

      {/* Control Bar: Radius, Type, Search */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search facility name, service, or village..."
              className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="md:col-span-4">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
            >
              <option value="">All Health Facility Types</option>
              <option value="PHC">Primary Health Centre (PHC)</option>
              <option value="CHC">Community Health Centre (CHC)</option>
              <option value="SUB_CENTRE">Ayushman Arogya Mandir (Sub-Centre)</option>
              <option value="JAN_AUSHADHI">Jan Aushadhi Kendra (Pharmacy)</option>
              <option value="DISTRICT_HOSPITAL">District Referral Hospital</option>
            </select>
          </div>

          <div className="md:col-span-4 flex items-center gap-3">
            <label className="text-xs font-bold text-slate-600 whitespace-nowrap">
              Radius: {radiusKm} KM
            </label>
            <input
              type="range"
              min="5"
              max="50"
              step="5"
              value={radiusKm}
              onChange={(e) => setRadiusKm(e.target.value)}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>

        </div>
      </div>

      {/* Facility Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-16 text-center text-xs text-slate-400">
            Calculating distances to nearest health facilities...
          </div>
        ) : filteredFacilities.length === 0 ? (
          <div className="col-span-full py-16 text-center text-xs text-slate-400">
            No healthcare facilities found within {radiusKm} KM. Try expanding search radius.
          </div>
        ) : (
          filteredFacilities.map((fac) => (
            <div
              key={fac._id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                      {fac.facilityType}
                    </span>
                    <h3 className="font-extrabold text-slate-900 text-sm mt-1.5 leading-snug">
                      {fac.name}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-black text-emerald-600 block">
                      {fac.distanceKm} KM
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1 justify-end">
                      <Clock className="w-3 h-3" /> ~{fac.estimatedTravelTimeMinutes} mins
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 font-medium flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span>{fac.address}</span>
                </p>

                {/* Services Pills */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {fac.services?.map((serv, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-semibold bg-slate-50 text-slate-700 px-2 py-0.5 rounded-md border border-slate-100"
                    >
                      {serv}
                    </span>
                  ))}
                </div>

                {/* Facility Details Box */}
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Available Beds</span>
                    <span className="font-bold text-slate-900">{fac.availableBeds} / {fac.totalBeds} Free</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">108 Ambulance</span>
                    <span className="font-bold text-emerald-700">{fac.hasAmbulance ? 'Available 24x7' : 'Stationed at CHC'}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                <a
                  href={`tel:${fac.phone}`}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                >
                  <PhoneCall className="w-3.5 h-3.5" /> Call ({fac.phone})
                </a>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${fac.location.lat},${fac.location.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors"
                  title="Open GPS Navigation"
                >
                  <Navigation className="w-4 h-4 text-emerald-600" />
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

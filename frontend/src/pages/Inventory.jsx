import React, { useState, useEffect } from 'react';
import {
  Package,
  Search,
  Pill,
  CheckCircle,
  AlertTriangle,
  MapPin,
  Building2,
  DollarSign
} from 'lucide-react';
import api from '../api/client';
import DisclaimerBanner from '../components/DisclaimerBanner';

export default function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const res = await api.get(`/inventory?search=${encodeURIComponent(search)}&category=${category}`);
        if (res.data.success) {
          setInventory(res.data.data);
        }
      } catch (err) {
        console.error('Error loading medicine inventory:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, [search, category]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-700 via-orange-700 to-amber-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="bg-white/20 text-amber-100 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full inline-block mb-2">
            Jan Aushadhi & Essential Drug Locator
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Medicine Stock & Availability Directory
          </h1>
          <p className="text-xs sm:text-sm text-amber-100 mt-1">
            Check real-time stock of essential generic medicines, anti-venom, ORS, and chronic care refills.
          </p>
        </div>
      </div>

      <DisclaimerBanner />

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setCategory('')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                category === '' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All Medicines
            </button>
            <button
              onClick={() => setCategory('ESSENTIAL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                category === 'ESSENTIAL' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Essential (PCM/ORS)
            </button>
            <button
              onClick={() => setCategory('EMERGENCY')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                category === 'EMERGENCY' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Anti-Venom / Emergency
            </button>
            <button
              onClick={() => setCategory('MATERNAL_CHILD')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                category === 'MATERNAL_CHILD' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Maternal & Child (IFA/Zinc)
            </button>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search generic or trade name..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Medicine Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-16 text-center text-xs text-slate-400">Searching inventory...</div>
        ) : inventory.length === 0 ? (
          <div className="col-span-full py-16 text-center text-xs text-slate-400 bg-white rounded-3xl border border-slate-200">
            No medicines found matching criteria.
          </div>
        ) : (
          inventory.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
                      {item.category}
                    </span>
                    <h3 className="font-extrabold text-slate-900 text-sm mt-1.5">
                      {item.name}
                    </h3>
                  </div>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                    item.isLowStock
                      ? 'bg-rose-100 text-rose-800 border border-rose-200'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {item.isLowStock ? 'Low Stock' : 'In Stock'}
                  </span>
                </div>

                <p className="text-xs text-slate-500 font-medium">
                  Generic: <strong>{item.genericName}</strong>
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Available Units</span>
                    <span className="font-bold text-slate-900">{item.quantity} {item.unit}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Jan Aushadhi Rate</span>
                    <span className="font-bold text-emerald-700">
                      {item.pricePerUnit === 0 ? 'FREE' : `₹${item.pricePerUnit}`}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span>Available at: <strong>{item.facilityName}</strong></span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

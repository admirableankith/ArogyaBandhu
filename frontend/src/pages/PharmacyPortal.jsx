import React, { useState, useEffect } from 'react';
import {
  Package,
  AlertTriangle,
  Plus,
  Search,
  CheckCircle,
  Pill,
  RefreshCw,
  TrendingDown,
  Building2,
  DollarSign
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import DisclaimerBanner from '../components/DisclaimerBanner';

export default function PharmacyPortal() {
  const { user } = useAuth();
  const [inventory, setInventory] = useState([]);
  const [lowStockAlerts, setLowStockAlerts] = useState([]);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Dispense modal
  const [selectedItem, setSelectedItem] = useState(null);
  const [dispenseQty, setDispenseQty] = useState(1);
  const [dispensing, setDispensing] = useState(false);
  const [dispenseMsg, setDispenseMsg] = useState('');

  // Add stock batch modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMed, setNewMed] = useState({
    name: '',
    genericName: '',
    category: 'ESSENTIAL',
    dosageForm: 'Tablet',
    strength: '500mg',
    quantity: '500',
    unit: 'tablets',
    minThreshold: '100',
    batchNumber: '',
    pricePerUnit: '1.0',
  });

  const fetchData = async () => {
    try {
      const [invRes, lowRes] = await Promise.all([
        api.get(`/inventory?category=${category}&search=${encodeURIComponent(search)}`),
        api.get('/inventory/alerts/low-stock'),
      ]);

      if (invRes.data.success) setInventory(invRes.data.data);
      if (lowRes.data.success) setLowStockAlerts(lowRes.data.data);
    } catch (err) {
      console.error('Error fetching inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [category, search]);

  const handleDispenseSubmit = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;

    setDispensing(true);
    setDispenseMsg('');

    try {
      const res = await api.put(`/inventory/${selectedItem._id}/stock`, {
        adjustment: Number(dispenseQty),
        operation: 'DISPENSE',
      });

      if (res.data.success) {
        setDispenseMsg(`Dispensed ${dispenseQty} ${selectedItem.unit} of ${selectedItem.name}. New balance: ${res.data.data.quantity}`);
        fetchData();
      }
    } catch (err) {
      alert('Dispense error: ' + (err.response?.data?.message || err.message));
    } finally {
      setDispensing(false);
    }
  };

  const handleRestockSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/inventory', {
        ...newMed,
        quantity: Number(newMed.quantity),
        minThreshold: Number(newMed.minThreshold),
        pricePerUnit: Number(newMed.pricePerUnit),
      });

      if (res.data.success) {
        alert('Medicine batch added to dispensary inventory!');
        setShowAddModal(false);
        setNewMed({
          name: '',
          genericName: '',
          category: 'ESSENTIAL',
          dosageForm: 'Tablet',
          strength: '500mg',
          quantity: '500',
          unit: 'tablets',
          minThreshold: '100',
          batchNumber: '',
          pricePerUnit: '1.0',
        });
        fetchData();
      }
    } catch (err) {
      alert('Add error: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-700 via-orange-700 to-amber-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="bg-white/20 text-amber-100 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full inline-block mb-2">
            Pradhan Mantri Bhartiya Janaushadhi Pariyojana (PMBJP) & PHC Dispensary
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            {user?.name}
          </h1>
          <p className="text-xs sm:text-sm text-amber-100 mt-1">
            Facility: <strong>{user?.assignedPhc || 'Rampur PHC Jan Aushadhi Store'}</strong> | License: {user?.licenseNumber || 'UP-PHARMA-1029'}
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-white text-amber-800 hover:bg-amber-50 font-black px-4 py-3 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" /> Add Medicine Batch
        </button>
      </div>

      <DisclaimerBanner />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Medicines in Stock"
          value={inventory.length}
          subtitle="Essential Generics Active"
          icon={Package}
          color="amber"
        />
        <StatCard
          title="Critical Low-Stock Alerts"
          value={lowStockAlerts.length}
          subtitle="Requires District Indent"
          icon={AlertTriangle}
          color="rose"
        />
        <StatCard
          title="Jan Aushadhi Subsidy"
          value="50-90%"
          subtitle="Affordable Rural Pricing"
          icon={DollarSign}
          color="emerald"
        />
        <StatCard
          title="Anti-Snake Venom"
          value="8 Vials"
          subtitle="Emergency Cold Storage"
          icon={Pill}
          color="blue"
        />
      </div>

      {/* Critical Stock Alerts Banner */}
      {lowStockAlerts.length > 0 && (
        <div className="bg-rose-50 border-2 border-rose-300 rounded-3xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-rose-900 text-sm flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              <span>Critical Low Stock Warnings ({lowStockAlerts.length} items below minimum threshold)</span>
            </h3>
            <span className="text-[10px] bg-rose-200 text-rose-900 font-black px-2 py-0.5 rounded-full uppercase">
              Action Required
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {lowStockAlerts.map((item) => (
              <div key={item._id} className="p-3 bg-white rounded-2xl border border-rose-200 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{item.name}</span>
                  <span className="text-[10px] font-black text-rose-700 bg-rose-100 px-1.5 py-0.2 rounded">
                    {item.quantity} {item.unit} left
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">{item.genericName}</p>
                <div className="text-[10px] text-slate-400">Min Threshold: {item.minThreshold} {item.unit}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inventory Table & Filters */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setCategory('')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                category === '' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All Drugs
            </button>
            <button
              onClick={() => setCategory('ESSENTIAL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                category === 'ESSENTIAL' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Essential (ORS/PCM)
            </button>
            <button
              onClick={() => setCategory('EMERGENCY')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                category === 'EMERGENCY' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Emergency (Anti-Venom)
            </button>
            <button
              onClick={() => setCategory('MATERNAL_CHILD')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                category === 'MATERNAL_CHILD' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Maternal / Child (IFA/Zinc)
            </button>
            <button
              onClick={() => setCategory('CHRONIC_CARE')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                category === 'CHRONIC_CARE' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              NCD Chronic
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

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider">
                <th className="p-3">Medicine & Generic Name</th>
                <th className="p-3">Category</th>
                <th className="p-3">Strength / Form</th>
                <th className="p-3">Current Stock</th>
                <th className="p-3">Batch & Expiry</th>
                <th className="p-3">Govt. Price (₹)</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {inventory.map((item) => (
                <tr key={item._id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3">
                    <div className="font-bold text-slate-900">{item.name}</div>
                    <div className="text-[11px] text-slate-500">{item.genericName}</div>
                  </td>
                  <td className="p-3">
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                      {item.category}
                    </span>
                  </td>
                  <td className="p-3 text-slate-600">
                    {item.strength} • {item.dosageForm}
                  </td>
                  <td className="p-3">
                    <span className={`font-extrabold ${item.isLowStock ? 'text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200' : 'text-slate-900'}`}>
                      {item.quantity} {item.unit}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="font-mono text-[11px] text-slate-700">{item.batchNumber}</div>
                    <div className="text-[10px] text-slate-400">Exp: {new Date(item.expiryDate).toLocaleDateString()}</div>
                  </td>
                  <td className="p-3 font-bold text-emerald-700">
                    {item.pricePerUnit === 0 ? 'FREE (Govt)' : `₹${item.pricePerUnit}`}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => {
                        setSelectedItem(item);
                        setDispenseQty(1);
                        setDispenseMsg('');
                      }}
                      className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs transition-colors shadow-sm"
                    >
                      Dispense
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dispense Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-black text-slate-900">Dispense Medicine at Counter</h3>
            
            <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-xs space-y-1">
              <div className="font-bold text-amber-950 text-sm">{selectedItem.name}</div>
              <div className="text-amber-800">{selectedItem.genericName} • Batch: {selectedItem.batchNumber}</div>
              <div className="text-amber-700 font-bold">Current Available Stock: {selectedItem.quantity} {selectedItem.unit}</div>
            </div>

            {dispenseMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold">
                {dispenseMsg}
              </div>
            )}

            <form onSubmit={handleDispenseSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Quantity to Dispense ({selectedItem.unit})</label>
                <input
                  type="number"
                  min="1"
                  max={selectedItem.quantity}
                  required
                  value={dispenseQty}
                  onChange={(e) => setDispenseQty(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border text-sm font-bold"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={dispensing || selectedItem.quantity < Number(dispenseQty)}
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-md disabled:opacity-50"
                >
                  {dispensing ? 'Updating Database...' : 'Confirm Dispense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Medicine Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-lg font-black text-slate-900">Add New Medicine Batch to PHC Inventory</h3>
            
            <form onSubmit={handleRestockSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Brand / Trade Name</label>
                  <input
                    type="text"
                    required
                    value={newMed.name}
                    onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
                    placeholder="e.g. Paracetamol 500mg"
                    className="w-full px-3 py-2 rounded-xl border text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Generic Name</label>
                  <input
                    type="text"
                    required
                    value={newMed.genericName}
                    onChange={(e) => setNewMed({ ...newMed, genericName: e.target.value })}
                    placeholder="e.g. Paracetamol IP"
                    className="w-full px-3 py-2 rounded-xl border text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Category</label>
                  <select
                    value={newMed.category}
                    onChange={(e) => setNewMed({ ...newMed, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border text-xs bg-white"
                  >
                    <option value="ESSENTIAL">ESSENTIAL</option>
                    <option value="ANTIBIOTIC">ANTIBIOTIC</option>
                    <option value="MATERNAL_CHILD">MATERNAL_CHILD</option>
                    <option value="EMERGENCY">EMERGENCY</option>
                    <option value="CHRONIC_CARE">CHRONIC_CARE</option>
                    <option value="VACCINE">VACCINE</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Dosage Form</label>
                  <select
                    value={newMed.dosageForm}
                    onChange={(e) => setNewMed({ ...newMed, dosageForm: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border text-xs bg-white"
                  >
                    <option value="Tablet">Tablet</option>
                    <option value="Syrup">Syrup</option>
                    <option value="Injection">Injection</option>
                    <option value="Sachet">Sachet (ORS)</option>
                    <option value="Capsule">Capsule</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Quantity</label>
                  <input
                    type="number"
                    required
                    value={newMed.quantity}
                    onChange={(e) => setNewMed({ ...newMed, quantity: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Unit</label>
                  <input
                    type="text"
                    value={newMed.unit}
                    onChange={(e) => setNewMed({ ...newMed, unit: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border text-xs"
                    placeholder="tablets/vials"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Min Threshold</label>
                  <input
                    type="number"
                    value={newMed.minThreshold}
                    onChange={(e) => setNewMed({ ...newMed, minThreshold: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border text-xs"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-md"
                >
                  Add to Dispensary
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

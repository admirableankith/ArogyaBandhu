import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  Pill,
  MapPin,
  Bot,
  AlertTriangle,
  Activity,
  HeartPulse,
  Stethoscope,
  Building2,
  ShieldCheck,
  Package
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ isOpen, onClose }) {
  const { user, t } = useAuth();
  const role = user?.role || 'patient';

  const baseLinks = [
    { to: '/', label: t('dashboard'), icon: LayoutDashboard },
    { to: '/ai-assistant', label: t('aiAssistant'), icon: Bot, badge: 'AI' },
    { to: '/facilities', label: t('facilities'), icon: MapPin },
    { to: '/emergency', label: t('emergencyCenter'), icon: AlertTriangle, urgent: true },
  ];

  const roleSpecificLinks = {
    patient: [
      { to: '/records', label: t('myRecords'), icon: FileText },
      { to: '/appointments', label: t('appointments'), icon: Calendar },
      { to: '/inventory', label: 'Jan Aushadhi Medicine Finder', icon: Pill },
    ],
    asha: [
      { to: '/asha/registry', label: 'Village Health Registry', icon: Users },
      { to: '/asha/screening', label: 'Doorstep Vitals Screening', icon: HeartPulse },
      { to: '/records', label: 'Patient EMR & MCP Cards', icon: FileText },
      { to: '/appointments', label: 'Teleconsultation Referrals', icon: Calendar },
      { to: '/inventory', label: 'ASHA Drug Kit Inventory', icon: Pill },
    ],
    doctor: [
      { to: '/doctor/queue', label: 'PHC Tele-OPD Queue', icon: Stethoscope },
      { to: '/records', label: 'Patient EMR & Vitals History', icon: FileText },
      { to: '/appointments', label: 'Consultation Calendar', icon: Calendar },
      { to: '/inventory', label: 'Essential Drug Stock', icon: Pill },
    ],
    pharmacist: [
      { to: '/inventory', label: t('pharmacy'), icon: Package },
      { to: '/records', label: 'Prescription Verification', icon: FileText },
      { to: '/facilities', label: 'Kendra Directory', icon: Building2 },
    ],
    admin: [
      { to: '/admin/surveillance', label: 'District Surveillance', icon: Activity },
      { to: '/asha/registry', label: 'District Citizen Registry', icon: Users },
      { to: '/inventory', label: 'District Medicine Supply', icon: Package },
      { to: '/emergency', label: '108 Dispatch Command', icon: AlertTriangle, urgent: true },
      { to: '/facilities', label: 'Health Facilities Directory', icon: Building2 },
    ],
  };

  const navItems = [
    ...baseLinks.slice(0, 1),
    ...(roleSpecificLinks[role] || []),
    ...baseLinks.slice(1),
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/50 z-30 lg:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Sidebar Aside */}
      <aside
        className={`fixed lg:sticky top-16 z-30 h-[calc(100vh-4rem)] w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Navigation list */}
        <div className="p-4 space-y-1.5 overflow-y-auto">
          <div className="px-3 py-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
            {role.toUpperCase()} PORTAL NAVIGATION
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => onClose && onClose()}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                      : item.urgent
                      ? 'text-red-700 bg-red-50 hover:bg-red-100 font-bold'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 flex-shrink-0 ${item.urgent ? 'text-red-600' : ''}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-1.5 py-0.5 rounded">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Footer Emergency Call Box */}
        <div className="p-4 border-t border-slate-100">
          <div className="bg-gradient-to-br from-red-50 to-orange-50 p-3.5 rounded-2xl border border-red-100">
            <div className="flex items-center gap-2 text-red-900 font-bold text-xs">
              <ShieldCheck className="w-4 h-4 text-red-600" />
              <span>NHM Toll-Free 108</span>
            </div>
            <p className="text-[11px] text-red-700 mt-1">24x7 Ambulance & Emergency Obstetric Care</p>
            <a
              href="tel:108"
              className="mt-2.5 block text-center bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs py-2 rounded-xl transition-colors shadow-sm"
            >
              Call 108 Now
            </a>
          </div>
        </div>
      </aside>
    </>
  );
}

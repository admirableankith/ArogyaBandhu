import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  HeartHandshake, 
  Bell, 
  AlertTriangle, 
  LogOut, 
  User, 
  Globe, 
  Check, 
  Sparkles,
  Menu,
  X,
  Stethoscope,
  Shield,
  Pill,
  Users
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import RoleBadge from './RoleBadge';

export default function Navbar({ onOpenEmergency, onToggleSidebar }) {
  const { user, logout, demoLogin, language, setLanguage, t } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const navigate = useNavigate();

  const handleRoleSwitch = async (role) => {
    setShowRoleDropdown(false);
    await demoLogin(role);
    navigate('/');
  };

  const languages = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'hi', label: 'हिन्दी', native: 'Hindi' },
    { code: 'kn', label: 'ಕನ್ನಡ', native: 'Kannada' },
    { code: 'te', label: 'తెలుగు', native: 'Telugu' },
    { code: 'bn', label: 'বাংলা', native: 'Bengali' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      {/* Top Banner: 1-Click Demo Switcher Bar for Hackathon judges */}
      <div className="bg-slate-900 text-slate-200 text-xs px-4 py-1.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-400" /> Hackathon Demo Switcher
          </span>
          <span className="hidden sm:inline text-slate-400">Switch Roles Instantly:</span>
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
          <button
            onClick={() => handleRoleSwitch('patient')}
            className={`px-2 py-0.5 rounded text-xs font-semibold transition-all ${
              user?.role === 'patient'
                ? 'bg-emerald-600 text-white font-bold'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            👤 Citizen
          </button>
          <button
            onClick={() => handleRoleSwitch('asha')}
            className={`px-2 py-0.5 rounded text-xs font-semibold transition-all ${
              user?.role === 'asha'
                ? 'bg-pink-600 text-white font-bold'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            👩‍⚕️ ASHA
          </button>
          <button
            onClick={() => handleRoleSwitch('doctor')}
            className={`px-2 py-0.5 rounded text-xs font-semibold transition-all ${
              user?.role === 'doctor'
                ? 'bg-blue-600 text-white font-bold'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            🩺 Doctor
          </button>
          <button
            onClick={() => handleRoleSwitch('pharmacist')}
            className={`px-2 py-0.5 rounded text-xs font-semibold transition-all ${
              user?.role === 'pharmacist'
                ? 'bg-amber-600 text-white font-bold'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            💊 Pharmacist
          </button>
          <button
            onClick={() => handleRoleSwitch('admin')}
            className={`px-2 py-0.5 rounded text-xs font-semibold transition-all ${
              user?.role === 'admin'
                ? 'bg-purple-600 text-white font-bold'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            🏛️ District Admin
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left Brand + Sidebar toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 lg:hidden"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-slate-900">
                  {t('appName')}
                </span>
                <span className="hidden md:inline-block text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded border border-emerald-200">
                  NHM Rural
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                {t('tagline')}
              </p>
            </div>
          </Link>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Emergency SOS Button */}
          <button
            onClick={onOpenEmergency}
            className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-3 sm:px-4 py-2 rounded-xl font-extrabold text-xs sm:text-sm tracking-wide shadow-md shadow-red-500/30 transition-all hover:scale-105 active:scale-95 animate-emergency"
          >
            <AlertTriangle className="w-4 h-4 text-yellow-300" />
            <span>{t('emergencySOS')}</span>
          </button>

          {/* Language Switcher */}
          <div className="relative">
            <button
              onClick={() => {
                setShowLangDropdown(!showLangDropdown);
                setShowNotifs(false);
              }}
              className="p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-1 text-xs font-bold transition-colors"
              title="Change Language"
            >
              <Globe className="w-4 h-4 text-emerald-600" />
              <span className="uppercase">{language}</span>
            </button>

            {showLangDropdown && (
              <div className="absolute right-0 mt-2 w-44 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Select Language
                </div>
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setShowLangDropdown(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                      language === lang.code ? 'font-bold text-emerald-600 bg-emerald-50' : 'text-slate-700'
                    }`}
                  >
                    <span>{lang.native} ({lang.label})</span>
                    {language === lang.code && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Real-time Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifs(!showNotifs);
                setShowLangDropdown(false);
              }}
              className="p-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 relative transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-bounce">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifs && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in zoom-in-95">
                <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-sm">Health Alerts & Reminders</span>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-[11px] text-emerald-400 hover:underline font-semibold"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">
                      No notifications at this time.
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif._id}
                        onClick={() => markAsRead(notif._id)}
                        className={`p-3.5 text-xs hover:bg-slate-50 cursor-pointer transition-colors ${
                          !notif.isRead ? 'bg-emerald-50/50 font-semibold' : 'text-slate-600'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className={`font-bold ${notif.priority === 'HIGH' ? 'text-rose-700' : 'text-slate-900'}`}>
                            {notif.title}
                          </span>
                          {!notif.isRead && (
                            <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-slate-600 text-[11px] mt-1 line-clamp-2">
                          {notif.message}
                        </p>
                        <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400">
                          <span>{new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          {notif.dueDate && (
                            <span className="text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded font-bold">
                              Due: {new Date(notif.dueDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Info / Role Badge */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="hidden md:block text-right">
                <div className="text-xs font-bold text-slate-900 leading-tight">{user.name}</div>
                <div className="text-[10px] text-slate-500 font-medium">{user.assignedPhc || user.village}</div>
              </div>
              <RoleBadge role={user.role} size="small" />
              <button
                onClick={logout}
                className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
            >
              Login
            </Link>
          )}

        </div>
      </div>
    </header>
  );
}

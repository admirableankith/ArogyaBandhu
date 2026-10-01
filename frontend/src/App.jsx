import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import EmergencyModal from './components/EmergencyModal';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AiHealthAssistant from './pages/AiHealthAssistant';
import FacilitiesMap from './pages/FacilitiesMap';
import EmergencyCenter from './pages/EmergencyCenter';
import HealthRecords from './pages/HealthRecords';
import Appointments from './pages/Appointments';
import Inventory from './pages/Inventory';
import AshaPortal from './pages/AshaPortal';
import DoctorPortal from './pages/DoctorPortal';
import AdminPortal from './pages/AdminPortal';
import PharmacyPortal from './pages/PharmacyPortal';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-bold text-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <span>Verifying ArogyaBandhu Session...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-bold text-sm">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function AppLayout({ children, onOpenEmergency }) {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-bold text-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <span>Initializing ArogyaBandhu Rural Health Platform...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar
        onOpenEmergency={onOpenEmergency}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl w-full mx-auto overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

function MainApp() {
  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AppLayout onOpenEmergency={() => setEmergencyModalOpen(true)}>
                <Routes>
                  <Route path="/" element={<Dashboard onOpenEmergency={() => setEmergencyModalOpen(true)} />} />
                  <Route path="/ai-assistant" element={<AiHealthAssistant />} />
                  <Route path="/facilities" element={<FacilitiesMap />} />
                  <Route path="/emergency" element={<EmergencyCenter onOpenEmergency={() => setEmergencyModalOpen(true)} />} />
                  <Route path="/records" element={<HealthRecords />} />
                  <Route path="/appointments" element={<Appointments />} />
                  <Route path="/inventory" element={<Inventory />} />
                  <Route path="/asha/registry" element={<AshaPortal />} />
                  <Route path="/asha/screening" element={<AshaPortal />} />
                  <Route path="/doctor/queue" element={<DoctorPortal />} />
                  <Route path="/admin/surveillance" element={<AdminPortal />} />
                  <Route path="/pharmacy" element={<PharmacyPortal />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </AppLayout>
            </ProtectedRoute>
          }
        />
      </Routes>

      <EmergencyModal
        isOpen={emergencyModalOpen}
        onClose={() => setEmergencyModalOpen(false)}
      />
    </Router>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <MainApp />
      </NotificationProvider>
    </AuthProvider>
  );
}

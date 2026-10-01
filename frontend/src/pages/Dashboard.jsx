import React from 'react';
import { useAuth } from '../context/AuthContext';
import PatientPortal from './PatientPortal';
import AshaPortal from './AshaPortal';
import DoctorPortal from './DoctorPortal';
import PharmacyPortal from './PharmacyPortal';
import AdminPortal from './AdminPortal';

export default function Dashboard({ onOpenEmergency }) {
  const { user } = useAuth();
  const role = user?.role || 'patient';

  switch (role) {
    case 'asha':
      return <AshaPortal onOpenEmergency={onOpenEmergency} />;
    case 'doctor':
      return <DoctorPortal onOpenEmergency={onOpenEmergency} />;
    case 'pharmacist':
      return <PharmacyPortal onOpenEmergency={onOpenEmergency} />;
    case 'admin':
      return <AdminPortal onOpenEmergency={onOpenEmergency} />;
    case 'patient':
    default:
      return <PatientPortal onOpenEmergency={onOpenEmergency} />;
  }
}

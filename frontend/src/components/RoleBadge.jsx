import React from 'react';

const roleConfig = {
  patient: {
    label: 'Citizen / Patient',
    hindi: 'नागरिक / मरीज',
    bg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    icon: '👤',
  },
  asha: {
    label: 'ASHA Sangini',
    hindi: 'आशा संगिनी',
    bg: 'bg-pink-100 text-pink-800 border-pink-300',
    icon: '👩‍⚕️',
  },
  doctor: {
    label: 'Medical Officer',
    hindi: 'चिकित्सा अधिकारी',
    bg: 'bg-blue-100 text-blue-800 border-blue-300',
    icon: '🩺',
  },
  pharmacist: {
    label: 'Jan Aushadhi Pharmacist',
    hindi: 'फार्मासिस्ट',
    bg: 'bg-amber-100 text-amber-800 border-amber-300',
    icon: '💊',
  },
  admin: {
    label: 'District Health Officer',
    hindi: 'जिला मुख्य चिकित्सा अधिकारी',
    bg: 'bg-purple-100 text-purple-800 border-purple-300',
    icon: '🏛️',
  },
};

export default function RoleBadge({ role = 'patient', size = 'normal' }) {
  const conf = roleConfig[role] || roleConfig.patient;

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full border shadow-sm ${
        conf.bg
      } ${size === 'small' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'}`}
    >
      <span>{conf.icon}</span>
      <span>{conf.label}</span>
    </span>
  );
}

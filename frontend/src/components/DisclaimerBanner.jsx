import React, { useState } from 'react';
import { ShieldAlert, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function DisclaimerBanner({ compact = false }) {
  const [dismissed, setDismissed] = useState(false);
  const { t } = useAuth();

  if (dismissed) return null;

  if (compact) {
    return (
      <div className="bg-amber-50 border border-amber-200 text-amber-900 px-3 py-1.5 rounded-lg text-xs flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 font-medium">
          <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span><strong>Clinical Note:</strong> AI triage provides decision support only, not certified clinical diagnosis. Always consult a registered Medical Officer.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 p-4 rounded-r-xl shadow-sm text-slate-800 relative">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-amber-100 text-amber-700 rounded-lg flex-shrink-0 mt-0.5">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div className="pr-6">
          <h4 className="font-bold text-amber-950 text-sm flex items-center gap-2">
            <span>{t('disclaimerTitle')}</span>
            <span className="bg-amber-200 text-amber-900 text-[10px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded">
              Statutory Guideline
            </span>
          </h4>
          <p className="text-xs text-amber-900/90 mt-1 leading-relaxed">
            {t('disclaimerText')}
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-3 right-3 text-amber-700 hover:text-amber-950 p-1 rounded-md hover:bg-amber-100 transition-colors"
          title="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

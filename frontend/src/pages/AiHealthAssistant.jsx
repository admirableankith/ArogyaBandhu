import React, { useState } from 'react';
import {
  Bot,
  Sparkles,
  Send,
  AlertTriangle,
  HeartPulse,
  Pill,
  ShieldAlert,
  HelpCircle,
  CheckCircle2,
  FileQuestion,
  User,
  Activity,
  Mic,
  Volume2
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import DisclaimerBanner from '../components/DisclaimerBanner';

export default function AiHealthAssistant() {
  const { user, language } = useAuth();
  const [activeTab, setActiveTab] = useState('triage'); // 'triage', 'chat', 'prescription'

  // Triage Form State
  const [symptoms, setSymptoms] = useState('');
  const [age, setAge] = useState('28');
  const [gender, setGender] = useState('Female');
  const [isPregnant, setIsPregnant] = useState(false);
  const [bpSystolic, setBpSystolic] = useState('');
  const [bpDiastolic, setBpDiastolic] = useState('');
  const [spO2, setSpO2] = useState('');
  const [triageResult, setTriageResult] = useState(null);
  const [triaging, setTriaging] = useState(false);

  // Chat State
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'model',
      content:
        'Namaste! I am your ArogyaBandhu Rural Health Assistant. You can ask me about pregnancy care, child vaccination schedules (UIP), ORS preparation, blood pressure care, or local PHC services. How can I help you today?',
    },
  ]);
  const [query, setQuery] = useState('');
  const [chatting, setChatting] = useState(false);

  // Prescription Explainer State
  const [sampleMedText, setSampleMedText] = useState('Paracetamol 500mg, Amoxicillin 500mg, Iron Folic Acid (IFA Red), ORS Sachet');
  const [explainedPrescription, setExplainedPrescription] = useState(null);
  const [explaining, setExplaining] = useState(false);

  const handleTriageSubmit = async (e) => {
    e.preventDefault();
    if (!symptoms.trim()) return;

    setTriaging(true);
    setTriageResult(null);

    try {
      const res = await api.post('/ai/triage', {
        symptoms,
        age: Number(age),
        gender,
        isPregnant,
        vitals: {
          bpSystolic: bpSystolic ? Number(bpSystolic) : undefined,
          bpDiastolic: bpDiastolic ? Number(bpDiastolic) : undefined,
          spO2: spO2 ? Number(spO2) : undefined,
        },
        language,
      });

      if (res.data.success) {
        setTriageResult(res.data.data);
      }
    } catch (err) {
      alert('Triage error: ' + (err.response?.data?.message || err.message));
    } finally {
      setTriaging(false);
    }
  };

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userText = query;
    setQuery('');
    const newHistory = [...chatMessages, { role: 'user', content: userText }];
    setChatMessages(newHistory);
    setChatting(true);

    try {
      const res = await api.post('/ai/chat', {
        message: userText,
        history: newHistory,
        language,
      });

      if (res.data.success) {
        setChatMessages((prev) => [
          ...prev,
          { role: 'model', content: res.data.data.reply },
        ]);
      }
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        { role: 'model', content: 'Apologies, could not process request right now. Please consult your local PHC.' },
      ]);
    } finally {
      setChatting(false);
    }
  };

  const handleExplainPrescription = async () => {
    setExplaining(true);
    try {
      const rawMeds = sampleMedText.split(',').map((name) => ({
        name: name.trim(),
        dosage: 'As prescribed',
        frequency: '1-0-1 (After Meals)',
      }));

      const res = await api.post('/ai/explain-prescription', {
        medications: rawMeds,
        diagnosis: 'General Rural Healthcare Prescription',
        language,
      });

      if (res.data.success) {
        setExplainedPrescription(res.data.data);
      }
    } catch (err) {
      alert('Prescription decoding error: ' + (err.response?.data?.message || err.message));
    } finally {
      setExplaining(false);
    }
  };

  const handleSpeakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-700 via-emerald-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full inline-block mb-2">
            AI Clinical Decision Support & Rural Health Assistant
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2.5">
            <Bot className="w-8 h-8 text-emerald-400" />
            ArogyaBandhu AI Assistant
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100 mt-1 max-w-2xl">
            Symptom triage, red flag detection, Universal Immunization guidance, and plain-language prescription decoding.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900/60 p-2 rounded-2xl border border-slate-700">
          <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
          <span className="text-xs font-bold text-slate-200">National Health Mission Guidelines</span>
        </div>
      </div>

      <DisclaimerBanner />

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('triage')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === 'triage'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Activity className="w-4 h-4" /> Symptom Triage & Red Flags
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === 'chat'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Bot className="w-4 h-4" /> Conversational Health Guide
        </button>
        <button
          onClick={() => setActiveTab('prescription')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === 'prescription'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Pill className="w-4 h-4" /> Prescription Explainer
        </button>
      </div>

      {/* TAB 1: Symptom Triage */}
      {activeTab === 'triage' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Triage Form */}
          <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-600" />
              <span>Describe Symptoms for Clinical Triage</span>
            </h3>

            <form onSubmit={handleTriageSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Reported Symptoms & Complaints *
                </label>
                <textarea
                  rows={3}
                  required
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="e.g. 26y pregnant with headache and blurred vision / High fever with chills and vomiting for 3 days / Snakebite on foot while farming..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Age</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border text-xs bg-white"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="pregCheckTriage"
                  checked={isPregnant}
                  onChange={(e) => setIsPregnant(e.target.checked)}
                  className="rounded text-pink-600 focus:ring-pink-500 w-4 h-4"
                />
                <label htmlFor="pregCheckTriage" className="text-xs font-bold text-slate-700">
                  Patient is Pregnant (Triggers Maternal Red-Flag Protocol)
                </label>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase block">Optional Vitals Check</span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400 block">BP Systolic</span>
                    <input
                      type="number"
                      placeholder="120"
                      value={bpSystolic}
                      onChange={(e) => setBpSystolic(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border text-xs bg-white"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">BP Diastolic</span>
                    <input
                      type="number"
                      placeholder="80"
                      value={bpDiastolic}
                      onChange={(e) => setBpDiastolic(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border text-xs bg-white"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">SpO2 %</span>
                    <input
                      type="number"
                      placeholder="98"
                      value={spO2}
                      onChange={(e) => setSpO2(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border text-xs bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Sample Quick Prompts for Hackathon Demo */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Try realistic test cases:</span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setSymptoms('High fever with chills and vomiting for 2 days. Child is lethargic and not taking fluids.');
                      setAge('4');
                      setGender('Female');
                      setIsPregnant(false);
                    }}
                    className="text-[11px] bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 px-2.5 py-1 rounded-lg transition-colors border border-slate-200"
                  >
                    Child High Fever & Dehydration
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSymptoms('Snake bite on foot while in paddy field 1 hour ago. Swelling spreading up the leg, feeling dizzy.');
                      setAge('35');
                      setGender('Male');
                      setIsPregnant(false);
                    }}
                    className="text-[11px] bg-red-50 hover:bg-red-100 text-red-800 px-2.5 py-1 rounded-lg transition-colors border border-red-200 font-bold"
                  >
                    🐍 Venomous Snakebite SOS
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSymptoms('34 weeks pregnant with severe persistent headache, blurred vision, and swollen face/hands.');
                      setAge('26');
                      setGender('Female');
                      setIsPregnant(true);
                      setBpSystolic('150');
                      setBpDiastolic('98');
                    }}
                    className="text-[11px] bg-pink-50 hover:bg-pink-100 text-pink-800 px-2.5 py-1 rounded-lg transition-colors border border-pink-200 font-bold"
                  >
                    🤰 Maternal Pre-Eclampsia Red Flag
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={triaging}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3.5 rounded-2xl transition-all shadow-md shadow-emerald-600/20 text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                {triaging ? 'Running Clinical Triage Engine...' : 'Evaluate Symptoms & Triage Level'}
              </button>
            </form>
          </div>

          {/* Triage Output Card */}
          <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-emerald-600" />
                <span>Clinical Triage Assessment</span>
              </h3>
              {triageResult && (
                <button
                  onClick={() => handleSpeakText(triageResult.summary)}
                  className="p-2 rounded-xl text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                  title="Read aloud"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {triageResult ? (
              <div className="space-y-4 animate-in fade-in duration-200">
                {/* Urgency Badge */}
                <div className={`p-4 rounded-2xl border-2 flex items-center justify-between ${
                  triageResult.urgency === 'CRITICAL'
                    ? 'bg-red-50 border-red-400 text-red-900'
                    : triageResult.urgency === 'HIGH'
                    ? 'bg-amber-50 border-amber-400 text-amber-900'
                    : 'bg-emerald-50 border-emerald-300 text-emerald-900'
                }`}>
                  <div>
                    <span className="text-[10px] uppercase font-black tracking-wider block">Priority Classification</span>
                    <span className="text-xl font-black">{triageResult.urgency}</span>
                    <p className="text-xs font-semibold mt-0.5">{triageResult.category}</p>
                  </div>
                  <span className="text-3xl">
                    {triageResult.urgency === 'CRITICAL' ? '🚨' : triageResult.urgency === 'HIGH' ? '⚠️' : '✅'}
                  </span>
                </div>

                <div className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <strong>Clinical Summary:</strong> {triageResult.summary}
                </div>

                {/* Red Flags */}
                {triageResult.redFlags?.length > 0 && (
                  <div className="p-3.5 bg-rose-50 rounded-2xl border border-rose-200 text-xs space-y-1">
                    <h4 className="font-extrabold text-rose-900 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-600" /> Critical Red Flag Signs:
                    </h4>
                    <ul className="list-disc list-inside text-rose-800 pl-1 space-y-0.5">
                      {triageResult.redFlags.map((rf, i) => (
                        <li key={i}>{rf}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Immediate First Aid */}
                {triageResult.immediateFirstAid?.length > 0 && (
                  <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs space-y-1">
                    <h4 className="font-bold text-emerald-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Immediate Non-Invasive First Aid:
                    </h4>
                    <ul className="list-disc list-inside text-emerald-800 pl-1 space-y-0.5">
                      {triageResult.immediateFirstAid.map((fa, i) => (
                        <li key={i}>{fa}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Doctor Questions */}
                {triageResult.doctorQuestions?.length > 0 && (
                  <div className="p-3.5 bg-blue-50 rounded-2xl border border-blue-200 text-xs space-y-1">
                    <h4 className="font-bold text-blue-900 flex items-center gap-1.5">
                      <FileQuestion className="w-4 h-4 text-blue-600" /> Questions to Ask the Doctor / ASHA:
                    </h4>
                    <ul className="list-disc list-inside text-blue-800 pl-1 space-y-0.5">
                      {triageResult.doctorQuestions.map((dq, i) => (
                        <li key={i}>{dq}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recommended Next Step */}
                <div className="p-4 bg-slate-900 text-white rounded-2xl text-xs space-y-1">
                  <span className="text-[10px] text-emerald-400 font-extrabold uppercase">Recommended Next Step</span>
                  <p className="font-bold text-sm text-slate-100">{triageResult.recommendedNextStep}</p>
                </div>

                <div className="text-[10px] text-slate-400 italic">
                  Engine Source: {triageResult.source || 'Clinical Knowledge Engine'}
                </div>
              </div>
            ) : (
              <div className="text-center py-20 text-slate-400 text-xs space-y-2">
                <Activity className="w-8 h-8 mx-auto text-slate-300" />
                <p>Enter patient symptoms on the left to generate clinical triage guidance.</p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 2: Conversational Chat */}
      {activeTab === 'chat' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4 max-w-4xl mx-auto">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Bot className="w-6 h-6 text-emerald-600" />
              <div>
                <h3 className="font-bold text-slate-900 text-base">Rural Health Knowledge Guide</h3>
                <p className="text-[11px] text-slate-500">Ask questions in English, हिन्दी, or regional languages</p>
              </div>
            </div>
            <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-full border border-emerald-200">
              Online
            </span>
          </div>

          {/* Chat Messages */}
          <div className="space-y-3 max-h-[450px] overflow-y-auto p-2">
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 text-xs sm:text-sm ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.role === 'model' && (
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold flex-shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`p-4 rounded-2xl max-w-xl leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-emerald-600 text-white rounded-tr-none'
                      : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200/60'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.content}</p>
                  {msg.role === 'model' && (
                    <button
                      onClick={() => handleSpeakText(msg.content)}
                      className="mt-2 text-[10px] text-emerald-700 hover:underline flex items-center gap-1 font-bold"
                    >
                      <Volume2 className="w-3 h-3" /> Listen
                    </button>
                  )}
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold flex-shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
            {chatting && (
              <div className="flex gap-2 text-xs text-slate-400 items-center">
                <Bot className="w-4 h-4 animate-bounce" />
                <span>Thinking...</span>
              </div>
            )}
          </div>

          {/* Quick Prompts */}
          <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
            <span className="text-[10px] text-slate-400 font-bold uppercase w-full">Quick questions:</span>
            <button
              onClick={() => setQuery('What vaccines are due for a 9 month baby?')}
              className="text-xs bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded-xl text-slate-700"
            >
              👶 9 Month Vaccines
            </button>
            <button
              onClick={() => setQuery('How to prepare and use ORS for diarrhea at home?')}
              className="text-xs bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded-xl text-slate-700"
            >
              💧 ORS Instructions
            </button>
            <button
              onClick={() => setQuery('What are the 4 essential Antenatal Care (ANC) checkups for pregnant mothers?')}
              className="text-xs bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded-xl text-slate-700"
            >
              🤰 ANC Checkup Schedule
            </button>
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendChat} className="flex gap-2 pt-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask about medications, vaccination, symptoms, PHC services..."
              className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={chatting || !query.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-3 rounded-2xl transition-colors disabled:opacity-50 flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: Prescription Explainer */}
      {activeTab === 'prescription' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 max-w-3xl mx-auto">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Pill className="w-5 h-5 text-emerald-600" />
              <span>Digital Prescription Plain-Language Explainer</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Converts doctor prescriptions and Jan Aushadhi generic names into simple dosage timings, precautions, and food instructions.
            </p>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-700 uppercase">
              Prescribed Medicines (Comma separated)
            </label>
            <input
              type="text"
              value={sampleMedText}
              onChange={(e) => setSampleMedText(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500"
            />
            <button
              onClick={handleExplainPrescription}
              disabled={explaining}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              {explaining ? 'Analyzing Medicines...' : 'Explain in Simple Language'}
            </button>
          </div>

          {explainedPrescription && (
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <div className="grid grid-cols-1 gap-3">
                {explainedPrescription.medications?.map((med, i) => (
                  <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-900 text-sm">{med.medicineName}</span>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                        {med.frequency}
                      </span>
                    </div>
                    <p className="text-slate-700"><strong>Purpose:</strong> {med.purpose}</p>
                    <p className="text-amber-800 bg-amber-50 p-2 rounded-xl border border-amber-200">
                      <strong>⚠️ Precautions:</strong> {med.precautions}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}

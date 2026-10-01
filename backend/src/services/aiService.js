/**
 * ArogyaBandhu AI Health Decision Support Service
 * 
 * Provides:
 * 1. Symptom Triage & Red Flag Detection for Rural Primary Healthcare
 * 2. Multi-turn Bilingual Rural Health Assistant
 * 3. Digital Prescription Explainer & Drug Safety Instructions
 * 
 * Supports both Live Google Gemini API and a clinical rule-based fallback
 * grounded in Indian National Health Mission (NHM) / WHO Rural Triage Guidelines.
 */

const MEDICAL_DISCLAIMER = 
  "DISCLAIMER: ArogyaBandhu AI provides informational guidance and triage categorization only. It is NOT a certified medical diagnosis and cannot replace the examination of a registered Medical Officer (MBBS/Ayush). In case of severe pain, bleeding, breathing difficulty, or unconsciousness, immediately visit the nearest PHC or dial 108.";

/**
 * Fallback Clinical Triage Engine
 */
function localClinicalTriage(symptoms = '', age = 30, gender = 'Female', isPregnant = false, vitals = {}) {
  const text = symptoms.toLowerCase();
  let urgency = 'MODERATE';
  let category = 'General OPD Consultation';
  let redFlags = [];
  let immediateFirstAid = [];
  let doctorQuestions = [];
  let possibleConditions = [];

  // Check Critical Emergency Red Flags first
  if (
    text.includes('snake') || 
    text.includes('bite') ||
    text.includes('poison') ||
    (text.includes('chest pain') && (text.includes('sweat') || text.includes('left arm') || text.includes('breath'))) ||
    text.includes('unconscious') ||
    text.includes('seizure') ||
    text.includes('fits') ||
    (isPregnant && (text.includes('bleed') || text.includes('severe headache') || text.includes('swelling in face')))
  ) {
    urgency = 'CRITICAL';
    category = 'Emergency Resuscitation & Anti-Venom/Cardiac Protocol';
    
    if (text.includes('snake')) {
      redFlags.push('Suspected venomous snake bite (Viper/Krait/Cobra). Risk of neuro/hemotoxicity.');
      immediateFirstAid.push('Keep the patient calm and immobilize the affected limb with a splint below heart level.');
      immediateFirstAid.push('DO NOT tie tight tourniquet, DO NOT cut or suck the bite wound.');
      immediateFirstAid.push('Rush to the nearest PHC/CHC equipped with Polyvalent Anti-Snake Venom (ASVS).');
      doctorQuestions.push('What time did the bite occur?');
      doctorQuestions.push('Are there any fang marks, progressive swelling, or eyelid drooping (ptosis)?');
      possibleConditions.push('Ophitoxaemia (Snakebite Envenomation)');
    } else if (isPregnant) {
      redFlags.push('Obstetric Red Flag: Potential Eclampsia / Antepartum Haemorrhage.');
      immediateFirstAid.push('Keep mother on her left side (Left Lateral position) to maintain placental blood flow.');
      immediateFirstAid.push('Contact ASHA worker immediately for 102/108 Janani Shishu Suraksha ambulance dispatch.');
      doctorQuestions.push('What is the gestational age (weeks)?', 'Are fetal movements felt?');
      possibleConditions.push('Pre-eclampsia / Antepartum Haemorrhage');
    } else {
      redFlags.push('Possible acute coronary syndrome / severe trauma / neurologic crisis.');
      immediateFirstAid.push('Keep airway clear, loosen tight clothing, provide comfort and dial 108 immediately.');
      possibleConditions.push('Acute Coronary Event / Neurological Emergency');
    }
  } 
  // High Urgency
  else if (
    text.includes('high fever') ||
    text.includes('vomiting') && text.includes('diarrhea') ||
    text.includes('breath') ||
    text.includes('cough with blood') ||
    (vitals.spO2 && vitals.spO2 < 94) ||
    (vitals.bpSystolic && vitals.bpSystolic > 160)
  ) {
    urgency = 'HIGH';
    category = 'Urgent PHC Doctor Evaluation';

    if (text.includes('diarrhea') || text.includes('vomiting') || text.includes('loose stool')) {
      redFlags.push('Dehydration warning: Dry mouth, sunken eyes, low urine output, lethargy.');
      immediateFirstAid.push('Prepare and start Oral Rehydration Salts (ORS) solution immediately (1 sachet in 1 liter clean boiled water).');
      immediateFirstAid.push('Continue feeding and clean fluids. Give Zinc supplementation if child.');
      doctorQuestions.push('How many watery episodes in the last 24 hours?', 'Is blood present in stools?');
      possibleConditions.push('Acute Gastroenteritis / Dehydration');
    } else if (text.includes('fever') && (text.includes('chills') || text.includes('rash') || text.includes('joint'))) {
      redFlags.push('Vector-borne or endemic febrile illness (Malaria, Dengue, Chikungunya, Typhoid).');
      immediateFirstAid.push('Cold sponging on forehead/body with room temperature water.', 'Drink plenty of water and coconut water.');
      immediateFirstAid.push('Avoid self-medicating with Aspirin or Brufen; use Paracetamol only under dosage limits.');
      doctorQuestions.push('Is the fever continuous or coming in cycles with chills?', 'Any petechial rash or bleeding gums?');
      possibleConditions.push('Febrile Illness (Suspected Malaria / Dengue / Typhoid)');
    } else {
      redFlags.push('Elevated vitals or respiratory distress.');
      immediateFirstAid.push('Rest in upright sitting position and visit PHC OPD.');
      possibleConditions.push('Acute Respiratory Infection / Hypertensive Urgency');
    }
  }
  // Moderate / Mild
  else {
    urgency = 'MILD_TO_MODERATE';
    category = 'Sub-centre / PHC Teleconsultation';
    if (text.includes('cough') || text.includes('cold') || text.includes('throat')) {
      immediateFirstAid.push('Warm saline gargles twice daily.', 'Warm water with tulsi/ginger or honey.');
      doctorQuestions.push('Has the cough lasted for more than 2 weeks (TB screening criteria)?');
      possibleConditions.push('Upper Respiratory Tract Infection');
    } else if (text.includes('joint') || text.includes('back') || text.includes('knee') || text.includes('body ache')) {
      immediateFirstAid.push('Gentle warm compress, adequate hydration, avoid heavy lifting.');
      doctorQuestions.push('Is there joint swelling or morning stiffness?');
      possibleConditions.push('Musculoskeletal Pain / Osteoarthritis');
    } else {
      immediateFirstAid.push('Maintain balanced diet, rest, and drink adequate clean filtered water.');
      doctorQuestions.push('When did symptoms start?', 'Any known chronic illnesses?');
      possibleConditions.push('General Health Complaint');
    }
  }

  return {
    urgency,
    category,
    summary: `Clinical triage summary for ${age}y ${gender}: Identified priority level ${urgency}. ${possibleConditions.join(', ')}.`,
    possibleConditions,
    redFlags,
    immediateFirstAid,
    doctorQuestions,
    recommendedNextStep: urgency === 'CRITICAL' 
      ? 'Immediately trigger Emergency SOS or call 108 for ambulance dispatch to nearest CHC/District Hospital.'
      : urgency === 'HIGH'
      ? 'Visit Primary Health Centre (PHC) today for in-person examination and basic lab tests.'
      : 'Book an in-person or teleconsultation with the PHC Medical Officer or consult your village ASHA worker.',
    disclaimer: MEDICAL_DISCLAIMER,
    source: 'Grounded Clinical Knowledge Engine (NHM Guidelines)',
  };
}

/**
 * Call external Gemini API if available, else gracefully fallback to local engine
 */
async function callGeminiTriage(symptoms, age, gender, isPregnant, vitals, language = 'en') {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return localClinicalTriage(symptoms, age, gender, isPregnant, vitals);
  }

  try {
    const prompt = `
You are ArogyaBandhu AI, an expert clinical triage assistant designed for rural healthcare centers (PHC/Sub-centres in India).
Patient profile:
- Age: ${age}
- Gender: ${gender}
- Pregnant: ${isPregnant ? 'Yes' : 'No'}
- Vitals: ${JSON.stringify(vitals || {})}
- Reported Symptoms: "${symptoms}"
- Language: ${language}

Analyze the symptoms according to Indian National Health Mission (NHM) and WHO rural triage protocols.
Respond in valid JSON format with the following keys:
{
  "urgency": "CRITICAL" | "HIGH" | "MILD_TO_MODERATE",
  "category": "string (e.g. Maternal Red Flag / Vector Borne / General OPD / Emergency)",
  "summary": "Concise 2-line clinical summary",
  "possibleConditions": ["array of differential possibilities"],
  "redFlags": ["critical warning signs to watch for"],
  "immediateFirstAid": ["safe immediate non-invasive rural first aid steps"],
  "doctorQuestions": ["specific questions patient or ASHA should ask the doctor"],
  "recommendedNextStep": "actionable instruction",
  "disclaimer": "${MEDICAL_DISCLAIMER}"
}
Output only the raw JSON object.
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' },
        }),
      }
    );

    if (!response.ok) {
      console.warn('[Gemini API Warning]: Non-200 response, falling back to local clinical triage engine.');
      return localClinicalTriage(symptoms, age, gender, isPregnant, vitals);
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (rawText) {
      const parsed = JSON.parse(rawText);
      parsed.disclaimer = MEDICAL_DISCLAIMER;
      parsed.source = 'Google Gemini 1.5 Flash (Clinical Triage Mode)';
      return parsed;
    }
  } catch (err) {
    console.error('[Gemini API Fallback Triggered]:', err.message);
  }

  return localClinicalTriage(symptoms, age, gender, isPregnant, vitals);
}

/**
 * Health Assistant Chat Service
 */
async function processHealthChat({ query, history = [], language = 'en', userRole = 'patient' }) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  
  if (apiKey) {
    try {
      const systemPrompt = `You are ArogyaBandhu Rural Health Assistant, helping citizens, ASHA workers, and health officers in rural India.
Provide clear, empathetic, and medically grounded explanations. Keep language accessible, simple, and culturally sensitive.
Always remind users that you provide health information support, not formal medical prescriptions.
Current user role: ${userRole}. Language preference: ${language}.`;

      const contents = [
        { role: 'user', parts: [{ text: systemPrompt }] },
        { role: 'model', parts: [{ text: 'Understood. I am ready to provide helpful, safe rural healthcare guidance with clear medical disclaimers.' }] },
        ...history.slice(-6).map((msg) => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text || msg.content }],
        })),
        { role: 'user', parts: [{ text: query }] },
      ];

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          return {
            reply: text,
            disclaimer: MEDICAL_DISCLAIMER,
            source: 'Google Gemini AI',
          };
        }
      }
    } catch (err) {
      console.warn('[Gemini Chat Error, fallback applied]:', err.message);
    }
  }

  // Fallback intelligent responses for common rural health queries
  const q = query.toLowerCase();
  let reply = '';

  if (q.includes('vaccin') || q.includes('tika') || q.includes('immuniz')) {
    reply = `**Universal Immunization Program (UIP) Guidance:**
- **At Birth:** BCG, OPV-0, Hepatitis B (within 24 hrs).
- **At 6, 10, 14 Weeks:** Pentavalent (DPT+HepB+Hib), Rotavirus, IPV, PCV.
- **At 9 Months:** Measles-Rubella (MR 1st dose), Vitamin A.
- **Pregnant Mothers:** Td (Tetanus-Diphtheria) 1st dose early in pregnancy, 2nd dose after 4 weeks.
Please check your village Anganwadi/Sub-centre for the next Village Health and Nutrition Day (VHND) schedule.`;
  } else if (q.includes('pregnancy') || q.includes('garbhavastha') || q.includes('anc')) {
    reply = `**Antenatal Care (ANC) Guidelines for Safe Motherhood:**
1. **Minimum 4 ANC Checkups:** 1st in 1st trimester, 2nd at 14-26 weeks, 3rd at 28-34 weeks, 4th at 36 weeks.
2. **Nutrition & Supplements:** 180 Iron & Folic Acid (IFA) tablets after 1st trimester + Calcium tablets.
3. **Danger Signs:** Severe headache, blurred vision, bleeding, swollen hands/face, reduced baby movement. If present, alert your ASHA worker immediately for referral.`;
  } else if (q.includes('ors') || q.includes('diarrhea') || q.includes('dast')) {
    reply = `**Diarrhea & Dehydration Care:**
1. **ORS Solution:** Mix 1 complete packet of Jan Aushadhi / WHO ORS in 1 Liter of clean boiled & cooled water.
2. Sip frequently after every loose motion.
3. For children under 5: Give Zinc tablet (20mg daily for 14 days) to prevent recurrent episodes.
4. Continue breastfeeding and soft khichdi/banana.`;
  } else if (q.includes('blood pressure') || q.includes('sugar') || q.includes('diabetes')) {
    reply = `**Non-Communicable Disease (NCD) Management:**
- Regular monthly screening at your nearest Ayushman Bharat Health & Wellness Centre.
- Take your prescribed medications (e.g., Amlodipine, Metformin) daily without skipping.
- Limit salt intake to less than 1 teaspoon (5g) per day and avoid processed sweets.
- Schedule a quarterly teleconsultation with your PHC Medical Officer.`;
  } else {
    reply = `Thank you for asking ArogyaBandhu Health Assistant. 
For your inquiry regarding "${query}":
- Ensure adequate rest, balanced nutrition, and safe drinking water.
- If you or a family member is feeling unwell, visit your local Sub-Centre or PHC for routine vitals check and consultation.
- You can book a teleconsultation appointment directly through the Appointments tab.`;
  }

  return {
    reply,
    disclaimer: MEDICAL_DISCLAIMER,
    source: 'ArogyaBandhu Rural Health Knowledge Base',
  };
}

/**
 * Digital Prescription & Medication Explainer
 */
function explainMedications(medications = [], diagnosis = '') {
  const simplified = medications.map((med) => {
    const name = med.name || med.genericName || 'Medicine';
    let purpose = 'General therapeutic relief';
    let precautions = 'Take with a glass of water. Do not skip doses.';
    let timingNote = med.frequency || 'As advised by doctor';

    const lower = name.toLowerCase();
    if (lower.includes('paracetamol') || lower.includes('pcm')) {
      purpose = 'Relieves fever and mild-to-moderate body pain.';
      precautions = 'Do not exceed 4000mg per day. Take after light food.';
    } else if (lower.includes('amoxicillin') || lower.includes('azithromycin') || lower.includes('ciprofloxacin')) {
      purpose = 'Antibiotic for bacterial infection.';
      precautions = 'Complete the full course even if you start feeling better to prevent drug resistance.';
    } else if (lower.includes('ors') || lower.includes('oral rehydration')) {
      purpose = 'Restores essential electrolytes and prevents dehydration.';
      precautions = 'Use prepared solution within 24 hours. Discard remaining after 24 hrs.';
    } else if (lower.includes('iron') || lower.includes('folic') || lower.includes('ifa')) {
      purpose = 'Builds hemoglobin and treats nutritional anemia.';
      precautions = 'Take after meals. Stools may turn dark - this is harmless. Avoid taking with tea or milk.';
    } else if (lower.includes('metformin') || lower.includes('glimepiride')) {
      purpose = 'Controls blood sugar in Type 2 Diabetes.';
      precautions = 'Take with or immediately after meals. Monitor for dizziness or hypoglycemia.';
    } else if (lower.includes('amlodipine') || lower.includes('telmisartan')) {
      purpose = 'Controls high blood pressure (Hypertension).';
      precautions = 'Take at the same time every morning. Do not stop abruptly.';
    } else if (lower.includes('cetirizine') || lower.includes('levocetirizine')) {
      purpose = 'Relieves allergy, cold symptoms, sneezing and itching.';
      precautions = 'May cause mild drowsiness. Best taken before bedtime.';
    }

    return {
      medicineName: name,
      dosage: med.dosage || 'Standard dose',
      frequency: timingNote,
      purpose,
      precautions,
      duration: med.duration || 'As directed',
      specialInstructions: med.instructions || 'Store in a cool dry place away from direct sunlight.',
    };
  });

  return {
    diagnosis: diagnosis || 'Clinical Evaluation',
    patientAdvice: 'Take all medicines exactly as instructed. If you experience rash, nausea, or swelling, contact your PHC immediately.',
    medications: simplified,
    disclaimer: MEDICAL_DISCLAIMER,
  };
}

module.exports = {
  callGeminiTriage,
  processHealthChat,
  explainMedications,
  MEDICAL_DISCLAIMER,
};

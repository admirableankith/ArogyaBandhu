const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Facility = require('../models/Facility');
const Inventory = require('../models/Inventory');
const Appointment = require('../models/Appointment');
const HealthRecord = require('../models/HealthRecord');
const Emergency = require('../models/Emergency');
const Notification = require('../models/Notification');

dotenv.config({ path: __dirname + '/../../.env' });

const seedDatabase = async () => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/arogyabandhu';
    await mongoose.connect(connStr);
    console.log('[Seeder]: Connected to MongoDB...');

    // Clear existing data
    await User.deleteMany({});
    await Patient.deleteMany({});
    await Facility.deleteMany({});
    await Inventory.deleteMany({});
    await Appointment.deleteMany({});
    await HealthRecord.deleteMany({});
    await Emergency.deleteMany({});
    await Notification.deleteMany({});

    console.log('[Seeder]: Cleared old data.');

    // 1. Create Facilities
    const facilities = await Facility.create([
      {
        name: 'Rampur Primary Health Centre (PHC)',
        facilityType: 'PHC',
        address: 'Main Road, Near Panchayat Bhawan, Rampur',
        village: 'Rampur',
        district: 'Varanasi',
        state: 'Uttar Pradesh',
        pincode: '221008',
        location: { lat: 25.3176, lng: 82.9739 },
        phone: '+91 542 229101',
        emergencyHelpline: '108',
        operatingHours: '24x7 Emergency / 8:00 AM - 4:00 PM OPD',
        availableBeds: 6,
        totalBeds: 12,
        doctorCount: 3,
        hasAmbulance: true,
        hasPharmacy: true,
        services: ['24x7 Delivery & ANC', 'Emergency Anti-Venom', 'General OPD', 'Jan Aushadhi Dispensary', 'Telemedicine Room'],
      },
      {
        name: 'Kalyanpur Community Health Centre (CHC)',
        facilityType: 'CHC',
        address: 'Bypass Highway, Kalyanpur Block',
        village: 'Kalyanpur',
        district: 'Varanasi',
        state: 'Uttar Pradesh',
        pincode: '221010',
        location: { lat: 25.345, lng: 82.991 },
        phone: '+91 542 229202',
        emergencyHelpline: '108',
        operatingHours: '24x7 Full Service',
        availableBeds: 18,
        totalBeds: 30,
        doctorCount: 8,
        hasAmbulance: true,
        hasPharmacy: true,
        services: ['Surgical Unit', 'NICU / Sick Newborn Unit', 'Blood Storage Facility', 'Digital X-Ray', 'Ultrasound for ANC'],
      },
      {
        name: 'Shivpur Ayushman Arogya Mandir (Sub-Centre)',
        facilityType: 'SUB_CENTRE',
        address: 'Near Village Primary School, Shivpur',
        village: 'Shivpur',
        district: 'Varanasi',
        state: 'Uttar Pradesh',
        pincode: '221003',
        location: { lat: 25.362, lng: 82.955 },
        phone: '+91 94150 12345',
        emergencyHelpline: '108',
        operatingHours: '9:00 AM - 3:00 PM',
        availableBeds: 2,
        totalBeds: 4,
        doctorCount: 1,
        hasAmbulance: false,
        hasPharmacy: true,
        services: ['Universal Immunization (UIP)', 'Doorstep NCD Screening', 'Maternal MCP Card Tracking', 'First Aid'],
      },
      {
        name: 'Pradhan Mantri Jan Aushadhi Kendra - Rampur Market',
        facilityType: 'JAN_AUSHADHI',
        address: 'Shop 14, Main Market, Rampur Chauraha',
        village: 'Rampur',
        district: 'Varanasi',
        state: 'Uttar Pradesh',
        pincode: '221008',
        location: { lat: 25.321, lng: 82.978 },
        phone: '+91 98380 55443',
        emergencyHelpline: '108',
        operatingHours: '8:00 AM - 8:00 PM',
        availableBeds: 0,
        totalBeds: 0,
        doctorCount: 0,
        hasAmbulance: false,
        hasPharmacy: true,
        services: ['Subsidized Essential Generics (50-90% Discount)', 'Chronic Care Refills', 'Surgical Consumables', 'Sanitary Pads (Suvidha)'],
      },
      {
        name: 'Pandit Deendayal Upadhyaya District Hospital',
        facilityType: 'DISTRICT_HOSPITAL',
        address: 'Pandeypur, Varanasi City',
        village: 'Varanasi Central',
        district: 'Varanasi',
        state: 'Uttar Pradesh',
        pincode: '221002',
        location: { lat: 25.338, lng: 83.008 },
        phone: '+91 542 250100',
        emergencyHelpline: '108',
        operatingHours: '24x7 Level 3 Referral Hospital',
        availableBeds: 42,
        totalBeds: 200,
        doctorCount: 35,
        hasAmbulance: true,
        hasPharmacy: true,
        services: ['Advanced Trauma ICU', 'High Risk Pregnancy C-Section', 'Dialysis Unit', 'Specialist Teleconsultation Hub'],
      },
    ]);

    const phcRampur = facilities[0];
    const chcKalyanpur = facilities[1];

    // 2. Create Users (RBAC)
    const password = 'password123'; // pre-save hook will hash this

    const users = await User.create([
      {
        name: 'Sunita Devi',
        email: 'patient@arogya.in',
        phone: '9876543210',
        password,
        role: 'patient',
        village: 'Rampur',
        district: 'Varanasi',
        abhaId: 'ABHA-9812-4411-8890',
      },
      {
        name: 'Ramu Lal',
        email: 'ramu@arogya.in',
        phone: '9876543211',
        password,
        role: 'patient',
        village: 'Kalyanpur',
        district: 'Varanasi',
        abhaId: 'ABHA-7733-1122-4455',
      },
      {
        name: 'Rekha Devi (ASHA Sangini)',
        email: 'asha@arogya.in',
        phone: '9876543220',
        password,
        role: 'asha',
        village: 'Rampur',
        district: 'Varanasi',
        assignedPhc: 'Rampur Primary Health Centre (PHC)',
      },
      {
        name: 'Dr. Arvind Mishra (Medical Officer)',
        email: 'doctor@arogya.in',
        phone: '9876543230',
        password,
        role: 'doctor',
        village: 'Rampur',
        district: 'Varanasi',
        specialization: 'MBBS, DNB - Family Medicine',
        licenseNumber: 'UPMC-88492',
        assignedPhc: 'Rampur Primary Health Centre (PHC)',
      },
      {
        name: 'Manoj Sharma (Pharmacist)',
        email: 'pharmacist@arogya.in',
        phone: '9876543240',
        password,
        role: 'pharmacist',
        village: 'Rampur',
        district: 'Varanasi',
        licenseNumber: 'UP-PHARMA-1029',
        assignedPhc: 'Rampur Primary Health Centre (PHC)',
      },
      {
        name: 'Dr. S. P. Verma (Chief Medical Officer)',
        email: 'admin@arogya.in',
        phone: '9876543250',
        password,
        role: 'admin',
        village: 'Varanasi Central',
        district: 'Varanasi',
        assignedPhc: 'District Health Administration HQ',
      },
    ]);

    const patientUser = users[0];
    const ramuUser = users[1];
    const ashaUser = users[2];
    const doctorUser = users[3];
    const pharmaUser = users[4];
    const adminUser = users[5];

    // 3. Create Patient Profiles
    const patients = await Patient.create([
      {
        userId: patientUser._id,
        name: 'Sunita Devi',
        age: 26,
        gender: 'Female',
        phone: '9876543210',
        village: 'Rampur',
        block: 'Kashi Vidyapeeth',
        district: 'Varanasi',
        bloodGroup: 'B+',
        isPregnant: true,
        expectedDeliveryDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // ~6 weeks away
        isHighRisk: true,
        highRiskReason: 'Mild Gestational Hypertension & Borderline Hemoglobin (9.4 g/dL)',
        chronicConditions: ['Gestational Hypertension'],
        allergies: ['Penicillin'],
        emergencyContact: {
          name: 'Mukesh Kumar (Husband)',
          relation: 'Husband',
          phone: '+91 98110 54321',
        },
        abhaId: 'ABHA-9812-4411-8890',
        assignedAshaWorker: ashaUser._id,
      },
      {
        userId: ramuUser._id,
        name: 'Ramu Lal',
        age: 64,
        gender: 'Male',
        phone: '9876543211',
        village: 'Kalyanpur',
        block: 'Kashi Vidyapeeth',
        district: 'Varanasi',
        bloodGroup: 'O+',
        isPregnant: false,
        isHighRisk: false,
        chronicConditions: ['Type 2 Diabetes', 'Hypertension'],
        allergies: [],
        emergencyContact: {
          name: 'Suresh Lal (Son)',
          relation: 'Son',
          phone: '+91 97210 99881',
        },
        abhaId: 'ABHA-7733-1122-4455',
        assignedAshaWorker: ashaUser._id,
      },
      {
        name: 'Pinky Kumari (Infant)',
        age: 1,
        gender: 'Female',
        phone: '9876543210',
        village: 'Rampur',
        block: 'Kashi Vidyapeeth',
        district: 'Varanasi',
        bloodGroup: 'Unknown',
        isPregnant: false,
        isHighRisk: false,
        chronicConditions: [],
        emergencyContact: {
          name: 'Sunita Devi (Mother)',
          relation: 'Mother',
          phone: '+91 98765 43210',
        },
        abhaId: 'ABHA-3344-9988-1122',
        assignedAshaWorker: ashaUser._id,
      },
      {
        name: 'Shivpal Yadav',
        age: 42,
        gender: 'Male',
        phone: '94150 88776',
        village: 'Shivpur',
        block: 'Kashi Vidyapeeth',
        district: 'Varanasi',
        bloodGroup: 'A+',
        isPregnant: false,
        isHighRisk: true,
        highRiskReason: 'Recent Snakebite envenomation recovery; vitals monitoring',
        chronicConditions: [],
        emergencyContact: {
          name: 'Geeta Yadav (Wife)',
          relation: 'Wife',
          phone: '+91 94150 88777',
        },
        abhaId: 'ABHA-5566-7788-9900',
        assignedAshaWorker: ashaUser._id,
      },
    ]);

    const sunitaPatient = patients[0];
    const ramuPatient = patients[1];
    const infantPatient = patients[2];

    // 4. Create Pharmacy Inventory
    await Inventory.create([
      {
        facilityId: phcRampur._id,
        facilityName: phcRampur.name,
        name: 'Paracetamol 500mg',
        genericName: 'Paracetamol IP',
        category: 'ESSENTIAL',
        dosageForm: 'Tablet',
        strength: '500mg',
        quantity: 1200,
        unit: 'tablets',
        minThreshold: 200,
        batchNumber: 'PCM-2025-01',
        expiryDate: new Date('2027-05-15'),
        pricePerUnit: 0.5,
        isSubsidized: true,
        isLowStock: false,
      },
      {
        facilityId: phcRampur._id,
        facilityName: phcRampur.name,
        name: 'Oral Rehydration Salts (ORS)',
        genericName: 'WHO Oral Rehydration Salts Formula',
        category: 'ESSENTIAL',
        dosageForm: 'Sachet',
        strength: '20.5g',
        quantity: 450,
        unit: 'sachets',
        minThreshold: 100,
        batchNumber: 'ORS-9081',
        expiryDate: new Date('2027-08-20'),
        pricePerUnit: 2.0,
        isSubsidized: true,
        isLowStock: false,
      },
      {
        facilityId: phcRampur._id,
        facilityName: phcRampur.name,
        name: 'Polyvalent Anti-Snake Venom (ASVS)',
        genericName: 'Lyophilized Polyvalent Anti-Snake Venom Serum',
        category: 'EMERGENCY',
        dosageForm: 'Injection',
        strength: '10ml Vial',
        quantity: 8, // Low Stock alert
        unit: 'vials',
        minThreshold: 15,
        batchNumber: 'ASVS-UP-44',
        expiryDate: new Date('2026-11-30'),
        pricePerUnit: 0,
        isSubsidized: true,
        isLowStock: true,
      },
      {
        facilityId: phcRampur._id,
        facilityName: phcRampur.name,
        name: 'Iron & Folic Acid (IFA Red)',
        genericName: 'Ferrous Sulfate 100mg + Folic Acid 0.5mg',
        category: 'MATERNAL_CHILD',
        dosageForm: 'Tablet',
        strength: '100mg+0.5mg',
        quantity: 800,
        unit: 'tablets',
        minThreshold: 150,
        batchNumber: 'IFA-MAT-88',
        expiryDate: new Date('2027-02-10'),
        pricePerUnit: 0,
        isSubsidized: true,
        isLowStock: false,
      },
      {
        facilityId: phcRampur._id,
        facilityName: phcRampur.name,
        name: 'Amoxicillin 500mg',
        genericName: 'Amoxicillin Trihydrate IP',
        category: 'ANTIBIOTIC',
        dosageForm: 'Capsule',
        strength: '500mg',
        quantity: 45, // Low stock
        unit: 'strips',
        minThreshold: 60,
        batchNumber: 'AMX-2025-09',
        expiryDate: new Date('2026-12-10'),
        pricePerUnit: 12.0,
        isSubsidized: true,
        isLowStock: true,
      },
      {
        facilityId: phcRampur._id,
        facilityName: phcRampur.name,
        name: 'Metformin 500mg (Jan Aushadhi)',
        genericName: 'Metformin Hydrochloride IP',
        category: 'CHRONIC_CARE',
        dosageForm: 'Tablet',
        strength: '500mg',
        quantity: 650,
        unit: 'tablets',
        minThreshold: 100,
        batchNumber: 'MET-500-11',
        expiryDate: new Date('2027-09-01'),
        pricePerUnit: 0.8,
        isSubsidized: true,
        isLowStock: false,
      },
      {
        facilityId: phcRampur._id,
        facilityName: phcRampur.name,
        name: 'Amlodipine 5mg',
        genericName: 'Amlodipine Besylate IP',
        category: 'CHRONIC_CARE',
        dosageForm: 'Tablet',
        strength: '5mg',
        quantity: 500,
        unit: 'tablets',
        minThreshold: 100,
        batchNumber: 'AML-05-99',
        expiryDate: new Date('2027-04-18'),
        pricePerUnit: 0.6,
        isSubsidized: true,
        isLowStock: false,
      },
      {
        facilityId: phcRampur._id,
        facilityName: phcRampur.name,
        name: 'Oxytocin 10 IU Injection',
        genericName: 'Oxytocin IP',
        category: 'MATERNAL_CHILD',
        dosageForm: 'Injection',
        strength: '10 IU / ml',
        quantity: 60,
        unit: 'ampoules',
        minThreshold: 30,
        batchNumber: 'OXY-2025-33',
        expiryDate: new Date('2026-10-25'),
        pricePerUnit: 0,
        isSubsidized: true,
        isLowStock: false,
      },
      {
        facilityId: phcRampur._id,
        facilityName: phcRampur.name,
        name: 'Zinc Sulfate 20mg Dispersible',
        genericName: 'Zinc Sulfate Monohydrate',
        category: 'MATERNAL_CHILD',
        dosageForm: 'Tablet',
        strength: '20mg',
        quantity: 320,
        unit: 'tablets',
        minThreshold: 50,
        batchNumber: 'ZN-20-41',
        expiryDate: new Date('2027-01-15'),
        pricePerUnit: 1.0,
        isSubsidized: true,
        isLowStock: false,
      },
      {
        facilityId: phcRampur._id,
        facilityName: phcRampur.name,
        name: 'Measles-Rubella (MR) Vaccine',
        genericName: 'MR Vaccine Live Attenuated',
        category: 'VACCINE',
        dosageForm: 'Injection',
        strength: '0.5ml single dose',
        quantity: 80,
        unit: 'vials',
        minThreshold: 20,
        batchNumber: 'MR-VAC-101',
        expiryDate: new Date('2026-12-31'),
        pricePerUnit: 0,
        isSubsidized: true,
        isLowStock: false,
      },
    ]);

    // 5. Create Health Records (Vitals History, ANC, Immunization, Diagnosis)
    await HealthRecord.create([
      {
        patientId: sunitaPatient._id,
        recordedBy: ashaUser._id,
        recordedByRole: 'asha',
        recordType: 'ANC_CHECKUP',
        date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 2 weeks ago
        vitals: {
          bpSystolic: 138,
          bpDiastolic: 88,
          pulseRate: 82,
          spO2: 98,
          hemoglobin: 9.4,
          weightKg: 58,
          heightCm: 154,
        },
        ancCheckup: {
          trimester: 3,
          fundalHeight: '32 cm',
          fetalHeartSound: '144 bpm regular',
          edema: true,
          urineAlbumin: 'Nil',
          ironFolicAcidGiven: 60,
        },
        clinicalNotes: {
          symptoms: 'Mild pedal edema, occasional fatigue',
          diagnosis: '32 Weeks Gestation with Mild Gestational Hypertension',
          clinicalFindings: 'Fetal movements active, heart sounds good. Advised salt moderation.',
          recommendations: 'Continue IFA tablets, regular BP monitoring by ASHA twice a week.',
        },
      },
      {
        patientId: sunitaPatient._id,
        recordedBy: doctorUser._id,
        recordedByRole: 'doctor',
        recordType: 'PRESCRIPTION',
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        vitals: {
          bpSystolic: 135,
          bpDiastolic: 86,
          pulseRate: 78,
          spO2: 99,
          hemoglobin: 9.6,
          weightKg: 58.5,
        },
        clinicalNotes: {
          symptoms: 'Follow-up for BP check and ANC review',
          diagnosis: 'High-risk Pregnancy - 33 Weeks',
          clinicalFindings: 'Stable maternal vitals. Advised institutional delivery at PHC/CHC.',
          recommendations: 'Janani Suraksha Yojana registration verified.',
        },
        prescription: {
          medications: [
            {
              name: 'Iron & Folic Acid (IFA Red)',
              genericName: 'Ferrous Sulfate + Folic Acid',
              dosage: '100mg + 0.5mg',
              frequency: '1-0-0 (After Breakfast)',
              duration: '30 days',
              instructions: 'Do not take with tea or milk',
              dispensed: true,
            },
            {
              name: 'Calcium + Vitamin D3',
              genericName: 'Calcium Carbonate 500mg',
              dosage: '500mg',
              frequency: '0-0-1 (After Dinner)',
              duration: '30 days',
              instructions: 'Take with warm water',
              dispensed: true,
            },
          ],
          doctorAdvice: 'Plan institutional delivery at Rampur PHC. Keep 102/108 numbers saved.',
        },
      },
      {
        patientId: ramuPatient._id,
        recordedBy: doctorUser._id,
        recordedByRole: 'doctor',
        recordType: 'VITALS',
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        vitals: {
          bpSystolic: 142,
          bpDiastolic: 90,
          bloodSugar: 168,
          sugarType: 'Fasting',
          pulseRate: 74,
          spO2: 97,
          weightKg: 68,
          heightCm: 168,
          bmi: 24.1,
        },
        clinicalNotes: {
          symptoms: 'Routine NCD checkup, mild thirst and tingling in feet',
          diagnosis: 'Type 2 Diabetes Mellitus with Stage 1 Hypertension',
          recommendations: 'Daily brisk walk 30 mins, reduce rice/sugar intake. Refill Metformin and Amlodipine.',
        },
      },
      {
        patientId: infantPatient._id,
        recordedBy: ashaUser._id,
        recordedByRole: 'asha',
        recordType: 'IMMUNIZATION',
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        immunization: {
          vaccineName: 'Pentavalent-3 & IPV-2',
          doseNumber: 3,
          beneficiaryType: 'INFANT',
          administeredLocation: 'Shivpur Sub-centre Anganwadi',
          nextDueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // Due soon for Measles-Rubella
        },
        clinicalNotes: {
          recommendations: 'Administered without adverse events. Next due for Measles-Rubella (MR-1) at 9 months.',
        },
      },
    ]);

    // 6. Create Appointments
    await Appointment.create([
      {
        patientId: sunitaPatient._id,
        doctorId: doctorUser._id,
        ashaId: ashaUser._id,
        facilityId: phcRampur._id,
        appointmentDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        timeSlot: '11:00 AM - 11:30 AM',
        type: 'TELECONSULT',
        symptoms: 'Third Trimester ANC Review & Blood Pressure Monitoring',
        triageLevel: 'URGENT',
        status: 'CONFIRMED',
      },
      {
        patientId: ramuPatient._id,
        doctorId: doctorUser._id,
        facilityId: phcRampur._id,
        appointmentDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        timeSlot: '10:30 AM - 11:00 AM',
        type: 'IN_PERSON',
        symptoms: 'Diabetic NCD monthly review and prescription refill',
        triageLevel: 'ROUTINE',
        status: 'REQUESTED',
      },
      {
        patientId: sunitaPatient._id,
        doctorId: doctorUser._id,
        facilityId: phcRampur._id,
        appointmentDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        timeSlot: '10:00 AM - 10:30 AM',
        type: 'TELECONSULT',
        symptoms: 'Swelling in feet and headache evaluation',
        triageLevel: 'URGENT',
        status: 'COMPLETED',
        diagnosis: 'Mild Gestational Hypertension (Controlled)',
        doctorNotes: 'BP stable. Prescribed IFA and Calcium. Follow-up in 2 weeks.',
      },
    ]);

    // 7. Create Emergency SOS Records
    await Emergency.create([
      {
        callerName: 'Mukesh Kumar (Rampur Village)',
        callerPhone: '+91 98110 54321',
        patientId: sunitaPatient._id,
        patientName: 'Sunita Devi',
        village: 'Rampur',
        landmark: 'Near Hanuman Mandir, Sector 3',
        location: { lat: 25.318, lng: 82.975 },
        emergencyType: 'MATERNAL_COMPLICATION',
        severity: 'HIGH',
        description: 'Labor pains started early. ASHA worker Rekha Devi on site coordinating ambulance.',
        status: 'DISPATCHED',
        assignedFacility: phcRampur._id,
        assignedAsha: ashaUser._id,
        assignedAmbulance: {
          vehicleNumber: 'UP-65-AMB-1082',
          driverName: 'Rajesh Kumar (108 Pilot)',
          driverPhone: '+91 94150 99881',
          etaMinutes: 8,
        },
        actionNotes: [
          {
            note: 'SOS triggered from ArogyaBandhu app. Auto-dispatched 108 ambulance from Kalyanpur CHC base.',
            updatedBy: 'System Auto-Dispatch',
            timestamp: new Date(Date.now() - 15 * 60 * 1000),
          },
          {
            note: 'Ambulance pilot confirmed dispatch. ETA updated to 8 minutes.',
            updatedBy: 'ASHA Rekha Devi',
            timestamp: new Date(Date.now() - 5 * 60 * 1000),
          },
        ],
      },
      {
        callerName: 'Village Pradhan (Shivpur)',
        callerPhone: '+91 94150 88776',
        patientName: 'Shivpal Yadav',
        village: 'Shivpur',
        landmark: 'Agricultural fields near Canal',
        location: { lat: 25.362, lng: 82.955 },
        emergencyType: 'SNAKE_BITE',
        severity: 'CRITICAL',
        description: 'Viper snake bite on left leg while farming. Splint applied, ASVS administered at PHC.',
        status: 'RESOLVED',
        assignedFacility: phcRampur._id,
        resolvedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        actionNotes: [
          {
            note: 'Anti-snake venom (10 vials) administered at Rampur PHC. Patient vitals stabilized.',
            updatedBy: 'Dr. Arvind Mishra (PHC MO)',
            timestamp: new Date(Date.now() - 23 * 60 * 60 * 1000),
          },
        ],
      },
    ]);

    // 8. Create Notifications
    await Notification.create([
      {
        userId: patientUser._id,
        patientId: sunitaPatient._id,
        title: 'ANC Checkup Due this Week',
        message: 'Your 3rd trimester Antenatal checkup is scheduled at Rampur PHC. Please bring your MCP card.',
        category: 'MATERNAL_CARE',
        priority: 'HIGH',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      },
      {
        userId: patientUser._id,
        patientId: infantPatient._id,
        title: 'Child Immunization Reminder (MR-1)',
        message: 'Measles-Rubella (MR) 1st dose is due for Pinky Kumari in 15 days at Anganwadi Centre.',
        category: 'IMMUNIZATION_DUE',
        priority: 'HIGH',
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      },
      {
        userId: pharmaUser._id,
        title: 'Critical Stock Alert: Anti-Snake Venom (ASVS)',
        message: 'Anti-Snake Venom stock at Rampur PHC is down to 8 vials (threshold: 15). Indent sent to CMO warehouse.',
        category: 'STOCK_ALERT',
        priority: 'HIGH',
      },
      {
        userId: doctorUser._id,
        title: 'High-Risk Pregnancy Teleconsultation Queue',
        message: '2 High-risk ANC patients from Rampur village scheduled for teleconsultation today.',
        category: 'APPOINTMENT',
        priority: 'MEDIUM',
      },
      {
        userId: ashaUser._id,
        patientId: sunitaPatient._id,
        title: 'Home Visit Scheduled: Sunita Devi',
        message: 'BP check & nutrition review due for Sunita Devi (Gestational Hypertension).',
        category: 'MATERNAL_CARE',
        priority: 'HIGH',
      },
    ]);

    console.log('[Seeder]: Successfully seeded realistic demo data for all 5 roles!');
    console.log(`
------------------------------------------------------------
DEMO LOGIN CREDENTIALS (PASSWORD FOR ALL: password123)
------------------------------------------------------------
1. Patient:    patient@arogya.in     (Sunita Devi - High Risk ANC)
2. ASHA:       asha@arogya.in        (Rekha Devi - ASHA Sangini)
3. Doctor:     doctor@arogya.in      (Dr. Arvind Mishra - PHC Medical Officer)
4. Pharmacist: pharmacist@arogya.in  (Manoj Sharma - Jan Aushadhi & PHC Dispensary)
5. Admin:      admin@arogya.in       (Dr. S.P. Verma - Chief Medical Officer)
------------------------------------------------------------
`);

    process.exit(0);
  } catch (error) {
    console.error('[Seeder Error]:', error);
    process.exit(1);
  }
};

seedDatabase();

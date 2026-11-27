import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const HOSPITALS = [
  {
    id: 'hosp-area',
    name: 'Government Area Hospital, Narasaraopet',
    location: 'Palnadu Road, Arundelpet, Narasaraopet',
    distance: '0.8 km',
    emergencyBeds: 14,
    icuBeds: 4,
    ventilators: 2,
    opQueueCount: 16,
    phone: '08647 220108',
    rating: 4.6,
    specialties: ['General Checkup', 'General Medicine', 'General Surgery', 'Obstetrics & Gynaecology', 'Pediatrics'],
    doctors: [
      { id: 'DOCTOR-001', name: 'Dr. Raghavendra', title: 'MBBS, MD (Internal Medicine)', specialty: 'General Medicine', experience: '12 yrs', roomNo: 'Room 104' },
      { id: 'doc-area-2', name: 'Dr. G. Padmavathi', title: 'MS, DGO (Obstetrics & Gynaecology)', specialty: 'Obstetrics & Gynaecology', experience: '15 yrs', roomNo: 'Room 105' },
      { id: 'doc-area-3', name: 'Dr. P. Ramanjaneyulu', title: 'MS (General Surgery)', specialty: 'General Surgery & Trauma', experience: '18 yrs', roomNo: 'Room 108' }
    ]
  },
  {
    id: 'hosp-mgh',
    name: 'Mahatma Gandhi Super Speciality Hospital',
    location: 'Panasathota, Opp. Bus Stand Backside, Narasaraopet',
    distance: '1.2 km',
    emergencyBeds: 20,
    icuBeds: 8,
    ventilators: 4,
    opQueueCount: 24,
    phone: '08647 223456',
    rating: 4.9,
    specialties: ['Cardiology', 'Nephrology', 'Neurology', 'Orthopedics', 'Pulmonology'],
    doctors: [
      { id: 'doc-mgh-1', name: 'Dr. K. Srinivas Reddy', title: 'MD, DM (Cardiology)', specialty: 'Cardiology', experience: '19 yrs', roomNo: 'Room 201' },
      { id: 'doc-mgh-2', name: 'Dr. D. Srikanth', title: 'MD, DM (Nephrology)', specialty: 'Nephrology', experience: '15 yrs', roomNo: 'Room 204' },
      { id: 'doc-mgh-3', name: 'Dr. Soumya Medabalimi', title: 'MD, DM (Neurology)', specialty: 'Neurology', experience: '12 yrs', roomNo: 'Room 301' }
    ]
  },
  {
    id: 'hosp-mathashree',
    name: 'Mathashree Multi Specialty Hospital',
    location: 'Near RTC Bus Stand, Opp. Petrol Bunk, Narasaraopet',
    distance: '0.6 km',
    emergencyBeds: 12,
    icuBeds: 4,
    ventilators: 2,
    opQueueCount: 14,
    phone: '08647 222333',
    rating: 4.7,
    specialties: ['Advanced Laparoscopy', 'General Surgery', 'General Medicine', 'Critical Care'],
    doctors: [
      { id: 'doc-mat-1', name: 'Dr. V. Ramachandra Reddy', title: 'MS, FIAGES', specialty: 'Advanced Laparoscopic Surgery', experience: '22 yrs', roomNo: 'Suite 1' },
      { id: 'doc-mat-2', name: 'Dr. R. Mahesh Babu', title: 'MBBS, MD', specialty: 'General Medicine & Critical Care', experience: '14 yrs', roomNo: 'Suite 3' }
    ]
  }
];

const AADHAAR_DB = {
  '589241037621': {
    name: 'Alex Johnson',
    age: '28',
    gender: 'MALE',
    bloodGroup: 'O+',
    address: 'Door No 4-12, Main Road, Palnadu District, Narasaraopet',
    city: 'Narasaraopet',
    pincode: '522601'
  },
  '123456789012': {
    name: 'Priya Sharma',
    age: '32',
    gender: 'FEMALE',
    bloodGroup: 'B+',
    address: 'House No 18, Collectorate Colony, Guntur',
    city: 'Guntur',
    pincode: '522004'
  }
};

app.get('/api/health-status', (req, res) => {
  res.json({
    status: 'ONLINE',
    system: 'Care Navigator Emergency & Triage Dispatch API',
    activeAmbulances: 12,
    availableEmergencyBeds: 44,
    availableICUBeds: 16
  });
});

app.get('/api/hospitals', (req, res) => {
  res.json(HOSPITALS);
});

app.get('/api/hospitals/:id', (req, res) => {
  const hospital = HOSPITALS.find(h => h.id === req.params.id);
  if (!hospital) return res.status(404).json({ error: 'Hospital not found' });
  res.json(hospital);
});

app.post('/api/verify-aadhaar', (req, res) => {
  const { aadhaarNumber } = req.body;
  const cleanNo = (aadhaarNumber || '').replace(/\s+/g, '');
  const data = AADHAAR_DB[cleanNo];
  if (!data) return res.status(404).json({ error: 'Aadhaar record not found in NHA Registry' });
  res.json({ success: true, user: data });
});

// -----------------------------------------------------------------------------
// Admin Dashboard REST API Endpoints
// -----------------------------------------------------------------------------

app.get('/api/admin/stats', (req, res) => {
  res.json({
    totalPatients: 4280,
    verifiedHospitals: HOSPITALS.length,
    pendingHospitals: 2,
    verifiedDoctors: HOSPITALS.reduce((acc, h) => acc + (h.doctors ? h.doctors.length : 0), 0) + 12,
    totalApptsToday: 54,
    servingAppts: 18,
    pendingAppts: 31,
    cancelledAppts: 5,
    activeEmergencies: 3,
    resolvedEmergencies: 28,
    totalEmergencyBeds: HOSPITALS.reduce((acc, h) => acc + (h.emergencyBeds || 0), 0),
    totalIcuBeds: HOSPITALS.reduce((acc, h) => acc + (h.icuBeds || 0), 0),
    totalVentilators: HOSPITALS.reduce((acc, h) => acc + (h.ventilators || 0), 0)
  });
});

app.get('/api/admin/hospitals', (req, res) => {
  res.json(HOSPITALS);
});

app.post('/api/admin/hospitals', (req, res) => {
  const newHospital = { id: `hosp-${Date.now()}`, ...req.body };
  HOSPITALS.push(newHospital);
  res.status(201).json(newHospital);
});

app.put('/api/admin/hospitals/:id', (req, res) => {
  const idx = HOSPITALS.findIndex(h => h.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Hospital not found' });
  HOSPITALS[idx] = { ...HOSPITALS[idx], ...req.body };
  res.json(HOSPITALS[idx]);
});

app.get('/api/admin/system-health', (req, res) => {
  res.json({
    status: 'ONLINE',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: 'Firestore / Postgres Connected',
    gateway: 'Care Navigator Admin Gateway v2.4'
  });
});

// Serve built static files from Vite
app.use(express.static(path.join(__dirname, 'dist')));

// Fallback to index.html for client-side routing
app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`⚡ CARE NAVIGATOR Web App & API running on port ${PORT}`);
});

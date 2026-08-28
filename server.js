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
    id: 'hosp-1',
    name: 'Government General Hospital (GGH)',
    location: 'Collectorate Road, Guntur',
    distance: '2.4 km',
    emergencyBeds: 14,
    icuBeds: 5,
    ventilators: 3,
    opQueueCount: 42,
    phone: '0863 2234567',
    rating: 4.6,
    specialties: ['Cardiology', 'Trauma & Emergency', 'Orthopedics', 'Pediatrics', 'Neurology'],
    doctors: [
      { id: 'doc-1', name: 'Dr. K. Srinivas Rao', title: 'MD, DM (Cardiology)', experience: '18 yrs', roomNo: 'OP Block-2, Room 104' },
      { id: 'doc-2', name: 'Dr. M. Lakshmi Prasanna', title: 'MS (General Surgery)', experience: '14 yrs', roomNo: 'OP Block-1, Room 202' }
    ]
  },
  {
    id: 'hosp-2',
    name: 'Narasaraopet Area Hospital',
    location: 'Palnadu Road, Narasaraopet',
    distance: '1.1 km',
    emergencyBeds: 8,
    icuBeds: 2,
    ventilators: 1,
    opQueueCount: 18,
    phone: '08647 220108',
    rating: 4.4,
    specialties: ['General Medicine', 'Pediatrics', 'Obstetrics & Gynaecology', 'Emergency'],
    doctors: [
      { id: 'doc-3', name: 'Dr. S. Meenakshi', title: 'MS (Orthopedics)', experience: '12 yrs', roomNo: 'Room 12' },
      { id: 'doc-4', name: 'Dr. R. V. Ramana', title: 'MD (Pediatrics)', experience: '16 yrs', roomNo: 'Room 05' }
    ]
  },
  {
    id: 'hosp-3',
    name: 'Ramesh Hospitals & Cardiac Center',
    location: 'Ring Road, Guntur',
    distance: '4.8 km',
    emergencyBeds: 22,
    icuBeds: 9,
    ventilators: 6,
    opQueueCount: 29,
    phone: '0863 2377777',
    rating: 4.8,
    specialties: ['Cardiac Care', 'Critical Care', 'Nephrology', 'Neurology'],
    doctors: [
      { id: 'doc-5', name: 'Dr. P. Ramesh Babu', title: 'MD, DM (Cardiology)', experience: '25 yrs', roomNo: 'Tower A, Floor 3' }
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

app.post('/api/emergency-sos', (req, res) => {
  const { location, patientName } = req.body;
  res.json({
    success: true,
    dispatchId: 'SOS-' + Date.now(),
    ambulanceEtaMinutes: 6,
    ambulanceVehicle: 'AP 07 AP 1082',
    driver: 'Ramesh Kumar (+91 98765 10810)',
    dispatchedHospital: HOSPITALS[0].name
  });
});

// Serve built static files from Vite
app.use(express.static(path.join(__dirname, 'dist')));

// Fallback to index.html for client-side routing
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`⚡ CARE NAVIGATOR Web App & API running on port ${PORT}`);
});

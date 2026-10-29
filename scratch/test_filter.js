// test filter simulation
const hospitals = [
  {
    id: 'hosp-4',
    name: 'Apollo Primary Clinic & OPD Center',
    type: 'Primary Care & OPD Clinic',
    location: 'Main Road, Narasaraopet',
    emergencyBeds: 4,
    icuBeds: 1,
    ventilators: 0,
    specialties: ['General Checkup', 'General Medicine', 'Dermatology', 'Pediatrics']
  },
  {
    id: 'hosp-2',
    name: 'Narasaraopet Area Hospital',
    type: 'District Govt Area Hospital',
    location: 'Palnadu Road, Narasaraopet',
    emergencyBeds: 8,
    icuBeds: 2,
    ventilators: 1,
    specialties: ['General Checkup', 'General Medicine', 'Orthopedics', 'Pediatrics', 'Obstetrics & Gynaecology']
  },
  {
    id: 'hosp-5',
    name: 'Sri City Community Health Center (CHC)',
    type: 'Community Health Center (CHC)',
    location: 'Station Road, Narasaraopet',
    emergencyBeds: 6,
    icuBeds: 1,
    ventilators: 1,
    specialties: ['General Checkup', 'General Medicine', 'Obstetrics & Gynaecology', 'Emergency Triage']
  },
  {
    id: 'hosp-1',
    name: 'Government General Hospital (GGH)',
    type: 'Govt Super Specialty Hospital',
    location: 'Collectorate Road, Guntur',
    emergencyBeds: 14,
    icuBeds: 5,
    ventilators: 3,
    specialties: ['General Checkup', 'Cardiology', 'Trauma & Emergency', 'Orthopedics', 'General Surgery', 'Pediatrics']
  },
  {
    id: 'hosp-6',
    name: 'KIMS Saveera Multi-Specialty Hospital',
    type: 'Private Super Specialty Hospital',
    location: 'NH-16 Express Highway, Guntur',
    emergencyBeds: 18,
    icuBeds: 8,
    ventilators: 5,
    specialties: ['General Checkup', 'Neurology', 'Endocrinology', 'Gastroenterology', 'Cardiology']
  },
  {
    id: 'hosp-7',
    name: 'Guntur City Care Clinic & OPD Center',
    type: 'Neighborhood Daycare Clinic',
    location: 'Brodipet 4th Line, Guntur',
    emergencyBeds: 3,
    icuBeds: 0,
    ventilators: 0,
    specialties: ['General Checkup', 'ENT Specialist', 'General Medicine', 'Dental Care']
  },
  {
    id: 'hosp-3',
    name: 'Ramesh Hospitals & Cardiac Center',
    type: 'Tertiary Cardiac & Emergency Hospital',
    location: 'Ring Road, Guntur',
    emergencyBeds: 22,
    icuBeds: 9,
    ventilators: 6,
    specialties: ['General Checkup', 'Cardiac Care', 'Critical Care', 'Nephrology', 'Pulmonology']
  },
  {
    id: 'hosp-8',
    name: 'Palnadu Mother & Child Health Center',
    type: 'Maternity & Children Hospital',
    location: 'Vinukonda Highway, Palnadu',
    emergencyBeds: 10,
    icuBeds: 4,
    ventilators: 2,
    specialties: ['General Checkup', 'Pediatrics & Neonatology', 'Obstetrics & Gynaecology']
  },
  {
    id: 'hosp-9',
    name: 'Manipal Super Specialty Hospital',
    type: 'Regional Super Specialty',
    location: 'Tadepalle Bypass, Vijayawada',
    emergencyBeds: 30,
    icuBeds: 12,
    ventilators: 8,
    specialties: ['General Checkup', 'Nephrology', 'Urology', 'Oncology', 'Organ Transplant']
  },
  {
    id: 'hosp-10',
    name: 'AIIMS Apex Medical Institute & Hospital',
    type: 'National Apex Referral Institute',
    location: 'Mangalagiri, Guntur District',
    emergencyBeds: 50,
    icuBeds: 25,
    ventilators: 15,
    specialties: ['General Checkup', 'Pulmonology', 'Cardiothoracic Surgery', 'Neurosurgery', 'Multi-Specialty']
  }
];

const selectedFilter = 'ICU';
const searchTerm = '';
const _icuCategoryFilter = 'all';

const filteredHospitals = (hospitals || []).filter(hosp => {
  const q = (searchTerm || '').toLowerCase().trim();
  const hospName = (hosp.name || '').toLowerCase();
  const hospAddr = (hosp.address || hosp.location || '').toLowerCase();
  const hospType = (hosp.type || '').toLowerCase();
  const hospSpecs = (hosp.specialties || []).map(s => (s || '').toLowerCase());

  const matchesSearch = !q ||
                        hospName.includes(q) ||
                        hospAddr.includes(q) ||
                        hospType.includes(q) ||
                        hospSpecs.some(s => s.includes(q));

  let matchesFilter = true;
  if (selectedFilter !== 'All') {
    const f = selectedFilter.toLowerCase();
    if (f === 'icu') {
      const icuBeds = hosp.icuBeds !== undefined ? hosp.icuBeds : (hosp.icuAvailable || 0);
      matchesFilter = (icuBeds > 0) || 
                      (hosp.ventilators > 0) ||
                      hospSpecs.some(s => s.includes('icu') || s.includes('critical')) ||
                      hospType.includes('icu') ||
                      hospType.includes('super specialty') ||
                      hospType.includes('hospital');
    }
  }

  return matchesSearch && matchesFilter;
});

console.log(`Matched ${filteredHospitals.length} hospitals out of ${hospitals.length}:`);
filteredHospitals.forEach(h => console.log(`- ${h.name}: icuBeds=${h.icuBeds}, ventilators=${h.ventilators}`));

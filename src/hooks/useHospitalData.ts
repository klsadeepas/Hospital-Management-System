import { useState, useEffect } from 'react';
import { HospitalState, Doctor, Patient, Appointment, InventoryItem, Invoice, Prescription, LabReport } from '../types';

const INITIAL_STATE: HospitalState = {
  doctors: [
    { 
      id: '1', 
      name: 'Dr. Sarah Wilson', 
      specialization: 'Cardiology', 
      email: 'sarah@gmail.com', 
      phone: '0715559856', 
      availability: ['Monday', 'Wednesday', 'Friday'], 
      room: 'A-101',
      reviews: [
        { id: 'r1', patientName: 'Kamal Perera', rating: 5, comment: 'Excellent care and very professional.', date: '2024-03-15' },
        { id: 'r2', patientName: 'Nimal Udayanga', rating: 4, comment: 'Wait time was a bit long, but the doctor was great.', date: '2024-03-10' }
      ]
    },
    { 
      id: '2', 
      name: 'Dr. James Miller', 
      specialization: 'Neurology', 
      email: 'james@gmail.com', 
      phone: '0705556745', 
      availability: ['Tuesday', 'Thursday'], 
      room: 'B-202',
      reviews: [
        { id: 'r3', patientName: 'Michael Corleone', rating: 5, comment: 'Very thorough explanation of my condition.', date: '2024-03-20' }
      ]
    },
  ],
  patients: [
    { id: 'p1', name: 'Kamal Perera', age: 45, gender: 'Male', bloodGroup: 'O+', phone: '0713423457', address: '123, Galle Road, Colombo 03', history: [] },
    { id: 'p2', name: 'Nimal Udayanga', age: 32, gender: 'Female', bloodGroup: 'A-', phone: '0753519111', address: 'No. 42, Lake View Road, Nugegoda, Colombo 10250', history: [] },
    { id: 'p3', name: 'Sadeepa Shyamal', age: 28, gender: 'Male', bloodGroup: 'B+', phone: '0753519186', address: '374/E/01 Udupila, Delgoda', history: [] },
    { id: 'p4', name: 'Prameesha Shyanadi', age: 25, gender: 'Female', bloodGroup: 'B+', phone: '0756472537', address: '376/B/02 Gampaha, Weliweriya', history: [] },
  ],
  appointments: [
    { id: 'a1', patientId: 'p1', doctorId: '1', date: '2024-04-26', time: '09:00', status: 'Scheduled', notes: 'Routine checkup' },
    { id: 'a2', patientId: 'p2', doctorId: '2', date: '2024-04-26', time: '10:30', status: 'Scheduled', notes: 'Follow-up on previous treatment' },
    { id: 'a3', patientId: 'p3', doctorId: '1', date: '2024-04-27', time: '14:00', status: 'Scheduled', notes: 'Consultation' },
    { id: 'a4', patientId: 'p4', doctorId: '2', date: '2024-04-28', time: '11:00', status: 'Scheduled', notes: 'First visit' },
  ],
  inventory: [
    { id: 'i1', name: 'Paracetamol', category: 'Medicine', quantity: 500, minQuantity: 50, unit: 'Tablets', price: 0.5, expiryDate: '2025-12-01' },
    { id: 'i2', name: 'Amoxicillin', category: 'Medicine', quantity: 200, minQuantity: 20, unit: 'Capsules', price: 1.2, expiryDate: '2024-06-15' },
    { id: 'i3', name: 'Surgical Masks', category: 'Supplies', quantity: 1000, minQuantity: 100, unit: 'Box of 50', price: 15.0 },
    { id: 'i4', name: 'Insulin', category: 'Medicine', quantity: 15, minQuantity: 20, unit: 'Vials', price: 45.0, expiryDate: '2024-05-30' },
  ],
  invoices: [
    {
      id: 'inv-101',
      patientId: 'p1',
      date: '2024-04-10',
      items: [
        { description: 'General Consultation', amount: 50 },
        { description: 'Blood Test', amount: 35 },
        { description: 'ECG', amount: 45 }
      ],
      total: 130,
      status: 'Paid'
    },
    {
      id: 'inv-102',
      patientId: 'p2',
      date: '2024-04-15',
      items: [
        { description: 'Neurology Consultation', amount: 75 },
        { description: 'MRI Scan', amount: 450 }
      ],
      total: 525,
      status: 'Paid'
    },
    {
      id: 'inv-103',
      patientId: 'p1',
      date: '2024-04-20',
      items: [
        { description: 'Follow-up Cardiology', amount: 40 },
        { description: 'Medication - Paracetamol', amount: 15 }
      ],
      total: 55,
      status: 'Unpaid'
    },
    {
      id: 'inv-104',
      patientId: 'p2',
      date: '2024-04-22',
      items: [
        { description: 'Emergency Consultation', amount: 100 },
        { description: 'X-Ray', amount: 60 }
      ],
      total: 160,
      status: 'Paid'
    }
  ],
  labReports: [],
};

const STORAGE_KEY = 'mediflow_hms_data';

export function useHospitalData() {
  const [state, setState] = useState<HospitalState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return INITIAL_STATE;
    
    let data = JSON.parse(saved);
    
    // Migration: Populate initial invoices if none exist
    if (!data.invoices || data.invoices.length === 0) {
      data.invoices = INITIAL_STATE.invoices;
    }

    // Migration: Populate initial patients if none exist or are missing core ones
    if (!data.patients) {
      data.patients = INITIAL_STATE.patients;
    } else {
      // Ensure all core patients exist
      INITIAL_STATE.patients.forEach(initialPatient => {
        if (!data.patients.find((p: Patient) => p.id === initialPatient.id || p.name === initialPatient.name)) {
          data.patients.push(initialPatient);
        }
      });

      data.patients = data.patients.map((p: Patient) => {
        if (p.name.toLowerCase() === 'kamal perera' || p.name === 'John Doe') {
          return { ...p, name: 'Kamal Perera', phone: '0713423457', address: '123, Galle Road, Colombo 03' };
        }
        if (p.name.toLowerCase() === 'nimal udayanga' || p.name === 'Jane Smith') {
          return { ...p, name: 'Nimal Udayanga', phone: '0753519111', address: 'No. 42, Lake View Road, Nugegoda, Colombo 10250' };
        }
        if (p.name.toLowerCase() === 'sadeepa shyamal') {
          return { ...p, name: 'Sadeepa Shyamal', phone: '0753519186', address: '374/E/01 Udupila, Delgoda' };
        }
        if (p.name.toLowerCase() === 'prameesha shyanadi') {
          return { ...p, name: 'Prameesha Shyanadi', phone: '0756472537', address: '376/B/02 Gampaha, Weliweriya' };
        }
        return p;
      });
    }

    // Migration: Update names in appointments if they use patientId
    if (!data.appointments || data.appointments.length === 0) {
      data.appointments = INITIAL_STATE.appointments;
    } else {
      // Ensure specific sample appointments exist
      INITIAL_STATE.appointments.forEach(initialAppt => {
        if (!data.appointments.find((a: Appointment) => a.id === initialAppt.id)) {
          data.appointments.push(initialAppt);
        }
      });
    }
    
    if (data.doctors) {
      data.doctors = data.doctors.map((d: Doctor) => {
        if (d.name === 'Dr. Sarah Wilson') {
          return { ...d, email: 'sarah@gmail.com', phone: '0715559856' };
        }
        if (d.name === 'Dr. James Miller') {
          return { ...d, email: 'james@gmail.com', phone: '0705556745' };
        }
        if (d.reviews) {
          const updatedReviews = d.reviews.map(r => {
            if (r.patientName.toLowerCase() === 'kamal perera' || r.patientName === 'John Doe') {
              return { ...r, patientName: 'Kamal Perera' };
            }
            if (r.patientName.toLowerCase() === 'nimal udayanga' || r.patientName === 'Jane Smith') {
              return { ...r, patientName: 'Nimal Udayanga' };
            }
            if (r.patientName.toLowerCase() === 'sadeepa shyamal') {
              return { ...r, patientName: 'Sadeepa Shyamal' };
            }
            if (r.patientName.toLowerCase() === 'prameesha shyanadi') {
              return { ...r, patientName: 'Prameesha Shyanadi' };
            }
            return r;
          });
          return { ...d, reviews: updatedReviews };
        }
        return d;
      });
    }

    return data;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Actions
  const addPatient = (patient: Patient) => {
    setState(prev => ({ ...prev, patients: [...prev.patients, patient] }));
  };

  const addDoctor = (doctor: Doctor) => {
    setState(prev => ({ ...prev, doctors: [...prev.doctors, doctor] }));
  };

  const updateDoctor = (doctor: Doctor) => {
    setState(prev => ({
      ...prev,
      doctors: prev.doctors.map(d => d.id === doctor.id ? doctor : d)
    }));
  };

  const updatePatient = (patient: Patient) => {
    setState(prev => ({
      ...prev,
      patients: prev.patients.map(p => p.id === patient.id ? patient : p)
    }));
  };

  const addAppointment = (appointment: Appointment) => {
    // Conflict detection
    const hasConflict = state.appointments.some(a => 
      a.doctorId === appointment.doctorId && 
      a.date === appointment.date && 
      a.time === appointment.time &&
      a.status !== 'Cancelled'
    );

    if (hasConflict) {
      throw new Error('Doctor already has an appointment at this time.');
    }

    setState(prev => ({ ...prev, appointments: [...prev.appointments, appointment] }));
  };

  const updateAppointment = (appointment: Appointment) => {
    setState(prev => ({
      ...prev,
      appointments: prev.appointments.map(a => (a.id === appointment.id ? appointment : a)),
    }));
  };

  const updateAppointmentStatus = (id: string, status: Appointment['status']) => {
    setState(prev => ({
      ...prev,
      appointments: prev.appointments.map(a => (a.id === id ? {...a, status} : a)),
    }));
  };

  const updateInventory = (id: string, quantity: number) => {
    setState(prev => ({
      ...prev,
      inventory: prev.inventory.map(item => (item.id === id ? {...item, quantity} : item)),
    }));
  };

  const addInvoice = (invoice: Invoice) => {
    setState(prev => ({...prev, invoices: [...prev.invoices, invoice]}));
  };

  const addPrescription = (prescription: Prescription) => {
    setState(prev => {
      const patient = prev.patients.find(p => p.id === prescription.patientId);
      if (!patient) return prev;

      const updatedPatient = {
        ...patient,
        prescriptions: [...(patient.prescriptions || []), prescription]
      };

      const updatedInventory = prev.inventory.map(item => {
        if (item.id === prescription.medicationId) {
          return { ...item, quantity: Math.max(0, item.quantity - 1) };
        }
        return item;
      });

      return {
        ...prev,
        patients: prev.patients.map(p => p.id === patient.id ? updatedPatient : p),
        inventory: updatedInventory
      };
    });
  };

  const addLabReport = (report: LabReport) => {
    setState(prev => {
      const patient = prev.patients.find(p => p.id === report.patientId);
      if (!patient) return prev;

      const updatedPatient = {
        ...patient,
        labReports: [...(patient.labReports || []), report]
      };

      return {
        ...prev,
        patients: prev.patients.map(p => p.id === patient.id ? updatedPatient : p),
        labReports: [...prev.labReports, report]
      };
    });
  };

  return {
    ...state,
    addPatient,
    addDoctor,
    updateDoctor,
    updatePatient,
    addAppointment,
    updateAppointment,
    updateAppointmentStatus,
    updateInventory,
    addInvoice,
    addPrescription,
    addLabReport,
  };
}

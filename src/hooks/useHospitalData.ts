import { useState, useEffect } from 'react';
import { HospitalState, Doctor, Patient, Appointment, InventoryItem, Invoice, Prescription, LabReport } from '../types';

const INITIAL_STATE: HospitalState = {
  doctors: [
    { 
      id: '1', 
      name: 'Dr. Sarah Wilson', 
      specialization: 'Cardiology', 
      email: 'sarah@mediflow.com', 
      phone: '555-0101', 
      availability: ['Monday', 'Wednesday', 'Friday'], 
      room: 'A-101',
      reviews: [
        { id: 'r1', patientName: 'John Doe', rating: 5, comment: 'Excellent care and very professional.', date: '2024-03-15' },
        { id: 'r2', patientName: 'Jane Smith', rating: 4, comment: 'Wait time was a bit long, but the doctor was great.', date: '2024-03-10' }
      ]
    },
    { 
      id: '2', 
      name: 'Dr. James Miller', 
      specialization: 'Neurology', 
      email: 'james@mediflow.com', 
      phone: '555-0102', 
      availability: ['Tuesday', 'Thursday'], 
      room: 'B-202',
      reviews: [
        { id: 'r3', patientName: 'Michael Corleone', rating: 5, comment: 'Very thorough explanation of my condition.', date: '2024-03-20' }
      ]
    },
  ],
  patients: [
    { id: 'p1', name: 'John Doe', age: 45, gender: 'Male', bloodGroup: 'O+', phone: '555-1234', address: '123 Pine St', history: [] },
    { id: 'p2', name: 'Jane Smith', age: 32, gender: 'Female', bloodGroup: 'A-', phone: '555-5678', address: '456 Oak Ave', history: [] },
  ],
  appointments: [],
  inventory: [
    { id: 'i1', name: 'Paracetamol', category: 'Medicine', quantity: 500, minQuantity: 50, unit: 'Tablets', price: 0.5, expiryDate: '2025-12-01' },
    { id: 'i2', name: 'Amoxicillin', category: 'Medicine', quantity: 200, minQuantity: 20, unit: 'Capsules', price: 1.2, expiryDate: '2024-06-15' },
    { id: 'i3', name: 'Surgical Masks', category: 'Supplies', quantity: 1000, minQuantity: 100, unit: 'Box of 50', price: 15.0 },
    { id: 'i4', name: 'Insulin', category: 'Medicine', quantity: 15, minQuantity: 20, unit: 'Vials', price: 45.0, expiryDate: '2024-05-30' },
  ],
  invoices: [],
  labReports: [],
};

const STORAGE_KEY = 'mediflow_hms_data';

export function useHospitalData() {
  const [state, setState] = useState<HospitalState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : INITIAL_STATE;
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

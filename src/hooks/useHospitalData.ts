import { useState, useEffect } from 'react';
import { HospitalState, Doctor, Patient, Appointment, InventoryItem, Invoice } from '../types';

const INITIAL_STATE: HospitalState = {
  doctors: [
    { id: '1', name: 'Dr. Sarah Wilson', specialization: 'Cardiology', email: 'sarah@mediflow.com', phone: '555-0101', availability: ['Monday', 'Wednesday', 'Friday'], room: 'A-101' },
    { id: '2', name: 'Dr. James Miller', specialization: 'Neurology', email: 'james@mediflow.com', phone: '555-0102', availability: ['Tuesday', 'Thursday'], room: 'B-202' },
  ],
  patients: [
    { id: 'p1', name: 'John Doe', age: 45, gender: 'Male', bloodGroup: 'O+', phone: '555-1234', address: '123 Pine St', history: [] },
    { id: 'p2', name: 'Jane Smith', age: 32, gender: 'Female', bloodGroup: 'A-', phone: '555-5678', address: '456 Oak Ave', history: [] },
  ],
  appointments: [],
  inventory: [
    { id: 'i1', name: 'Paracetamol', category: 'Medicine', quantity: 500, minQuantity: 50, unit: 'Tablets', price: 0.5 },
    { id: 'i2', name: 'Amoxicillin', category: 'Medicine', quantity: 200, minQuantity: 20, unit: 'Capsules', price: 1.2 },
    { id: 'i3', name: 'Surgical Masks', category: 'Supplies', quantity: 1000, minQuantity: 100, unit: 'Box of 50', price: 15.0 },
  ],
  invoices: [],
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

  const updateAppointmentStatus = (id: string, status: Appointment['status']) => {
    setState(prev => ({
      ...prev,
      appointments: prev.appointments.map(a => a.id === id ? { ...a, status } : a)
    }));
  };

  const updateInventory = (id: string, quantity: number) => {
    setState(prev => ({
      ...prev,
      inventory: prev.inventory.map(item => item.id === id ? { ...item, quantity } : item)
    }));
  };

  const addInvoice = (invoice: Invoice) => {
    setState(prev => ({ ...prev, invoices: [...prev.invoices, invoice] }));
  };

  return {
    ...state,
    addPatient,
    updatePatient,
    addAppointment,
    updateAppointmentStatus,
    updateInventory,
    addInvoice
  };
}

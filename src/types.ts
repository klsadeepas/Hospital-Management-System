export type UserRole = 'ADMIN' | 'DOCTOR' | 'RECEPTIONIST' | 'PHARMACIST';

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  email: string;
  phone: string;
  availability: string[]; // ['Monday', 'Tuesday'...]
  room: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup: string;
  phone: string;
  address: string;
  history: MedicalNote[];
}

export interface MedicalNote {
  id: string;
  date: string;
  diagnosis: string;
  treatment: string;
  doctorId: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  notes?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'Medicine' | 'Equipment' | 'Supplies';
  quantity: number;
  minQuantity: number;
  unit: string;
  price: number;
  expiryDate?: string;
}

export interface Invoice {
  id: string;
  patientId: string;
  date: string;
  items: { description: string; amount: number }[];
  total: number;
  status: 'Paid' | 'Unpaid';
}

export interface HospitalState {
  doctors: Doctor[];
  patients: Patient[];
  appointments: Appointment[];
  inventory: InventoryItem[];
  invoices: Invoice[];
}

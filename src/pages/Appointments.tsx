import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  User, 
  Check,
  X,
  Clock,
  Calendar as CalendarIcon,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useHospitalData } from '../hooks/useHospitalData';
import { generateId, cn } from '../lib/utils';
import { Appointment } from '../types';

export default function Appointments() {
  const { doctors, patients, appointments, addAppointment, updateAppointmentStatus } = useHospitalData();
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    date: '',
    time: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const newAppt: Appointment = {
        id: generateId(),
        ...formData,
        status: 'Scheduled'
      };
      addAppointment(newAppt);
      setShowModal(false);
      setFormData({ patientId: '', doctorId: '', date: '', time: '', notes: '' });
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Appointments</h1>
          <p className="text-slate-500">Manage patient schedules and room assignments.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus className="w-5 h-5" /> Schedule Appointment
        </button>
      </div>

      <div className="bento-card overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Patient</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Doctor</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Date & Time</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Status</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {appointments.map((appt) => (
              <tr key={appt.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                      {patients.find(p => p.id === appt.patientId)?.name[0]}
                    </div>
                    <span className="font-medium text-slate-900">{patients.find(p => p.id === appt.patientId)?.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600">
                  {doctors.find(d => d.id === appt.doctorId)?.name}
                </td>
                <td className="px-6 py-4 text-slate-600">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" /> {appt.date}
                    <Clock className="w-4 h-4 ml-2" /> {appt.time}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-xs font-bold",
                    appt.status === 'Scheduled' ? "bg-blue-50 text-blue-600" :
                    appt.status === 'Completed' ? "bg-emerald-50 text-emerald-600" :
                    "bg-red-50 text-red-600"
                  )}>
                    {appt.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  {appt.status === 'Scheduled' && (
                    <div className="flex justify-end gap-2">
                      <button onClick={() => updateAppointmentStatus(appt.id, 'Completed')} className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-lg" title="Mark as Completed">
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={() => updateAppointmentStatus(appt.id, 'Cancelled')} className="p-2 hover:bg-red-50 text-red-600 rounded-lg" title="Cancel">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {appointments.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                  No appointments scheduled
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-8"
            >
              <h3 className="text-xl font-bold text-slate-900 mb-6">Schedule New Appointment</h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-100 p-3 rounded-lg flex items-center gap-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" /> {error}
                  </div>
                )}

                <div>
                  <label className="label-text">Select Patient</label>
                  <select 
                    className="input-field"
                    value={formData.patientId}
                    onChange={e => setFormData({ ...formData, patientId: e.target.value })}
                    required
                  >
                    <option value="">Choose a patient...</option>
                    {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="label-text">Select Doctor</label>
                  <select 
                    className="input-field"
                    value={formData.doctorId}
                    onChange={e => setFormData({ ...formData, doctorId: e.target.value })}
                    required
                  >
                    <option value="">Choose a doctor...</option>
                    {doctors.map(d => <option key={d.id} value={d.id}>{d.name} ({d.specialization})</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label-text">Date</label>
                    <input 
                      type="date" 
                      className="input-field"
                      value={formData.date}
                      onChange={e => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="label-text">Time</label>
                    <input 
                      type="time" 
                      className="input-field"
                      value={formData.time}
                      onChange={e => setFormData({ ...formData, time: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="label-text">Notes</label>
                  <textarea 
                    className="input-field min-h-[100px]"
                    value={formData.notes}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Reason for visit..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                  <button type="submit" className="btn-primary flex-1 justify-center">Schedule</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

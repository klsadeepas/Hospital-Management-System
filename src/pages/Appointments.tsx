import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Check,
  X,
  Clock,
  Calendar as CalendarIcon,
  AlertCircle,
  LayoutList,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Trash2,
  Stethoscope
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useHospitalData } from '../hooks/useHospitalData';
import { generateId, cn } from '../lib/utils';
import { Appointment } from '../types';
import { 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  format, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  parseISO
} from 'date-fns';

export default function Appointments() {
  const { doctors, patients, appointments, addAppointment, updateAppointment, updateAppointmentStatus } = useHospitalData();
  const [view, setView] = useState<'table' | 'calendar'>('table');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '09:00',
    notes: ''
  });

  const handleEditInit = () => {
    if (selectedAppointment) {
      setFormData({
        patientId: selectedAppointment.patientId,
        doctorId: selectedAppointment.doctorId,
        date: selectedAppointment.date,
        time: selectedAppointment.time,
        notes: selectedAppointment.notes || ''
      });
      setIsEditing(true);
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAppointment) {
      const updated: Appointment = {
        ...selectedAppointment,
        ...formData
      };
      updateAppointment(updated);
      setSelectedAppointment(updated);
      setIsEditing(false);
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const newAppt: Appointment = {
        id: generateId(),
        ...formData,
        status: 'Scheduled'
      };
      addAppointment(newAppt);
      setShowAddModal(false);
      setFormData({ 
        patientId: '', 
        doctorId: '', 
        date: format(new Date(), 'yyyy-MM-dd'), 
        time: '09:00', 
        notes: '' 
      });
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Calendar Logic
  const renderCalendar = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

    return (
      <div className="bento-card p-0 overflow-hidden">
        <div className="flex items-center justify-between p-6 bg-white border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800">{format(currentMonth, 'MMMM yyyy')}</h3>
          <div className="flex gap-2">
            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-slate-50 rounded-lg text-slate-500">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={() => setCurrentMonth(new Date())} className="px-3 py-1 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-lg uppercase tracking-wider">Today</button>
            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-slate-50 rounded-lg text-slate-500">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-100">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="py-3 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">{day}</div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {calendarDays.map((day, idx) => {
            const dayAppointments = appointments.filter(a => isSameDay(parseISO(a.date), day));
            return (
              <div 
                key={idx} 
                className={cn(
                  "min-h-[120px] p-2 border-b border-r border-slate-100 transition-colors",
                  !isSameMonth(day, monthStart) ? "bg-slate-50/50 opacity-40" : "bg-white hover:bg-slate-50/30"
                )}
              >
                <p className={cn(
                  "text-xs font-bold mb-2 w-6 h-6 flex items-center justify-center rounded-lg",
                  isSameDay(day, new Date()) ? "bg-blue-600 text-white" : "text-slate-400"
                )}>
                  {format(day, 'd')}
                </p>
                <div className="space-y-1">
                  {dayAppointments.slice(0, 3).map(appt => (
                    <button
                      key={appt.id}
                      onClick={() => setSelectedAppointment(appt)}
                      className={cn(
                        "w-full text-left p-1.5 rounded-md text-[10px] font-bold truncate transition-all",
                        appt.status === 'Completed' ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                        appt.status === 'Cancelled' ? "bg-slate-100 text-slate-500 border border-slate-200 line-through" :
                        "bg-blue-50 text-blue-700 border border-blue-100"
                      )}
                    >
                      {appt.time} - {patients.find(p => p.id === appt.patientId)?.name || 'Unknown Patient'}
                    </button>
                  ))}
                  {dayAppointments.length > 3 && (
                    <p className="text-[9px] font-bold text-slate-400 pl-1">+{dayAppointments.length - 3} more</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Appointments</h1>
          <p className="text-slate-500 font-medium">Manage patient schedules and room assignments.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button 
              onClick={() => setView('table')}
              className={cn("p-2 rounded-lg flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-all", 
                view === 'table' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              <LayoutList className="w-4 h-4" /> Table
            </button>
            <button 
              onClick={() => setView('calendar')}
              className={cn("p-2 rounded-lg flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-all", 
                view === 'calendar' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              <CalendarDays className="w-4 h-4" /> Calendar
            </button>
          </div>
          <button onClick={() => setShowAddModal(true)} className="btn-primary h-11 px-6">
            <Plus className="w-5 h-5 shrink-0" /> <span className="hidden sm:inline">Schedule Appointment</span>
          </button>
        </div>
      </div>

      {view === 'table' ? (
        <div className="bento-card p-0 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Patient</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Doctor</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date & Time</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {appointments.map((appt) => (
                <tr 
                  key={appt.id} 
                  className="hover:bg-slate-50/50 transition-colors cursor-pointer group"
                  onClick={() => setSelectedAppointment(appt)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                        {patients.find(p => p.id === appt.patientId)?.name?.[0] || '?'}
                      </div>
                      <span className="font-bold text-slate-900">{patients.find(p => p.id === appt.patientId)?.name || 'Unknown Patient'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-500">
                    {doctors.find(d => d.id === appt.doctorId)?.name}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-tighter">
                      <CalendarIcon className="w-4 h-4 text-blue-500" /> {appt.date}
                      <Clock className="w-4 h-4 ml-2 text-emerald-500" /> {appt.time}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-xs font-bold",
                      appt.status === 'Scheduled' ? "bg-blue-50 text-blue-600" :
                      appt.status === 'Completed' ? "bg-emerald-50 text-emerald-600" :
                      "bg-slate-100 text-slate-400 line-through"
                    )}>
                      {appt.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 opacity-0 group-hover:opacity-100 hover:bg-blue-50 text-blue-600 rounded-lg transition-all">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {appointments.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">
                    No appointments scheduled
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : renderCalendar()}

      {/* Add Appointment Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddModal(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
              <h3 className="text-xl font-bold text-slate-900 mb-6 tracking-tight">Schedule New Appointment</h3>
              <form onSubmit={handleAddSubmit} className="space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-100 p-3 rounded-xl flex items-center gap-2 text-red-600 text-xs font-bold">
                    <AlertCircle className="w-4 h-4" /> {error}
                  </div>
                )}
                <div>
                  <label className="label-text">Select Patient</label>
                  <select className="input-field h-11" value={formData.patientId} onChange={e => setFormData({ ...formData, patientId: e.target.value })} required>
                    <option value="">Choose a patient...</option>
                    {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label-text">Select Doctor</label>
                  <select className="input-field h-11" value={formData.doctorId} onChange={e => setFormData({ ...formData, doctorId: e.target.value })} required>
                    <option value="">Choose a doctor...</option>
                    {doctors.map(d => <option key={d.id} value={d.id}>{d.name} ({d.specialization})</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label-text">Date</label>
                    <input type="date" className="input-field h-11" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} required />
                  </div>
                  <div>
                    <label className="label-text">Time</label>
                    <input type="time" className="input-field h-11" value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} required />
                  </div>
                </div>
                <div>
                  <label className="label-text">Objective / Notes</label>
                  <textarea className="input-field min-h-[100px]" value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} placeholder="Reason for the visit..." />
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary flex-1 h-11">Cancel</button>
                  <button type="submit" className="btn-primary flex-1 h-11 justify-center">Schedule</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Appointment Detail Modal */}
      <AnimatePresence>
        {selectedAppointment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => {
                setSelectedAppointment(null);
                setIsEditing(false);
              }} 
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
            />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden">
              <div className="p-8 pb-0">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    {!isEditing && (
                      <span className={cn(
                        "px-3 py-1 rounded-full text-xs font-bold inline-flex mb-2",
                        selectedAppointment.status === 'Scheduled' ? "bg-blue-50 text-blue-600" :
                        selectedAppointment.status === 'Completed' ? "bg-emerald-50 text-emerald-600" :
                        "bg-slate-100 text-slate-400"
                      )}>
                        {selectedAppointment.status}
                      </span>
                    )}
                    <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                      {isEditing ? 'Edit Appointment' : 'Appointment Details'}
                    </h3>
                    {!isEditing && <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Ref: {selectedAppointment.id}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedAppointment.status === 'Scheduled' && !isEditing && (
                      <button 
                        onClick={handleEditInit}
                        className="p-2 hover:bg-blue-50 rounded-xl text-blue-600 transition-colors"
                        title="Edit Appointment"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                    )}
                    <button 
                      onClick={() => {
                        setSelectedAppointment(null);
                        setIsEditing(false);
                      }} 
                      className="p-2 hover:bg-slate-50 rounded-xl text-slate-400"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-8 pt-0 space-y-6">
                {isEditing ? (
                  <form onSubmit={handleEditSubmit} className="space-y-4 pt-4">
                    <div>
                      <label className="label-text">Patient</label>
                      <select className="input-field h-11" value={formData.patientId} onChange={e => setFormData({ ...formData, patientId: e.target.value })} required>
                        {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="label-text">Doctor</label>
                      <select className="input-field h-11" value={formData.doctorId} onChange={e => setFormData({ ...formData, doctorId: e.target.value })} required>
                        {doctors.map(d => <option key={d.id} value={d.id}>{d.name} ({d.specialization})</option>)}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="label-text">Date</label>
                        <input type="date" className="input-field h-11" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} required />
                      </div>
                      <div>
                        <label className="label-text">Time</label>
                        <input type="time" className="input-field h-11" value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} required />
                      </div>
                    </div>
                    <div>
                      <label className="label-text">Objective / Notes</label>
                      <textarea className="input-field min-h-[100px]" value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} placeholder="Reason for the visit..." />
                    </div>
                    <div className="flex gap-4 pt-4">
                      <button type="button" onClick={() => setIsEditing(false)} className="btn-secondary flex-1 h-11">Cancel</button>
                      <button type="submit" className="btn-primary flex-1 h-11 justify-center">Save Changes</button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-8">
                      <div>
                        <p className="label-text">Patient</p>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                            {patients.find(p => p.id === selectedAppointment.patientId)?.name?.[0] || '?'}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{patients.find(p => p.id === selectedAppointment.patientId)?.name || 'Unknown Patient'}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">ID: {selectedAppointment.patientId}</p>
                          </div>
                        </div>
                      </div>
                      <div>
                        <p className="label-text">Doctor</p>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
                            <Stethoscope className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{doctors.find(d => d.id === selectedAppointment.doctorId)?.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">{doctors.find(d => d.id === selectedAppointment.doctorId)?.specialization}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-3">
                        <CalendarIcon className="w-5 h-5 text-blue-500" />
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Date</p>
                          <p className="text-sm font-bold text-slate-900">{selectedAppointment.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-emerald-500" />
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Time</p>
                          <p className="text-sm font-bold text-slate-900">{selectedAppointment.time}</p>
                        </div>
                      </div>
                    </div>

                    {selectedAppointment.notes && (
                      <div>
                        <p className="label-text">Clinical Notes / Objective</p>
                        <div className="p-4 bg-white border border-slate-200 rounded-2xl text-sm text-slate-600 leading-relaxed italic">
                          "{selectedAppointment.notes}"
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col gap-4 pt-4 border-t border-slate-100">
                      {selectedAppointment.status === 'Scheduled' && (
                        <>
                          <div className="flex gap-4">
                            <button 
                              onClick={handleEditInit}
                              className="btn-secondary flex-1 h-12 text-blue-600 hover:bg-blue-50"
                            >
                              <Edit2 className="w-4 h-4" /> Edit Appointment
                            </button>
                            <button 
                              onClick={() => {
                                updateAppointmentStatus(selectedAppointment.id, 'Completed');
                                setSelectedAppointment(null);
                              }}
                              className="btn-primary flex-1 h-12 justify-center bg-emerald-600 hover:bg-emerald-700"
                            >
                              <Check className="w-4 h-4" /> Mark Completed
                            </button>
                          </div>
                          
                          <button 
                            onClick={() => {
                              updateAppointmentStatus(selectedAppointment.id, 'Cancelled');
                              setSelectedAppointment(null);
                            }}
                            className="w-full h-12 text-slate-400 hover:text-red-600 font-bold text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" /> Cancel Appointment
                          </button>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}


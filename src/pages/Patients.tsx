import React, { useState } from 'react';
import { Plus, Search, Filter, Phone, MapPin, User, ChevronRight, ArrowLeft, Clipboard, Stethoscope, Calendar as CalendarIcon, AlertCircle, Activity, LayoutList, CalendarDays, ChevronLeft, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useHospitalData } from '../hooks/useHospitalData';
import { generateId, cn } from '../lib/utils';
import { Patient, MedicalNote } from '../types';
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

export default function Patients() {
  const { patients, addPatient, updatePatient, doctors, appointments } = useHospitalData();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  const selectedPatient = patients.find(p => p.id === selectedPatientId);
  const patientAppointments = appointments.filter(a => a.patientId === selectedPatientId);
  const upcomingAppointments = patientAppointments.filter(a => a.status === 'Scheduled');

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.id.toLowerCase().includes(search.toLowerCase())
  );

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Male' as const,
    bloodGroup: '',
    phone: '',
    address: ''
  });

  const [historyFormData, setHistoryFormData] = useState({
    diagnosis: '',
    treatment: '',
    doctorId: ''
  });

  const [historyView, setHistoryView] = useState<'list' | 'calendar'>('list');
  const [historyMonth, setHistoryMonth] = useState(new Date());
  const [selectedNote, setSelectedNote] = useState<MedicalNote | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newPatient: Patient = {
      id: `p${generateId()}`,
      ...formData,
      age: parseInt(formData.age),
      history: []
    } as Patient;
    addPatient(newPatient);
    setShowModal(false);
    setFormData({ name: '', age: '', gender: 'Male', bloodGroup: '', phone: '', address: '' });
  };

  const handleAddHistory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    const newNote: MedicalNote = {
      id: generateId(),
      date: new Date().toISOString().split('T')[0],
      ...historyFormData
    };

    const updatedPatient = {
      ...selectedPatient,
      history: [newNote, ...selectedPatient.history]
    };

    updatePatient(updatedPatient);
    setHistoryFormData({ diagnosis: '', treatment: '', doctorId: '' });
  };

  if (selectedPatient) {
    return (
      <div className="space-y-6">
        <button 
          onClick={() => setSelectedPatientId(null)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-medium mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back to list
        </button>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <div className="bento-card p-8 text-center flex flex-col items-center">
              <div className="w-24 h-24 rounded-3xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-4xl mb-4">
                {selectedPatient.name[0]}
              </div>
              <h2 className="text-2xl font-bold text-slate-900">{selectedPatient.name}</h2>
              <p className="text-slate-500 font-mono text-sm">#{selectedPatient.id}</p>
              
              <div className="grid grid-cols-3 gap-8 mt-8 w-full border-y border-slate-100 py-6">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Age</p>
                  <p className="text-lg font-bold text-slate-900">{selectedPatient.age}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Blood</p>
                  <p className="text-lg font-bold text-slate-900">{selectedPatient.bloodGroup}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gender</p>
                  <p className="text-lg font-bold text-slate-900">{selectedPatient.gender[0]}</p>
                </div>
              </div>

              <div className="w-full space-y-4 mt-6 text-left">
                <div className="flex items-center gap-3 text-slate-600">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium">{selectedPatient.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium">{selectedPatient.address}</span>
                </div>
              </div>
            </div>

            <div className="bento-card p-6 border-l-4 border-l-amber-500">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                Alerts & Notifications
              </h3>
              <div className="space-y-3">
                {upcomingAppointments.length > 0 ? (
                  upcomingAppointments.map(app => (
                    <div key={app.id} className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                      <p className="text-xs font-bold text-amber-700 uppercase tracking-tight mb-1">Upcoming Appointment</p>
                      <p className="text-sm font-medium text-amber-900">
                        {app.date} at {app.time}
                      </p>
                      <p className="text-xs text-amber-600 mt-1">
                        With {doctors.find(d => d.id === app.doctorId)?.name || 'Doctor'}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 italic">No upcoming appointments.</p>
                )}

                <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                  <p className="text-xs font-bold text-blue-700 uppercase tracking-tight mb-1 flex items-center gap-1.5">
                    <Activity className="w-3 h-3" />
                    Pending Lab Results
                  </p>
                  <ul className="text-xs text-blue-900 space-y-1 mt-1 list-disc pl-4">
                    <li>Complete Blood Count (CBC) - Processing</li>
                    <li>Lipid Profile - Scheduled for tomorrow</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bento-card p-6">
              <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Clipboard className="w-5 h-5 text-blue-500" />
                Add Clinical Note
              </h3>
              <form onSubmit={handleAddHistory} className="space-y-4">
                <div>
                  <label className="label-text">Diagnosis</label>
                  <input 
                    required
                    className="input-field"
                    placeholder="E.g. Mild Hypertension"
                    value={historyFormData.diagnosis}
                    onChange={e => setHistoryFormData({ ...historyFormData, diagnosis: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label-text">Treatment & Medication</label>
                  <textarea 
                    required
                    className="input-field min-h-[80px]"
                    placeholder="Prescribed rest and daily 5mg Amlodipine"
                    value={historyFormData.treatment}
                    onChange={e => setHistoryFormData({ ...historyFormData, treatment: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label-text">Attending Physician</label>
                  <select 
                    required
                    className="input-field"
                    value={historyFormData.doctorId}
                    onChange={e => setHistoryFormData({ ...historyFormData, doctorId: e.target.value })}
                  >
                    <option value="">Select Doctor...</option>
                    {doctors.map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.specialization})</option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="btn-primary w-full justify-center mt-2">
                  Add to Medical History
                </button>
              </form>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-8 bento-card p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Stethoscope className="w-6 h-6 text-blue-600" />
                Medical History
              </h3>
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 w-full sm:w-auto">
                <button 
                  onClick={() => setHistoryView('list')}
                  className={cn("flex-1 sm:flex-none px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-wider transition-all", 
                    historyView === 'list' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  <LayoutList className="w-4 h-4" /> List
                </button>
                <button 
                  onClick={() => setHistoryView('calendar')}
                  className={cn("flex-1 sm:flex-none px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-wider transition-all", 
                    historyView === 'calendar' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  <CalendarDays className="w-4 h-4" /> Calendar
                </button>
              </div>
            </div>

            {historyView === 'list' ? (
              <div className="space-y-8 relative before:absolute before:left-[11px] before:top-4 before:bottom-0 before:w-0.5 before:bg-slate-100">
                {selectedPatient.history.length === 0 ? (
                  <div className="text-center py-20 text-slate-400 italic bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                    No medical records found for this patient.
                  </div>
                ) : (
                  selectedPatient.history.map((note) => (
                    <div key={note.id} className="relative pl-8">
                      <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-white border-4 border-blue-500 shadow-sm z-10" />
                      <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:border-blue-100 transition-all group">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                              <CalendarIcon className="w-3 h-3" />
                              {note.date}
                            </p>
                            <h4 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{note.diagnosis}</h4>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Physician</p>
                            <p className="text-sm font-semibold text-slate-700">
                              {doctors.find(d => d.id === note.doctorId)?.name || 'Unknown'}
                            </p>
                          </div>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Treatment Plan</p>
                          <p className="text-sm text-slate-700 leading-relaxed italic">"{note.treatment}"</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <h4 className="font-bold text-slate-700">{format(historyMonth, 'MMMM yyyy')}</h4>
                  <div className="flex gap-2">
                    <button onClick={() => setHistoryMonth(subMonths(historyMonth, 1))} className="p-2 hover:bg-white rounded-lg text-slate-500 transition-colors">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button onClick={() => setHistoryMonth(addMonths(historyMonth, 1))} className="p-2 hover:bg-white rounded-lg text-slate-500 transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 border-t border-l border-slate-100 rounded-xl overflow-hidden">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="py-2 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 border-r border-b border-slate-100">{day}</div>
                  ))}
                  {(() => {
                    const monthStart = startOfMonth(historyMonth);
                    const monthEnd = endOfMonth(monthStart);
                    const startDate = startOfWeek(monthStart);
                    const endDate = endOfWeek(monthEnd);
                    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

                    return calendarDays.map((day, idx) => {
                      const dayNotes = selectedPatient.history.filter(note => isSameDay(parseISO(note.date), day));
                      return (
                        <div 
                          key={idx} 
                          className={cn(
                            "min-h-[100px] p-2 border-r border-b border-slate-100 transition-all",
                            !isSameMonth(day, monthStart) ? "bg-slate-50/30 opacity-20" : "bg-white"
                          )}
                        >
                          <p className={cn(
                            "text-[10px] font-bold mb-1 w-5 h-5 flex items-center justify-center rounded-md",
                            isSameDay(day, new Date()) ? "bg-blue-600 text-white" : "text-slate-400"
                          )}>
                            {format(day, 'd')}
                          </p>
                          <div className="space-y-1">
                            {dayNotes.map(note => (
                              <button
                                key={note.id}
                                onClick={() => setSelectedNote(note)}
                                className="w-full text-left p-1.5 rounded-lg bg-blue-50 text-[9px] font-bold text-blue-700 border border-blue-100 truncate hover:bg-blue-100 transition-colors"
                              >
                                {note.diagnosis}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>

                {selectedNote && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 rounded-2xl bg-white border border-blue-100 shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">{selectedNote.date}</p>
                        <h4 className="text-lg font-bold text-slate-900">{selectedNote.diagnosis}</h4>
                      </div>
                      <button onClick={() => setSelectedNote(null)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Physician: {doctors.find(d => d.id === selectedNote.doctorId)?.name}</p>
                      <p className="text-sm text-slate-700 italic">"{selectedNote.treatment}"</p>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Patients</h1>
          <p className="text-slate-500">Register and manage hospital patient records.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus className="w-5 h-5" /> Add Patient
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search by name..." 
            className="input-field pl-12 h-12 font-medium"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full md:w-64 relative">
          <Clipboard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Filter by ID (e.g. p1)..." 
            className="input-field pl-11 h-12 font-bold uppercase text-xs"
            onChange={e => {
              const val = e.target.value.toLowerCase();
              setSearch(val); // Reuse same search state for simplicity or could add specific ID state
            }}
          />
        </div>
        <button className="btn-secondary h-12 px-6">
          <Filter className="w-5 h-5" /> Filters
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredPatients.map((patient, idx) => (
          <motion.div
            key={patient.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => setSelectedPatientId(patient.id)}
            className="bento-card group hover:border-blue-300 transition-all cursor-pointer bg-white"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-2xl uppercase shadow-inner">
                {patient.name[0]}
              </div>
              <span className="text-[10px] font-mono bg-slate-100 text-slate-500 px-2 py-1 rounded-lg uppercase tracking-tighter font-bold">#{patient.id}</span>
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{patient.name}</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1 mb-6">
              {patient.age}Y • {patient.gender} • {patient.bloodGroup}
            </p>

            <div className="space-y-3 text-sm text-slate-600 mb-8 border-t border-slate-50 pt-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                  <Phone className="w-4 h-4" />
                </div>
                <span className="font-medium">{patient.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                  <MapPin className="w-4 h-4" />
                </div>
                <span className="font-medium truncate">{patient.address}</span>
              </div>
            </div>

            <button className="w-full py-3 bg-slate-50 text-slate-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2">
              View Profile <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
        {filteredPatients.length === 0 && (
          <div className="col-span-full py-20 text-center bento-card border-dashed">
            <User className="w-16 h-16 mx-auto mb-4 text-slate-200" />
            <p className="text-slate-500 font-medium tracking-tight">No patients found matching your search.</p>
          </div>
        )}
      </div>

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
              className="relative bg-white rounded-3xl shadow-2xl p-8 w-full max-w-xl"
            >
              <h3 className="text-2xl font-bold mb-8 tracking-tight">Register New Patient</h3>
              <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="label-text">Full Legal Name</label>
                  <input required placeholder="E.g. Johnathan Smith" className="input-field h-12" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="label-text">Current Age</label>
                  <input required type="number" className="input-field h-12" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} />
                </div>
                <div>
                  <label className="label-text">Gender</label>
                  <select className="input-field h-12" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value as any})}>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="label-text">Blood Type</label>
                  <input className="input-field h-12 uppercase" value={formData.bloodGroup} onChange={e => setFormData({...formData, bloodGroup: e.target.value})} placeholder="O+" />
                </div>
                <div>
                  <label className="label-text">Contact Number</label>
                  <input required className="input-field h-12" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div className="col-span-2">
                  <label className="label-text">Residence Address</label>
                  <textarea className="input-field min-h-[80px]" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                </div>
                <div className="col-span-2 flex gap-4 pt-6 border-t border-slate-100">
                  <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1 h-12">Cancel</button>
                  <button type="submit" className="btn-primary flex-1 justify-center h-12">Register Patient</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}


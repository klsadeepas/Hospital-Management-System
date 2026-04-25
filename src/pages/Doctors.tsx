import React, { useState } from 'react';
import { 
  Users, 
  Stethoscope, 
  Mail, 
  Phone, 
  MapPin,
  Award,
  Filter,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  X,
  Plus,
  AlertCircle,
  Star,
  MessageSquare,
  Edit2
} from 'lucide-react';
import { useHospitalData } from '../hooks/useHospitalData';
import { generateId } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
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
} from 'date-fns';
import { Doctor } from '../types';

export default function Doctors() {
  const { doctors, addDoctor, updateDoctor } = useHospitalData();
  const [specializationFilter, setSpecializationFilter] = useState<string>('All');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    specialization: '',
    email: '',
    phone: '',
    room: '',
    availability: [] as string[]
  });

  const availableDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleDayToggle = (day: string) => {
    setFormData(prev => ({
      ...prev,
      availability: prev.availability.includes(day)
        ? prev.availability.filter(d => d !== day)
        : [...prev.availability, day]
    }));
  };

  const handleEditInit = (doctor: Doctor) => {
    setFormData({
      name: doctor.name,
      specialization: doctor.specialization,
      email: doctor.email,
      phone: doctor.phone,
      room: doctor.room,
      availability: doctor.availability
    });
    setEditingId(doctor.id);
    setIsEditing(true);
    setShowAddModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (formData.availability.length === 0) {
      setError('Please select at least one day of availability.');
      return;
    }

    try {
      if (isEditing && editingId) {
        const existingDoctor = doctors.find(d => d.id === editingId);
        const updatedDoctor: Doctor = {
          ...existingDoctor!,
          ...formData
        };
        updateDoctor(updatedDoctor);
      } else {
        const newDoctor: Doctor = {
          id: generateId(),
          ...formData
        };
        addDoctor(newDoctor);
      }
      
      setShowAddModal(false);
      setIsEditing(false);
      setEditingId(null);
      setFormData({
        name: '',
        specialization: '',
        email: '',
        phone: '',
        room: '',
        availability: []
      });
    } catch (err: any) {
      setError(err.message);
    }
  };

  const [detailTab, setDetailTab] = useState<'availability' | 'reviews'>('availability');

  const getDoctorStats = (doctor: Doctor) => {
    const reviews = doctor.reviews || [];
    const avgRating = reviews.length > 0 
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) 
      : '0.0';
    return { avgRating, reviewCount: reviews.length };
  };

  const specializations = ['All', ...Array.from(new Set(doctors.map(d => d.specialization)))];

  const filteredDoctors = specializationFilter === 'All' 
    ? doctors 
    : doctors.filter(d => d.specialization === specializationFilter);

  const dayMap: Record<string, number> = {
    'Sunday': 0,
    'Monday': 1,
    'Tuesday': 2,
    'Wednesday': 3,
    'Thursday': 4,
    'Friday': 5,
    'Saturday': 6
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Medical Staff</h1>
          <p className="text-slate-500 font-medium">Manage doctor profiles and availability schedules.</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="flex-1 md:w-64 relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select 
              value={specializationFilter}
              onChange={(e) => setSpecializationFilter(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-10 py-2.5 text-sm font-bold text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
            >
              {specializations.map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
          <button 
            onClick={() => {
              setIsEditing(false);
              setEditingId(null);
              setFormData({
                name: '',
                specialization: '',
                email: '',
                phone: '',
                room: '',
                availability: []
              });
              setShowAddModal(true);
            }}
            className="btn-primary shrink-0 px-6 h-11 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" /> Register Staff
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <AnimatePresence mode="popLayout">
          {filteredDoctors.map((doctor, idx) => (
            <motion.div
              layout
              key={doctor.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            className="bento-card overflow-hidden flex flex-col sm:flex-row p-0"
          >
            <div className="bg-slate-100 w-full sm:w-48 h-48 sm:h-auto flex items-center justify-center relative">
              <Users className="w-16 h-16 text-slate-300" />
              <div className="absolute top-4 left-4">
                <span className="px-2 py-1 bg-white/90 backdrop-blur shadow-sm rounded text-[10px] font-bold text-blue-600 uppercase tracking-widest border border-blue-100">
                  {doctor.specialization}
                </span>
              </div>
            </div>
            
            <div className="flex-1 p-6 space-y-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    {doctor.name}
                    <Award className="w-5 h-5 text-amber-500" />
                  </span>
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-50 rounded-lg">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span className="text-xs font-bold text-amber-700">{getDoctorStats(doctor).avgRating}</span>
                  </div>
                </h3>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-sm text-slate-500">{doctor.specialization} Specialist</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{getDoctorStats(doctor).reviewCount} reviews</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail className="w-4 h-4 text-slate-400" /> {doctor.email}
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone className="w-4 h-4 text-slate-400" /> {doctor.phone}
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <MapPin className="w-4 h-4 text-slate-400" /> Room {doctor.room}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-between items-end">
                <div className="flex gap-4">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Weekly Schedule</p>
                    <div className="flex flex-wrap gap-2">
                      {doctor.availability.map((day) => (
                        <span key={day} className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-[10px] font-bold uppercase">
                          {day.slice(0, 3)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEditInit(doctor)}
                    className="p-2 bg-slate-50 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 rounded-xl transition-all"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => {
                      setSelectedDoctor(doctor);
                      setCurrentMonth(new Date());
                    }}
                    className="p-2 bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-xl transition-all"
                  >
                    <CalendarIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
        </AnimatePresence>
      </div>
      {filteredDoctors.length === 0 && (
        <div className="bg-slate-50 border border-dashed border-slate-200 rounded-3xl p-20 text-center">
          <Stethoscope className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900">No doctors found</h3>
          <p className="text-slate-500">No medical staff currently match the selected specialization.</p>
          <button 
            onClick={() => setSpecializationFilter('All')} 
            className="mt-4 text-blue-600 font-bold text-sm tracking-tight hover:underline"
          >
            Clear specialized filter
          </button>
        </div>
      )}
      {/* Availability Modal */}
      <AnimatePresence>
        {selectedDoctor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setSelectedDoctor(null)} 
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }} 
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8 pb-0">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{selectedDoctor.name}</h3>
                    <div className="flex gap-4 mt-2">
                      <button 
                        onClick={() => setDetailTab('availability')}
                        className={cn(
                          "text-[10px] font-bold uppercase tracking-widest transition-colors pb-1 border-b-2",
                          detailTab === 'availability' ? "text-blue-600 border-blue-600" : "text-slate-400 border-transparent hover:text-slate-600"
                        )}
                      >
                        Availability
                      </button>
                      <button 
                        onClick={() => setDetailTab('reviews')}
                        className={cn(
                          "text-[10px] font-bold uppercase tracking-widest transition-colors pb-1 border-b-2",
                          detailTab === 'reviews' ? "text-blue-600 border-blue-600" : "text-slate-400 border-transparent hover:text-slate-600"
                        )}
                      >
                        Reviews ({getDoctorStats(selectedDoctor).reviewCount})
                      </button>
                    </div>
                  </div>
                  <button onClick={() => setSelectedDoctor(null)} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {detailTab === 'availability' && (
                  <div className="flex items-center justify-between mb-6 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                    <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-white rounded-xl text-slate-500 transition-all">
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <h4 className="font-bold text-slate-800">{format(currentMonth, 'MMMM yyyy')}</h4>
                    <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-white rounded-xl text-slate-500 transition-all">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>

              <div className="px-8 pb-8">
                {detailTab === 'availability' ? (
                  <>
                    <div className="grid grid-cols-7 border-t border-l border-slate-100 rounded-xl overflow-hidden shadow-sm">
                      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                        <div key={i} className="py-2 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50/50 border-r border-b border-slate-100">
                          {day}
                        </div>
                      ))}
                      {(() => {
                        const monthStart = startOfMonth(currentMonth);
                        const monthEnd = endOfMonth(monthStart);
                        const startDate = startOfWeek(monthStart);
                        const endDate = endOfWeek(monthEnd);
                        const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

                        return calendarDays.map((date, idx) => {
                          const dayOfWeek = format(date, 'EEEE');
                          const isAvailable = selectedDoctor.availability.includes(dayOfWeek);
                          const isToday = isSameDay(date, new Date());
                          const isCurrentMonth = isSameMonth(date, monthStart);

                          return (
                            <div 
                              key={idx} 
                              className={cn(
                                "h-12 relative flex flex-col items-center justify-center border-r border-b border-slate-100 transition-all",
                                !isCurrentMonth ? "bg-slate-50/30 opacity-20" : "bg-white",
                                isAvailable && isCurrentMonth && "bg-blue-50/30"
                              )}
                            >
                              <span className={cn(
                                "text-[10px] font-bold z-10",
                                isToday && isCurrentMonth ? "bg-blue-600 text-white w-5 h-5 rounded-md flex items-center justify-center" : 
                                isCurrentMonth ? "text-slate-700" : "text-slate-300"
                              )}>
                                {format(date, 'd')}
                              </span>
                              {isAvailable && isCurrentMonth && (
                                <div className="absolute inset-x-1 bottom-1 h-1 bg-blue-400 rounded-full" />
                              )}
                            </div>
                          );
                        });
                      })()}
                    </div>
                    
                    <div className="mt-6 flex items-center gap-3 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                      <p className="text-xs font-bold text-blue-700 tracking-tight uppercase">
                        Available every {selectedDoctor.availability.join(', ')}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {selectedDoctor.reviews && selectedDoctor.reviews.length > 0 ? (
                      selectedDoctor.reviews.map((review) => (
                        <div key={review.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm font-bold text-slate-900">{review.patientName}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase">{review.date}</p>
                            </div>
                            <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 rounded-lg">
                              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                              <span className="text-[10px] font-bold text-amber-700">{review.rating}</span>
                            </div>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed italic">"{review.comment}"</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-10">
                        <MessageSquare className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                        <p className="text-sm text-slate-400 font-medium italic">No reviews yet for this doctor.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Doctor Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setShowAddModal(false)} 
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }} 
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8 pb-4">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                      {isEditing ? 'Update Specialist Details' : 'Register New Specialist'}
                    </h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
                      {isEditing ? 'Personnel Management' : 'Personnel Onboarding'}
                    </p>
                  </div>
                  <button 
                    onClick={() => {
                      setShowAddModal(false);
                      setIsEditing(false);
                      setEditingId(null);
                    }} 
                    className="p-2 hover:bg-slate-50 rounded-xl text-slate-400"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-8 pt-0 space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-red-600 text-xs font-bold uppercase tracking-tight">
                    <AlertCircle className="w-4 h-4" /> {error}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="label-text">Full Name</label>
                    <input 
                      type="text" 
                      className="input-field h-11" 
                      placeholder="e.g. Dr. Robert Brown"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      required 
                    />
                  </div>
                  <div>
                    <label className="label-text">Specialization</label>
                    <input 
                      type="text" 
                      className="input-field h-11" 
                      placeholder="e.g. Pediatrics"
                      value={formData.specialization}
                      onChange={e => setFormData({ ...formData, specialization: e.target.value })}
                      required 
                    />
                  </div>
                  <div>
                    <label className="label-text">Room Assignment</label>
                    <input 
                      type="text" 
                      className="input-field h-11" 
                      placeholder="e.g. C-303"
                      value={formData.room}
                      onChange={e => setFormData({ ...formData, room: e.target.value })}
                      required 
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="label-text">Email Address</label>
                    <input 
                      type="email" 
                      className="input-field h-11" 
                      placeholder="robert@mediflow.com"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      required 
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="label-text">Phone Number</label>
                    <input 
                      type="tel" 
                      className="input-field h-11" 
                      placeholder="555-0103"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      required 
                    />
                  </div>
                </div>

                <div>
                  <label className="label-text mb-3 inline-block">Weekly Availability</label>
                  <div className="flex flex-wrap gap-2">
                    {availableDays.map(day => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleDayToggle(day)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all",
                          formData.availability.includes(day)
                            ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                            : "bg-white border-slate-200 text-slate-500 hover:border-blue-300"
                        )}
                      >
                        {day.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary flex-1 h-12">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary flex-1 h-12 justify-center">
                    {isEditing ? 'Save Changes' : 'Register Staff'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

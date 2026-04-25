import React from 'react';
import { 
  Users, 
  Stethoscope, 
  Mail, 
  Phone, 
  MapPin,
  Award
} from 'lucide-react';
import { useHospitalData } from '../hooks/useHospitalData';
import { motion } from 'motion/react';

export default function Doctors() {
  const { doctors } = useHospitalData();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Medical Staff</h1>
          <p className="text-slate-500">Manage doctor profiles and availability schedules.</p>
        </div>
        <button className="btn-primary">
          Register New Staff
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {doctors.map((doctor, idx) => (
          <motion.div
            key={doctor.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
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
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  {doctor.name}
                  <Award className="w-5 h-5 text-amber-500" />
                </h3>
                <p className="text-sm text-slate-500">{doctor.specialization} Specialist</p>
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

              <div className="pt-4 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Availability</p>
                <div className="flex flex-wrap gap-2">
                  {doctor.availability.map((day) => (
                    <span key={day} className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs font-semibold">
                      {day}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

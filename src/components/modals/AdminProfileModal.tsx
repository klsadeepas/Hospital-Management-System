import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Phone, MapPin, Calendar, ShieldCheck, Camera } from 'lucide-react';
import { cn } from '../../lib/utils';

interface AdminProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  admin: {
    name: string;
    email: string;
    role: string;
    phone: string;
    joinedDate: string;
  };
}

export default function AdminProfileModal({ isOpen, onClose, admin }: AdminProfileModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-50 cursor-pointer"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[420px] bg-white rounded-[32px] shadow-2xl z-[60] overflow-hidden"
          >
            {/* Header / Banner Area */}
            <div className="h-24 bg-blue-600 relative">
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 text-white rounded-full transition-colors backdrop-blur-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-8 pb-10">
              {/* Profile Image */}
              <div className="relative -mt-12 mb-6 inline-block">
                <div className="w-24 h-24 rounded-3xl bg-white p-1.5 shadow-xl">
                  <img 
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${admin.name}`} 
                    className="w-full h-full rounded-[22px] bg-slate-100 border border-slate-50"
                    alt="Profile"
                  />
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-xl shadow-lg border-2 border-white hover:bg-blue-700 transition-all hover:scale-110">
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              {/* Title Info */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-2xl font-bold text-slate-900">{admin.name}</h3>
                  <div className="p-1 bg-blue-50 rounded-lg">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">System Administrator</span>
                  <span className="w-1 h-1 rounded-full bg-slate-200" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Active</span>
                </div>
              </div>

              {/* Stats/Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 group transition-colors hover:bg-white hover:border-blue-100">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-slate-400 group-hover:text-blue-600 transition-colors">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Address</p>
                    <p className="text-sm font-bold text-slate-900">{admin.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 group transition-colors hover:bg-white hover:border-blue-100">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-slate-400 group-hover:text-blue-600 transition-colors">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phone Number</p>
                    <p className="text-sm font-bold text-slate-900">{admin.phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 group transition-colors hover:bg-white hover:border-blue-100">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-slate-400 group-hover:text-blue-600 transition-colors">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Administrator Since</p>
                    <p className="text-sm font-bold text-slate-900">{admin.joinedDate}</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-3">
                <button className="py-3 bg-slate-50 text-slate-600 rounded-[18px] text-xs font-bold hover:bg-slate-100 transition-all border border-slate-200">
                  Edit Profile
                </button>
                <button className="py-3 bg-blue-600 text-white rounded-[18px] text-xs font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
                  Manage Access
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

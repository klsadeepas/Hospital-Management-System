import React, { useState } from 'react';
import { Plus, Search, Filter, Phone, MapPin, User, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useHospitalData } from '../hooks/useHospitalData';
import { generateId } from '../lib/utils';
import { Patient } from '../types';

export default function Patients() {
  const { patients, addPatient } = useHospitalData();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Patients</h1>
          <p className="text-slate-500">Register and manage hospital patient records.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus className="w-5 h-5" /> Add Patient
        </button>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search by name or ID..." 
            className="input-field pl-10"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button className="btn-secondary">
          <Filter className="w-5 h-5" /> Filters
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredPatients.map((patient, idx) => (
          <motion.div
            key={patient.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            className="bento-card p-6 group hover:border-blue-200 transition-all cursor-pointer"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xl uppercase">
                {patient.name[0]}
              </div>
              <span className="text-xs font-mono bg-slate-100 text-slate-500 px-2 py-1 rounded">#{patient.id}</span>
            </div>
            
            <h3 className="text-lg font-bold text-slate-900">{patient.name}</h3>
            <p className="text-sm text-slate-500 mb-4">{patient.age} years • {patient.gender} • {patient.bloodGroup}</p>

            <div className="space-y-2 text-sm text-slate-600 mb-6">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400" /> {patient.phone}
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400" /> {patient.address}
              </div>
            </div>

            <button className="w-full py-2 bg-slate-50 text-slate-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-all font-medium flex items-center justify-center gap-2">
              View Profile <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
        {filteredPatients.length === 0 && (
          <div className="col-span-full py-20 text-center text-slate-400">
            <User className="w-16 h-16 mx-auto mb-4 opacity-10" />
            <p className="text-lg">No patients found matches your search.</p>
          </div>
        )}
      </div>

      {/* Basic Modal for Registration */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white rounded-2xl p-8 w-full max-w-xl">
            <h3 className="text-xl font-bold mb-6">New Patient Registration</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="label-text">Full Name</label>
                <input required className="input-field" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="label-text">Age</label>
                <input required type="number" className="input-field" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} />
              </div>
              <div>
                <label className="label-text">Gender</label>
                <select className="input-field" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value as any})}>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="label-text">Blood Group</label>
                <input className="input-field" value={formData.bloodGroup} onChange={e => setFormData({...formData, bloodGroup: e.target.value})} placeholder="O+" />
              </div>
              <div>
                <label className="label-text">Phone</label>
                <input required className="input-field" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div className="col-span-2">
                <label className="label-text">Address</label>
                <textarea className="input-field" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              </div>
              <div className="col-span-2 flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1 justify-center">Register Patient</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

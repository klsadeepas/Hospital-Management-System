import React from 'react';
import { 
  Users, 
  Calendar, 
  AlertCircle, 
  TrendingUp, 
  ChevronRight,
  ClipboardList,
  Clock
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { motion } from 'motion/react';
import { useHospitalData } from '../hooks/useHospitalData';
import { formatCurrency, cn } from '../lib/utils';

export default function Dashboard() {
  const data = useHospitalData();

  const stats = [
    { label: 'Active In-Patients', value: data.patients.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', progress: 80, trend: '+4%' },
    { label: 'Available Beds', value: 42, icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50', progress: 25, trend: 'Critical' },
    { label: 'Appointments Today', value: data.appointments.filter(a => a.status === 'Scheduled').length, icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50', trend: '8 Pending' },
  ];

  const pieData = [
    { name: 'Medicine', value: data.inventory.filter(i => i.category === 'Medicine').length, color: '#3b82f6' },
    { name: 'Equipment', value: data.inventory.filter(i => i.category === 'Equipment').length, color: '#10b981' },
    { name: 'Supplies', value: data.inventory.filter(i => i.category === 'Supplies').length, color: '#f59e0b' },
  ];

  return (
    <div className="grid grid-cols-12 gap-6 h-full min-h-[800px]">
      {/* Stats row */}
      {stats.map((stat, idx) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="col-span-12 md:col-span-3 bento-card flex flex-col justify-center gap-1"
        >
          <p className="label-text mb-0">{stat.label}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold tracking-tight text-slate-900">{stat.value}</h3>
            <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-tighter", 
              stat.trend.includes('+') ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
            )}>
              {stat.trend}
            </span>
          </div>
          {stat.progress !== undefined && (
            <div className="mt-4 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div 
                className={cn("h-full transition-all duration-1000", stat.color.replace('text-', 'bg-'))} 
                style={{ width: `${stat.progress}%` }}
              ></div>
            </div>
          )}
        </motion.div>
      ))}

      {/* Revenue highlighted card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="col-span-12 md:col-span-3 bg-slate-900 rounded-2xl p-6 text-white flex flex-col justify-center"
      >
        <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">Daily Revenue</p>
        <h3 className="text-3xl font-bold tracking-tight">{formatCurrency(data.invoices.reduce((acc, curr) => acc + curr.total, 0))}</h3>
        <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
          <Clock className="w-3 h-3" /> Updated 12m ago
        </p>
      </motion.div>

      {/* Main chart area */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="col-span-12 lg:col-span-8 bento-card"
      >
        <div className="flex justify-between items-center mb-8">
          <h4 className="font-bold text-slate-900">Patient Admissions Trend</h4>
          <div className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-bold text-slate-500">
            LAST 7 DAYS
          </div>
        </div>
        <div className="h-64 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={[
              { day: 'MON', val: 40 }, { day: 'TUE', val: 60 }, { day: 'WED', val: 45 },
              { day: 'THU', val: 85 }, { day: 'FRI', val: 55 }, { day: 'SAT', val: 70 },
              { day: 'SUN', val: 90 }
            ]}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
              <YAxis hide />
              <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="val" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Alerts side card */}
      <motion.div
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        className="col-span-12 lg:col-span-4 bento-card flex flex-col"
      >
        <h4 className="font-bold text-slate-900 mb-6">System Alerts</h4>
        <div className="space-y-4">
          <div className="flex items-start gap-4 p-4 bg-red-50 rounded-2xl border border-red-100">
            <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0"></div>
            <div>
              <p className="text-xs font-bold text-red-900">Pharmacy: Low Insulin Stock</p>
              <p className="text-[10px] text-red-700 leading-tight mt-1">Less than 20 units remaining in Central Wing storage.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 bg-amber-50 rounded-2xl border border-amber-100">
            <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0"></div>
            <div>
              <p className="text-xs font-bold text-amber-900">ER Congestion: Level 3</p>
              <p className="text-[10px] text-amber-700 leading-tight mt-1">Wait times exceeding 45 minutes for non-critical cases.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-2xl border border-blue-100">
            <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0"></div>
            <div>
              <p className="text-xs font-bold text-blue-900">New Staff Shift started</p>
              <p className="text-[10px] text-blue-700 leading-tight mt-1">Night shift rotation (12 personnel) logged into the dashboard.</p>
            </div>
          </div>
        </div>
        <button className="mt-auto w-full py-3 text-blue-600 font-bold text-xs hover:bg-blue-50 rounded-xl transition-all">
          VIEW ALL ALERTS
        </button>
      </motion.div>

      {/* Staff summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="col-span-12 lg:col-span-4 bento-card"
      >
        <h4 className="font-bold text-slate-900 mb-4 text-sm">Doctors On Duty</h4>
        <div className="space-y-4">
          {data.doctors.slice(0, 3).map((doctor, idx) => (
            <div key={doctor.id} className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-bold", 
                  idx === 0 ? "bg-indigo-100 text-indigo-600" : idx === 1 ? "bg-pink-100 text-pink-600" : "bg-cyan-100 text-cyan-600"
                )}>
                  {doctor.name.split(' ').pop()?.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">{doctor.name}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-tighter font-medium">{doctor.specialization}</p>
                </div>
              </div>
              <span className="status-badge bg-green-100 text-green-700">Available</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Admissions summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="col-span-12 lg:col-span-4 bento-card"
      >
        <h4 className="font-bold text-slate-900 mb-4 text-sm">Recent Admissions</h4>
        <div className="space-y-3">
          {data.patients.slice(0, 3).map((p) => (
            <div key={p.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                  {p.name[0]}
                </div>
                <p className="text-xs font-bold text-slate-900">{p.name}</p>
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{p.bloodGroup}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Quick Actions bento block */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="col-span-12 lg:col-span-4 bg-blue-600 rounded-2xl p-6 text-white flex flex-col justify-between"
      >
        <div>
          <h4 className="font-bold text-sm tracking-tight">Quick Actions</h4>
          <p className="text-[10px] text-blue-100 mt-1 uppercase tracking-widest font-medium opacity-80">Automate hospital workflows</p>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-6">
          {['Admit', 'Invoice', 'Schedule', 'Report'].map(action => (
            <button key={action} className="bg-white/10 hover:bg-white/20 p-2.5 rounded-xl text-[10px] font-bold text-center border border-white/20 transition-all">
              {action.toUpperCase()}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

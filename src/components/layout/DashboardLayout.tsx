import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  UserRound, 
  Calendar, 
  Package, 
  CreditCard, 
  Settings,
  Menu,
  X,
  Stethoscope,
  Search,
  LogOut
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import AdminProfileModal from '../modals/AdminProfileModal';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: UserRound, label: 'Patients', path: '/patients' },
  { icon: Users, label: 'Doctors', path: '/doctors' },
  { icon: Calendar, label: 'Appointments', path: '/appointments' },
  { icon: Package, label: 'Inventory', path: '/inventory' },
  { icon: CreditCard, label: 'Billing', path: '/billing' },
];

interface DashboardLayoutProps {
  onLogout: () => void;
}

export default function DashboardLayout({ onLogout }: DashboardLayoutProps) {
  const [isSidebarOpen, setSidebarOpen] = React.useState(true);
  const [isAdminProfileOpen, setIsAdminProfileOpen] = React.useState(false);

  const adminInfo = {
    name: 'K.L Sadeepa',
    email: 'klsadeepas@gmail.com',
    role: 'Admin',
    phone: '+94 77 123 4567',
    joinedDate: 'Jan 20, 2024'
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 260 : 88 }}
        className="bg-white border-r border-slate-200 flex flex-col z-20"
      >
        <div className="p-6 flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Stethoscope className="text-white w-5 h-5" />
          </div>
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.span 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="font-bold text-xl tracking-tight text-slate-900 whitespace-nowrap"
              >
                MediFlow
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-4">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all group font-medium",
                isActive ? "bg-blue-50 text-blue-700" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              {({ isActive }) => (
                <>
                  <item.icon className={cn("w-5 h-5 flex-shrink-0", isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600")} />
                  <AnimatePresence>
                    {isSidebarOpen && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        className="whitespace-nowrap overflow-hidden text-sm"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-100">
          <div className="flex items-center justify-between gap-3 overflow-hidden">
            <button 
              onClick={() => setIsAdminProfileOpen(true)}
              className="flex items-center gap-3 overflow-hidden hover:bg-slate-50 transition-all rounded-xl p-1 -m-1 group"
            >
              <img 
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${adminInfo.name}`} 
                className="w-10 h-10 bg-slate-100 rounded-full flex-shrink-0 border border-slate-200 group-hover:border-blue-200 transition-colors" 
                alt="Admin avatar"
              />
              {isSidebarOpen && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-shrink-0 overflow-hidden text-left">
                  <p className="text-sm font-bold text-slate-800 whitespace-nowrap overflow-hidden text-ellipsis max-w-[100px] group-hover:text-blue-600 transition-colors">
                    {adminInfo.name}
                  </p>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500 leading-none">{adminInfo.role}</p>
                </motion.div>
              )}
            </button>
            {isSidebarOpen && (
              <button 
                onClick={onLogout}
                className="p-2 text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
          
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-10 shrink-0">
          <h2 className="text-lg font-bold tracking-tight text-slate-900">Hospital Management System</h2>
          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-2">
              <span className="status-badge bg-emerald-100 text-emerald-700">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                System Online
              </span>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search patient ID..." 
                className="w-full bg-slate-100 border-none rounded-full px-9 py-1.5 text-xs focus:ring-2 focus:ring-blue-500/10 placeholder-slate-400 transition-all"
              />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
          <Outlet />
        </div>
      </main>

      <AdminProfileModal 
        isOpen={isAdminProfileOpen}
        onClose={() => setIsAdminProfileOpen(false)}
        admin={adminInfo}
      />
    </div>
  );
}

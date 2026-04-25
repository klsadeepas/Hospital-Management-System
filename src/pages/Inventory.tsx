import React, { useState } from 'react';
import { 
  Plus, 
  Package, 
  AlertTriangle, 
  History,
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  Calendar,
  Filter
} from 'lucide-react';
import { useHospitalData } from '../hooks/useHospitalData';
import { formatCurrency, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { isBefore, addMonths, parseISO } from 'date-fns';

export default function Inventory() {
  const { inventory, updateInventory } = useHospitalData();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'low' | 'expiring'>('all');

  const filtered = inventory.filter(i => {
    const matchesSearch = i.name.toLowerCase().includes(search.toLowerCase());
    if (filterType === 'low') return matchesSearch && i.quantity <= i.minQuantity;
    if (filterType === 'expiring') {
      return matchesSearch && i.expiryDate && isBefore(parseISO(i.expiryDate), addMonths(new Date(), 3));
    }
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Inventory & Pharmacy</h1>
          <p className="text-slate-500">Track medical supplies, medicine stock and equipment.</p>
        </div>
        <button className="btn-primary">
          <Plus className="w-5 h-5" /> Add New Item
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <button 
          onClick={() => setFilterType('all')}
          className={cn(
            "bento-card p-6 border-l-4 text-left transition-all",
            filterType === 'all' ? "border-l-blue-500 bg-blue-50/10 shadow-md" : "border-l-transparent"
          )}
        >
          <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
            <Package className="w-4 h-4" /> Total Items
          </p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{inventory.length}</p>
        </button>

        <button 
          onClick={() => setFilterType('low')}
          className={cn(
            "bento-card p-6 border-l-4 text-left transition-all",
            filterType === 'low' ? "border-l-amber-500 bg-amber-50/10 shadow-md" : "border-l-transparent"
          )}
        >
          <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" /> Low Stock
          </p>
          <p className="text-2xl font-bold text-amber-600 mt-1">
            {inventory.filter(i => i.quantity <= i.minQuantity).length}
          </p>
        </button>

        <button 
          onClick={() => setFilterType('expiring')}
          className={cn(
            "bento-card p-6 border-l-4 text-left transition-all",
            filterType === 'expiring' ? "border-l-rose-500 bg-rose-50/10 shadow-md" : "border-l-transparent"
          )}
        >
          <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-rose-500" /> Expiring Soon
          </p>
          <p className="text-2xl font-bold text-rose-600 mt-1">
            {inventory.filter(i => i.expiryDate && isBefore(parseISO(i.expiryDate), addMonths(new Date(), 3))).length}
          </p>
        </button>

        <div className="bento-card h-full flex items-center px-6">
          <div className="w-full relative">
            <input 
              type="text" 
              placeholder="Search pharmacy..." 
              className="input-field px-4 h-10 text-sm"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="bento-card overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-medium text-slate-600">Stock levels are checked automatically every hour.</span>
        </div>
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Item Name</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Category</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Stock Level</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Expiry Date</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Unit Price</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">Adjust Stock</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-semibold text-slate-900">{item.name}</p>
                    <p className="text-xs text-slate-500">ID: {item.id}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-slate-100 rounded text-xs font-medium text-slate-600 uppercase">
                    {item.category}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-1 max-w-[100px] h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full rounded-full transition-all",
                          item.quantity <= item.minQuantity ? "bg-amber-500" : "bg-emerald-500"
                        )}
                        style={{ width: `${Math.min(100, (item.quantity / (item.minQuantity * 3)) * 100)}%` }}
                      ></div>
                    </div>
                    <span className={cn(
                      "text-sm font-bold",
                      item.quantity <= item.minQuantity ? "text-amber-600" : "text-emerald-600"
                    )}>
                      {item.quantity} {item.unit}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {item.expiryDate ? (
                    <div className="flex flex-col">
                      <span className={cn(
                        "text-xs font-bold font-mono",
                        item.expiryDate && isBefore(parseISO(item.expiryDate), addMonths(new Date(), 3)) ? "text-rose-600" : "text-slate-600"
                      )}>
                        {item.expiryDate}
                      </span>
                      {item.expiryDate && isBefore(parseISO(item.expiryDate), addMonths(new Date(), 3)) && (
                        <span className="text-[10px] font-bold text-rose-500 uppercase tracking-tighter">Expiring Soon</span>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 italic">No date</span>
                  )}
                </td>
                <td className="px-6 py-4 font-mono text-slate-600">
                  {formatCurrency(item.price)}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => updateInventory(item.id, item.quantity + 10)}
                      className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => updateInventory(item.id, Math.max(0, item.quantity - 10))}
                      className="p-2 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors text-xs font-bold"
                    >
                      -10
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

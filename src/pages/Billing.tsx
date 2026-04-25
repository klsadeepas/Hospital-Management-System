import React, { useState } from 'react';
import { 
  Plus, 
  CreditCard, 
  Search, 
  Download, 
  Printer, 
  CheckCircle2, 
  Clock,
  Eye
} from 'lucide-react';
import { useHospitalData } from '../hooks/useHospitalData';
import { formatCurrency, cn, generateId } from '../lib/utils';
import { Invoice } from '../types';
import { motion } from 'motion/react';

export default function Billing() {
  const { invoices, patients, addInvoice } = useHospitalData();
  const [showNewInvoice, setShowNewInvoice] = useState(false);

  // New Invoice Form State
  const [formData, setFormData] = useState({
    patientId: '',
    items: [{ description: '', amount: 0 }]
  });

  const addItem = () => setFormData({ ...formData, items: [...formData.items, { description: '', amount: 0 }] });

  const updateItem = (index: number, field: 'description' | 'amount', value: string | number) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const total = formData.items.reduce((acc, curr) => acc + curr.amount, 0);
    const invoice: Invoice = {
      id: `INV-${generateId().toUpperCase()}`,
      patientId: formData.patientId,
      items: formData.items,
      total,
      date: new Date().toISOString().split('T')[0],
      status: 'Unpaid'
    };
    addInvoice(invoice);
    setShowNewInvoice(false);
    setFormData({ patientId: '', items: [{ description: '', amount: 0 }] });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Billing & Invoices</h1>
          <p className="text-slate-500">Process payments and manage financial records.</p>
        </div>
        <button onClick={() => setShowNewInvoice(true)} className="btn-primary">
          <Plus className="w-5 h-5" /> Create Invoice
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bento-card p-6">
          <p className="text-sm font-medium text-slate-500">Unpaid Balance</p>
          <p className="text-3xl font-bold text-red-600">
            {formatCurrency(invoices.filter(i => i.status === 'Unpaid').reduce((acc, curr) => acc + curr.total, 0))}
          </p>
        </div>
        <div className="bento-card p-6">
          <p className="text-sm font-medium text-slate-500">Total Collected</p>
          <p className="text-3xl font-bold text-emerald-600">
            {formatCurrency(invoices.filter(i => i.status === 'Paid').reduce((acc, curr) => acc + curr.total, 0))}
          </p>
        </div>
        <div className="bento-card p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Transactions Today</p>
            <p className="text-3xl font-bold text-slate-900">{invoices.length}</p>
          </div>
          <CreditCard className="w-10 h-10 text-blue-500 opacity-20" />
        </div>
      </div>

      <div className="bento-card overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-white">
          <h3 className="font-bold text-slate-900">Invoicing History</h3>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input type="text" placeholder="Search invoices..." className="input-field pl-9 text-sm py-1.5" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider font-bold">
              <tr>
                <th className="px-6 py-4">Invoice ID</th>
                <th className="px-6 py-4">Patient</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 font-mono text-sm">{inv.id}</td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-900">{patients.find(p => p.id === inv.patientId)?.name}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{inv.date}</td>
                  <td className="px-6 py-4 font-bold text-slate-900">{formatCurrency(inv.total)}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold",
                      inv.status === 'Paid' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                    )}>
                      {inv.status === 'Paid' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg"><Eye className="w-4 h-4" /></button>
                      <button className="p-2 hover:bg-slate-100 text-slate-600 rounded-lg"><Printer className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {invoices.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    No invoices generated yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Invoice Modal */}
      {showNewInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl p-8 w-full max-w-2xl overflow-y-auto max-h-[90vh]">
            <h3 className="text-xl font-bold mb-6">Generate New Invoice</h3>
            <form onSubmit={handleCreate} className="space-y-6">
              <div>
                <label className="label-text">Patient</label>
                <select 
                  className="input-field" 
                  value={formData.patientId} 
                  onChange={e => setFormData({ ...formData, patientId: e.target.value })}
                  required
                >
                  <option value="">Select Patient...</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="label-text mb-0">Line Items</label>
                  <button type="button" onClick={addItem} className="text-sm text-blue-600 font-bold hover:underline">+ Add Item</button>
                </div>
                {formData.items.map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <input 
                      placeholder="Description" 
                      className="input-field flex-1" 
                      value={item.description}
                      onChange={e => updateItem(idx, 'description', e.target.value)}
                      required
                    />
                    <input 
                      type="number" 
                      placeholder="Amount" 
                      className="input-field w-32"
                      value={item.amount || ''}
                      onChange={e => updateItem(idx, 'amount', parseFloat(e.target.value))}
                      required
                    />
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 flex justify-between items-center">
                <span className="text-slate-500 font-medium">Total Amount Due</span>
                <span className="text-2xl font-bold text-slate-900">
                  {formatCurrency(formData.items.reduce((acc, curr) => acc + curr.amount, 0))}
                </span>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowNewInvoice(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1 justify-center">Generate & Send</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

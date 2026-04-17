import React, { useState } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { StockItem } from '../types';
import { formatZAR, cn } from '../lib/utils';
import { Plus, Trash2, Save, Package } from 'lucide-react';

interface StockManagementProps {
  userId: string;
}

export default function StockManagement({ userId }: StockManagementProps) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState<StockItem[]>([
    { name: '', quantity: 0, costPerItem: 0, totalValue: 0 }
  ]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const addItem = () => {
    setItems([...items, { name: '', quantity: 0, costPerItem: 0, totalValue: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof StockItem, value: string | number) => {
    const newItems = [...items];
    const item = { ...newItems[index] };
    
    if (field === 'name') {
      item.name = value as string;
    } else {
      const numValue = Number(value);
      if (field === 'quantity') item.quantity = numValue;
      if (field === 'costPerItem') item.costPerItem = numValue;
      item.totalValue = item.quantity * item.costPerItem;
    }
    
    newItems[index] = item;
    setItems(newItems);
  };

  const totalStockValue = items.reduce((acc, curr) => acc + curr.totalValue, 0);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await addDoc(collection(db, 'users', userId, 'stock_records'), {
        userId,
        date,
        items,
        totalStockValue,
        createdAt: serverTimestamp(),
      });
      setMessage('Stock record saved successfully!');
      setItems([{ name: '', quantity: 0, costPerItem: 0, totalValue: 0 }]);
    } catch (err: any) {
      setMessage('Error saving record: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header>
        <h1 className="text-xl font-bold">Stock Management</h1>
        <p className="text-sm text-[var(--text-muted)] font-medium">Track your weekly stock levels and inventory value.</p>
      </header>

      <div className="card">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[var(--border)]">
            <div className="w-full md:w-64">
              <label className="stat-label">Record Date</label>
              <input
                type="date"
                className="input-field"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="text-right">
              <p className="stat-label">Total Inventory Value</p>
              <h2 className="text-3xl font-black tracking-tight text-[var(--text-primary)]">{formatZAR(totalStockValue)}</h2>
            </div>
          </div>

          <div className="space-y-4">
            <div className="hidden md:grid grid-cols-12 gap-4 text-[0.7rem] font-bold text-[var(--text-muted)] uppercase tracking-wider px-2">
              <div className="col-span-5">Item Name</div>
              <div className="col-span-2">Quantity</div>
              <div className="col-span-2">Cost (ZAR)</div>
              <div className="col-span-2">Total</div>
              <div className="col-span-1"></div>
            </div>

            {items.map((item, index) => (
              <div key={index} className="flex flex-col md:grid md:grid-cols-12 gap-3 md:gap-4 p-4 md:p-0 bg-[var(--bg-input)] md:bg-transparent rounded-xl border border-[var(--border)] md:border-none relative">
                <div className="md:col-span-5">
                  <label className="stat-label md:hidden">Item Name</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Milk 2L"
                    value={item.name}
                    onChange={(e) => updateItem(index, 'name', e.target.value)}
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="stat-label md:hidden">Quantity</label>
                  <input
                    type="number"
                    className="input-field"
                    placeholder="0"
                    value={item.quantity || ''}
                    onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="stat-label md:hidden">Cost (ZAR)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="input-field"
                    placeholder="0.00"
                    value={item.costPerItem || ''}
                    onChange={(e) => updateItem(index, 'costPerItem', e.target.value)}
                    required
                  />
                </div>
                <div className="md:col-span-2 flex items-center justify-between md:justify-start">
                  <span className="stat-label md:hidden">Total:</span>
                  <span className="font-black text-sm">{formatZAR(item.totalValue)}</span>
                </div>
                <div className="md:col-span-1 absolute top-2 right-2 md:relative md:top-0 md:right-0">
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    disabled={items.length === 1}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col md:flex-row justify-between gap-4 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={addItem}
              className="btn-secondary flex items-center justify-center gap-2"
            >
              <Plus size={18} />
              Add Item
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center justify-center gap-2"
            >
              {loading ? 'Saving...' : (
                <>
                  <Save size={18} />
                  Save Stock Record
                </>
              )}
            </button>
          </div>
        </form>
        {message && (
          <p className={cn(
            "mt-4 text-sm text-center font-medium",
            message.includes('Error') ? "text-red-500" : "text-green-600"
          )}>
            {message}
          </p>
        )}
      </div>

      <div className="bg-[var(--bg-input)] p-6 rounded-xl flex gap-4 border border-[var(--border)]">
        <div className="p-2 bg-[var(--bg-card)] text-[var(--accent)] rounded-lg h-fit shadow-sm">
          <Package size={24} />
        </div>
        <div>
          <h4 className="font-extrabold text-[var(--text-primary)] uppercase text-xs tracking-wider">Pro Tip</h4>
          <p className="text-sm text-[var(--text-muted)] mt-1 font-medium">
            Regularly updating your stock levels helps you identify which products are your best sellers and which ones are tying up your cash flow.
          </p>
        </div>
      </div>
    </div>
  );
}

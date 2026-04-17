import React, { useState } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { formatZAR, cn } from '../lib/utils';
import { Plus, Trash2, Save, TrendingDown } from 'lucide-react';

interface ExpensesProps {
  userId: string;
}

export default function Expenses({ userId }: ExpensesProps) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('Supplies');
  const [amount, setAmount] = useState<number>(0);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const categories = ['Rent', 'Utilities', 'Salaries', 'Supplies', 'Marketing', 'Transport', 'Stock Purchase', 'Maintenance', 'Insurance', 'Other'];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      setMessage('Error: Amount must be greater than zero.');
      return;
    }
    setLoading(true);
    setMessage('');

    try {
      await addDoc(collection(db, 'users', userId, 'expenses'), {
        userId,
        date,
        category,
        amount,
        description,
        createdAt: serverTimestamp(),
      });
      setMessage('Expense record saved successfully!');
      setAmount(0);
      setDescription('');
    } catch (err: any) {
      setMessage('Error saving record: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header>
        <h1 className="text-xl font-bold">Business Expenses</h1>
        <p className="text-sm text-[var(--text-muted)] font-medium">Record outgoing costs and spending for your business.</p>
      </header>

      <div className="card shadow-lg border border-[var(--border)]">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-[var(--border)]">
            <div>
              <label className="stat-label">Expense Date</label>
              <input
                type="date"
                className="input-field"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="stat-label">Category</label>
              <select
                className="input-field"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="stat-label text-[var(--danger)]">Amount (ZAR)</label>
              <input
                type="number"
                step="0.01"
                className="input-field text-lg font-black text-[var(--danger)]"
                placeholder="0.00"
                value={amount || ''}
                onChange={(e) => setAmount(Number(e.target.value))}
                required
              />
            </div>
            <div>
              <label className="stat-label">Description / Note</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Fuel for delivery truck"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end pt-6">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ backgroundColor: 'var(--danger)', color: 'white' }}
            >
              {loading ? 'Saving...' : (
                <>
                  <Save size={18} className="mr-2 inline" />
                  Record Expense
                </>
              )}
            </button>
          </div>
        </form>
        {message && (
          <p className={cn(
            "mt-4 text-sm text-center font-medium p-3 rounded-lg",
            message.includes('Error') ? "bg-red-50 text-red-500 border border-red-100" : "bg-green-50 text-green-600 border border-green-100"
          )}>
            {message}
          </p>
        )}
      </div>

      <div className="bg-[var(--bg-input)] p-6 rounded-xl flex gap-4 border border-[var(--danger)]/10">
        <div className="p-2 bg-[var(--bg-card)] text-[var(--danger)] rounded-lg h-fit shadow-sm">
          <TrendingDown size={24} />
        </div>
        <div>
          <h4 className="font-extrabold text-[var(--text-primary)] uppercase text-xs tracking-wider">Expense Strategy</h4>
          <p className="text-sm text-[var(--text-muted)] mt-1 font-medium">
            Categorizing your expenses correctly helps you identify "leakage" in your business. Try to be as specific as possible with descriptions.
          </p>
        </div>
      </div>
    </div>
  );
}

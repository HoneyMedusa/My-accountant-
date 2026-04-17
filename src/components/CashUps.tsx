import React, { useState } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ExpenseItem } from '../types';
import { formatZAR, cn } from '../lib/utils';
import { Plus, Trash2, Save, Receipt } from 'lucide-react';

interface DailyRecordsProps {
  userId: string;
}

export interface CashUpsProps {
  userId: string;
}

export default function CashUps({ userId }: CashUpsProps) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      setMessage('Error: Sales amount must be greater than zero.');
      return;
    }
    setLoading(true);
    setMessage('');

    try {
      await addDoc(collection(db, 'users', userId, 'cashups'), {
        userId,
        date,
        amount,
        createdAt: serverTimestamp(),
      });
      setMessage('Cash-up record saved successfully!');
      setAmount(0);
    } catch (err: any) {
      setMessage('Error saving record: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header>
        <h1 className="text-xl font-bold">Daily Cash-ups</h1>
        <p className="text-sm text-[var(--text-muted)] font-medium">Record your total daily sales and takings.</p>
      </header>

      <div className="card shadow-lg border border-[var(--accent)]/10">
        <form onSubmit={handleSave} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="stat-label text-[var(--text-primary)]">Record Date</label>
              <input
                type="date"
                className="input-field"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="stat-label text-[var(--accent)]">Total Sales (ZAR)</label>
              <input
                type="number"
                step="0.01"
                className="input-field text-2xl font-black text-[var(--accent)]"
                placeholder="0.00"
                value={amount || ''}
                onChange={(e) => setAmount(Number(e.target.value))}
                required
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center justify-center gap-2 px-12"
            >
              {loading ? 'Saving...' : (
                <>
                  <Save size={18} />
                  Record Sales
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

      <div className="bg-[var(--tag-bg)] p-6 rounded-xl flex gap-4 border border-[var(--tag-text)]/10">
        <div className="p-2 bg-[var(--bg-card)] text-[var(--tag-text)] rounded-lg h-fit shadow-sm">
          <Receipt size={24} />
        </div>
        <div>
          <h4 className="font-extrabold text-[var(--text-primary)] uppercase text-xs tracking-wider">Daily Discipline</h4>
          <p className="text-sm text-[var(--text-muted)] mt-1 font-medium">
            Recording your cash-ups immediately at the end of every day ensures that you never miss a sale and keeps your records accurate for tax season.
          </p>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { CashUpRecord, ExpenseRecord, StockRecord } from '../types';
import { formatZAR, formatDate, cn } from '../lib/utils';
import { Download, Search, FileText, Package, Receipt, TrendingDown } from 'lucide-react';

interface HistoryProps {
  userId: string;
}

export default function History({ userId }: HistoryProps) {
  const [cashupRecords, setCashupRecords] = useState<CashUpRecord[]>([]);
  const [expenseRecords, setExpenseRecords] = useState<ExpenseRecord[]>([]);
  const [stockRecords, setStockRecords] = useState<StockRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'cashups' | 'expenses' | 'stock'>('cashups');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cashQuery = query(collection(db, 'users', userId, 'cashups'), orderBy('date', 'desc'));
    const expenseQuery = query(collection(db, 'users', userId, 'expenses'), orderBy('date', 'desc'));
    const stockQuery = query(collection(db, 'users', userId, 'stock_records'), orderBy('date', 'desc'));

    const unsubCash = onSnapshot(cashQuery, (snapshot) => {
      setCashupRecords(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CashUpRecord)));
      setLoading(false);
    });

    const unsubExpense = onSnapshot(expenseQuery, (snapshot) => {
      setExpenseRecords(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ExpenseRecord)));
    });

    const unsubStock = onSnapshot(stockQuery, (snapshot) => {
      setStockRecords(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StockRecord)));
    });

    return () => {
      unsubCash();
      unsubExpense();
      unsubStock();
    };
  }, [userId]);

  const exportToCSV = () => {
    let data: any[] = [];
    let csvContent = "data:text/csv;charset=utf-8,";
    
    if (activeTab === 'cashups') {
      csvContent += "Date,Sales Amount\n";
      cashupRecords.forEach(r => csvContent += `${r.date},${r.amount}\n`);
    } else if (activeTab === 'expenses') {
      csvContent += "Date,Category,Amount,Description\n";
      expenseRecords.forEach(r => csvContent += `${r.date},${r.category},${r.amount},${r.description}\n`);
    } else {
      csvContent += "Date,Total Stock Value,Items Count\n";
      stockRecords.forEach(r => csvContent += `${r.date},${r.totalStockValue},${r.items.length}\n`);
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${activeTab}_history_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredCash = cashupRecords.filter(r => r.date.includes(searchTerm));
  const filteredExpense = expenseRecords.filter(r => r.date.includes(searchTerm) || r.category.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredStock = stockRecords.filter(r => r.date.includes(searchTerm));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">Records History</h1>
          <p className="text-sm text-[#6B778C] font-medium">View and export your historical business data.</p>
        </div>
        <button
          onClick={exportToCSV}
          className="btn-secondary flex items-center gap-2 w-fit"
        >
          <Download size={18} />
          EXPORT TO CSV
        </button>
      </header>

      <div className="flex flex-wrap gap-2 p-1 bg-[var(--border)] rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('cashups')}
          className={cn(
            "px-6 py-2 rounded-md text-xs font-bold transition-all uppercase tracking-wider",
            activeTab === 'cashups' ? "bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          )}
        >
          Cash-ups
        </button>
        <button
          onClick={() => setActiveTab('expenses')}
          className={cn(
            "px-6 py-2 rounded-md text-xs font-bold transition-all uppercase tracking-wider",
            activeTab === 'expenses' ? "bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          )}
        >
          Expenses
        </button>
        <button
          onClick={() => setActiveTab('stock')}
          className={cn(
            "px-6 py-2 rounded-md text-xs font-bold transition-all uppercase tracking-wider",
            activeTab === 'stock' ? "bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          )}
        >
          Stock Records
        </button>
      </div>

      <div className="card">
        <div className="flex items-center gap-3 mb-6 p-3 bg-[var(--bg-input)] rounded-lg border border-[var(--border)]">
          <Search size={18} className="text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder={activeTab === 'expenses' ? "SEARCH BY DATE OR CATEGORY..." : "SEARCH BY DATE (YYYY-MM-DD)..."}
            className="bg-transparent border-none focus:ring-0 w-full text-xs font-bold uppercase tracking-wider placeholder:text-[#A0A0A0]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          {activeTab === 'cashups' ? (
            <table className="w-full text-left">
              <thead>
                <tr className="stat-label border-b border-[var(--border)]">
                  <th className="pb-4">Date</th>
                  <th className="pb-4">Sales Amount</th>
                  <th className="pb-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filteredCash.map((record) => (
                  <tr key={record.id} className="text-sm">
                    <td className="py-4 font-bold">{formatDate(record.date)}</td>
                    <td className="py-4 font-black text-[var(--accent)]">{formatZAR(record.amount)}</td>
                    <td className="py-4 text-xs text-[var(--text-muted)]">
                      {record.createdAt?.toDate().toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : activeTab === 'expenses' ? (
            <table className="w-full text-left">
              <thead>
                <tr className="stat-label border-b border-[var(--border)]">
                  <th className="pb-4">Date</th>
                  <th className="pb-4">Category</th>
                  <th className="pb-4">Amount</th>
                  <th className="pb-4">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filteredExpense.map((record) => (
                  <tr key={record.id} className="text-sm">
                    <td className="py-4 font-bold">{formatDate(record.date)}</td>
                    <td className="py-4">
                      <span className="tag">{record.category}</span>
                    </td>
                    <td className="py-4 font-black text-[var(--danger)]">{formatZAR(record.amount)}</td>
                    <td className="py-4 text-[var(--text-muted)] italic">{record.description || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="stat-label border-b border-[var(--border)]">
                  <th className="pb-4">Date</th>
                  <th className="pb-4">Total Value</th>
                  <th className="pb-4">Items Count</th>
                  <th className="pb-4">Top Items</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filteredStock.map((record) => (
                  <tr key={record.id} className="text-sm">
                    <td className="py-4 font-bold">{formatDate(record.date)}</td>
                    <td className="py-4 font-black">{formatZAR(record.totalStockValue)}</td>
                    <td className="py-4 font-medium">{record.items.length} items</td>
                    <td className="py-4">
                      <div className="flex flex-wrap gap-1">
                        {record.items.slice(0, 3).map((item, i) => (
                          <span key={i} className="tag">
                            {item.name} ({item.quantity})
                          </span>
                        ))}
                        {record.items.length > 3 && <span className="text-[10px] text-[var(--text-muted)] font-bold ml-1">+{record.items.length - 3} MORE</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          
          {(activeTab === 'cashups' ? filteredCash : activeTab === 'expenses' ? filteredExpense : filteredStock).length === 0 && (
            <div className="py-12 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-[var(--bg-input)] text-[var(--text-muted)] rounded-full mb-4">
                {activeTab === 'cashups' ? <Receipt size={24} /> : activeTab === 'expenses' ? <TrendingDown size={24} /> : <Package size={24} />}
              </div>
              <p className="text-[var(--text-muted)]">No records found for the selected criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

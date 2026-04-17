import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { CashUpRecord, ExpenseRecord, StockRecord } from '../types';
import { formatZAR, formatDate, cn } from '../lib/utils';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Package,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

interface DashboardProps {
  userId: string;
}

interface DashboardData {
  date: string;
  sales: number;
  expenses: number;
  netProfit: number;
}

export default function Dashboard({ userId }: DashboardProps) {
  const [dashboardData, setDashboardData] = useState<DashboardData[]>([]);
  const [latestStock, setLatestStock] = useState<StockRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cashupsQuery = query(
      collection(db, 'users', userId, 'cashups'),
      orderBy('date', 'desc'),
      limit(14)
    );

    const expensesQuery = query(
      collection(db, 'users', userId, 'expenses'),
      orderBy('date', 'desc'),
      limit(30)
    );

    const stockQuery = query(
      collection(db, 'users', userId, 'stock_records'),
      orderBy('date', 'desc'),
      limit(1)
    );

    let cashUpsData: CashUpRecord[] = [];
    let expensesData: ExpenseRecord[] = [];

    const updateDashboard = () => {
      const merged: { [date: string]: DashboardData } = {};
      
      cashUpsData.forEach(c => {
        if (!merged[c.date]) merged[c.date] = { date: c.date, sales: 0, expenses: 0, netProfit: 0 };
        merged[c.date].sales += c.amount;
      });

      expensesData.forEach(e => {
        if (!merged[e.date]) merged[e.date] = { date: e.date, sales: 0, expenses: 0, netProfit: 0 };
        merged[e.date].expenses += e.amount;
      });

      const result = Object.values(merged).map(d => ({
        ...d,
        netProfit: d.sales - d.expenses
      })).sort((a, b) => a.date.localeCompare(b.date));

      setDashboardData(result);
      setLoading(false);
    };

    const unsubCashups = onSnapshot(cashupsQuery, (snapshot) => {
      cashUpsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CashUpRecord));
      updateDashboard();
    });

    const unsubExpenses = onSnapshot(expensesQuery, (snapshot) => {
      expensesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ExpenseRecord));
      updateDashboard();
    });

    const unsubStock = onSnapshot(stockQuery, (snapshot) => {
      if (!snapshot.empty) {
        setLatestStock({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as StockRecord);
      }
    });

    return () => {
      unsubCashups();
      unsubExpenses();
      unsubStock();
    };
  }, [userId]);

  const totalSales = dashboardData.reduce((acc, curr) => acc + curr.sales, 0);
  const totalExpenses = dashboardData.reduce((acc, curr) => acc + curr.expenses, 0);
  const totalProfit = totalSales - totalExpenses;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold">Dashboard Overview</h1>
          <p className="text-sm text-[#6B778C] font-medium">Welcome back! Here's how your business is performing.</p>
        </div>
        <div className="text-[0.8rem] font-bold text-[#6B778C] uppercase tracking-wider bg-[var(--border)] px-3 py-1 rounded-full">
          {new Date().toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
        </div>
      </header>

      {/* Hero Stats */}
      <div className="card flex flex-col sm:flex-row items-start sm:items-center justify-between py-6 sm:py-8 px-6 sm:px-10 gap-4">
        <div className="flex flex-col">
          <div className="stat-label">Monthly Net Profit</div>
          <div className={cn("text-3xl sm:text-4xl font-black tracking-tighter", totalProfit >= 0 ? "text-[#00875A]" : "text-[#DE350B]")}>
            {formatZAR(totalProfit)}
          </div>
        </div>
        <div className="flex flex-col sm:text-right w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-[var(--border)]">
          <div className="stat-label">Total Sales (7d)</div>
          <div className="text-xl sm:text-2xl font-black tracking-tight">{formatZAR(totalSales)}</div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-title">SALES VS EXPENSES</div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboardData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: 'var(--text-muted)', fontWeight: 700 }}
                  tickFormatter={(val) => new Date(val).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--text-muted)', fontWeight: 700 }} />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '8px', 
                    border: '1px solid var(--border)', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    backgroundColor: 'var(--bg-card)',
                    color: 'var(--text-primary)'
                  }}
                  itemStyle={{ color: 'var(--text-primary)' }}
                  formatter={(value: number) => [formatZAR(value), '']}
                />
                <Bar dataKey="sales" fill="var(--chart-1)" radius={[2, 2, 0, 0]} name="Sales" />
                <Bar dataKey="expenses" fill="var(--chart-2)" radius={[2, 2, 0, 0]} name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-title">PROFIT TREND</div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dashboardData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: 'var(--text-muted)', fontWeight: 700 }}
                  tickFormatter={(val) => new Date(val).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--text-muted)', fontWeight: 700 }} />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '8px', 
                    border: '1px solid var(--border)', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    backgroundColor: 'var(--bg-card)',
                    color: 'var(--text-primary)'
                  }}
                  itemStyle={{ color: 'var(--text-primary)' }}
                  formatter={(value: number) => [formatZAR(value), 'Profit']}
                />
                <Line 
                  type="monotone" 
                  dataKey="netProfit" 
                  stroke="var(--chart-3)" 
                  strokeWidth={4} 
                  dot={{ r: 4, fill: 'var(--chart-3)', strokeWidth: 2, stroke: 'var(--bg-card)' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Stock Summary */}
      <div className="card">
        <div className="card-title">
          STOCK SUMMARY <span className="tag">LATEST</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[var(--bg-input)] p-4 rounded-lg">
            <div className="stat-label">Total Stock Value</div>
            <span className="text-xl font-black">{formatZAR(latestStock?.totalStockValue || 0)}</span>
          </div>
          <div className="bg-[var(--bg-input)] p-4 rounded-lg">
            <div className="stat-label">Items Count</div>
            <span className="text-xl font-black">{latestStock?.items.length || 0}</span>
          </div>
          <div className="bg-[var(--bg-input)] p-4 rounded-lg">
            <div className="stat-label">Last Updated</div>
            <span className="text-xl font-black">{latestStock ? new Date(latestStock.date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' }) : '-'}</span>
          </div>
          <div className="bg-[var(--tag-bg)] p-4 rounded-lg">
            <div className="stat-label" style={{ color: 'var(--tag-text)' }}>Status</div>
            <span className="text-xl font-black" style={{ color: 'var(--tag-text)' }}>Active</span>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="card-title">RECENT DAILY RECORDS</div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="stat-label border-b border-[var(--border)]">
                <th className="pb-4">Date</th>
                <th className="pb-4">Sales</th>
                <th className="pb-4">Expenses</th>
                <th className="pb-4">Net Profit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {dashboardData.slice().reverse().map((record, index) => (
                <tr key={index} className="text-sm">
                  <td className="py-4 font-bold">{formatDate(record.date)}</td>
                  <td className="py-4 font-medium">{formatZAR(record.sales)}</td>
                  <td className="py-4 text-[#DE350B] font-bold">{formatZAR(record.expenses)}</td>
                  <td className={cn("py-4 font-black", record.netProfit >= 0 ? "text-[#00875A]" : "text-[#DE350B]")}>
                    {formatZAR(record.netProfit)}
                  </td>
                </tr>
              ))}
              {dashboardData.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-[#6B778C] font-bold uppercase text-xs">No records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

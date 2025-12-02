import React from 'react';
import { Chemical, Transaction } from '../types';
import { AlertTriangle, Package, Activity, ArrowDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  chemicals: Chemical[];
  transactions: Transaction[];
}

const Dashboard: React.FC<DashboardProps> = ({ chemicals, transactions }) => {
  const lowStockItems = chemicals.filter((c) => c.currentStock <= c.minLevel);
  // Total units = Stock + In Use count
  const totalStockUnits = chemicals.reduce((acc, curr) => acc + curr.currentStock + (curr.unitsInUse?.length || 0), 0);
  const totalInUse = chemicals.reduce((acc, curr) => acc + (curr.unitsInUse?.length || 0), 0);
  const recentTransactions = transactions.slice(0, 5);

  // Prepare data for chart: Stock Levels vs Target
  const chartData = chemicals.map(c => ({
    name: c.name.split(' ')[0], // Short name
    current: c.currentStock,
    target: c.targetLevel,
    isLow: c.currentStock <= c.minLevel
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="化學品種類 (Types)"
          value={chemicals.length.toString()}
          icon={Package}
          color="bg-blue-500"
        />
        <StatCard
          title="低庫存警示 (Low Stock)"
          value={lowStockItems.length.toString()}
          icon={AlertTriangle}
          color="bg-red-500"
          alert={lowStockItems.length > 0}
        />
        <StatCard
          title="總庫存桶數 (Total Containers)"
          value={totalStockUnits.toString()}
          icon={Activity}
          color="bg-emerald-500"
        />
        <StatCard
          title="現場使用中 (In Use)"
          value={`${totalInUse} 桶/瓶`}
          icon={ArrowDown}
          color="bg-amber-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-4">倉庫庫存 vs 目標水位 (Warehouse Stock vs Target)</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="current" name="目前庫存 (Stock)" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.isLow ? '#ef4444' : '#3b82f6'} />
                  ))}
                </Bar>
                <Bar dataKey="target" name="目標水位 (Target)" fill="#e2e8f0" radius={[0, 4, 4, 0]} barSize={10} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-4">近期變動紀錄 (Recent Activity)</h2>
          <div className="space-y-4">
            {recentTransactions.length === 0 ? (
              <p className="text-slate-400 text-sm">尚無紀錄 (No transactions yet).</p>
            ) : (
              recentTransactions.map((t) => (
                <div key={t.id} className="flex items-start gap-3 pb-3 border-b border-slate-100 last:border-0">
                  <div className={`mt-1 w-2 h-2 rounded-full ${t.type === 'IN' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  <div>
                    <p className="text-sm font-medium text-slate-700">
                      {t.type === 'IN' ? '入庫 (Restocked)' : '領用 (Used)'} <span className="font-bold">{t.quantity}</span> {t.chemicalName}
                    </p>
                    <p className="text-xs text-slate-400">
                      {new Date(t.date).toLocaleDateString()} • {t.user}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color, alert }: any) => (
  <div className={`bg-white p-6 rounded-xl shadow-sm border ${alert ? 'border-red-200 ring-2 ring-red-100' : 'border-slate-200'} flex items-center gap-4`}>
    <div className={`${color} p-4 rounded-full text-white shadow-md`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-slate-500 text-sm font-medium">{title}</p>
      <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
    </div>
  </div>
);

export default Dashboard;
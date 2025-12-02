
import React from 'react';
import { LayoutDashboard, FlaskConical, ArrowRightLeft, FileText, Settings } from 'lucide-react';
import { ViewState } from '../types';

interface SidebarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  onOpenSettings: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, onOpenSettings }) => {
  const navItems = [
    { id: 'dashboard', label: '儀表板 (Dashboard)', icon: LayoutDashboard },
    { id: 'inventory', label: '庫存管理 (Inventory)', icon: FlaskConical },
    { id: 'transactions', label: '進出紀錄 (In/Out Log)', icon: ArrowRightLeft },
    { id: 'reports', label: 'AI 報表 (Reports)', icon: FileText },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white h-screen flex flex-col shadow-xl fixed left-0 top-0 z-10">
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <div className="bg-blue-500 p-2 rounded-lg">
            <FlaskConical className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-wider">ChemFlow AI</h1>
        </div>
        <p className="text-slate-400 text-xs mt-2">庫存與採購系統 (Inventory System)</p>
      </div>

      <nav className="flex-1 py-6 px-3 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id as ViewState)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-700">
        <button 
          onClick={onOpenSettings}
          className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white transition-colors"
        >
          <Settings size={20} />
          <span className="font-medium">設定 (Settings)</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

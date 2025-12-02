
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import Transactions from './components/Transactions';
import Reports from './components/Reports';
import { ViewState, Chemical, Transaction, User, AppSettings, UserRole } from './types';
import { INITIAL_CHEMICALS, INITIAL_TRANSACTIONS, INITIAL_USERS, DEFAULT_SETTINGS } from './constants';
import { v4 as uuidv4 } from 'uuid';
import { X, Save, Check, Trash2, UserPlus, Shield } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [chemicals, setChemicals] = useState<Chemical[]>(INITIAL_CHEMICALS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  
  // User Management State
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]);
  
  // Settings State
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  // Temporary state for editing settings inside the modal
  const [tempSettings, setTempSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('Staff');

  // Re-sort transactions whenever they change to ensure newest are first
  const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleAddTransaction = (newTx: Omit<Transaction, 'id' | 'date'>) => {
    // 1. Create the Transaction Object
    const transaction: Transaction = {
      ...newTx,
      id: uuidv4(),
      date: new Date().toISOString()
    };

    // 2. Update Chemical Stock
    const updatedChemicals = chemicals.map(chem => {
      if (chem.id === transaction.chemicalId) {
        let newStock = chem.currentStock;
        if (transaction.type === 'IN') {
          newStock += transaction.quantity;
        } else {
          newStock = Math.max(0, newStock - transaction.quantity);
        }
        return { ...chem, currentStock: newStock, lastUpdated: new Date().toISOString() };
      }
      return chem;
    });

    setChemicals(updatedChemicals);
    setTransactions(prev => [transaction, ...prev]);
  };

  const handleUpdateChemical = (updatedChemical: Chemical) => {
    setChemicals(prev => prev.map(c => c.id === updatedChemical.id ? updatedChemical : c));
  };

  const handleAddChemical = (newChemicalData: Omit<Chemical, 'id'>) => {
    const newChemical: Chemical = {
      ...newChemicalData,
      id: uuidv4(),
      lastUpdated: new Date().toISOString()
    };
    setChemicals(prev => [...prev, newChemical]);
  };

  // Settings Handlers
  const handleOpenSettings = () => {
    setTempSettings(settings);
    setNewUserName(''); // Reset add user form
    setIsSettingsOpen(true);
  };

  const handleSaveSettings = () => {
    setSettings(tempSettings);
    setIsSettingsOpen(false);
  };

  // User Management Handlers
  const handleAddUser = () => {
    if (!newUserName.trim()) return;
    
    // Generate initials (e.g., "Mike Wang" -> "MW")
    const initials = newUserName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);

    const newUser: User = {
      id: uuidv4(),
      name: newUserName,
      role: newUserRole,
      initials: initials || 'U'
    };

    setUsers([...users, newUser]);
    setNewUserName('');
  };

  const handleDeleteUser = (userId: string) => {
    if (users.length <= 1) {
      alert("Cannot delete the last user.");
      return;
    }
    setUsers(users.filter(u => u.id !== userId));
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard chemicals={chemicals} transactions={sortedTransactions} />;
      case 'inventory':
        return (
          <Inventory 
            chemicals={chemicals} 
            onUpdateChemical={handleUpdateChemical} 
            onAddChemical={handleAddChemical}
          />
        );
      case 'transactions':
        return (
          <Transactions 
            chemicals={chemicals} 
            history={sortedTransactions} 
            onAddTransaction={handleAddTransaction} 
            currentUser={currentUser}
          />
        );
      case 'reports':
        return <Reports chemicals={chemicals} settings={settings} />;
      default:
        return <Dashboard chemicals={chemicals} transactions={sortedTransactions} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100 font-sans text-slate-900 relative">
      <Sidebar 
        currentView={currentView} 
        setView={setCurrentView} 
        onOpenSettings={handleOpenSettings}
      />
      
      <main className="flex-1 ml-64 p-8 overflow-y-auto min-h-screen">
        <header className="mb-8 flex justify-between items-center relative z-20">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 capitalize">
              {currentView === 'dashboard' && '儀表板 (Dashboard)'}
              {currentView === 'inventory' && '庫存管理 (Inventory)'}
              {currentView === 'transactions' && '進出紀錄 (Transactions)'}
              {currentView === 'reports' && 'AI 報表 (Reports)'}
            </h1>
            <p className="text-slate-500 mt-1">
              {currentView === 'dashboard' && '化學品庫存狀態總覽 (Overview of chemical inventory status).'}
              {currentView === 'inventory' && '管理化學品資料庫 (Manage your chemical database).'}
              {currentView === 'transactions' && '紀錄領用與入庫事件 (Record usage and restock events).'}
              {currentView === 'reports' && '生成 AI 輔助採購報告 (Generate AI-powered justification reports).'}
            </p>
          </div>
          
          <div className="relative">
            <button 
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-white hover:shadow-sm transition-all outline-none"
            >
               <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-slate-700">{currentUser.name}</p>
                  <p className="text-xs text-slate-500">{currentUser.role}</p>
               </div>
               <div className="w-10 h-10 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-blue-700 font-bold shadow-sm">
                  {currentUser.initials}
               </div>
            </button>

            {/* User Dropdown */}
            {isUserMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-3 border-b border-slate-50 bg-slate-50">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Switch User</p>
                </div>
                {users.map(user => (
                  <button
                    key={user.id}
                    onClick={() => {
                      setCurrentUser(user);
                      setIsUserMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors ${
                      currentUser.id === user.id ? 'bg-blue-50 text-blue-700' : 'text-slate-600'
                    }`}
                  >
                    <span className="font-medium">{user.name}</span>
                    {currentUser.id === user.id && <Check size={16} />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </header>

        {renderContent()}
      </main>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg text-slate-800">系統設定 (System Settings)</h3>
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full p-1 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
               {/* General Settings Section */}
               <section>
                 <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
                   基本設定 (General)
                 </h4>
                 <div className="space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">組織/實驗室名稱 (Organization Name)</label>
                        <input
                          type="text"
                          value={tempSettings.orgName}
                          onChange={(e) => setTempSettings({...tempSettings, orgName: e.target.value})}
                          className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                          placeholder="e.g. My Chem Lab"
                        />
                        <p className="text-xs text-slate-400 mt-1">此名稱將顯示在 AI 報告的標題中。</p>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">貨幣單位 (Currency)</label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => setTempSettings({...tempSettings, currency: 'USD'})}
                            className={`py-3 rounded-lg border font-medium transition-all ${
                              tempSettings.currency === 'USD' 
                              ? 'border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500' 
                              : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                            }`}
                          >
                            USD ($)
                          </button>
                          <button
                            type="button"
                            onClick={() => setTempSettings({...tempSettings, currency: 'TWD'})}
                            className={`py-3 rounded-lg border font-medium transition-all ${
                              tempSettings.currency === 'TWD' 
                              ? 'border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500' 
                              : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                            }`}
                          >
                            TWD (NT$)
                          </button>
                        </div>
                    </div>
                 </div>
               </section>

               {/* User Management Section */}
               <section>
                 <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
                   使用者管理 (User Management)
                 </h4>
                 
                 {/* Add User Form */}
                 <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-4">
                    <label className="block text-xs font-bold text-slate-500 mb-2">新增使用者 (Add User)</label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input 
                        type="text" 
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                        placeholder="姓名 (Name)"
                        className="flex-1 p-2 rounded border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      />
                      <select
                        value={newUserRole}
                        onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                        className="p-2 rounded border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
                      >
                        <option value="Admin">Admin</option>
                        <option value="Manager">Manager</option>
                        <option value="Staff">Staff</option>
                      </select>
                      <button 
                        onClick={handleAddUser}
                        disabled={!newUserName.trim()}
                        className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded font-medium text-sm flex items-center justify-center gap-2 transition-colors"
                      >
                        <UserPlus size={16} /> 新增
                      </button>
                    </div>
                 </div>

                 {/* User List */}
                 <div className="border border-slate-200 rounded-lg overflow-hidden">
                   {users.map((user) => (
                     <div key={user.id} className="flex items-center justify-between p-3 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                       <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold">
                           {user.initials}
                         </div>
                         <div>
                           <p className="text-sm font-bold text-slate-800">{user.name}</p>
                           <p className="text-[10px] text-slate-500 flex items-center gap-1">
                             <Shield size={10} /> {user.role}
                           </p>
                         </div>
                       </div>
                       
                       {currentUser.id === user.id ? (
                         <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded font-medium">當前 (Current)</span>
                       ) : (
                         <button 
                           onClick={() => handleDeleteUser(user.id)}
                           className="text-slate-400 hover:text-red-500 p-2 hover:bg-red-50 rounded transition-colors"
                           title="刪除使用者 (Delete User)"
                         >
                           <Trash2 size={16} />
                         </button>
                       )}
                     </div>
                   ))}
                 </div>
               </section>
            </div>

            <div className="p-6 border-t border-slate-200 bg-slate-50 flex gap-3">
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="flex-1 py-2.5 rounded-lg font-medium text-slate-600 bg-white border border-slate-300 hover:bg-slate-100 transition-colors"
              >
                取消 (Cancel)
              </button>
              <button
                onClick={handleSaveSettings}
                className="flex-1 py-2.5 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Save size={18} />
                儲存設定 (Save)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;

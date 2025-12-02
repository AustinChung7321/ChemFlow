
import React, { useState, useEffect } from 'react';
import { Chemical, Transaction, User } from '../types';
import { ArrowDown, ArrowUp, Save, Lock, AlertCircle } from 'lucide-react';

interface TransactionsProps {
  chemicals: Chemical[];
  onAddTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => void;
  history: Transaction[];
  currentUser: User;
}

const Transactions: React.FC<TransactionsProps> = ({ chemicals, onAddTransaction, history, currentUser }) => {
  const [type, setType] = useState<'IN' | 'OUT'>('OUT');
  const [selectedChemical, setSelectedChemical] = useState<string>(chemicals[0]?.id || '');
  const [quantity, setQuantity] = useState<number>(1);
  const [reason, setReason] = useState<string>('');

  // Automatically update the chemical selection if chemicals list changes
  useEffect(() => {
    if (chemicals.length > 0 && !chemicals.find(c => c.id === selectedChemical)) {
        setSelectedChemical(chemicals[0].id);
    }
  }, [chemicals, selectedChemical]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const chemical = chemicals.find(c => c.id === selectedChemical);
    if (!chemical) return;

    // Validation: Check sufficiency for OUT transactions
    if (type === 'OUT') {
        if (chemical.currentStock <= 0) {
            alert('庫存不足，無法領用！請先入庫。(Insufficient stock. Please restock first.)');
            return;
        }
        if (quantity > chemical.currentStock) {
            alert(`領用數量超過庫存！目前庫存: ${chemical.currentStock} (Quantity exceeds stock. Current: ${chemical.currentStock})`);
            return;
        }
    }

    onAddTransaction({
      chemicalId: chemical.id,
      chemicalName: chemical.name,
      type,
      quantity,
      user: currentUser.name, // Use the current logged-in user
      reason
    });

    // Reset form (except user)
    setQuantity(1);
    setReason('');
  };

  const currentChem = chemicals.find(c => c.id === selectedChemical);
  const isOutOfStock = currentChem ? currentChem.currentStock <= 0 : false;
  const isOutTransaction = type === 'OUT';
  const showStockError = isOutTransaction && isOutOfStock;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Input Form */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-fit">
        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          {type === 'OUT' ? <ArrowDown className="text-amber-500" /> : <ArrowUp className="text-emerald-500" />}
          {type === 'OUT' ? '紀錄領用 (Record Usage)' : '紀錄入庫 (Record Restock)'}
        </h2>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setType('OUT')}
            className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
              type === 'OUT' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            領用 (OUT)
          </button>
          <button
            onClick={() => {
                setType('IN');
                // Reset quantity error when switching to IN
                if (quantity > (currentChem?.currentStock || 0)) setQuantity(1);
            }}
            className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
              type === 'IN' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            入庫 (IN)
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">選擇化學品 (Chemical)</label>
            <select
              value={selectedChemical}
              onChange={(e) => setSelectedChemical(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
              required
            >
              {chemicals.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} (庫存: {c.currentStock} {c.unit})
                </option>
              ))}
            </select>
            {/* Low Stock Warning */}
            {currentChem && currentChem.currentStock <= currentChem.minLevel && !isOutOfStock && type === 'OUT' && (
              <p className="text-amber-500 text-xs mt-1 font-medium flex items-center gap-1">
                 <AlertCircle size={12} /> 警告：此項目庫存偏低 (Low Stock Warning)!
              </p>
            )}
            
            {/* Zero Stock Error */}
            {showStockError && (
              <div className="mt-2 bg-red-50 border border-red-100 text-red-600 p-3 rounded-lg text-sm font-bold flex items-center gap-2 animate-pulse">
                <AlertCircle size={16} />
                庫存為 0，無法領用。請先入庫。
                <br/>(Stock is 0. Cannot record usage.)
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">數量 ({currentChem?.unit})</label>
            <input
              type="number"
              min="0.1"
              step="0.1"
              max={isOutTransaction ? currentChem?.currentStock : undefined}
              value={quantity}
              onChange={(e) => setQuantity(parseFloat(e.target.value))}
              className={`w-full p-2.5 rounded-lg border outline-none transition-colors ${
                 showStockError ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200' : 'border-slate-300 focus:ring-2 focus:ring-blue-500'
              }`}
              required
              disabled={showStockError}
            />
            {isOutTransaction && currentChem && (
                <p className="text-xs text-slate-400 mt-1 text-right">
                    最大可領用: {currentChem.currentStock} {currentChem.unit}
                </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">使用者姓名 (User Name)</label>
            <div className="relative">
                <input
                  type="text"
                  value={currentUser.name}
                  readOnly
                  className="w-full p-2.5 pl-10 rounded-lg border border-slate-300 bg-slate-100 text-slate-600 focus:outline-none cursor-not-allowed"
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">如需更改使用者，請點擊右上角頭像 (Switch user via top-right avatar).</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">原因 / 備註 (Reason / Notes)</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={type === 'OUT' ? "例如: 實驗 42B (Experiment 42B)" : "例如: 定期補貨 (Weekly Restock)"}
              className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none"
              disabled={showStockError}
            />
          </div>

          <button
            type="submit"
            disabled={showStockError}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-bold transition-all shadow-md mt-4 ${
                showStockError 
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <Save size={20} />
            儲存紀錄 (Save Transaction)
          </button>
        </form>
      </div>

      {/* History Log */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 mb-6">歷史紀錄 (History)</h2>
        <div className="space-y-0 divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
          {history.length === 0 ? (
             <p className="text-slate-400 text-center py-8">查無紀錄 (No records found).</p>
          ) : (
            history.map(t => (
              <div key={t.id} className="py-4 flex justify-between items-center group hover:bg-slate-50 px-2 rounded-lg transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${
                      t.type === 'IN' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {t.type === 'IN' ? '入庫 (IN)' : '領用 (OUT)'}
                    </span>
                    <span className="font-semibold text-slate-800">{t.chemicalName}</span>
                  </div>
                  <div className="text-sm text-slate-500 mt-1">
                    <span className="font-medium text-slate-700">{t.user}</span> • {t.reason || '無備註'}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">{new Date(t.date).toLocaleString()}</div>
                </div>
                <div className={`text-lg font-bold ${t.type === 'IN' ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {t.type === 'IN' ? '+' : '-'}{t.quantity}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Transactions;

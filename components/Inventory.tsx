import React, { useState } from 'react';
import { Chemical, UnitInUse } from '../types';
import { Search, Plus, X, Save, Beaker, Package, Trash2, AlertCircle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface InventoryProps {
  chemicals: Chemical[];
  onUpdateChemical: (chemical: Chemical) => void;
  onAddChemical: (chemical: Omit<Chemical, 'id'>) => void;
}

const Inventory: React.FC<InventoryProps> = ({ chemicals, onUpdateChemical, onAddChemical }) => {
  const [editingChemical, setEditingChemical] = useState<Chemical | null>(null);

  const handleEditClick = (chemical: Chemical) => {
    // Ensure default values if they don't exist
    setEditingChemical({ 
      ...chemical,
      unitsInUse: chemical.unitsInUse || []
    });
  };

  const handleAddClick = () => {
    setEditingChemical({
      id: 'NEW_ENTRY', // Temporary ID to mark as new
      name: '',
      functionality: '',
      packageSize: '',
      currentStock: 0,
      unit: 'Drum',
      minLevel: 0,
      targetLevel: 0,
      lastUpdated: new Date().toISOString(),
      unitsInUse: []
    });
  };

  const handleCloseModal = () => {
    setEditingChemical(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingChemical) {
      if (editingChemical.id === 'NEW_ENTRY') {
        // Add new chemical
        const { id, ...newChemicalData } = editingChemical;
        onAddChemical(newChemicalData);
      } else {
        // Update existing chemical
        onUpdateChemical({
          ...editingChemical,
          lastUpdated: new Date().toISOString()
        });
      }
      handleCloseModal();
    }
  };

  const handleInputChange = (field: keyof Chemical, value: any) => {
    if (editingChemical) {
      setEditingChemical({
        ...editingChemical,
        [field]: value
      });
    }
  };

  const addUnitInUse = () => {
    if (!editingChemical) return;
    const newUnit: UnitInUse = {
      id: uuidv4(),
      remaining: 100
    };
    setEditingChemical({
      ...editingChemical,
      unitsInUse: [...editingChemical.unitsInUse, newUnit]
    });
  };

  const removeUnitInUse = (unitId: string) => {
    if (!editingChemical) return;
    setEditingChemical({
      ...editingChemical,
      unitsInUse: editingChemical.unitsInUse.filter(u => u.id !== unitId)
    });
  };

  const updateUnitLevel = (unitId: string, level: number) => {
    if (!editingChemical) return;
    setEditingChemical({
      ...editingChemical,
      unitsInUse: editingChemical.unitsInUse.map(u => 
        u.id === unitId ? { ...u, remaining: level } : u
      )
    });
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800">庫存管理 (Inventory)</h2>
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="搜尋化學品 (Search)..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>
          <button 
            onClick={handleAddClick}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
          >
            <Plus size={18} />
            <span>新增化學品 (Add)</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold tracking-wider">
                <th className="px-6 py-4">化學品名稱 (Chemical)</th>
                <th className="px-6 py-4">功能性 (Functionality)</th>
                <th className="px-6 py-4 text-center">倉庫庫存 (Stock)</th>
                <th className="px-6 py-4">現場使用狀況 (In Use)</th>
                <th className="px-6 py-4 text-right">操作 (Actions)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {chemicals.map((chemical) => {
                const stockPercentage = Math.min((chemical.currentStock / chemical.targetLevel) * 100, 100);
                const isLow = chemical.currentStock <= chemical.minLevel;
                const inUseCount = chemical.unitsInUse?.length || 0;

                return (
                  <tr key={chemical.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">{chemical.name}</div>
                      <div className="text-xs text-slate-500 mt-1">
                        {chemical.packageSize} <span className="text-slate-400">/</span> {chemical.unit}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                        <span className="inline-block bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-full border border-slate-200">
                            {chemical.functionality}
                        </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-bold text-slate-700">{chemical.currentStock} {chemical.unit}s</span>
                        <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${isLow ? 'bg-red-500' : 'bg-emerald-500'}`} 
                            style={{ width: `${stockPercentage}%` }}
                          />
                        </div>
                        {isLow && (
                          <span className="text-[10px] text-red-600 font-bold bg-red-100 px-1.5 py-0.5 rounded">Low Stock</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       {inUseCount > 0 ? (
                         <div className="flex flex-col gap-2">
                           <div className="flex items-center gap-2">
                             <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold">
                               {inUseCount} 使用中 (Open)
                             </span>
                           </div>
                           <div className="flex flex-wrap gap-1">
                             {chemical.unitsInUse.map((u, idx) => (
                               <div key={u.id || idx} className="text-[10px] bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-slate-600" title={`Unit ${idx+1}`}>
                                 {u.remaining}%
                               </div>
                             ))}
                           </div>
                         </div>
                       ) : (
                         <span className="text-slate-400 text-xs italic">無 (None open)</span>
                       )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleEditClick(chemical)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        編輯 (Edit)
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit/Add Modal */}
      {editingChemical && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[95vh]">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg text-slate-800">
                {editingChemical.id === 'NEW_ENTRY' ? '新增化學品 (Add New)' : '編輯化學品 (Edit Chemical)'}
              </h3>
              <button 
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full p-1 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="overflow-y-auto p-6 space-y-4">
               <form id="editForm" onSubmit={handleSave}>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">化學品名稱 (Name)</label>
                      <input
                        type="text"
                        value={editingChemical.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                        required
                        placeholder="e.g., Acetone"
                      />
                    </div>
                    
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">功能性 (Functionality)</label>
                      <input
                        type="text"
                        value={editingChemical.functionality}
                        onChange={(e) => handleInputChange('functionality', e.target.value)}
                        className="w-full p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="e.g., Acid Leveling Agent (酸性均染劑)"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">包裝規格 (Pkg Size)</label>
                      <input
                        type="text"
                        value={editingChemical.packageSize}
                        onChange={(e) => handleInputChange('packageSize', e.target.value)}
                        className="w-full p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                        required
                        placeholder="e.g., 25kg, 200L"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">容器單位 (Unit)</label>
                      <input
                        type="text"
                        value={editingChemical.unit}
                        onChange={(e) => handleInputChange('unit', e.target.value)}
                        className="w-full p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="e.g., Drum, Box"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-6 mt-6">
                    {/* Warehouse Stock Section */}
                    <div className="flex-1 border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                      <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
                        <Package size={16} className="text-blue-500" />
                        倉庫庫存 (Warehouse)
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1">目前數量 (Unopened)</label>
                          <input
                            type="number"
                            step="1"
                            min="0"
                            value={editingChemical.currentStock}
                            onChange={(e) => handleInputChange('currentStock', parseFloat(e.target.value))}
                            className="w-full p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white font-bold text-lg"
                            required
                          />
                          <p className="text-[10px] text-slate-400 mt-1">倉庫內可用的完整包裝數量。</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">安全水位 (Min)</label>
                            <input
                              type="number"
                              step="1"
                              min="0"
                              value={editingChemical.minLevel}
                              onChange={(e) => handleInputChange('minLevel', parseFloat(e.target.value))}
                              className="w-full p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">目標水位 (Target)</label>
                            <input
                              type="number"
                              step="1"
                              min="0"
                              value={editingChemical.targetLevel}
                              onChange={(e) => handleInputChange('targetLevel', parseFloat(e.target.value))}
                              className="w-full p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* On-Site Usage Section */}
                    <div className="flex-1 border border-blue-100 rounded-xl p-4 bg-blue-50/30">
                       <div className="flex justify-between items-center mb-3">
                          <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                            <Beaker size={16} className="text-blue-600" />
                            使用中容器 (Active)
                          </h4>
                          <button
                            type="button"
                            onClick={addUnitInUse}
                            className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors flex items-center gap-1"
                          >
                            <Plus size={12} /> 新增 (Add)
                          </button>
                       </div>
                       
                       <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                          {editingChemical.unitsInUse.length === 0 ? (
                            <div className="text-center py-6 text-slate-400 text-xs italic border border-dashed border-slate-300 rounded-lg">
                              目前沒有開封的容器。
                            </div>
                          ) : (
                            editingChemical.unitsInUse.map((unit, idx) => (
                              <div key={unit.id} className="bg-white p-2 rounded-lg border border-blue-100 shadow-sm flex items-center justify-between gap-2 animate-in slide-in-from-left-2 duration-200">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-slate-500 w-5">#{idx + 1}</span>
                                </div>
                                <div className="flex gap-1 flex-1 justify-center">
                                   {[25, 50, 75, 100].map((level) => (
                                     <button
                                       key={level}
                                       type="button"
                                       onClick={() => updateUnitLevel(unit.id, level)}
                                       className={`text-[10px] py-1 px-1.5 rounded transition-all ${
                                          unit.remaining === level
                                          ? 'bg-blue-600 text-white font-bold'
                                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                       }`}
                                     >
                                       {level}%
                                     </button>
                                   ))}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeUnitInUse(unit.id)}
                                  className="text-red-400 hover:text-red-600 p-1 hover:bg-red-50 rounded"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            ))
                          )}
                       </div>
                       {editingChemical.currentStock === 0 && editingChemical.unitsInUse.length > 0 && (
                          <div className="mt-3 flex items-start gap-2 text-[10px] text-amber-600 bg-amber-50 p-2 rounded border border-amber-100">
                             <AlertCircle size={12} className="mt-0.5" />
                             <p>倉庫已空，但仍有使用中容器 (Stock is 0, but Active > 0)。</p>
                          </div>
                       )}
                    </div>
                  </div>
               </form>
            </div>

            <div className="p-6 border-t border-slate-200 bg-slate-50 mt-auto">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 py-2.5 rounded-lg font-medium text-slate-600 bg-white border border-slate-300 hover:bg-slate-100 transition-colors"
                >
                  取消 (Cancel)
                </button>
                <button
                  type="submit"
                  form="editForm"
                  className="flex-1 py-2.5 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"
                >
                  <Save size={18} />
                  {editingChemical.id === 'NEW_ENTRY' ? '確認新增 (Add)' : '儲存變更 (Save)'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
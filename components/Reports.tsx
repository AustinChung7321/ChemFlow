
import React, { useState } from 'react';
import { Chemical, ReorderItem, AppSettings } from '../types';
import { MOCK_COSTS } from '../constants';
import { generateProcurementReport } from '../services/geminiService';
import { FileText, Sparkles, CheckCircle, Loader2, Printer } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ReportsProps {
  chemicals: Chemical[];
  settings: AppSettings;
}

const Reports: React.FC<ReportsProps> = ({ chemicals, settings }) => {
  const [loading, setLoading] = useState(false);
  const [reportText, setReportText] = useState<string>('');
  
  // Currency Conversion (Mock: 1 USD = 32 TWD)
  const currencyRate = settings.currency === 'TWD' ? 32 : 1;
  const currencySymbol = settings.currency === 'USD' ? '$' : 'NT$';

  // Calculate recommended orders based on Warehouse Stock vs Min Level
  const recommendedOrders: ReorderItem[] = chemicals
    .filter(c => c.currentStock <= c.minLevel)
    .map(c => ({
      chemicalId: c.id,
      name: c.name,
      functionality: c.functionality,
      packageSize: c.packageSize,
      currentStock: c.currentStock,
      suggestedQty: Math.ceil(c.targetLevel - c.currentStock),
      unit: c.unit,
      costPerUnit: (MOCK_COSTS[c.id] || 0) * currencyRate,
      minLevel: c.minLevel,
      unitsInUse: c.unitsInUse || []
    }));

  const totalEstimatedCost = recommendedOrders.reduce((sum, item) => sum + (item.suggestedQty * item.costPerUnit), 0);

  const handleGenerateReport = async () => {
    setLoading(true);
    setReportText('');
    const text = await generateProcurementReport(recommendedOrders, totalEstimatedCost, settings);
    setReportText(text);
    setLoading(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Col: Order Preview */}
        <div className="md:w-1/3 space-y-4">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <CheckCircle className="text-blue-500" size={20} />
              建議採購清單 (Preview)
            </h2>
            
            {recommendedOrders.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                <p className="text-slate-500">庫存水位良好 (All levels healthy).</p>
                <p className="text-xs text-slate-400 mt-1">無需採購 (No purchase required).</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recommendedOrders.map((item) => (
                  <div key={item.chemicalId} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div>
                      <div className="font-semibold text-slate-800">{item.name}</div>
                      <div className="text-xs text-slate-500">
                        {item.packageSize} / {item.unit}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{item.functionality}</div>
                      
                      {item.unitsInUse.length > 0 && (
                        <div className="text-[10px] text-blue-600 font-medium mt-1">
                          使用中 (In Use): {item.unitsInUse.length} 單位
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-blue-600">購買 {item.suggestedQty}</div>
                      <div className="text-xs text-slate-400">~{currencySymbol}{(item.suggestedQty * item.costPerUnit).toFixed(0)}</div>
                    </div>
                  </div>
                ))}
                <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                   <span className="font-bold text-slate-700">預估總額 (Est. Total):</span>
                   <span className="font-bold text-xl text-slate-900">{currencySymbol}{totalEstimatedCost.toFixed(2)}</span>
                </div>
              </div>
            )}
            
            <button
              onClick={handleGenerateReport}
              disabled={loading || recommendedOrders.length === 0}
              className="mt-6 w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-3 rounded-lg font-bold transition-all shadow-md group"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Sparkles className="group-hover:text-yellow-200 transition-colors" />}
              {loading ? 'AI 分析中 (Analyzing)...' : '生成採購評估報告 (Generate)'}
            </button>
          </div>
        </div>

        {/* Right Col: The Report */}
        <div className="md:w-2/3">
           {reportText ? (
             <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex justify-between items-center">
                  <h3 className="font-bold text-slate-700 flex items-center gap-2">
                    <FileText size={18} className="text-slate-500" />
                    採購評估報告 (Generated Report)
                  </h3>
                  <button 
                    onClick={() => window.print()} 
                    className="text-slate-500 hover:text-blue-600 transition-colors"
                    title="Print"
                  >
                    <Printer size={20} />
                  </button>
                </div>
                <div className="p-8 prose prose-slate max-w-none prose-headings:text-slate-800 prose-p:text-slate-600 prose-li:text-slate-600 prose-table:border-collapse prose-th:bg-slate-100 prose-th:p-3 prose-td:p-3 prose-td:border prose-th:border prose-tr:border-b-0">
                   <ReactMarkdown remarkPlugins={[remarkGfm]}>{reportText}</ReactMarkdown>
                </div>
             </div>
           ) : (
             <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-slate-50 rounded-xl border-2 border-dashed border-slate-300 text-slate-400 p-8 text-center">
               <Sparkles size={48} className="mb-4 text-slate-300" />
               <h3 className="text-lg font-semibold mb-2">準備生成 (Ready to Generate)</h3>
               <p className="max-w-md">
                 點擊按鈕讓 Gemini AI 分析您的低庫存項目並撰寫專業的採購評估報告。
                 (Click the button to have Gemini AI analyze your low stock items and write a professional report.)
               </p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default Reports;

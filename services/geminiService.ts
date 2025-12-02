
import { GoogleGenAI } from "@google/genai";
import { ReorderItem, AppSettings } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateProcurementReport = async (
  reorderItems: ReorderItem[],
  totalEstimatedCost: number,
  settings: AppSettings
): Promise<string> => {
  if (reorderItems.length === 0) {
    return "No items selected for reorder.";
  }

  const currencySymbol = settings.currency === 'USD' ? '$' : 'NT$';

  // Include Functionality and Package Size in the data string for AI context
  const itemsList = reorderItems.map(item => {
    // Format in-use units string, e.g., "1@50%, 1@25%"
    const inUseDescription = item.unitsInUse.length > 0 
      ? item.unitsInUse.map(u => `1@${u.remaining}%`).join(', ')
      : "None";

    return `- ${item.name}: Functionality="${item.functionality}", Packaging=${item.packageSize}/${item.unit}, In Use Count=${item.unitsInUse.length} (${inUseDescription}), Warehouse Stock=${item.currentStock} ${item.unit}s, Safety Stock=${item.minLevel} ${item.unit}s, Suggested Buy=${item.suggestedQty} ${item.unit}s, Approx Unit Cost=${currencySymbol}${item.costPerUnit}`;
  }).join('\n');

  const prompt = `
    You are a Lab Manager assisting with procurement for **${settings.orgName}**.
    The user wants a very **concise** Chemical Procurement List in **Traditional Chinese (繁體中文)**.
    
    **Constraint:**
    - NO long executive summaries.
    - NO long risk assessment paragraphs.
    - Just a clear, professional table and a brief closing.
    - Specifically break down "Currently In Use (現場使用)" vs "Warehouse Stock (庫存)".
    - Include the **Functionality** and **Packaging** in the description to justify the purchase.
    - For "In Use", list the count and details (e.g., "2桶 (1@50%, 1@25%)").
    - Use **${currencySymbol}** for all monetary values.

    Data:
    ${itemsList}

    Total Estimated Cost: ${currencySymbol}${totalEstimatedCost.toFixed(2)}

    Please generate the output in the following Markdown format:

    # 化學品採購申請單 - ${settings.orgName}

    **申請日期:** ${new Date().toLocaleDateString()}
    
    請批准以下化學品採購需求，這些項目目前庫存低於安全水位：

    | 化學品名稱 (Chemical) | 功能性 (Function) | 包裝規格 (Packaging) | 現場使用狀況 (In Use) | 倉庫庫存 (Stock) | 安全庫存 (Safety) | 建議採購 (Order Qty) | 預估費用 (Cost) |
    | :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: |
    | [Item Name] | [Function] | [Size]/[Unit] | **[Count]** ([Details]) | [Stock] [Unit] | [Min Level] [Unit] | **[Qty]** | ${currencySymbol}[Cost] |
    ... (fill with data)

    **總預估費用:** ${currencySymbol}${totalEstimatedCost.toFixed(2)}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 } 
      }
    });

    return response.text || "Failed to generate report text.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generating report. Please check your API Key and internet connection.";
  }
};

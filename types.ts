
export interface UnitInUse {
  id: string;
  remaining: number; // 25, 50, 75, 100
}

export interface Chemical {
  id: string;
  name: string;
  functionality: string; // e.g., 'Acid Leveling Agent', 'pH Control'
  currentStock: number; // Warehouse Stock (Unopened only)
  unit: string; // Container type e.g., 'Drum', 'Box', 'Bottle'
  packageSize: string; // e.g., '25kg', '200L', '500ml'
  minLevel: number; // Reorder point (in units)
  targetLevel: number; // Max stock level (in units)
  lastUpdated: string;
  unitsInUse: UnitInUse[]; // List of currently open units
}

export interface Transaction {
  id: string;
  chemicalId: string;
  chemicalName: string;
  type: 'IN' | 'OUT';
  quantity: number;
  date: string;
  user: string;
  reason?: string;
}

export interface ReorderItem {
  chemicalId: string;
  name: string;
  functionality: string;
  currentStock: number;
  suggestedQty: number;
  unit: string;
  packageSize: string;
  costPerUnit: number; // Mock cost for report generation
  minLevel: number; // Safety stock level
  unitsInUse: UnitInUse[];
}

export type ViewState = 'dashboard' | 'inventory' | 'transactions' | 'reports';

export type UserRole = 'Admin' | 'Manager' | 'Staff';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  initials: string;
}

export interface AppSettings {
  currency: 'USD' | 'TWD';
  orgName: string;
}

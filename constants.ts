
import { Chemical, Transaction, User, AppSettings } from './types';

export const INITIAL_CHEMICALS: Chemical[] = [
  {
    id: 'c1',
    name: 'Acetone',
    functionality: 'Solvent / Cleaning',
    packageSize: '20L',
    currentStock: 12,
    unit: 'Drum',
    minLevel: 15,
    targetLevel: 40,
    lastUpdated: new Date().toISOString(),
    unitsInUse: [
      { id: 'u1', remaining: 50 }
    ],
  },
  {
    id: 'c2',
    name: 'Sulfuric Acid (98%)',
    functionality: 'pH Adjustment / Catalyst',
    packageSize: '2.5L',
    currentStock: 4,
    unit: 'Bottle',
    minLevel: 5,
    targetLevel: 10,
    lastUpdated: new Date().toISOString(),
    unitsInUse: [
      { id: 'u2', remaining: 75 },
      { id: 'u2b', remaining: 25 }
    ],
  },
  {
    id: 'c3',
    name: 'Ethanol (Absolute)',
    functionality: 'Solvent / Disinfectant',
    packageSize: '200L',
    currentStock: 25,
    unit: 'Drum',
    minLevel: 10,
    targetLevel: 50,
    lastUpdated: new Date().toISOString(),
    unitsInUse: [],
  },
  {
    id: 'c4',
    name: 'Sodium Hydroxide Pellets',
    functionality: 'Strong Base / Neutralizer',
    packageSize: '1kg',
    currentStock: 8,
    unit: 'Jar',
    minLevel: 3,
    targetLevel: 10,
    lastUpdated: new Date().toISOString(),
    unitsInUse: [
      { id: 'u4', remaining: 25 }
    ],
  },
  {
    id: 'c5',
    name: 'Hydrochloric Acid (37%)',
    functionality: 'Acid Leveling Agent',
    packageSize: '20L',
    currentStock: 0,
    unit: 'Jerrycan',
    minLevel: 6,
    targetLevel: 12,
    lastUpdated: new Date().toISOString(),
    unitsInUse: [
      { id: 'u5', remaining: 50 }
    ],
  },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 't1',
    chemicalId: 'c1',
    chemicalName: 'Acetone',
    type: 'OUT',
    quantity: 5,
    date: new Date(Date.now() - 86400000 * 2).toISOString(),
    user: 'Dr. Chen',
    reason: 'Glassware cleaning',
  },
  {
    id: 't2',
    chemicalId: 'c2',
    chemicalName: 'Sulfuric Acid (98%)',
    type: 'OUT',
    quantity: 1,
    date: new Date(Date.now() - 86400000 * 1).toISOString(),
    user: 'Sarah Lin',
    reason: 'Synthesis Project X',
  },
  {
    id: 't3',
    chemicalId: 'c5',
    chemicalName: 'Hydrochloric Acid (37%)',
    type: 'OUT',
    quantity: 2,
    date: new Date(Date.now() - 43200000).toISOString(),
    user: 'Dr. Chen',
    reason: 'pH Adjustment',
  },
];

export const MOCK_COSTS: Record<string, number> = {
  'c1': 35.00, // Acetone per Drum
  'c2': 45.00, // H2SO4 per bottle
  'c3': 120.00, // Ethanol per Drum
  'c4': 22.00, // NaOH per jar
  'c5': 38.00, // HCl per jerrycan
};

export const INITIAL_USERS: User[] = [
  { id: 'u1', name: 'Dr. Chen', role: 'Manager', initials: 'DC' },
  { id: 'u2', name: 'Sarah Lin', role: 'Staff', initials: 'SL' },
  { id: 'u3', name: 'Mike Wang', role: 'Staff', initials: 'MW' },
  { id: 'u4', name: 'Admin', role: 'Admin', initials: 'AD' },
];

export const DEFAULT_SETTINGS: AppSettings = {
  currency: 'TWD',
  orgName: '化學實驗室 (Chem Lab)',
};

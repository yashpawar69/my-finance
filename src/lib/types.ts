export type Category = string;

export type Transaction = {
  id: string;
  date: string; // Changed to string to prevent hydration errors
  description: string;
  amount: number;
  category: Category;
};

// Type for creating/updating transactions, expects a Date object
export type TransactionInput = {
  date: Date;
  description: string;
  amount: number;
  category: Category;
};

export type Budget = {
  id: string;
  category: Category;
  limitAmount: number;
  month: number; // 0-11
  year: number;
};

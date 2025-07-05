export type Category = string;

export type Transaction = {
  id: string;
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

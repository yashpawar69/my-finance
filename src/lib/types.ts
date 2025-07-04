export type Category = 'Groceries' | 'Rent' | 'Utilities' | 'Transport' | 'Entertainment' | 'Other';

export type Transaction = {
  id: string;
  date: Date;
  description: string;
  amount: number;
  category: Category;
};

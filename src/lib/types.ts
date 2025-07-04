export type Category = string;

export type Transaction = {
  id: string;
  date: Date;
  description: string;
  amount: number;
  category: Category;
};

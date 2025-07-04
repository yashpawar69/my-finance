import type { Transaction, Category } from './types';

export const categories: Category[] = [
  'Groceries',
  'Rent',
  'Utilities',
  'Transport',
  'Entertainment',
  'Other',
];

export const transactions: Transaction[] = [
  { id: '1', date: new Date('2024-07-01'), description: 'Monthly Rent', amount: 1200, category: 'Rent' },
  { id: '2', date: new Date('2024-07-02'), description: 'Weekly Groceries', amount: 75.50, category: 'Groceries' },
  { id: '3', date: new Date('2024-07-05'), description: 'Electricity Bill', amount: 55.20, category: 'Utilities' },
  { id: '4', date: new Date('2024-07-07'), description: 'Gas for Car', amount: 40.00, category: 'Transport' },
  { id: '5', date: new Date('2024-07-10'), description: 'Movie Night', amount: 35.00, category: 'Entertainment' },
  { id: '6', date: new Date('2024-07-15'), description: 'Internet Bill', amount: 60.00, category: 'Utilities' },
  { id: '7', date: new Date('2024-07-16'), description: 'Weekly Groceries', amount: 85.25, category: 'Groceries' },
  { id: '8', date: new Date('2024-07-20'), description: 'Dinner with friends', amount: 120.00, category: 'Entertainment' },
  { id: '9', date: new Date('2024-07-22'), description: 'Public Transport Pass', amount: 50.00, category: 'Transport' },
  { id: '10', date: new Date('2024-07-28'), description: 'Pharmacy', amount: 25.00, category: 'Other' },
  
  { id: '11', date: new Date('2024-06-01'), description: 'Monthly Rent', amount: 1200, category: 'Rent' },
  { id: '12', date: new Date('2024-06-03'), description: 'Weekly Groceries', amount: 90.10, category: 'Groceries' },
  { id: '13', date: new Date('2024-06-05'), description: 'Electricity Bill', amount: 50.75, category: 'Utilities' },
  { id: '14', date: new Date('2024-06-09'), description: 'Concert Tickets', amount: 150.00, category: 'Entertainment' },
  { id: '15', date: new Date('2024-06-17'), description: 'Weekly Groceries', amount: 65.00, category: 'Groceries' },
  
  { id: '16', date: new Date('2024-05-01'), description: 'Monthly Rent', amount: 1200, category: 'Rent' },
  { id: '17', date: new Date('2024-05-04'), description: 'Groceries', amount: 110.40, category: 'Groceries' },
  { id: '18', date: new Date('2024-05-06'), description: 'Water Bill', amount: 30.00, category: 'Utilities' },
  { id: '19', date: new Date('2024-05-15'), description: 'Train tickets', amount: 80.00, category: 'Transport' },
  { id: '20', date: new Date('2024-05-21'), description: 'Book purchase', amount: 45.50, category: 'Other' },
];

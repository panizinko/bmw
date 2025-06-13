export interface User {
  id?: string;
  name: string;
  email?: string;
  currency: string;
  createdAt?: Date;
}

export interface Income {
  id: string;
  source: string;
  amount: number;
  frequency: 'monthly' | 'bi-weekly' | 'weekly';
  isActive: boolean;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  color: string;
  icon?: string;
  budgetLimit: number;
  isActive: boolean;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  categoryId: string;
  type: 'income' | 'expense';
  date: Date;
  tags?: string[];
}

export interface BudgetSummary {
  totalIncome: number;
  totalExpenses: number;
  remainingBudget: number;
  categorySpending: CategorySpending[];
}

export interface CategorySpending {
  categoryId: string;
  categoryName: string;
  spent: number;
  budgetLimit: number;
  percentage: number;
}

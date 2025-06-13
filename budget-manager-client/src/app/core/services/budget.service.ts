import { computed, Injectable, signal } from '@angular/core';
import {
  BudgetSummary,
  ExpenseCategory,
  Income,
  Transaction,
  User,
} from '../models/budget.model';

@Injectable({
  providedIn: 'root',
})
export class BudgetService {
  // Signal-based state management
  private readonly _user = signal<User | null>(null);
  private readonly _incomes = signal<Income[]>([]);
  private readonly _categories = signal<ExpenseCategory[]>([]);
  private readonly _transactions = signal<Transaction[]>([]);

  // Read-only signals for components
  readonly user = this._user.asReadonly();
  readonly incomes = this._incomes.asReadonly();
  readonly categories = this._categories.asReadonly();
  readonly transactions = this._transactions.asReadonly();

  // Computed signals for derived state
  readonly totalMonthlyIncome = computed(() => {
    return this._incomes()
      .filter((income) => income.isActive)
      .reduce((total, income) => {
        switch (income.frequency) {
          case 'monthly':
            return total + income.amount;
          case 'bi-weekly':
            return total + income.amount * 2;
          case 'weekly':
            return total + income.amount * 4;
          default:
            return total;
        }
      }, 0);
  });

  readonly budgetSummary = computed<BudgetSummary>(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthlyTransactions = this._transactions().filter((t) => {
      const transactionDate = new Date(t.date);
      return (
        transactionDate.getMonth() === currentMonth &&
        transactionDate.getFullYear() === currentYear
      );
    });

    const totalExpenses = monthlyTransactions
      .filter((t) => t.type === 'expense')
      .reduce((total, t) => total + t.amount, 0);

    const totalIncome = this.totalMonthlyIncome();
    const remainingBudget = totalIncome - totalExpenses;

    const categorySpending = this._categories().map((category) => {
      const spent = monthlyTransactions
        .filter((t) => t.categoryId === category.id && t.type === 'expense')
        .reduce((total, t) => total + t.amount, 0);

      return {
        categoryId: category.id,
        categoryName: category.name,
        spent,
        budgetLimit: category.budgetLimit,
        percentage:
          category.budgetLimit > 0 ? (spent / category.budgetLimit) * 100 : 0,
      };
    });

    return {
      totalIncome,
      totalExpenses,
      remainingBudget,
      categorySpending,
    };
  });

  constructor() {
    this.loadFromStorage();
  }

  // State management methods
  setUser(user: User): void {
    this._user.set(user);
    this.saveToStorage();
  }

  addIncome(income: Income): void {
    this._incomes.update((incomes) => [...incomes, income]);
    this.saveToStorage();
  }

  updateIncome(updatedIncome: Income): void {
    this._incomes.update((incomes) =>
      incomes.map((income) =>
        income.id === updatedIncome.id ? updatedIncome : income,
      ),
    );
    this.saveToStorage();
  }

  removeIncome(incomeId: string): void {
    this._incomes.update((incomes) =>
      incomes.filter((income) => income.id !== incomeId),
    );
    this.saveToStorage();
  }

  addCategory(category: ExpenseCategory): void {
    this._categories.update((categories) => [...categories, category]);
    this.saveToStorage();
  }

  updateCategory(updatedCategory: ExpenseCategory): void {
    this._categories.update((categories) =>
      categories.map((category) =>
        category.id === updatedCategory.id ? updatedCategory : category,
      ),
    );
    this.saveToStorage();
  }

  removeCategory(categoryId: string): void {
    this._categories.update((categories) =>
      categories.filter((category) => category.id !== categoryId),
    );
    this.saveToStorage();
  }

  addTransaction(transaction: Transaction): void {
    this._transactions.update((transactions) => [...transactions, transaction]);
    this.saveToStorage();
  }

  updateTransaction(updatedTransaction: Transaction): void {
    this._transactions.update((transactions) =>
      transactions.map((transaction) =>
        transaction.id === updatedTransaction.id
          ? updatedTransaction
          : transaction,
      ),
    );
    this.saveToStorage();
  }

  removeTransaction(transactionId: string): void {
    this._transactions.update((transactions) =>
      transactions.filter((transaction) => transaction.id !== transactionId),
    );
    this.saveToStorage();
  }

  // Data persistence
  private saveToStorage(): void {
    const data = {
      user: this._user(),
      incomes: this._incomes(),
      categories: this._categories(),
      transactions: this._transactions(),
    };

    localStorage.setItem(
      'budget-data',
      JSON.stringify(data, this.dateReplacer),
    );
  }

  loadFromStorage(): void {
    try {
      const storedData = localStorage.getItem('budget-data');
      if (!storedData) return;

      const parsedData = JSON.parse(storedData, this.dateReviver);

      // Set data to signals with fallbacks
      if (parsedData.user) this._user.set(parsedData.user);
      if (Array.isArray(parsedData.incomes))
        this._incomes.set(parsedData.incomes);
      if (Array.isArray(parsedData.categories))
        this._categories.set(parsedData.categories);
      if (Array.isArray(parsedData.transactions))
        this._transactions.set(parsedData.transactions);
    } catch (error) {
      console.warn('Failed to load budget data from storage:', error);
      // Keep default empty state if parsing fails
    }
  }

  clearData(): void {
    this._user.set(null);
    this._incomes.set([]);
    this._categories.set([]);
    this._transactions.set([]);
    localStorage.removeItem('budget-data');
  }

  // Utility methods
  generateId(): string {
    return crypto.randomUUID();
  }

  getDefaultCategories(): ExpenseCategory[] {
    return [
      {
        id: this.generateId(),
        name: 'Housing',
        color: '#E3F2FD',
        budgetLimit: 0,
        isActive: true,
      },
      {
        id: this.generateId(),
        name: 'Food',
        color: '#E8F5E8',
        budgetLimit: 0,
        isActive: true,
      },
      {
        id: this.generateId(),
        name: 'Transportation',
        color: '#FFF3E0',
        budgetLimit: 0,
        isActive: true,
      },
      {
        id: this.generateId(),
        name: 'Entertainment',
        color: '#FCE4EC',
        budgetLimit: 0,
        isActive: true,
      },
      {
        id: this.generateId(),
        name: 'Utilities',
        color: '#F3E5F5',
        budgetLimit: 0,
        isActive: true,
      },
      {
        id: this.generateId(),
        name: 'Healthcare',
        color: '#FFEBEE',
        budgetLimit: 0,
        isActive: true,
      },
    ];
  }

  private dateReplacer(key: string, value: any): any {
    if (value instanceof Date) {
      return value.toISOString();
    }
    return value;
  }

  private dateReviver(key: string, value: any): any {
    if (key === 'date' && typeof value === 'string') {
      return new Date(value);
    }
    return value;
  }
}

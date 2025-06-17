
export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  date: Date;
}

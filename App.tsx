
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Transaction, TransactionType } from './types';
import BalanceDisplay from './components/BalanceDisplay';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import DollarSignIcon from './components/icons/DollarSignIcon';

const App: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const savedTransactions = localStorage.getItem('transactions');
    if (savedTransactions) {
      try {
        const rawParsedData = JSON.parse(savedTransactions);
        if (Array.isArray(rawParsedData)) {
          const typedTransactions: any[] = rawParsedData; // Process as any[] for robust mapping
          
          return typedTransactions.map(t => {
            let parsedDate;
            if (t && t.date) {
              parsedDate = new Date(t.date);
              if (isNaN(parsedDate.getTime())) { // Check if date parsing resulted in Invalid Date
                console.warn(`Invalid date format for transaction id "${t.id}", value "${t.date}". Using current date as fallback.`);
                parsedDate = new Date(); // Fallback to current date
              }
            } else {
              console.warn(`Missing or invalid date for transaction (id: ${t.id}). Using current date as fallback.`);
              parsedDate = new Date(); // Fallback if date is missing or t is malformed
            }

            // Ensure other properties are valid or provide sensible defaults
            const id = String(t.id || crypto.randomUUID());
            const description = String(t.description || "N/A");
            const amount = Number(t.amount || 0);
            const type = (Object.values(TransactionType).includes(t.type)) ? t.type : TransactionType.EXPENSE; // Default to expense if type is invalid

            return {
              id,
              description,
              amount,
              type,
              date: parsedDate,
            };
          }).filter(t => t !== null) as Transaction[]; // Filter ensures all mapped items are valid objects
        } else {
          console.warn('Transactions from localStorage were not in the expected array format. Initializing with empty list.');
          return [];
        }
      } catch (error) {
        console.error('Failed to parse transactions from localStorage:', error);
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  const addTransaction = useCallback((newTransaction: Omit<Transaction, 'id' | 'date'>) => {
    setTransactions(prevTransactions => [
      ...prevTransactions,
      { ...newTransaction, id: crypto.randomUUID(), date: new Date() },
    ]);
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions(prevTransactions =>
      prevTransactions.filter(transaction => transaction.id !== id)
    );
  }, []);

  const { totalIncome, totalExpenses, balance } = useMemo(() => {
    let income = 0;
    let expenses = 0;
    transactions.forEach(transaction => {
      // Ensure transaction and amount are valid before processing
      if (transaction && typeof transaction.amount === 'number') {
        if (transaction.type === TransactionType.INCOME) {
          income += transaction.amount;
        } else {
          expenses += transaction.amount;
        }
      }
    });
    return {
      totalIncome: income,
      totalExpenses: expenses,
      balance: income - expenses,
    };
  }, [transactions]);

  return (
    <div className="min-h-screen bg-light dark:bg-dark py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-3xl mx-auto">
        <header className="mb-10 text-center">
          <div className="flex items-center justify-center mb-2">
            <DollarSignIcon className="w-12 h-12 text-primary dark:text-blue-400 mr-3" />
            <h1 className="text-4xl font-extrabold text-gray-800 dark:text-gray-100">
              Controle Financeiro
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Gerencie suas receitas e despesas de forma simples.
          </p>
        </header>

        <main>
          <BalanceDisplay
            totalIncome={totalIncome}
            totalExpenses={totalExpenses}
            balance={balance}
          />
          <TransactionForm onAddTransaction={addTransaction} />
          <TransactionList
            transactions={transactions}
            onDeleteTransaction={deleteTransaction}
          />
        </main>
        
        <footer className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>&copy; {new Date().getFullYear()} Controle Financeiro Simples. Todos os direitos reservados.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;

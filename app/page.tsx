"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useEffect, useState } from 'react'
import { ProgressBar } from '../components/ProgressBar'

const DAILY_AMOUNT = 6000;

type Transaction = {
  amount: number;
  date: string;
};

const calculateMax = (currentAmount: number) => {
  return Math.max(Math.abs(currentAmount), DAILY_AMOUNT);
};

const saveTransaction = (amount: number, setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>) => {
  const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
  const newTransaction = {
    amount,
    date: new Date().toLocaleString(),
  };
  transactions.unshift(newTransaction);
  if (transactions.length > 3) {
    transactions.pop();
  }
  localStorage.setItem('transactions', JSON.stringify(transactions));
  setTransactions(transactions);
};

const getTransactions = (): Transaction[] => {
  return JSON.parse(localStorage.getItem('transactions') || '[]');
};

export default function SpendTracker() {
  const [amount, setAmount] = useState(DAILY_AMOUNT);
  const [spendAmount, setSpendAmount] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [isSpendOpen, setIsSpendOpen] = useState(false);
  const [isSetOpen, setIsSetOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const syncTheme = () => {
    let isDark = false;
    const cache = localStorage.getItem('theme');

    if (cache === null) {
      isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    } else {
      isDark = cache === 'dark';
    }

    setTheme(isDark);
  }

  useEffect(() => {
    syncTheme();
  }, []);

  useEffect(() => {
    setTransactions(getTransactions());

    const storedAmount = localStorage.getItem('amount');
    if (storedAmount) {
      setAmount(parseInt(storedAmount, 10));
    }

    const lastUpdate = localStorage.getItem('lastUpdate');
    const now = new Date();
    const today = now.toDateString();

    if (lastUpdate !== today) {
      setAmount(prevAmount => {
        const newAmount = prevAmount + DAILY_AMOUNT;
        localStorage.setItem('amount', newAmount.toString());
        return newAmount;
      });
      localStorage.setItem('lastUpdate', today);
    }

    const timer = setInterval(() => {
      const currentDate = new Date().toDateString();
      if (currentDate !== localStorage.getItem('lastUpdate')) {
        setAmount(prevAmount => {
          const newAmount = prevAmount + DAILY_AMOUNT;
          localStorage.setItem('amount', newAmount.toString());
          localStorage.setItem('lastUpdate', currentDate);
          return newAmount;
        });
      }
    }, 60000); // Check every minute

    return () => clearInterval(timer);
  }, [setAmount]);

  const handleSetAmount = () => {
    const newAmt = parseInt(newAmount, 10);
    if (!isNaN(newAmt)) {
      setAmount(() => {
        localStorage.setItem('amount', newAmt.toString());
        return newAmt;
      });
      saveTransaction(newAmt, setTransactions);
      setNewAmount('');
      setIsSetOpen(false);
    }
  }

  const handleSpendAmount = () => {
    const spend = parseInt(spendAmount, 10);
    if (!isNaN(spend)) {
      setAmount(prevAmount => {
        const newAmount = prevAmount - spend;
        localStorage.setItem('amount', newAmount.toString());
        return newAmount;
      });
      saveTransaction(-spend, setTransactions);
      setSpendAmount('');
      setIsSpendOpen(false);
    }
  };



  const setTheme = (isDarkMode: boolean) => {
    setIsDarkMode(isDarkMode);
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', isDarkMode);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-black dark:text-white">
      <div className="p-8 rounded-lg w-96">
        <div className="flex flex-row flex-nowrap items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Spend Tracker</h1>
          <Button onClick={() => setTheme(!isDarkMode)} className="px-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><defs><mask id="lineMdLightDark0"><circle cx={7.5} cy={7.5} r={5.5} fill="#fff"></circle><circle cx={11} cy={7.5} r={6.5}></circle></mask><mask id="lineMdLightDark1"><g fill="#fff"><circle cx={12} cy={15} r={5.5}></circle><g><use href="#lineMdLightDark2" transform="rotate(-75 12 15)"></use><use href="#lineMdLightDark2" transform="rotate(-25 12 15)"></use><use href="#lineMdLightDark2" transform="rotate(25 12 15)"></use><use href="#lineMdLightDark2" transform="rotate(75 12 15)"></use></g></g><path d="M0 10h26v5h-26z"></path><path stroke="#fff" strokeWidth={2} d="M23 12h-22"></path></mask><symbol id="lineMdLightDark2"><path d="M10.5 21.5h3L12 24z"></path></symbol></defs><g fill="currentColor"><rect width={13} height={13} x={1} y={1} mask="url(#lineMdLightDark0)"></rect><path d="M-2 11h28v13h-28z" mask="url(#lineMdLightDark1)" transform="rotate(-45 12 12)"></path></g></svg>
          </Button>
        </div>
        <div className="mb-6">
          <p className="text-xl font-semibold mb-8">
            Balance: {amount.toLocaleString()} RWF
          </p>
          <ProgressBar value={amount} max={calculateMax(amount)} />
        </div>
        <div className="my-8 flex space-x-4">
          <Dialog open={isSetOpen} onOpenChange={setIsSetOpen}>
            <DialogTrigger asChild>
              <Button className="w-full">Set</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Set Amount</DialogTitle>
              </DialogHeader>
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  placeholder="Enter amount to set"
                  min={0}
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                />
                <Button onClick={handleSetAmount}>Set</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={isSpendOpen} onOpenChange={setIsSpendOpen}>
            <DialogTrigger asChild>
              <Button className="w-full">Spend</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Spend</DialogTitle>
              </DialogHeader>
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  placeholder="Enter amount to spend"
                  value={spendAmount}
                  onChange={(e) => setSpendAmount(e.target.value)}
                />
                <Button onClick={handleSpendAmount}>Spend</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Recent Transactions</h2>
          {transactions.length === 0 ? (
            <p>No transactions yet.</p>
          ) : (
            <ul>
              {transactions.map((transaction, index) => (
                <li key={index} className="mb-2 text-sm flex flex-row flex-nowrap items-center">
                  <span className="inline">{transaction.amount.toLocaleString()} RWF</span>
                  <span className="border-dashed flex-1 border-b h-1 mx-2 border-gray-500"></span>
                  <span className="inline">{transaction.date}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
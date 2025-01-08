"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useEffect, useState } from 'react'
import { ProgressBar } from '../components/ProgressBar'

const DAILY_POINTS = 5000;

const calculateMax = (currentAmount: number) => {
  return Math.max(Math.abs(currentAmount), DAILY_POINTS);
};

export default function PointTracker() {
  const [amount, setAmount] = useState(DAILY_POINTS);
  const [spendAmount, setSpendAmount] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [isSpendOpen, setIsSpendOpen] = useState(false);
  const [isSetOpen, setIsSetOpen] = useState(false);

  useEffect(() => {
    const storedAmount = localStorage.getItem('amount');
    if (storedAmount) {
      setAmount(parseInt(storedAmount, 10));
    }

    const lastUpdate = localStorage.getItem('lastUpdate');
    const now = new Date();
    const today = now.toDateString();

    if (lastUpdate !== today) {
      setAmount(prevAmount => {
        const newAmount = prevAmount + DAILY_POINTS;
        localStorage.setItem('amount', newAmount.toString());
        return newAmount;
      });
      localStorage.setItem('lastUpdate', today);
    }

    const timer = setInterval(() => {
      const currentDate = new Date().toDateString();
      if (currentDate !== localStorage.getItem('lastUpdate')) {
        setAmount(prevAmount => {
          const newAmount = prevAmount + DAILY_POINTS;
          localStorage.setItem('amount', newAmount.toString());
          localStorage.setItem('lastUpdate', currentDate);
          return newAmount;
        });
      }
    }, 60000); // Check every minute

    return () => clearInterval(timer);
  }, []);

  const handleSetAmount = () => {
    const newAmt = parseInt(newAmount, 10);
    if (!isNaN(newAmt)) {
      setAmount(prev => {
        localStorage.setItem('amount', newAmt.toString());
        return newAmt;
      });
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
      setSpendAmount('');
      setIsSpendOpen(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="p-8 rounded-lg w-96">
        <h1 className="text-2xl font-bold mb-8">Spend Tracker</h1>
        <div className="mb-6">
          <p className="text-xl font-semibold mb-8">
            Balance: {amount.toLocaleString()} RWF
          </p>
          <ProgressBar value={amount} max={calculateMax(amount)} min={DAILY_POINTS} />
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
      </div>
    </div>
  );
}
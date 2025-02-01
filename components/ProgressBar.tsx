import { useEffect, useState } from "react";

interface ProgressBarProps {
  value: number;
  max: number;
}

export function ProgressBar({ value, max }: ProgressBarProps) {
  const absValue = Math.abs(value);
  const percentage = (absValue / max) * 50; // 50% of the bar represents the full value
  const barWidth = `${Math.min(percentage, 50)}%`;

  const [background, setBackground] = useState('rgb(34 197 94)');

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    if (value >= 0) {
      setBackground(isDarkMode ? 'rgb(34 197 94)' : 'rgb(34 197 94)');
    } else {
      setBackground(isDarkMode ? 'rgb(239 68 68)' : 'rgb(239 68 68)');
    }
  }, [value]);

  const getBarStyle = () => {
    if (value >= 0) {
      return {
        left: '50%',
        width: barWidth,
        backgroundColor: background,
      };
    } else {
      return {
        left: `${50 - Math.min(percentage, 50)}%`,
        width: barWidth,
        backgroundColor: background,
      };
    }
  };

  return (
    <div className="relative w-full h-8 bg-gray-200 rounded-full overflow-hidden dark:bg-dark-gray-200">
      <div
        className="absolute top-0 bottom-0 transition-all duration-300 ease-in-out"
        style={getBarStyle()}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-white px-2 py-1 rounded-full text-sm font-semibold text-gray-800">0</div>
      </div>
      <div className="absolute inset-0 flex items-center justify-between px-2">
        <span className="text-sm font-semibold text-gray-700 dark:text-dark-gray-700">-{max.toLocaleString()}</span>
        <span className="text-sm font-semibold text-gray-700 dark:text-dark-gray-700">{max.toLocaleString()}</span>
      </div>
    </div>
  );
}


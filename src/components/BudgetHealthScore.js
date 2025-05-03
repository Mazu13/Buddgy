// components/BudgetHealthScore.js
import React from 'react';

const BudgetHealthScore = ({ score = 90 }) => {
  const normalizedScore = Math.min(Math.max(score, 0), 100);
  const circumference = 2 * Math.PI * 80;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;
  
  const getColor = (score) => {
    if (score >= 85) return "#10b981"; // yeşil
    if (score >= 60) return "#f59e0b"; // sarı/amber
    return "#ef4444"; // kırmızı
  };
  
  const scoreColor = getColor(normalizedScore);

  return (
    <div className="flex flex-col items-center justify-center w-full h-64">
      <div className="relative w-40 h-40">
        <svg className="w-full h-full" viewBox="0 0 180 180">
          <circle
            cx="90"
            cy="90"
            r="80"
            fill="none"
            stroke="#374151"
            strokeWidth="12"
            opacity="0.2"
          />
          
          <circle
            cx="90"
            cy="90"
            r="80"
            fill="none"
            stroke={scoreColor}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 90 90)"
          />
          
          <circle
            cx="90"
            cy="90"
            r="60"
            fill="#1f2937"
          />
        </svg>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-sm text-gray-400">Health Score</span>
          <span className="text-2xl font-bold text-white">{`${normalizedScore.toFixed(1)}/100`}</span>
        </div>
      </div>
    </div>
  );
};

export default BudgetHealthScore;
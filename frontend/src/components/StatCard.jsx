import React from 'react';
import { ChevronRight } from 'lucide-react';

export default function StatCard({
  title,
  value,
  subvalue,
  icon: Icon,
  variant = 'blue', // 'blue' | 'red' | 'navy' | 'gray'
  onClick,
  isInteractive = false,
  badgeText
}) {
  const variantStyles = {
    blue: {
      border: 'border-l-4 border-l-blue-600',
      badge: 'bg-blue-50 text-blue-700 border-blue-200',
      iconBg: 'bg-blue-600 text-white',
      accentText: 'text-blue-600',
    },
    red: {
      border: 'border-l-4 border-l-red-600',
      badge: 'bg-red-50 text-red-700 border-red-200',
      iconBg: 'bg-red-600 text-white',
      accentText: 'text-red-600',
    },
    navy: {
      border: 'border-l-4 border-l-blue-900',
      badge: 'bg-slate-100 text-slate-800 border-slate-300',
      iconBg: 'bg-blue-900 text-white',
      accentText: 'text-blue-900',
    },
    gray: {
      border: 'border-l-4 border-l-slate-400',
      badge: 'bg-slate-100 text-slate-700 border-slate-200',
      iconBg: 'bg-slate-700 text-white',
      accentText: 'text-slate-600',
    }
  };

  const currentVariant = variantStyles[variant] || variantStyles.blue;

  return (
    <div
      onClick={onClick}
      className={`relative bg-white rounded-xl border border-slate-200 p-5 shadow-sm transition-all duration-200 ${currentVariant.border} ${
        isInteractive ? 'cursor-pointer hover:shadow-md hover:border-blue-400 group' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-wider uppercase text-slate-500">
              {title}
            </span>
            {badgeText && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase ${currentVariant.badge}`}>
                {badgeText}
              </span>
            )}
          </div>
          <div className="mt-2 text-2xl font-black tracking-tight text-slate-900 flex items-baseline gap-2">
            <span>{value}</span>
            {isInteractive && (
              <span className="text-xs font-medium text-blue-600 group-hover:translate-x-0.5 transition-transform flex items-center">
                Details <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </span>
            )}
          </div>
          {subvalue && (
            <p className="mt-1 text-xs text-slate-500">{subvalue}</p>
          )}
        </div>

        <div className={`p-3 rounded-lg shadow-sm ${currentVariant.iconBg}`}>
          {Icon && <Icon className="w-5 h-5" />}
        </div>
      </div>

      {isInteractive && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-blue-700 font-medium">
          <span>Click to view Purchases, Transfers In & Out</span>
          <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-[10px] font-semibold">
            Bonus Feature
          </span>
        </div>
      )}
    </div>
  );
}

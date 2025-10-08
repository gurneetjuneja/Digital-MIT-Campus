import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  trend?: {
    value: string;
    up?: boolean;
  };
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, color, trend }) => {
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-500 bg-opacity-10 text-blue-500';
      case 'green':
        return 'bg-green-500 bg-opacity-10 text-green-500';
      case 'yellow':
        return 'bg-yellow-500 bg-opacity-10 text-yellow-500';
      case 'red':
        return 'bg-red-500 bg-opacity-10 text-red-500';
      case 'purple':
        return 'bg-purple-500 bg-opacity-10 text-purple-500';
      default:
        return 'bg-gray-500 bg-opacity-10 text-gray-500';
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 card-hover">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${getColorClasses(color)} mr-4`}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-semibold text-gray-800">{value}</p>
        </div>
      </div>
      {trend && (
        <div className={`mt-3 text-sm ${trend.up ? 'text-green-500' : 'text-red-500'} flex items-center`}>
          {trend.up ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v3.586l-4.293-4.293a1 1 0 00-1.414 0L8 10.586 3.707 6.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clipRule="evenodd" />
            </svg>
          )}
          <span>{trend.value}</span>
        </div>
      )}
    </div>
  );
};

export default StatsCard;
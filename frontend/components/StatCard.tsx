import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactElement<{ className?: string }>;
  color: 'blue' | 'green' | 'purple' | 'red';
}

const colorClasses = {
  blue: 'bg-blue-100 text-blue-600',
  green: 'bg-green-100 text-green-600',
  purple: 'bg-purple-100 text-purple-600',
  red: 'bg-red-100 text-red-600',
};

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-md flex items-center">
    <div className={`p-4 rounded-full ${colorClasses[color]}`}>
      {React.cloneElement(icon, { className: 'w-6 h-6' })}
    </div>
    <div className="ml-4">
      <p className="text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

export default React.memo(StatCard);

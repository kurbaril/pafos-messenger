import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export default function UsersChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-text-secondary">
        No data available
      </div>
    );
  }

  const chartData = data.map(item => ({
    date: new Date(item.date).toLocaleDateString([], { month: 'short', day: 'numeric' }),
    count: item.count
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface border border-border rounded-lg p-2 shadow-lg">
          <p className="text-text-secondary text-xs mb-1">{label}</p>
          <p className="text-text font-semibold">
            {payload[0].value} new users
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
        <XAxis 
          dataKey="date" 
          stroke="#9CA3AF" 
          tick={{ fill: '#9CA3AF', fontSize: 12 }}
          tickLine={{ stroke: '#2A2A2A' }}
        />
        <YAxis 
          stroke="#9CA3AF" 
          tick={{ fill: '#9CA3AF', fontSize: 12 }}
          tickLine={{ stroke: '#2A2A2A' }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="count"
          stroke="#10B981"
          strokeWidth={2}
          dot={{ fill: '#10B981', r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
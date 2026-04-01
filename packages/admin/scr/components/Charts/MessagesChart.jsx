import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

export default function MessagesChart({ data }) {
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
            {payload[0].value} messages
          </p>
        </div>
      );
    }
    return null;
  };

  const maxCount = Math.max(...chartData.map(d => d.count));
  const getBarColor = (count) => {
    const ratio = count / maxCount;
    if (ratio > 0.7) return '#EF4444';
    if (ratio > 0.4) return '#F59E0B';
    return '#7C3AED';
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getBarColor(entry.count)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
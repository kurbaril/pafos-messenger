import React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export default function ActivityChart({ data }) {
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

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#7C3AED" stopOpacity={0}/>
          </linearGradient>
        </defs>
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
        <Area
          type="monotone"
          dataKey="count"
          stroke="#7C3AED"
          strokeWidth={2}
          fill="url(#colorActivity)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
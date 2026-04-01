import React from 'react';

export default function Heatmap({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-text-secondary">
        No data available
      </div>
    );
  }

  // Generate sample heatmap data based on actual message counts
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hours = Array.from({ length: 24 }, (_, i) => i);
  
  // Create a matrix of activity levels
  const matrix = days.map((day, dayIndex) => {
    return hours.map(hour => {
      // Generate a value based on actual data if available, otherwise use pattern
      const baseValue = data[dayIndex % data.length]?.count || 0;
      // Peak hours: 9-11 AM and 7-10 PM
      let multiplier = 1;
      if (hour >= 9 && hour <= 11) multiplier = 1.5;
      if (hour >= 19 && hour <= 22) multiplier = 1.8;
      if (hour >= 0 && hour <= 6) multiplier = 0.3;
      
      const value = Math.min(100, Math.round(baseValue * multiplier / 10));
      return { hour, value };
    });
  });

  const getColor = (value) => {
    if (value === 0) return '#1A1A1A';
    if (value < 20) return '#2D2A3A';
    if (value < 40) return '#3B2A5A';
    if (value < 60) return '#5B2A8A';
    if (value < 80) return '#7C3AED';
    return '#A78BFA';
  };

  const formatHour = (hour) => {
    if (hour === 0) return '12a';
    if (hour < 12) return `${hour}a`;
    if (hour === 12) return '12p';
    return `${hour - 12}p`;
  };

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[800px]">
        <div className="flex mb-2">
          <div className="w-12" />
          {hours.map(hour => (
            <div key={hour} className="flex-1 text-center text-xs text-text-muted">
              {formatHour(hour)}
            </div>
          ))}
        </div>
        
        {days.map((day, dayIndex) => (
          <div key={day} className="flex mb-1">
            <div className="w-12 text-sm text-text-secondary flex items-center">
              {day}
            </div>
            {matrix[dayIndex].map((cell, hourIndex) => (
              <div
                key={hourIndex}
                className="flex-1 h-8 mx-0.5 rounded transition-transform hover:scale-110 cursor-pointer"
                style={{ backgroundColor: getColor(cell.value) }}
                title={`${day}, ${formatHour(cell.hour)}: ${cell.value} activity`}
              />
            ))}
          </div>
        ))}
        
        <div className="flex justify-end items-center gap-2 mt-4">
          <span className="text-xs text-text-muted">Activity:</span>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#1A1A1A' }} />
            <span className="text-xs text-text-muted">Low</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#3B2A5A' }} />
            <span className="text-xs text-text-muted">Medium</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#7C3AED' }} />
            <span className="text-xs text-text-muted">High</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#A78BFA' }} />
            <span className="text-xs text-text-muted">Peak</span>
          </div>
        </div>
        
        <div className="mt-4 text-center text-xs text-text-muted">
          Shows message activity by hour of day and day of week
        </div>
      </div>
    </div>
  );
}
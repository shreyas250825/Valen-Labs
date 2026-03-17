// src/components/feedback/RadarChart.tsx
import React from 'react';

interface RadarChartProps {
  technicalScore: number;
  communicationScore: number;
  confidenceScore: number;
  overallScore: number;
}

const RadarChart: React.FC<RadarChartProps> = ({
  technicalScore,
  communicationScore,
  confidenceScore,
  overallScore
}) => {
  // For a real implementation, you would use a charting library like Chart.js or D3
  // This is a simplified SVG-based radar chart

  const dimensions = [
    { label: 'Technical', score: technicalScore, color: '#3B82F6' },
    { label: 'Communication', score: communicationScore, color: '#10B981' },
    { label: 'Confidence', score: confidenceScore, color: '#8B5CF6' },
    { label: 'Overall', score: overallScore, color: '#F59E0B' }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">
        Skills Assessment
      </h3>

      <div className="flex flex-col lg:flex-row items-center justify-between">
        {/* Radar Chart Visualization */}
        <div className="relative w-64 h-64 mb-6 lg:mb-0">
          <svg
            viewBox="0 0 200 200"
            className="w-full h-full transform -rotate-90"
          >
            {/* Grid Circles */}
            <circle cx="100" cy="100" r="40" fill="none" stroke="#F3F4F6" strokeWidth="1" />
            <circle cx="100" cy="100" r="60" fill="none" stroke="#F3F4F6" strokeWidth="1" />
            <circle cx="100" cy="100" r="80" fill="none" stroke="#F3F4F6" strokeWidth="1" />
            
            {/* Axes */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
              <line
                key={i}
                x1="100"
                y1="100"
                x2={100 + 80 * Math.cos(angle * Math.PI / 180)}
                y2={100 + 80 * Math.sin(angle * Math.PI / 180)}
                stroke="#E5E7EB"
                strokeWidth="1"
              />
            ))}

            {/* Data Points */}
            {dimensions.map((dimension, i) => {
              const angle = (i * 90) * Math.PI / 180;
              const radius = (dimension.score / 100) * 80;
              const x = 100 + radius * Math.cos(angle);
              const y = 100 + radius * Math.sin(angle);
              
              return (
                <circle
                  key={dimension.label}
                  cx={x}
                  cy={y}
                  r="4"
                  fill={dimension.color}
                />
              );
            })}

            {/* Polygon */}
            <polygon
              points={dimensions.map((dimension, i) => {
                const angle = (i * 90) * Math.PI / 180;
                const radius = (dimension.score / 100) * 80;
                const x = 100 + radius * Math.cos(angle);
                const y = 100 + radius * Math.sin(angle);
                return `${x},${y}`;
              }).join(' ')}
              fill="rgba(59, 130, 246, 0.2)"
              stroke="#3B82F6"
              strokeWidth="2"
            />
          </svg>
        </div>

        {/* Legend */}
        <div className="space-y-4">
          {dimensions.map((dimension) => (
            <div key={dimension.label} className="flex items-center space-x-3">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: dimension.color }}
              />
              <div className="flex-1">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    {dimension.label}
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {Math.round(dimension.score)}%
                  </span>
                </div>
                <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${dimension.score}%`,
                      backgroundColor: dimension.color
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interpretation */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">Interpretation</h4>
        <p className="text-sm text-blue-800">
          {overallScore >= 80 
            ? 'Excellent overall performance with strong technical knowledge and communication skills.'
            : overallScore >= 60
            ? 'Good performance with balanced skills across different areas. Some improvement opportunities exist.'
            : 'Solid foundation with significant room for improvement in key areas.'
          }
        </p>
      </div>
    </div>
  );
};

export default RadarChart;
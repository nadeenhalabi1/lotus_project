import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useTheme } from '../../context/ThemeContext';
import { generateDiverseColorPalette } from '../../utils/colorPalette';

const MultiSeriesLineChart = ({ data, width = '100%', height = 200, colorScheme }) => {
  const { theme } = useTheme();
  
  if (!data || !Array.isArray(data) || data.length === 0) {
    return <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">No data</div>;
  }

  const primaryColor = colorScheme?.primary || '#10b981';
  const isDark = theme === 'dark';
  const textColor = isDark ? '#e5e7eb' : '#374151';
  // White tooltip background in dark mode
  const tooltipBg = isDark ? 'rgba(255, 255, 255, 0.98)' : 'rgba(255, 255, 255, 0.98)';
  const tooltipText = isDark ? '#374151' : '#374151';
  const legendText = isDark ? '#e5e7eb' : '#374151';

  // Get all data keys except 'name'
  const dataKeys = Object.keys(data[0] || {}).filter(key => key !== 'name');
  
  // Generate diverse colors for each series
  const colorPalette = generateDiverseColorPalette(dataKeys.length);
  const colorMap = {};
  dataKeys.forEach((key, index) => {
    colorMap[index] = colorPalette[index];
  });

  return (
    <ResponsiveContainer width={width} height={height}>
      <RechartsLineChart data={data} margin={{ bottom: 100, top: 10, left: 5, right: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={primaryColor} className="opacity-20" />
        <XAxis 
          dataKey="name" 
          tick={{ fill: textColor, fontSize: 12, fontWeight: 500 }}
          angle={-45}
          textAnchor="end"
          height={120}
          interval={0}
          stroke={isDark ? '#6b7280' : primaryColor}
          strokeWidth={1}
          tickFormatter={(value) => {
            // Truncate long labels to max 20 characters
            if (value && value.length > 20) {
              return value.substring(0, 20) + '...';
            }
            return value;
          }}
        />
        <YAxis 
          tick={{ fill: textColor, fontSize: 13, fontWeight: 500 }}
          stroke={isDark ? '#6b7280' : primaryColor}
          strokeWidth={1}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: tooltipBg,
            border: `2px solid ${primaryColor}`,
            borderRadius: '12px',
            boxShadow: isDark 
              ? `0 8px 16px -4px rgba(0, 0, 0, 0.3), 0 4px 8px -2px rgba(0, 0, 0, 0.2)`
              : `0 8px 16px -4px ${primaryColor}40`,
            fontSize: '14px',
            fontWeight: '500',
            color: tooltipText
          }}
          labelStyle={{ color: primaryColor, fontWeight: 'bold', fontSize: '15px', marginBottom: '8px' }}
          itemStyle={{ fontSize: '14px', fontWeight: '600', color: tooltipText }}
        />
        <Legend 
          verticalAlign="top" 
          height={50}
          iconType="line"
          wrapperStyle={{ fontSize: '14px', fontWeight: '500', paddingBottom: '15px', color: legendText }}
        />
        {dataKeys.map((key, index) => {
          const color = colorMap[index] || primaryColor;
          // Create a slightly lighter shade for active dot
          const hex = color.replace('#', '');
          const r = parseInt(hex.substring(0, 2), 16);
          const g = parseInt(hex.substring(2, 4), 16);
          const b = parseInt(hex.substring(4, 6), 16);
          const lighterColor = `rgb(${Math.min(255, r + 30)}, ${Math.min(255, g + 30)}, ${Math.min(255, b + 30)})`;
          
          return (
            <Line 
              key={key}
              type="monotone" 
              dataKey={key} 
              stroke={color} 
              strokeWidth={4}
              dot={{ r: 6, fill: color, strokeWidth: 3, stroke: '#fff' }}
              activeDot={{ r: 9, fill: lighterColor, stroke: color, strokeWidth: 2 }}
              name={key}
              animationDuration={800}
            />
          );
        })}
      </RechartsLineChart>
    </ResponsiveContainer>
  );
};

export default MultiSeriesLineChart;


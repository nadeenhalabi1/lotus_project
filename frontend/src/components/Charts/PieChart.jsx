import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useTheme } from '../../context/ThemeContext';
import { generateDiverseColorPalette } from '../../utils/colorPalette';

const PieChart = ({ data, width = '100%', height = 200, colorScheme }) => {
  const { theme } = useTheme();
  
  if (!data || !Array.isArray(data)) {
    return <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">No data</div>;
  }

  const primaryColor = colorScheme?.primary || '#10b981';
  // Use diverse colors for pie chart slices
  const colors = generateDiverseColorPalette(data.length);
  const isDark = theme === 'dark';
  const textColor = isDark ? '#e5e7eb' : '#374151';
  // Green tooltip background in dark mode (like Dashboard button)
  const tooltipBg = isDark ? 'rgba(16, 185, 129, 0.95)' : 'rgba(255, 255, 255, 0.98)';
  const tooltipText = isDark ? '#ffffff' : '#374151';
  const legendText = isDark ? '#e5e7eb' : '#374151';

  return (
    <ResponsiveContainer width={width} height={height}>
      <RechartsPieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => {
            if (percent < 0.05) return ''; // Hide labels for small slices
            return `${name}: ${(percent * 100).toFixed(1)}%`;
          }}
          labelStyle={{ fontSize: '13px', fontWeight: '600', fill: textColor }}
          outerRadius={120}
          innerRadius={60}
          fill={primaryColor}
          dataKey="value"
          paddingAngle={3}
        >
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={colors[index % colors.length]}
              stroke={primaryColor}
              strokeWidth={2}
            />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: tooltipBg,
            border: `2px solid ${primaryColor}`,
            borderRadius: '12px',
            boxShadow: isDark 
              ? `0 8px 16px -4px rgba(16, 185, 129, 0.4), 0 4px 8px -2px rgba(0, 0, 0, 0.3)`
              : `0 8px 16px -4px ${primaryColor}40`,
            fontSize: '14px',
            fontWeight: '500',
            color: tooltipText
          }}
          itemStyle={{ fontSize: '14px', fontWeight: '600', color: tooltipText }}
        />
        <Legend 
          verticalAlign="bottom" 
          height={50}
          iconType="circle"
          wrapperStyle={{ fontSize: '14px', fontWeight: '500', paddingTop: '15px', color: legendText }}
        />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
};

export default PieChart;


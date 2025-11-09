import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../context/ThemeContext';

const LineChart = ({ data, width = '100%', height = 200, colorScheme }) => {
  const { theme } = useTheme();
  
  if (!data || !Array.isArray(data)) {
    return <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">No data</div>;
  }

  const primaryColor = colorScheme?.primary || '#10b981';
  const secondaryColor = colorScheme?.secondary || primaryColor;
  const isDark = theme === 'dark';
  const textColor = isDark ? '#e5e7eb' : '#374151';
  const tooltipBg = isDark ? 'rgba(31, 41, 55, 0.98)' : 'rgba(255, 255, 255, 0.98)';
  const tooltipText = isDark ? '#e5e7eb' : '#374151';

  return (
    <ResponsiveContainer width={width} height={height}>
      <RechartsLineChart data={data} margin={{ bottom: 150, top: 20, left: 10, right: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={primaryColor} className="opacity-20" />
        <XAxis 
          dataKey="name" 
          tick={{ fill: textColor, fontSize: 10, fontWeight: 500 }}
          angle={-60}
          textAnchor="end"
          height={160}
          interval={0}
          stroke={isDark ? '#6b7280' : primaryColor}
          strokeWidth={1}
          tickFormatter={(value) => {
            // Truncate long labels to max 15 characters
            if (value && value.length > 15) {
              return value.substring(0, 15) + '...';
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
              ? `0 8px 16px -4px rgba(0, 0, 0, 0.5)`
              : `0 8px 16px -4px ${primaryColor}40`,
            fontSize: '14px',
            fontWeight: '500',
            color: tooltipText
          }}
          labelStyle={{ color: primaryColor, fontWeight: 'bold', fontSize: '15px', marginBottom: '8px' }}
          itemStyle={{ fontSize: '14px', fontWeight: '600', color: tooltipText }}
        />
        <Line 
          type="monotone" 
          dataKey="value" 
          stroke={primaryColor} 
          strokeWidth={4}
          dot={{ r: 6, fill: primaryColor, strokeWidth: 3, stroke: '#fff' }}
          activeDot={{ r: 9, fill: secondaryColor, stroke: primaryColor, strokeWidth: 2 }}
          animationDuration={800}
        />
      </RechartsLineChart>
    </ResponsiveContainer>
  );
};

export default LineChart;


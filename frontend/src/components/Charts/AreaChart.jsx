import { AreaChart as RechartsAreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../context/ThemeContext';

const AreaChart = ({ data, width = '100%', height = 200, colorScheme }) => {
  const { theme } = useTheme();
  
  if (!data || !Array.isArray(data)) {
    return <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">No data</div>;
  }

  const primaryColor = colorScheme?.primary || '#10b981';
  const secondaryColor = colorScheme?.secondary || primaryColor;
  const gradientId = `areaGradient-${primaryColor.replace('#', '')}`;
  const isDark = theme === 'dark';
  const textColor = isDark ? '#e5e7eb' : '#374151';
  // Green tooltip background in dark mode (like Dashboard button)
  const tooltipBg = isDark ? 'rgba(16, 185, 129, 0.95)' : 'rgba(255, 255, 255, 0.98)';
  const tooltipText = isDark ? '#ffffff' : '#374151';

  return (
    <ResponsiveContainer width={width} height={height}>
      <RechartsAreaChart data={data} margin={{ bottom: 100, top: 10, left: 5, right: 5 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={primaryColor} stopOpacity={0.9} />
            <stop offset="50%" stopColor={secondaryColor} stopOpacity={0.6} />
            <stop offset="95%" stopColor={primaryColor} stopOpacity={0.1} />
          </linearGradient>
        </defs>
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
              ? `0 8px 16px -4px rgba(0, 0, 0, 0.5)`
              : `0 8px 16px -4px ${primaryColor}40`,
            fontSize: '14px',
            fontWeight: '500',
            color: tooltipText
          }}
          labelStyle={{ color: primaryColor, fontWeight: 'bold', fontSize: '15px', marginBottom: '8px' }}
          itemStyle={{ fontSize: '14px', fontWeight: '600', color: tooltipText }}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={primaryColor}
          strokeWidth={3}
          fillOpacity={1}
          fill={`url(#${gradientId})`}
          animationDuration={800}
        />
      </RechartsAreaChart>
    </ResponsiveContainer>
  );
};

export default AreaChart;


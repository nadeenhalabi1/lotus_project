import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useTheme } from '../../context/ThemeContext';
import { generateDiverseColorPalette } from '../../utils/colorPalette';

const BarChart = ({ data, width = '100%', height = 200, colorScheme }) => {
  const { theme } = useTheme();
  
  if (!data || !Array.isArray(data)) {
    return <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">No data</div>;
  }

  const primaryColor = colorScheme?.primary || '#10b981';
  const isDark = theme === 'dark';
  const textColor = isDark ? '#e5e7eb' : '#374151';
  const tooltipBg = isDark ? 'rgba(31, 41, 55, 0.98)' : 'rgba(255, 255, 255, 0.98)';
  const tooltipText = isDark ? '#e5e7eb' : '#374151';

  // Generate different color for each bar - professional color palette
  const colors = generateDiverseColorPalette(data.length);
  const gradientIds = data.map((_, index) => `barGradient-${index}-${colors[index].replace('#', '')}`);

  return (
    <ResponsiveContainer width={width} height={height}>
      <RechartsBarChart data={data} margin={{ bottom: 100 }}>
        <defs>
          {data.map((_, index) => {
            const color = colors[index];
            const hex = color.replace('#', '');
            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);
            // Create professional gradient - darker at bottom
            const darkerColor = `rgb(${Math.max(0, r - 25)}, ${Math.max(0, g - 25)}, ${Math.max(0, b - 25)})`;
            
            return (
              <linearGradient key={gradientIds[index]} id={gradientIds[index]} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={1} />
                <stop offset="95%" stopColor={darkerColor} stopOpacity={0.85} />
              </linearGradient>
            );
          })}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={primaryColor} className="opacity-20" />
        <XAxis 
          dataKey="name" 
          tick={{ fill: textColor, fontSize: 11, fontWeight: 500 }}
          angle={-45}
          textAnchor="end"
          height={140}
          interval={0}
          stroke={isDark ? '#6b7280' : primaryColor}
          strokeWidth={1}
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
        <Bar 
          dataKey="value" 
          radius={[12, 12, 0, 0]}
          strokeWidth={2}
          animationDuration={800}
        >
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={`url(#${gradientIds[index]})`} 
              stroke={colors[index]} 
            />
          ))}
        </Bar>
      </RechartsBarChart>
    </ResponsiveContainer>
  );
};

export default BarChart;


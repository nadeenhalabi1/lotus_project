import ChartCard from './ChartCard';

const ChartGrid = ({ charts, onChartClick, failedServices }) => {
  // Use 2 columns on large screens for bigger, more prominent charts
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {charts.map((chart) => (
        <ChartCard
          key={chart.id}
          chart={chart}
          onClick={() => onChartClick(chart)}
          isStale={!!failedServices?.[chart.metadata?.service]}
          lastSuccessful={failedServices?.[chart.metadata?.service]?.lastSuccessful || chart.metadata?.lastUpdated}
        />
      ))}
    </div>
  );
};

export default ChartGrid;


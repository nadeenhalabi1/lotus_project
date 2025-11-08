import BOXChartItem from './BOXChartItem';

const BOXChartList = ({ charts, onChartClick }) => {
  return (
    <div className="space-y-2">
      {charts.map((chart) => (
        <BOXChartItem
          key={chart.id}
          chart={chart}
          onClick={() => onChartClick(chart.id)}
        />
      ))}
    </div>
  );
};

export default BOXChartList;


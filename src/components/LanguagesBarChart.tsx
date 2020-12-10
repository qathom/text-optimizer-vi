import React, { FunctionComponent } from 'react';
import { Chart } from 'chart.js';
import { Bar } from 'react-chartjs-2';

type Props = {
  data: Map<string, number[]>,
  onBarClicked: (labelIndex: number) => void,
};

const colors = [
  '#ef5350',
  '#333',
  '#9b59b6',
  '#80cbc4',
  '#90caf9',
];

function getChartData(data: Map<string, number[]>) {
  // 1 dataset per language
  const keys = [...data.keys()];
  const datasets: Chart.ChartDataSets[] = [];

  keys.forEach((lang, i) => {
    datasets.push({
      label: lang,
      backgroundColor: colors[i],
      borderColor: colors[i],
      borderWidth: 1,
      stack: `${lang}-${i}`,
      data: data.get(lang),
    });
  });

  return {
    datasets,
    labels: (data.get('eng')??[]).map((value, idx) => `${idx + 1}`)
  };
}

const LanguagesBarChart: FunctionComponent<Props> = ({ data, onBarClicked }) => {
  const chartData = getChartData(data);

  const onElementClick = (elements) => {
    if (elements.length === 0) {
      return;
    }

    const [first] = elements;

    onBarClicked(first._index);
  };

  return (
    <div className="languages-chart-container" style={{ height: '200px' }}>
      <Bar
        data={chartData}
        height={200}
        onElementsClick={onElementClick}
        options={{
          maintainAspectRatio: false,
          responsive: true,
          scales: {
            yAxes: [{
              stacked: true,
              display: true,
              ticks: {
                maxTicksLimit: 5,
              },
              scaleLabel: {
                display: true,
                labelString: 'Sentiment score',
              },
            }],
            xAxes: [{
              stacked: true,
              ticks: {
                padding: 20,
              },
              scaleLabel: {
                display: true,
                labelString: '# Paragraph',
              },
            }],
          },
					plugins: {
						zoom: {
							pan: {
								enabled: true,
								mode: 'x',
							},
							zoom: {
								enabled: true,
								mode: 'x',
							},
						},
					},
        }}
      />
    </div>
  );
}

export default LanguagesBarChart;
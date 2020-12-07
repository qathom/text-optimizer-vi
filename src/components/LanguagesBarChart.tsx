import React, { FunctionComponent } from 'react';
import { Chart } from 'chart.js';
import { Bar } from 'react-chartjs-2';

type Props = {
  data: Map<string, number[]>;
};

const colors = [
  '#1abc9c',
  '#3498db',
  '#9b59b6',
  '#e67e22',
  '#e74c3c',
];

function getChartData(data: Map<string, number[]>) {
    console.log('data');
    console.log(data);
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
    labels: (data.get('eng')??[]).map((value, idx) => `Paragraph ${idx}`)
  };
}

const LanguagesBarChart: FunctionComponent<Props> = ({ data }) => {
  const chartData = getChartData(data);

  return (
    <div className="languages-chart-container" style={{ height: '200px' }}>
      <Bar
        data={chartData}
        height={200}
        options={{
          maintainAspectRatio: false,
          responsive: true,
          scales: {
            yAxes: [{
              stacked: true,
              display: true,
              ticks: {
                // min: -1,
                //  max: 1,
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
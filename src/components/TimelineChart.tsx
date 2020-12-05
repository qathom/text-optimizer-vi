import React, { FunctionComponent } from 'react';
import { Line } from 'react-chartjs-2';
import isTextNeutral from '../utils/text';

type Props = {
  data: number[],
  colorBlindness: boolean,
  onLabelClicked: (labelIndex: number) => void,
};

const TimelineChart: FunctionComponent<Props> = ({ data, onLabelClicked, colorBlindness }) => {
  const getColor = (res: number) => {
    const colorPositive = colorBlindness ? '#90caf9' : '#a5d6a7';
    const colorNegative = colorBlindness ? '#ffef61' : '#ef9a9a';

    if (isTextNeutral(res)) {
      return '#333';
    }

    if (res > 0) {
      return colorPositive;
    }

    return colorNegative;
  };

  const chartData = {
    datasets: [{
      data,
      label: 'Sentiment per paragraph',
      fill: false,
      borderColor: '#333',
      pointBackgroundColor: data.map((res) => getColor(res)),
      pointBorderColor: data.map((res) => getColor(res)),
      pointHoverBackgroundColor: data.map((res) => getColor(res)),
      pointHoverBorderColor: data.map((res) => getColor(res)),
      pointStyle: 'rect',
      pointBorderWidth: 10,
      pointHoverBorderWidth: 14,
    }],
    labels: data.map((s, i) => `${i + 1}`),
  };

  const onElementClick = (elements) => {
    if (elements.length === 0) {
      return;
    }

    const [first] = elements;

    onLabelClicked(first._index);
  };

  return (
    <div className="timeline-chart-container" style={{ height: '200px' }}>
      <Line
        data={chartData}
        height={200}
        onElementsClick={onElementClick}
        options={{
          maintainAspectRatio: false,
          responsive: true,
          legend: {
            labels: {
              boxWidth: 0,
            },
          },
          scales: {
            yAxes: [{
              display: true,
              ticks: {
               // min: -1,
               //  max: 1,
                 maxTicksLimit: 5,
              },
              scaleLabel: {
                display: true,
                labelString: 'Score du sentiment',
              },
            }],
            xAxes: [{
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

export default TimelineChart;

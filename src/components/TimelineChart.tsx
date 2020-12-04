import React, { FunctionComponent } from 'react';
import { Line } from 'react-chartjs-2';

type Props = {
  data: number[];
  onLabelClicked: (labelIndex: number) => void,
};

const TimelineChart: FunctionComponent<Props> = ({ data, onLabelClicked }) => {
  const chartData = {
    datasets: [{
      data,
      label: 'Sentiment per sentence',
      fill: false,
      borderColor: '#333',
      pointBackgroundColor: '#0d6efd',
      pointBorderColor: '#0d6efd',
      pointStyle: 'rect',
      pointBorderWidth: 10,
      pointHoverBorderWidth: 14,
      pointHoverBackgroundColor: '#0d6efd',
      pointHoverBorderColor: '#0d6efd',
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
                labelString: '# Paragraphe',
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

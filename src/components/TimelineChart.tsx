import React, { FunctionComponent } from 'react';
import { Line } from 'react-chartjs-2';

type Props = {
  data: number[];
  onLabelClicked: (labelIndex: number) => void,
};

const TimelineChart: FunctionComponent<Props> = ({ data, onLabelClicked }) => {
  const chartData = {
    datasets: [{
      label: 'Sentiment per sentence',
      fill: false,
      data: data,
      borderColor: '#2980b9',
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
    <div style={{ height: '200px' }}>
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
                // max: 1,
              },
              scaleLabel: {
                display: true,
                labelString: 'Sentiment score',
              },
            }],
            xAxes: [{
              ticks: {
                padding: 20,
              },
            }],
          },
        }}
      />
    </div>
  );
}

export default TimelineChart;

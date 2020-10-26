import React, { FunctionComponent } from 'react';
import { Line } from 'react-chartjs-2';

type Props = {
  data: number[];
};

const TimelineChart: FunctionComponent<Props> = ({ data }) => {
  const chartData = {
    datasets: [{
      label: 'Sentiment per sentence',
      fill: false,
      data: data,
      borderColor: '#2980b9',
    }],
    labels: data.map((s, i) => `${i + 1}`),
  };

  return (
    <div style={{ height: '200px' }}>
      <Line
        data={chartData}
        height={200}
        options={{
          maintainAspectRatio: false,
          responsive: true,
          scales: {
            yAxes: [{
              display: true,
              ticks: {
                min: -1,
                max: 1,
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

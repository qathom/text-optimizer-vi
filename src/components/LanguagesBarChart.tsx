import React, { FunctionComponent } from 'react';
import { Bar } from 'react-chartjs-2';

type Props = {
  data: Map<string, number[]>;
  //onLabelClicked: (labelIndex: number) => void,
};

const LanguagesBarChart: FunctionComponent<Props> = ({ data }) => {
  const chartData = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
    datasets: [
    //   {
    //     label: 'My First dataset',
    //     backgroundColor: 'rgba(255,99,132,0.2)',
    //     borderColor: 'rgba(255,99,132,1)',
    //     borderWidth: 1,
    //     stack: 1,
    //     hoverBackgroundColor: 'rgba(255,99,132,0.4)',
    //     hoverBorderColor: 'rgba(255,99,132,1)',
    //     data: [65, 59, 80, 81, 56, 55, 40]
    //   },
    //   {
    //     label: 'My second dataset',
    //     backgroundColor: 'rgba(155,231,91,0.2)',
    //     borderColor: 'rgba(255,99,132,1)',
    //     borderWidth: 1,
    //     stack: 1,
    //     hoverBackgroundColor: 'rgba(255,99,132,0.4)',
    //     hoverBorderColor: 'rgba(255,99,132,1)',
    //     data: [45, 79, 10, 41, 16, 85, 20]
    //   }
    Array.from(data).map(([lang, tabNumber], idx) =>{
      {
         label: 'My First dataset',
         backgroundColor: 'rgba(255,99,132,0.2)',
         borderColor: 'rgba(255,99,132,1)',
         borderWidth: 1,
         stack: 1,
         hoverBackgroundColor: 'rgba(255,99,132,0.4)',
         hoverBorderColor: 'rgba(255,99,132,1)',
         data: [65, 59, 80, 81, 56, 55, 40]
       },
    })
    ]
};

  const chartData = 

  const onElementClick = (elements) => {
    if (elements.length === 0) {
      return;
    }

    const [first] = elements;

    //onLabelClicked(first._index);
  };

  return (
    <div className="timeline-chart-container" style={{ height: '200px' }}>
      <Bar
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

export default LanguagesBarChart;
export type Metrics = {
  countWords: number,
  sentiments: number[],
  neutralityScore: number,
  varianceScore: number,
  languages: Map<string, number[]>,
};

export type TimelineChartData = {
  data: number[];
  onLabelClicked: (labelIndex: number) => void,
};

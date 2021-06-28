export type ChartDataset = {
  data: Array<number>;
};

export type ChartData = {
  labels: Array<string>;
  datasets: Array<ChartDataset>;
};

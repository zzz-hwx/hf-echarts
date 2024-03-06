export type ChartData = {
  name: string;
  itemData?: {
    name: string;
    value: number | string;
  }[];
}[];

// TODO: 调整完全重复的代码
export type ChartData_ = {
  name: string;
  itemData: {
    name: string;
    value: number | string;
  }[];
}[];

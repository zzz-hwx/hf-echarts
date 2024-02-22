import { init } from 'echarts/core';

type InitType = typeof init;

export type EChartsType = ReturnType<InitType>;

type SetOptionType = EChartsType['setOption'];

export type Option = Parameters<SetOptionType>[0];

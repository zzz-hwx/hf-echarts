import VChart, { omitOn, attrsToProps } from '@hf/vue-echarts';
import type { Emits, Option } from '@hf/vue-echarts';
import { computed, defineComponent, h } from 'vue-demi';
import type { PropType } from 'vue-demi';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { BarChart } from 'echarts/charts';
import {
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
} from 'echarts/components';
import { merge } from 'lodash-es';
import useChartData from '../../../hooks/useChartData';
import useGridData from '../../../hooks/useGridData';
import { ChartData } from '../../../types/data';

use([
  CanvasRenderer,
  BarChart,
  TitleComponent,
  GridComponent,
  LegendComponent,
  TooltipComponent,
]);

export default defineComponent({
  name: 'HfBar',
  props: {
    data: Array as PropType<ChartData>,
    option: Object as PropType<Option>,
  },
  emits: {} as unknown as Emits,
  setup(props, { attrs }) {
    const nonEventAttrs = computed(() => omitOn(attrs));
    const { noDataRef, dataRef } = useChartData(props.data);
    const { xDataRef } = useGridData(noDataRef, dataRef);
    const seriesRef = computed(() => {
      return dataRef.value.map((item, index) => {
        return {
          type: 'bar', // 图表类型 柱状图
          name: item.name,
          data: item.itemData,
        };
      });
    });
    const optionRef = computed<Option>(() => ({
      legend: {},
      tooltip: {},
      grid: {
        left: '3%',
        // top: '20%',
        right: '3%',
        bottom: 0,
        containLabel: true,
      },
      xAxis: {
        type: 'category', // x轴 类目轴
        data: xDataRef.value,
        axisTick: {
          // 坐标轴刻度
          show: true,
          alignWithLabel: true, // 刻度线和文字标签对齐
          length: 4, // 刻度线长度
        },
        axisLabel: {
          // 刻度标签
          margin: 16, // 刻度标签与轴线距离
        },
        silent: false, // 坐标轴交互
        triggerEvent: true, // 坐标轴的标签响应和触发鼠标事件
      },
      yAxis: {
        type: 'value', // y轴 数值轴
        silent: false,
        triggerEvent: true,
      },
      series: seriesRef.value,
    }));
    console.log('--- bar props --->', props, attrs);
    const realOption = computed(() => merge(optionRef.value, props.option));

    return {
      nonEventAttrs,
      realOption,
    };
  },
  render() {
    const props = attrsToProps(this.nonEventAttrs);
    console.log('--- bar realOption --->', this.realOption);
    // TODO: 测试 vue2 绑定参数
    props.option = this.realOption;
    return h(VChart, props);
  },
});

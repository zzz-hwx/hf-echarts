import { omitOn, attrsToProps } from '@hf/vue-echarts';
import { type Emits, type Option } from '@hf/vue-echarts';
import { computed, defineComponent, h } from 'vue-demi';
import type { PropType } from 'vue-demi';
import VChart from '@hf/vue-echarts';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { BarChart } from 'echarts/charts';
import {
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
} from 'echarts/components';
import merge from 'lodash/merge';

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
  // components: {
  //   VChart,
  // },
  props: {
    option: Object as PropType<Option>,
  },
  emits: {} as unknown as Emits,
  setup(props, { attrs }) {
    const nonEventAttrs = computed(() => omitOn(attrs));
    const option = {
      title: {
        text: '测试一下',
      },
    };
    const realOption = computed(() => merge(props.option, option));

    return {
      nonEventAttrs,
      realOption,
    };
  },
  render() {
    const props = attrsToProps(this.nonEventAttrs);
    props.props = {
      option: this.realOption,
    };
    props.class = 'hf-bar';
    return h(VChart, props);
  },
});

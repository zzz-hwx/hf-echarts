import { watch, type Ref, type PropType } from 'vue-demi';
import { throttle } from 'echarts/core';
import {
  addListener,
  removeListener,
  type ResizeCallback,
} from 'resize-detector';
import { type EChartsType } from '../types';

type AutoresizeProp =
  | boolean
  | {
      throttle?: number;
      onResize?: () => void;
    };

export function useAutoresize(
  chart: Ref<EChartsType | undefined>,
  autoresize: Ref<AutoresizeProp | undefined>,
  root: Ref<HTMLElement | undefined>,
): void {
  let resizeListener: ResizeCallback | null = null;

  watch([root, chart, autoresize], ([root, chart, autoresize], _, cleanup) => {
    if (root && chart && autoresize) {
      const autoresizeOptions = autoresize === true ? {} : autoresize;
      const { throttle: wait = 100, onResize } = autoresizeOptions;

      const callback = () => {
        chart.resize();
        onResize?.();
      };

      resizeListener = wait ? throttle(callback, wait) : callback;
      addListener(root, resizeListener);
    }

    cleanup(() => {
      if (root && resizeListener) {
        removeListener(root, resizeListener);
      }
    });
  });
}

export const autoresizeProps = {
  /**
   * 图表在组件根元素尺寸变化时是否需要自动进行重绘。
   * 也可以传入一个选项对象来指定自定义的节流延迟和尺寸变化时的额外回调函数。
   * 默认值false
   */
  autoresize: [Boolean, Object] as PropType<AutoresizeProp>,
};

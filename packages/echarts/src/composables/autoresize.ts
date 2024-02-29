import { Ref, watch } from 'vue-demi';
import { EChartsType } from '../types';
import { ResizeCallback, addListener, removeListener } from 'resize-detector';
import { throttle } from 'echarts/core';

export function useAutoresize(
  chart: Ref<EChartsType | undefined>,
  autoresize: Ref<boolean>,
  root: Ref<HTMLElement | undefined>,
): void {
  let resizeListener: ResizeCallback | null = null;

  watch([root, chart, autoresize], ([root, chart, autoresize], _, cleanup) => {
    if (root && chart && autoresize) {
      resizeListener = throttle(() => {
        chart.resize();
      }, 100);

      addListener(root, resizeListener);
    }

    cleanup(() => {
      if (resizeListener && root) {
        removeListener(root, resizeListener);
      }
    });
  });
}

export const autoresizeProps = {
  autoresize: Boolean,
};

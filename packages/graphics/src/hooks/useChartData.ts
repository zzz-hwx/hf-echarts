import { computed } from 'vue-demi';
import { isArray } from '@hf/shared';

import type { ChartData, ChartData_ } from '../types/data';

export default function useChartData(data: ChartData) {
  //
  const noDataRef = computed(() => {
    // 是否空
    if (!(isArray(data) && data.length)) return true;
    if (data.some(item => isArray(item.itemData) && item.itemData.length)) {
      return false;
    }
    return true;
  });
  const dataRef = computed(() => {
    // 数据: 去掉空 itemData 的数据
    if (noDataRef.value) return [];
    // TODO: 格式化数据 defaultProps
    const arr = data.filter(item => {
      return isArray(item.itemData) && item.itemData.length;
    });
    return arr as ChartData_;
  });

  return {
    noDataRef,
    dataRef,
  };
}

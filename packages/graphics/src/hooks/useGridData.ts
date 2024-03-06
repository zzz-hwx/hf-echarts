import { computed } from 'vue-demi';
import type { Ref } from 'vue-demi';
import { ChartData_ } from '../types/data';

export default function useGridData(
  noDataRef: Ref<boolean>,
  dataRef: Ref<ChartData_>,
) {
  const xDataRef = computed(() => {
    if (noDataRef.value) return [];
    const set = new Set();
    dataRef.value.forEach(item => {
      const arr = item.itemData;
      arr.forEach(it => {
        set.add(it.name);
      });
    });
    return [...set];
  });
  return {
    xDataRef,
  };
}

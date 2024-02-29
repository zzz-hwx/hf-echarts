import {
  computed,
  inject,
  watchEffect,
  type InjectionKey,
  type Ref,
} from 'vue-demi';
import { EChartsType } from '../types';
import { unwrapInjected } from '../utils';

export const LOADING_OPTIONS_KEY =
  'ecLoadingOptions' as unknown as InjectionKey<
    UnknownRecord | Ref<UnknownRecord>
  >;

type UnknownRecord = Record<string, unknown>;

export function useLoading(
  chart: Ref<EChartsType | undefined>,
  loading: Ref<boolean>,
  loadingOptions: Ref<UnknownRecord | undefined>,
): void {
  const defaultLoadingOptions = inject(LOADING_OPTIONS_KEY, {});
  const realLoadingOptions = computed(() => ({
    ...unwrapInjected(defaultLoadingOptions, {}),
    ...loadingOptions?.value,
  }));

  watchEffect(() => {
    const instance = chart.value;
    if (!instance) {
      return;
    }

    if (loading.value) {
      instance.showLoading(realLoadingOptions.value);
    } else {
      instance.hideLoading();
    }
  });
}

export const loadingProps = {
  loading: Boolean,
  loadingOptions: Object,
};

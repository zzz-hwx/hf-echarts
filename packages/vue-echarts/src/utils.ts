import { type MaybeRef, unref, Vue2 } from 'vue-demi';
import type { Injection } from './types';

type Attrs = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

// Copied from
// https://github.com/vuejs/vue-next/blob/5a7a1b8293822219283d6e267496bec02234b0bc/packages/shared/src/index.ts#L40-L41
const onRE = /^on[^a-z]/;
export const isOn = (key: string): boolean => onRE.test(key);

export function omitOn(attrs: Attrs): Attrs {
  const result: Attrs = {};
  for (const key in attrs) {
    if (!isOn(key)) {
      result[key] = attrs[key];
    }
  }

  return result;
}

/**
 * 从 attrs 生成h函数的第2个参数 props
 * @param attrs
 * @returns
 */
export function attrsToProps(attrs: Attrs): any {
  // Vue 3 and Vue 2 have different vnode props format:
  // See https://v3-migration.vuejs.org/breaking-changes/render-function-api.html#vnode-props-format
  // See https://v3-migration.vuejs.org/zh/breaking-changes/render-function-api.html#vnode-prop-%E6%A0%BC%E5%BC%8F%E5%8C%96
  const props = (Vue2 ? { attrs: attrs } : { ...attrs }) as any;
  return props;
}

export function unwrapInjected<T, V>(
  injection: Injection<T>,
  defaultValue: V,
): T | V {
  const value = unref(injection as MaybeRef);

  if (value && typeof value === 'object' && 'value' in value) {
    return value.value || defaultValue;
  }

  return value || defaultValue;
}

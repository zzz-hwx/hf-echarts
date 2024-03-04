import {
  computed,
  defineComponent,
  getCurrentInstance,
  h,
  inject,
  nextTick,
  isVue2,
  isVue3,
  onBeforeUnmount,
  onMounted,
  shallowRef,
  toRefs,
  watch,
  watchEffect,
  type PropType,
  type InjectionKey,
} from 'vue-demi';
import type {
  EChartsType,
  EventTarget,
  Emits,
  InitOptions,
  InitOptionsInjection,
  Option,
  ThemeInjection,
  UpdateOptions,
  UpdateOptionsInjection,
} from './types';
import { omitOn, unwrapInjected } from './utils';
import { EChartsElement, TAG_NAME, register } from './wc';
import {
  autoresizeProps,
  loadingProps,
  useAutoresize,
  useLoading,
  usePublicAPI,
} from './composables';
import { init as initChart } from 'echarts/core';

// 绕过 tsc 导出到temp下没有包含css文件
// import './style.css';

const wcRegistered = register();


export const THEME_KEY = 'ecTheme' as unknown as InjectionKey<ThemeInjection>;
export const INIT_OPTIONS_KEY =
  'ecInitOptions' as unknown as InjectionKey<InitOptionsInjection>;
export const UPDATE_OPTIONS_KEY =
  'ecUpdateOptions' as unknown as InjectionKey<UpdateOptionsInjection>;

export default defineComponent({
  name: 'echarts',
  props: {
    option: Object as PropType<Option>,
    theme: {
      type: [Object, String] as PropType<Option>,
    },
    initOptions: Object as PropType<InitOptions>,
    updateOptions: Object as PropType<UpdateOptions>,
    group: String,
    manualUpdate: Boolean,
    ...autoresizeProps,
    ...loadingProps,
  },
  emits: [] as unknown as Emits,
  inheritAttrs: false,
  setup(props, { attrs }) {
    const root = shallowRef<EChartsElement>();
    const chart = shallowRef<EChartsType>();
    const manualOption = shallowRef<Option>();
    const defaultTheme = inject(THEME_KEY, null);
    const defaultInitOptions = inject(INIT_OPTIONS_KEY, null);
    const defaultUpdateOptions = inject(UPDATE_OPTIONS_KEY, null);

    const { autoresize, manualUpdate, loading, loadingOptions } = toRefs(props);

    const realOption = computed(
      () => manualOption.value || props.option || null,
    );
    const realTheme = computed(
      () => props.theme || unwrapInjected(defaultTheme, {}),
    );
    const realInitOptions = computed(
      () => props.initOptions || unwrapInjected(defaultInitOptions, {}),
    );
    const realUpdateOptions = computed(
      () => props.updateOptions || unwrapInjected(defaultUpdateOptions, {}),
    );
    const nonEventAttrs = computed(() => omitOn(attrs));

    // @ts-expect-error listeners for Vue 2 compatibility
    const listeners = getCurrentInstance().proxy.$listeners;

    function init(option?: Option) {
      if (!root.value) {
        return;
      }

      const instance = (chart.value = initChart(
        root.value,
        realTheme.value,
        realInitOptions.value,
      ));

      if (props.group) {
        instance.group = props.group;
      }

      let realListeners = listeners;
      if (!realListeners) {
        realListeners = {};

        Object.keys(attrs)
          .filter(key => key.indexOf('on') === 0 && key.length > 2)
          .forEach(key => {
            // onClick    -> c + lick
            // onZr:click -> z + r:click
            let event = key.charAt(2).toLowerCase() + key.slice(3);

            // clickOnce    -> ~click
            // zr:clickOnce -> ~zr:click
            if (event.substring(event.length - 4) === 'Once') {
              event = `~${event.substring(0, event.length - 4)}`;
            }

            realListeners[event] = attrs[key];
          });
      }

      Object.keys(realListeners).forEach(key => {
        let handler = realListeners[key];

        if (!handler) {
          return;
        }

        let event = key.toLowerCase();
        if (event.charAt(0) === '~') {
          event = event.substring(1);
          handler.__once__ = true;
        }

        let target: EventTarget = instance;
        if (event.indexOf('zr:') === 0) {
          target = instance.getZr();
          event = event.substring(3);
        }

        if (handler.__once__) {
          delete handler.__once__;

          const raw = handler;

          handler = (...args: any[]) => {
            raw(...args);
            target.off(event, handler);
          };
        }

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore EChartsType["on"] is not compatible with ZRenderType["on"]
        // but it's okay here
        target.on(event, handler);
      });

      function resize() {
        if (instance && !instance.isDisposed()) {
          instance.resize();
        }
      }

      function commit() {
        const opt = option || realOption.value;
        if (opt) {
          instance.setOption(opt, realUpdateOptions.value);
        }
      }

      if (autoresize.value) {
        // Try to make chart fit to container in case container size
        // is changed synchronously or in already queued microtasks
        nextTick(() => {
          resize();
          commit();
        });
      } else {
        commit();
      }
    }

    function setOption(option: Option, updateOptions?: UpdateOptions) {
      if (props.manualUpdate) {
        manualOption.value = option;
      }

      if (!chart.value) {
        init(option);
      } else {
        chart.value.setOption(option, updateOptions || {});
      }
    }

    function cleanup() {
      if (chart.value) {
        chart.value.dispose();
        chart.value = undefined;
      }
    }

    let unwatchOption: (() => void) | null = null;
    watch(
      manualUpdate,
      manualUpdate => {
        if (typeof unwatchOption === 'function') {
          unwatchOption();
          unwatchOption = null;
        }

        if (!manualUpdate) {
          unwatchOption = watch(
            () => props.option,
            (option, oldOption) => {
              if (!option) {
                return;
              }
              if (!chart.value) {
                init();
              } else {
                chart.value.setOption(option, {
                  notMerge: option.value !== oldOption?.value,
                  ...realUpdateOptions.value,
                });
              }
            },
            { deep: true },
          );
        }
      },
      {
        immediate: true,
      },
    );

    watch(
      [realTheme, realInitOptions],
      () => {
        cleanup();
        init();
      },
      {
        deep: true,
      },
    );

    watchEffect(() => {
      if (props.group && chart.value) {
        chart.value.group = props.group;
      }
    });

    const publicApi = usePublicAPI(chart);

    useLoading(chart, loading, loadingOptions);

    useAutoresize(chart, autoresize, root);

    onMounted(() => {
      init();
    });

    onBeforeUnmount(() => {
      if (wcRegistered && root.value) {
        // For registered web component, we can leverage the
        // `disconnectedCallback` to dispose the chart instance
        // so that we can delay the cleanup after exsiting leaving
        // transition.
        root.value.__dispose = cleanup;
      } else {
        cleanup();
      }
    });
    
    return {
      chart,
      root,
      setOption,
      nonEventAttrs,
      ...publicApi
    };
  },
  render() {
    // Vue 3 and Vue 2 have different vnode props format:
    // See https://v3-migration.vuejs.org/breaking-changes/render-function-api.html#vnode-props-format

    console.log('test', isVue2, isVue3);

    const attrs = (
      isVue2 ? { attrs: this.nonEventAttrs } : { ...this.nonEventAttrs }
    ) as any;
    attrs.ref = 'root';
    attrs.class = attrs.class ? ['echarts'].concat(attrs.class) : 'echarts';
    // 绕过 tsc 导出到temp下没有包含css文件
    attrs.style = 'display: block; width: 100%; height: 100%; min-width: 0;';
    return h(TAG_NAME, attrs, '一行文字呀');
  },
});

// import {
//   isVue2,
//   isVue3,
// } from 'vue-demi';
// export default function test() {
//   console.log('test', isVue2, isVue3);
// }

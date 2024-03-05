import {
  defineComponent,
  shallowRef,
  toRefs,
  watch,
  computed,
  inject,
  onMounted,
  onBeforeUnmount,
  h,
  nextTick,
  watchEffect,
  getCurrentInstance,
  Vue2,
  type PropType,
  type InjectionKey,
} from 'vue-demi';
import { init as initChart } from 'echarts/core';
import type {
  EChartsType,
  EventTarget,
  Option,
  Theme,
  ThemeInjection,
  InitOptions,
  InitOptionsInjection,
  UpdateOptions,
  UpdateOptionsInjection,
  Emits,
} from './types';
import {
  usePublicAPI,
  useAutoresize,
  autoresizeProps,
  useLoading,
  loadingProps,
} from './composables';
import { attrsToProps, omitOn, unwrapInjected } from './utils';
import { register, TAG_NAME, type EChartsElement } from './wc';

// 绕过 tsc 导出到temp下没有包含css文件
// import './style.css';

const __CSP__ = false;
const wcRegistered = __CSP__ ? false : register();

if (Vue2) {
  Vue2.config.ignoredElements.push(TAG_NAME);
}

export const THEME_KEY = 'ecTheme' as unknown as InjectionKey<ThemeInjection>;
export const INIT_OPTIONS_KEY =
  'ecInitOptions' as unknown as InjectionKey<InitOptionsInjection>;
export const UPDATE_OPTIONS_KEY =
  'ecUpdateOptions' as unknown as InjectionKey<UpdateOptionsInjection>;
export { LOADING_OPTIONS_KEY } from './composables';

export default defineComponent({
  name: 'VChart',
  props: {
    /**
     * 初始化附加参数
     * 请参考 echarts.init 的 opts 参数
     * Inject 键名：INIT_OPTIONS_KEY
     */
    initOptions: Object as PropType<InitOptions>,
    /**
     * 要应用的主题
     * 请参考 echarts.init 的 theme 参数
     * Inject 键名：THEME_KEY
     */
    theme: {
      type: [Object, String] as PropType<Theme>,
    },
    /**
     * ECharts 的万能接口
     * 修改这个 prop 会触发 ECharts 实例的 setOption 方法
     * 💡在没有指定 update-options 时，如果直接修改 option 对象而引用保持不变，setOption 方法调用时将默认指定 notMerge: false；
     * 💡否则，如果为 option 绑定一个新的引用，将指定 notMerge: true。
     */
    option: Object as PropType<Option>,
    /**
     * 图表更新的配置项
     * 请参考 echartsInstance.setOption 的 opts 参数
     * Inject 键名：UPDATE_OPTIONS_KEY
     */
    updateOptions: Object as PropType<UpdateOptions>,
    /**
     * 图表的分组，用于联动
     * echartsInstance.group
     */
    group: String,
    /**
     * 在性能敏感（数据量很大）的场景下，我们最好对于 option prop 绕过 Vue 的响应式系统。
     * 当将 manual-update prop 指定为 true 且不传入 option prop 时，数据将不会被监听。
     * 然后，需要用 ref 获取组件实例以后手动调用 setOption 方法来更新图表。
     * 默认值false
     */
    manualUpdate: Boolean,
    ...autoresizeProps,
    ...loadingProps,
  },
  emits: {} as unknown as Emits,
  inheritAttrs: false,
  setup(props, { attrs }) {
    const root = shallowRef<EChartsElement>();
    const inner = shallowRef<HTMLElement>();
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
      if (!inner.value) {
        return;
      }

      const instance = (chart.value = initChart(
        inner.value,
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
                  // mutating `option` will lead to `notMerge: false` and
                  // replacing it with new reference will lead to `notMerge: true`
                  notMerge: option !== oldOption,
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

    useAutoresize(chart, autoresize, inner);

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
      inner,
      setOption,
      nonEventAttrs,
      ...publicApi,
    };
  },
  render() {
    const attrs = attrsToProps(this.nonEventAttrs);
    attrs.ref = 'root';
    attrs.class = attrs.class ? ['echarts'].concat(attrs.class) : 'echarts';
    // 绕过 tsc 导出到temp下没有包含css文件
    attrs.style =
      'display: flex; flex-direction: column; width: 100%; height: 100%; min-width: 0;';
    return h(TAG_NAME, attrs, [
      h('div', {
        ref: 'inner',
        class: 'vue-echarts-inner',
        style: 'flex-grow: 1; min-width: 0;',
      }),
    ]);
  },
});

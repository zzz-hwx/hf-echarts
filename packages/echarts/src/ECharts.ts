import {
  computed,
  defineComponent,
  h,
  isVue2,
  isVue3,
  type PropType,
} from 'vue-demi';
import type { Option } from './types';
import { omitOn } from './utils';
import { TAG_NAME } from './wc';

export default defineComponent({
  name: 'hf-chart',
  props: {
    option: Object as PropType<Option>,
  },
  setup(props, { attrs }) {
    const nonEventAttrs = computed(() => omitOn(attrs));
    return {
      nonEventAttrs,
    };
  },
  render() {
    // Vue 3 and Vue 2 have different vnode props format:
    // See https://v3-migration.vuejs.org/breaking-changes/render-function-api.html#vnode-props-format

    console.log('test', isVue2, isVue3);

    // const jsx = (
    //   <div></div>
    // )

    const attrs = (
      isVue2 ? { attrs: this.nonEventAttrs } : { ...this.nonEventAttrs }
    ) as any;
    attrs.ref = 'root';
    attrs.class = attrs.class ? ['echarts'].concat(attrs.class) : 'echarts';
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

import { isArray, isFunction } from './general';

type Props = {
  children?: string;
};

/**
 * 树 格式化数据
 * @param data 数据
 * @param handle 处理函数
 * @param props 配置选项
 * @returns 
 */
export function treeDataFormat(
  data: any,
  handle: Function,
  props: Props = { children: 'children' },
): any[] {
  if (!isArray(data)) {
    console.warn('data is not array');
    return data;
  }
  if (!isFunction(handle)) {
    console.warn('handle is not function');
    return data;
  }
  const childrenProps = props?.children || 'children';
  return data.map(item => {
    let children;
    if (isArray(item[childrenProps])) {
      children = treeDataFormat(item[childrenProps], handle, props);
    }
    const newItem = handle(item);
    return {
      ...newItem,
      children,
    };
  });
}

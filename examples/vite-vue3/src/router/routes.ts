import { isArray, treeDataFormat } from '@hf/shared';
import { Component } from 'vue';

type Route = {
  path: string;
  component?: Component;
  meta: { icon?: string; title?: string };
  children?: Route[];
};

const data: Route[] = [
  {
    path: '/',
    component: () => import('@/views/test/table.vue'),
    meta: { icon: 'house', title: '测试' },
  },
  {
    path: '/line',
    meta: { icon: 'lock', title: '折线图' },
    children: [
      {
        path: '/line/index',
        component: () => import('@/views/line/index.vue'),
        meta: { title: '基础折线图' },
      },
    ],
  },
  {
    path: '/bar',
    meta: { icon: 'lock', title: '柱状图' },
    children: [
      {
        path: '/bar/index',
        component: () => import('@/views/bar/index.vue'),
        meta: { title: '基础用法' },
      },
      {
        path: '/bar/horizontal',
        meta: { icon: 'lock', title: '横向条形图' },
        children: [
          {
            path: '/bar/horizontal/index',
            component: () => import('@/views/bar/horizontal/index.vue'),
            meta: { title: '横向条形图' },
          },
          {
            path: '/bar/horizontal/pictorial',
            component: () => import('@/views/bar/horizontal/pictorial.vue'),
            meta: { title: 'pictorial' },
          },
        ],
      },
    ],
  },
  {
    path: '/pie',
    meta: { icon: 'lock', title: '饼图' },
    children: [
      {
        path: '/pie/index',
        component: () => import('@/views/pie/index.vue'),
        meta: { title: '饼图' },
      },
    ]
  },
  {
    path: '/scatter',
    meta: { icon: 'lock', title: '散点图' },
    children: []
  },
  {
    path: '/radar',
    meta: { icon: 'lock', title: '雷达图' },
    children: []
  },
  {
    path: '/gauge',
    meta: { icon: 'lock', title: '仪表盘' },
    children: []
  }
];

/**
 * 左侧菜单
 */
export const menuData = treeDataFormat(data, (item: any) => {
  return {
    title: item.meta.title,
    index: item.path,
    icon: item.meta.icon,
  };
});

function getRoutes() {
  const queue = data.slice(0);
  const routes = [];
  while (queue.length) {
    const item = queue.pop();
    if (!item) break;
    if (isArray(item.children)) {
      queue.push(...item.children);
    } else if (item.component) {
      routes.push({
        path: item.path,
        name: item.meta.title,
        component: item.component,
      });
    }
  }
  return routes;
}

/**
 * 静态路由
 */
export const routes = getRoutes();

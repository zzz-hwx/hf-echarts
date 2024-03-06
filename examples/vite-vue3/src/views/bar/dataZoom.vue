<template>
  <h1>缩放</h1>
  <div class="chart">
    <hf-bar :data="data" :option="option" autoresize></hf-bar>
  </div>
</template>

<script lang="ts" setup>
import { HfBar } from '@hf/graphics';
import { ref } from 'vue';
import { use } from 'echarts/core';
import { DataZoomComponent } from 'echarts/components';

use([
  DataZoomComponent
]);

const data = ref([
  {
    name: "车辆总数",
    itemData: [
      { name: "红泉社区", value: 999 },
      { name: "一连", value: 444 },
      { name: "二连", value: 996 },
      { name: "三连", value: 500 },
      { name: "四连", value: 2048 },
      { name: "五连", value: 1024 },
      { name: "六连", value: 444 },
      { name: "七连", value: 996 },
      { name: "八连", value: 500 },
      { name: "九连", value: 2048 },
      { name: "十连", value: 1024 },
    ]
  },
  {
    name: "重点车辆数",
    itemData: [
      { name: "红泉社区", value: 666 },
      { name: "一连", value: 888 },
      { name: "二连", value: 1024 },
      { name: "三连", value: 1005 },
      { name: "四连", value: 1048 },
      { name: "五连", value: 512 },
      { name: "六连", value: 888 },
      { name: "七连", value: 1024 },
      { name: "八连", value: 1005 },
      { name: "九连", value: 1048 },
      { name: "十连", value: 512 },
    ]
  },
  {
    name: "可疑车辆数",
    itemData: [
      { name: "红泉社区", value: 1200 },
      { name: "一连", value: 666 },
      { name: "二连", value: 2048 },
      { name: "三连", value: 1500 },
      { name: "四连", value: 996 },
      { name: "五连", value: 256 },
      { name: "六连", value: 666 },
      { name: "七连", value: 2048 },
      { name: "八连", value: 1500 },
      { name: "九连", value: 996 },
      { name: "十连", value: 256 },
    ]
  }
]);
const option = ref({
  grid: {
    bottom: 60
  },
  dataZoom: [
    {
      type: 'inside'
    }, {
      type: 'slider'
    }
  ]
});
</script>

<style scoped>
.chart {
  width: 600px;
  height: 500px;
}
</style>

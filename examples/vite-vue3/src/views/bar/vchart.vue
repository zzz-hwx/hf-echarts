<template>
  <h1>vue-echarts</h1>
  <div class="chart">
    <v-chart :option="option" autoresize name="bar-index"></v-chart>
  </div>
</template>

<script lang="ts" setup>
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { BarChart } from 'echarts/charts';
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components';
import VChart from '@hf/vue-echarts';
import { ref } from 'vue';

use([
  CanvasRenderer,
  BarChart,
  GridComponent,
  LegendComponent,
  TooltipComponent,
]);

const option = ref({
  tooltip: {},
  legend: {},
  xAxis: {
    data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  },
  yAxis: {},
  series: [{
    name: "Sale",
    type: "bar",
    data: [5, 20, 36, 10, 10, 20, 4]
  }]
});
</script>

<style scoped>
.chart {
  width: 600px;
  height: 500px;
}
</style>

<template>
  <h1>基础用法</h1>
  <div class="chart">
    <hf-bar :data="data" autoresize></hf-bar>
  </div>
</template>

<script lang="ts" setup>
import { HfBar } from '@hf/graphics';
import { ref } from 'vue';

const data = ref([
  {
    name: "A级门店",
    itemData: [
      { name: "福建", value: "211" },
      { name: "广州", value: "223" }
    ]
  },
  {
    name: "B级门店",
    itemData: [
      { name: "福建", value: "212" },
      { name: "广州", value: "145" }
    ]
  },
  {
    name: "C级门店",
    itemData: [
      { name: "福建", value: "112" },
      { name: "广州", value: "245" }
    ]
  }
]);
</script>

<style scoped>
.chart {
  width: 600px;
  height: 500px;
}
</style>

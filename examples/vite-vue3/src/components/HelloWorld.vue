<template>
  <h1>{{ msg }}</h1>

  <div class="card">
    <button type="button" @click="count++">count is {{ count }}</button>
  </div>

  <div>bool: {{ bool }}</div>

  <el-button>按钮呀</el-button>

  <!-- <hf-chart></hf-chart> -->
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { isArray } from '@hf/shared';
// import HfChart from '@hf/vue-echarts';

defineProps<{ msg: string }>()

const count = ref(0)

const bool = isArray(count);
</script>

<style scoped></style>

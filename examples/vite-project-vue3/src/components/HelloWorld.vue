<template>
  <h1>{{ msg }}</h1>

  <div class="card">
    <button type="button" @click="count++">count is {{ count }}</button>
  </div>

  <div>bool: {{ bool }}</div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { isArray } from '@hf/shared';

defineProps<{ msg: string }>()

const count = ref(0)

const bool = isArray(count);
</script>

<style scoped></style>

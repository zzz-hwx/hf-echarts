<template>
  <div>
    <h1>{{ msg }}</h1>
    <div class="card">
      <button type="button" @click="count++">count is {{ count }}</button>
    </div>
    <hf-chart></hf-chart>
  </div>
</template>

<script>
import HfChart from '@hf/vue-echarts';

export default {
  name: 'HelloWorld',
  components: {
    HfChart
  },
  props: {
    msg: String
  },
  data() {
    return {
      count: 0
    }
  }
}
</script>

<style scoped></style>

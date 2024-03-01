<template>
  <template v-for="menu in menuData">
    <template v-if="menu.children">
      <el-sub-menu :key="menu.index" :index="menu.index">
        <template #title>
          <el-icon v-if="menu.icon">
            <component :is="menu.icon"></component>
          </el-icon>
          {{ menu.title }}
        </template>
        <sub-menu :menu-data="menu.children"></sub-menu>
      </el-sub-menu>
    </template>
    <template v-else>
      <el-menu-item :key="menu.index" :index="menu.index">
        <template #title>
          <el-icon v-if="menu.icon">
            <component :is="menu.icon"></component>
          </el-icon>
          {{ menu.title }}
        </template>
      </el-menu-item>
    </template>
  </template>
</template>

<script lang="ts" setup>
type menu = {
  title: string
  index: string,
  icon?: string,
  children?: menu[]
}

defineProps<{
  menuData: menu[]
}>()
</script>

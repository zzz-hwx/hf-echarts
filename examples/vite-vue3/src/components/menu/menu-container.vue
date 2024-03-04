<template>
  <el-container class="menu-container">
    <el-header style="text-align: right; font-size: 12px">
      <div class="toolbar">
        <el-dropdown>
          <el-icon style="margin-right: 8px; margin-top: 1px">
            <setting />
          </el-icon>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>View</el-dropdown-item>
              <el-dropdown-item>Add</el-dropdown-item>
              <el-dropdown-item>Delete</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <span>Tom</span>
      </div>
    </el-header>
    <el-container>
      <el-aside width="200px">
        <el-scrollbar>
          <el-menu :default-openeds="defaultOpeneds" router :default-active="defaultActive">
            <sub-menu :menu-data="menuData"></sub-menu>
          </el-menu>
        </el-scrollbar>
      </el-aside>
      <el-main>
        <el-scrollbar>
          <router-view></router-view>
        </el-scrollbar>
      </el-main>
    </el-container>
    <el-footer>Footer</el-footer>
  </el-container>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import SubMenu from './sub-menu.vue';
import { menuData } from '@/router/routes';

const defaultOpeneds = ref(['/line']);
const defaultActive = '/test/table';
</script>

<style lang="scss" scoped>
.menu-container {
  height: 100vh;

  .el-header {
    position: relative;
    background-color: var(--el-color-primary-light-7);
    color: var(--el-text-color-primary);

    .toolbar {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      right: 20px;
    }
  }

  & > .el-container {
    height: 0;
  }

  .el-aside {
    color: var(--el-text-color-primary);
    background: var(--el-color-primary-light-8);

    .el-menu {
      border-right: none;
    }
  }

  .el-main {
    padding: 0;
  }

  .el-footer {
    background-color: var(--el-color-primary-light-7);
    color: var(--el-text-color-primary);
  }
}
</style>

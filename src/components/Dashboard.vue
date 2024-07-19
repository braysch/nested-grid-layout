<template>

</template>

<script>
import { reactive } from 'vue';
import GridHeader from './GridHeader.vue';
import NestedGridLayout from './NestedGridLayout.vue';

export default {
  name: 'Dashboard',
  components: {
    GridHeader,
    NestedGridLayout
  },
  data() {
    return {
      layout: reactive([]), // Ensure layout is reactive
      index: 0,
      colNum: 12
    };
  },
  methods: {

  }
};
</script>

<script setup>
import { onMounted, ref } from "vue";

const countdown = ref(60);

onMounted(() => {
  run();
});

const run = () => {
  if (countdown.value > 0) {
    setTimeout(() => {
      countdown.value -= 1;
      run();
    }, 1000);
  }
};
</script>

<template>
  <span>{{ countdown }}</span>
</template>

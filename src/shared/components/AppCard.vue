<script setup lang="ts">
interface Props {
  title?: string;
  subtitle?: string;
  noPadding?: boolean;
}

withDefaults(defineProps<Props>(), {
  title: undefined,
  subtitle: undefined,
  noPadding: false,
});
</script>

<template>
  <v-card class="app-card" :class="{ 'pa-0': noPadding, 'pa-5': !noPadding }">
    <div v-if="title" class="d-flex flex-column mb-4">
      <span class="text-smfont-weight-bold">{{ title }}</span>
      <span v-if="subtitle" class="text-caption text-medium-emphasis">{{
        subtitle
      }}</span>
    </div>
    <slot />
  </v-card>
</template>

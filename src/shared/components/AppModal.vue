<script setup lang="ts">
interface Props {
  modelValue: boolean;
  title?: string;
  maxWidth?: string | number;
  persistent?: boolean;
}

withDefaults(defineProps<Props>(), {
  title: "",
  maxWidth: 600,
  persistent: false,
});

defineEmits<{ "update:modelValue": [boolean] }>();
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    :max-width="maxWidth"
    :persistent="persistent"
    @update:model-value="(v: boolean) => $emit('update:modelValue', v)"
  >
    <v-card class="app-card pa-2" rounded="xl">
      <v-card-title class="d-flex align-center justify-space-between pa-4">
        <span class="font-weight-bold">{{ title }}</span>
        <v-btn
          icon="mdi-close"
          variant="text"
          size="small"
          @click="$emit('update:modelValue', false)"
        />
      </v-card-title>
      <v-divider />
      <v-card-text class="pa-4">
        <slot />
      </v-card-text>
      <v-card-actions v-if="$slots.actions" class="pa-4 pt-0">
        <slot name="actions" />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

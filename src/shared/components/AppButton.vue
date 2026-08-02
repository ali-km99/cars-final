<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'outline' | 'text' | 'danger'
  size?: 'small' | 'default' | 'large'
  loading?: boolean
  disabled?: boolean
  block?: boolean
  icon?: string
  type?: 'button' | 'submit'
}

withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'default',
  loading: false,
  disabled: false,
  block: false,
  icon: undefined,
  type: 'button',
})

defineEmits<{ click: [MouseEvent] }>()

const colorMap: Record<string, string> = {
  primary: 'accent',
  secondary: 'secondary',
  outline: 'primary',
  text: 'primary',
  danger: 'error',
}

const variantMap: Record<string, 'flat' | 'outlined' | 'text'> = {
  primary: 'flat',
  secondary: 'flat',
  outline: 'outlined',
  text: 'text',
  danger: 'flat',
}
</script>

<template>
  <v-btn
    :color="colorMap[variant]"
    :variant="variantMap[variant]"
    :size="size"
    :loading="loading"
    :disabled="disabled"
    :block="block"
    :type="type"
    :prepend-icon="icon"
    class="font-cairo"
    @click="(e: MouseEvent) => $emit('click', e)"
  >
    <slot />
  </v-btn>
</template>

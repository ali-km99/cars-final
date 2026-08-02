<script setup lang="ts">
interface Props {
  modelValue: string | number | null
  label?: string
  type?: string
  placeholder?: string
  prependIcon?: string
  appendIcon?: string
  errorMessages?: string | string[]
  required?: boolean
  disabled?: boolean
  hint?: string
}

withDefaults(defineProps<Props>(), {
  label: '',
  type: 'text',
  placeholder: '',
  prependIcon: undefined,
  appendIcon: undefined,
  errorMessages: undefined,
  required: false,
  disabled: false,
  hint: undefined,
})

defineEmits<{ 'update:modelValue': [string | number | null] }>()
</script>

<template>
  <v-text-field
    :model-value="modelValue"
    :label="label"
    :type="type"
    :placeholder="placeholder"
    :prepend-inner-icon="prependIcon"
    :append-inner-icon="appendIcon"
    :error-messages="errorMessages"
    :required="required"
    :disabled="disabled"
    :hint="hint"
    persistent-hint
    @update:model-value="(v: string) => $emit('update:modelValue', v)"
  />
</template>

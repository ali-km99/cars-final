<script setup lang="ts">
import { reactive, ref, watch } from "vue";
import AppModal from "@/shared/components/AppModal.vue";
import { useMaintenanceCenterStore } from "../store/maintenance-center.store";
import type { MaintenanceCenter } from "../models/maintenance-center.model";

const props = defineProps<{
  modelValue: boolean;
  editingCenter?: MaintenanceCenter | null;
}>();

const emit = defineEmits<{
  "update:modelValue": [boolean];
  saved: [MaintenanceCenter];
}>();

const centerStore = useMaintenanceCenterStore();
const formValid = ref(false);
const form = reactive({ name: "", notes: "" });

const rules = { required: (v: string) => !!v || "هذا الحقل مطلوب" };

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      form.name = props.editingCenter?.name || "";
      form.notes = props.editingCenter?.notes || "";
    }
  },
);

async function handleSave() {
  if (!formValid.value) return;
  const result = props.editingCenter
    ? await centerStore.updateCenter(props.editingCenter.id, { ...form })
    : await centerStore.createCenter({ ...form });

  emit("saved", result);
  emit("update:modelValue", false);
}
</script>

<template>
  <AppModal
    :model-value="modelValue"
    :title="editingCenter ? 'تعديل مركز الصيانة' : 'إضافة مركز صيانة جديد'"
    :max-width="420"
    @update:model-value="(v: boolean) => emit('update:modelValue', v)"
  >
    <v-form v-model="formValid" @submit.prevent="handleSave">
      <v-text-field
        v-model="form.name"
        label="اسم المركز"
        :rules="[rules.required]"
        variant="outlined"
        density="comfortable"
        rounded="lg"
        class="mb-2"
        autofocus
      />
      <v-textarea
        v-model="form.notes"
        label="ملاحظات (اختياري)"
        variant="outlined"
        density="comfortable"
        rounded="lg"
        rows="2"
      />
    </v-form>

    <template #actions>
      <v-spacer />
      <v-btn variant="text" @click="emit('update:modelValue', false)"
        >إلغاء</v-btn
      >
      <v-btn
        color="accent"
        :loading="centerStore.saving"
        :disabled="!formValid"
        @click="handleSave"
      >
        حفظ
      </v-btn>
    </template>
  </AppModal>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from "vue";
import AppModal from "@/shared/components/AppModal.vue";
import { useMaintenanceStore } from "../store/maintenance.store";
import { formatCurrency } from "@/core/utils/formatters";

const props = defineProps<{
  modelValue: boolean;
  maintenanceId: number | null;
  remainingAmount: number;
}>();

const emit = defineEmits<{
  "update:modelValue": [boolean];
  paid: [];
}>();

const maintenanceStore = useMaintenanceStore();
const formValid = ref(false);

const form = reactive({
  amount: 0,
  notes: "",
  paymentDate: new Date().toISOString().substring(0, 10),
});

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      form.amount = 0;
      form.notes = "";
      form.paymentDate = new Date().toISOString().substring(0, 10);
    }
  },
);

const rules = {
  required: (v: unknown) =>
    (v !== null && v !== undefined && v !== "") || "هذا الحقل مطلوب",
  amountGT: (v: number) => v > 0 || "المبلغ يجب أن يكون أكبر من صفر",
  amountLTE: (v: number) =>
    v <= props.remainingAmount ||
    `المبلغ لا يمكن أن يتجاوز المتبقي (${formatCurrency(props.remainingAmount)})`,
};

async function handleSave() {
  if (!formValid.value || !props.maintenanceId) return;
  try {
    await maintenanceStore.createPayment(props.maintenanceId, { ...form });
    emit("paid");
    emit("update:modelValue", false);
  } catch {
    // رسالة الخطأ تُعرض تلقائياً عبر uiStore داخل الستور
  }
}
</script>

<template>
  <AppModal
    :model-value="modelValue"
    title="تسجيل دفعة"
    :max-width="420"
    @update:model-value="(v: boolean) => emit('update:modelValue', v)"
  >
    <v-form v-model="formValid" @submit.prevent="handleSave">
      <v-alert type="info" variant="tonal" density="compact" class="mb-4">
        الحد الأقصى للدفعة: {{ formatCurrency(remainingAmount) }}
      </v-alert>

      <v-text-field
        v-model.number="form.amount"
        label="المبلغ"
        type="number"
        :rules="[rules.required, rules.amountGT, rules.amountLTE]"
        variant="outlined"
        density="comfortable"
        rounded="lg"
        prefix="$"
        class="mb-2"
      />

      <v-text-field
        v-model="form.paymentDate"
        label="تاريخ الدفعة"
        type="date"
        variant="outlined"
        density="comfortable"
        rounded="lg"
        class="mb-2"
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
        :loading="maintenanceStore.savingPayment"
        :disabled="!formValid"
        @click="handleSave"
      >
        تسجيل الدفعة
      </v-btn>
    </template>
  </AppModal>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from "vue";
import AppModal from "@/shared/components/AppModal.vue";
import { useMaintenanceCenterStore } from "../store/maintenance-center.store";
import type {
  MaintenanceCenter,
  MaintenanceCenterPhoneInput,
} from "../models/maintenance-center.model";

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

const form = reactive({
  name: "",
  notes: "",
  phones: [] as MaintenanceCenterPhoneInput[],
});

const rules = {
  required: (v: string) => !!v || "هذا الحقل مطلوب",
  // نفس صيغة أرقام الهاتف المستخدمة بفورم العميل: أرقام، مسافات، + - ( )
  phone: (v: string) => /^[\d\s()+-]+$/.test(v) || "رقم الهاتف غير صحيح",
};

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      form.name = props.editingCenter?.name || "";
      form.notes = props.editingCenter?.notes || "";
      // ⚠️ لازم نعبّي القائمة الكاملة من الأرقام الموجودة أصلاً (بدون id، فقط label/phoneNumber)
      form.phones = props.editingCenter?.phones?.length
        ? props.editingCenter.phones.map((p) => ({
            label: p.label,
            phoneNumber: p.phoneNumber,
          }))
        : [];
    }
  },
);

function addPhone() {
  form.phones.push({ label: "", phoneNumber: "" });
}

function removePhone(index: number) {
  form.phones.splice(index, 1);
}

async function handleSave() {
  if (!formValid.value) return;

  // ⚠️ الإرسال دائماً بالقائمة الكاملة الحالية (replace-all) — لا Diff
  const payload = {
    name: form.name,
    notes: form.notes,
    phones: form.phones.filter((p) => p.label.trim() && p.phoneNumber.trim()),
  };

  const result = props.editingCenter
    ? await centerStore.updateCenter(props.editingCenter.id, payload)
    : await centerStore.createCenter(payload);

  emit("saved", result);
  emit("update:modelValue", false);
}
</script>

<template>
  <AppModal
    :model-value="modelValue"
    :title="editingCenter ? 'تعديل مركز الصيانة' : 'إضافة مركز صيانة جديد'"
    :max-width="520"
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
        class="mb-3"
      />

      <v-divider class="mb-3" />

      <div class="d-flex align-center justify-space-between mb-3">
        <span class="font-weight-bold text-sm">أرقام الهاتف</span>
        <v-btn
          size="small"
          variant="tonal"
          color="accent"
          prepend-icon="mdi-plus"
          style="text-transform: none"
          @click="addPhone"
        >
          إضافة رقم
        </v-btn>
      </div>

      <div
        v-if="!form.phones.length"
        class="text-caption text-medium-emphasis mb-2"
      >
        لا توجد أرقام هاتف مضافة
      </div>

      <div
        v-for="(phone, i) in form.phones"
        :key="i"
        class="d-flex ga-2 mb-2 align-start"
      >
        <v-text-field
          v-model="phone.label"
          label="المسمى"
          placeholder="مثال: مدير المركز"
          :rules="[rules.required]"
          density="comfortable"
          variant="outlined"
          rounded="lg"
          hide-details="auto"
          style="max-width: 160px"
        />
        <v-text-field
          v-model="phone.phoneNumber"
          label="رقم الهاتف"
          placeholder="+218 91 234 5678"
          :rules="[rules.required, rules.phone]"
          density="comfortable"
          variant="outlined"
          rounded="lg"
          hide-details="auto"
          class="flex-grow-1"
        />
        <v-btn
          icon="mdi-close"
          size="small"
          variant="text"
          color="error"
          class="mt-1"
          @click="removePhone(i)"
        />
      </div>
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

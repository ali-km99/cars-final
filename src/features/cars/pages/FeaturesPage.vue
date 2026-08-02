<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { useFeatureStore } from "../store/feature.store";
import AppModal from "@/shared/components/AppModal.vue";
import type { FeatureDto } from "../models/car.model";

const featureStore = useFeatureStore();
const dialogOpen = ref(false);
const saving = ref(false);
const formValid = ref(false);
const editingId = ref<number | null>(null);

const categoryOptions = [
  { title: "الأنظمة الرقمية", value: "Technology" },
  { title: "الراحة والداخلية", value: "Interior" },
  { title: "الهيكل الخارجي", value: "Exterior" },
];

const emptyForm = (): Omit<FeatureDto, "id"> => ({
  name: "",
  category: "Technology",
});

const form = reactive<Omit<FeatureDto, "id">>(emptyForm());

const isEditing = computed(() => editingId.value !== null);

const rules = {
  required: (v: unknown) =>
    (v !== null && v !== undefined && v !== "") || "هذا الحقل مطلوب",
};

onMounted(() => featureStore.fetchFeatures());

function openCreateDialog() {
  editingId.value = null;
  Object.assign(form, emptyForm());
  dialogOpen.value = true;
}

function openEditDialog(feature: FeatureDto) {
  editingId.value = feature.id;
  Object.assign(form, {
    name: feature.name || "",
    category: feature.category || "Technology",
  });
  dialogOpen.value = true;
}

async function handleSave() {
  if (!formValid.value) return;

  saving.value = true;
  try {
    if (editingId.value) {
      await featureStore.updateFeature(editingId.value, {
        name: form.name || null,
        category: form.category || null,
      });
    } else {
      await featureStore.createFeature({
        name: form.name || null,
        category: form.category || null,
      });
    }

    dialogOpen.value = false;
    editingId.value = null;
    Object.assign(form, emptyForm());
  } finally {
    saving.value = false;
  }
}

async function handleDelete(id: number) {
  const confirmed = window.confirm("هل أنت متأكد من حذف هذه الكمالية؟");
  if (!confirmed) return;

  await featureStore.removeFeature(id);
}

const headers = [
  { title: "الاسم", key: "name" },
  { title: "الفئة", key: "category" },
  { title: "عدد الاستخدام", key: "usageCount" },
  { title: "الإجراءات", key: "actions", sortable: false },
];
</script>

<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-6">
      <div class="d-flex flex-column">
        <span class="font-weight-bold text-2xl">كماليات السيارات</span>
        <span class="text-sm text-medium-emphasis"
          >إدارة الكماليات التي يمكن ربطها بالسيارات</span
        >
      </div>
      <v-btn
        color="accent"
        prepend-icon="mdi-plus"
        rounded="lg"
        style="text-transform: none; font-weight: 600"
        @click="openCreateDialog"
      >
        إضافة كمالية
      </v-btn>
    </div>

    <v-card class="app-card" no-padding>
      <v-data-table
        :headers="headers"
        :items="featureStore.features"
        :loading="featureStore.loading"
        item-value="id"
        no-data-text="لا توجد كماليات حتى الآن"
        loading-text="جاري التحميل..."
        items-per-page="10"
        class="rounded-lg"
      >
        <template #item.actions="{ item }">
          <div class="d-flex gap-2">
            <v-btn
              icon="mdi-pencil"
              size="small"
              variant="text"
              color="primary"
              @click="openEditDialog(item)"
            />
            <v-btn
              icon="mdi-delete"
              size="small"
              variant="text"
              color="error"
              @click="handleDelete(item.id)"
            />
          </div>
        </template>
      </v-data-table>
    </v-card>

    <AppModal
      v-model="dialogOpen"
      :title="isEditing ? 'تعديل الكمالية' : 'إضافة كمالية جديدة'"
    >
      <v-form v-model="formValid" @submit.prevent="handleSave">
        <v-text-field
          v-model="form.name"
          label="اسم الكمالية"
          :rules="[rules.required]"
          variant="outlined"
          density="comfortable"
          rounded="lg"
          class="mb-3"
        />

        <v-select
          v-model="form.category"
          :items="categoryOptions"
          item-title="title"
          item-value="value"
          label="الفئة"
          :rules="[rules.required]"
          variant="outlined"
          density="comfortable"
          rounded="lg"
        />
      </v-form>

      <template #actions>
        <v-spacer />
        <v-btn variant="text" @click="dialogOpen = false">إلغاء</v-btn>
        <v-btn color="accent" :loading="saving" @click="handleSave">
          {{ isEditing ? "تعديل" : "حفظ" }}
        </v-btn>
      </template>
    </AppModal>
  </div>
</template>

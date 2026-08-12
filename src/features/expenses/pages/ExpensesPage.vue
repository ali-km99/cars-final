<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { useExpenseStore } from "../store/expense.store";
import AppModal from "@/shared/components/AppModal.vue";
import { formatCurrency, formatDate } from "@/core/utils/formatters";
import type { ExpenseCreateDto, ExpenseFilter } from "../models/expense.model";

const expenseStore = useExpenseStore();

// ─── الفلاتر ──────────────────────────────────────────────────────────────
const filter = reactive<ExpenseFilter>({
  categoryId: undefined,
  dateFrom: undefined,
  dateTo: undefined,
  page: 1,
  pageSize: 10,
});

function applyFilters() {
  filter.page = 1;
  expenseStore.fetchExpenses({ ...filter });
}

function resetFilters() {
  filter.categoryId = undefined;
  filter.dateFrom = undefined;
  filter.dateTo = undefined;
  applyFilters();
}

function handlePageChange(page: number) {
  filter.page = page;
  expenseStore.fetchExpenses({ ...filter });
}

// ─── فورم الإضافة/التعديل ───────────────────────────────────────────────────
const dialogOpen = ref(false);
const saving = ref(false);
const formValid = ref(false);
const editingId = ref<number | null>(null);

const emptyForm = (): ExpenseCreateDto => ({
  categoryId: 0,
  amount: 0,
  description: "",
  date: new Date().toISOString().substring(0, 10),
});

const form = reactive<ExpenseCreateDto>(emptyForm());
const isEditing = computed(() => editingId.value !== null);

const rules = {
  required: (v: unknown) =>
    (v !== null && v !== undefined && v !== "" && v !== 0) || "هذا الحقل مطلوب",
  amountGT: (v: number) => v > 0 || "المبلغ يجب أن يكون أكبر من صفر",
  maxLen: (max: number) => (v: string) =>
    !v || v.length <= max || `يجب ألا يتجاوز طول النص ${max} حرفاً`,
};

function openCreateDialog() {
  editingId.value = null;
  Object.assign(form, emptyForm());
  dialogOpen.value = true;
}

function openEditDialog(expense: (typeof expenseStore.expenses)[number]) {
  editingId.value = expense.id;
  Object.assign(form, {
    categoryId: expense.categoryId,
    amount: expense.amount,
    description: expense.description || "",
    date: expense.date?.substring(0, 10),
  });
  dialogOpen.value = true;
}

async function handleSave() {
  if (!formValid.value) return;
  saving.value = true;
  try {
    if (editingId.value) {
      await expenseStore.updateExpense(editingId.value, { ...form });
    } else {
      await expenseStore.createExpense({ ...form });
    }
    dialogOpen.value = false;
    editingId.value = null;
    Object.assign(form, emptyForm());
    expenseStore.fetchExpenses({ ...filter });
  } finally {
    saving.value = false;
  }
}

// ─── حذف مصروف ───────────────────────────────────────────────────────────
const deleteDialog = ref(false);
const deletingId = ref<number | null>(null);

function confirmDelete(id: number) {
  deletingId.value = id;
  deleteDialog.value = true;
}

async function handleDelete() {
  if (!deletingId.value) return;
  await expenseStore.removeExpense(deletingId.value);
  deleteDialog.value = false;
  deletingId.value = null;
}

// ─── إضافة تصنيف جديد بضغطة زر ──────────────────────────────────────────
const categoryDialog = ref(false);
const newCategoryName = ref("");
const categoryFormValid = ref(false);

async function handleAddCategory() {
  if (!newCategoryName.value.trim()) return;
  const created = await expenseStore.createCategory(
    newCategoryName.value.trim(),
  );
  form.categoryId = created.id; // نختارها تلقائياً في الفورم المفتوح
  newCategoryName.value = "";
  categoryDialog.value = false;
}

// ─── إجمالي المصروفات في الصفحة الحالية ────────────────────────────────────
const currentPageTotal = computed(() =>
  expenseStore.expenses.reduce((sum, e) => sum + e.amount, 0),
);

onMounted(() => {
  expenseStore.fetchCategories();
  expenseStore.fetchExpenses({ ...filter });
});

const headers = [
  { title: "التصنيف", key: "categoryName" },
  { title: "المبلغ", key: "amount" },
  { title: "الوصف", key: "description" },
  { title: "التاريخ", key: "date" },
  { title: "الإجراءات", key: "actions", sortable: false },
];
</script>

<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-6">
      <div class="d-flex flex-column">
        <span class="font-weight-bold text-2xl">المصروفات</span>
        <span class="text-sm text-medium-emphasis"
          >إدارة مصروفات المعرض وتصنيفاتها</span
        >
      </div>
      <v-btn
        color="accent"
        prepend-icon="mdi-plus"
        rounded="lg"
        style="text-transform: none; font-weight: 600"
        @click="openCreateDialog"
      >
        إضافة مصروف
      </v-btn>
    </div>

    <!-- ─── بطاقة الإجمالي ─────────────────────────────────────────────── -->
    <v-card class="app-card pa-5 mb-5">
      <div class="d-flex align-center justify-space-between">
        <div>
          <span class="text-caption text-medium-emphasis"
            >إجمالي مصروفات الصفحة الحالية</span
          >
          <div class="text-h6 font-weight-bold text-error mt-1">
            {{ formatCurrency(currentPageTotal) }}
          </div>
        </div>
        <v-avatar color="error" variant="tonal" size="46" rounded="lg">
          <v-icon icon="mdi-cash-minus" color="error" />
        </v-avatar>
      </div>
    </v-card>

    <!-- ─── الفلاتر ─────────────────────────────────────────────────────── -->
    <v-card class="app-card pa-4 mb-5">
      <v-row dense>
        <v-col cols="12" md="4">
          <v-select
            v-model="filter.categoryId"
            :items="expenseStore.categories"
            item-title="name"
            item-value="id"
            label="التصنيف"
            prepend-inner-icon="mdi-shape-outline"
            variant="outlined"
            density="comfortable"
            rounded="lg"
            hide-details
            clearable
            :loading="expenseStore.loadingCategories"
          />
        </v-col>
        <v-col cols="6" md="3">
          <v-text-field
            v-model="filter.dateFrom"
            label="من تاريخ"
            type="date"
            prepend-inner-icon="mdi-calendar-start"
            variant="outlined"
            density="comfortable"
            rounded="lg"
            hide-details
          />
        </v-col>
        <v-col cols="6" md="3">
          <v-text-field
            v-model="filter.dateTo"
            label="إلى تاريخ"
            type="date"
            prepend-inner-icon="mdi-calendar-end"
            variant="outlined"
            density="comfortable"
            rounded="lg"
            hide-details
          />
        </v-col>
        <v-col cols="12" md="2" class="d-flex ga-2">
          <v-btn
            color="accent"
            block
            style="text-transform: none; font-weight: 600"
            @click="applyFilters"
          >
            بحث
          </v-btn>
        </v-col>
      </v-row>
      <div class="d-flex justify-end mt-2">
        <v-btn
          variant="text"
          size="small"
          color="error"
          prepend-icon="mdi-refresh"
          @click="resetFilters"
        >
          إعادة تعيين
        </v-btn>
      </div>
    </v-card>

    <!-- ─── الجدول ──────────────────────────────────────────────────────── -->
    <v-card class="app-card" no-padding>
      <v-data-table
        :headers="headers"
        :items="expenseStore.expenses"
        :loading="expenseStore.loading"
        item-value="id"
        no-data-text="لا توجد مصروفات مطابقة"
        loading-text="جاري التحميل..."
        hide-default-footer
      >
        <template #item.amount="{ item }">
          <span class="font-weight-bold text-error">
            {{ formatCurrency(item.amount) }}
          </span>
        </template>
        <template #item.date="{ item }">{{ formatDate(item.date) }}</template>
        <template #item.description="{ item }">
          {{ item.description || "—" }}
        </template>
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
              @click="confirmDelete(item.id)"
            />
          </div>
        </template>
      </v-data-table>

      <div
        v-if="expenseStore.pagination && expenseStore.pagination.totalPages > 1"
        class="d-flex justify-center pa-4"
      >
        <v-pagination
          :model-value="expenseStore.pagination.page"
          :length="expenseStore.pagination.totalPages"
          :total-visible="7"
          color="accent"
          density="comfortable"
          @update:model-value="handlePageChange"
        />
      </div>
    </v-card>

    <!-- ─── مودال إضافة/تعديل مصروف ─────────────────────────────────────── -->
    <AppModal
      v-model="dialogOpen"
      :title="isEditing ? 'تعديل المصروف' : 'إضافة مصروف جديد'"
    >
      <v-form v-model="formValid" @submit.prevent="handleSave">
        <div class="d-flex ga-2 align-start mb-2">
          <v-select
            v-model="form.categoryId"
            :items="expenseStore.categories"
            item-title="name"
            item-value="id"
            label="التصنيف"
            :rules="[rules.required]"
            variant="outlined"
            density="comfortable"
            rounded="lg"
            :loading="expenseStore.loadingCategories"
            class="flex-grow-1"
          />
          <v-btn
            icon="mdi-plus"
            color="accent"
            variant="tonal"
            class="mt-1"
            @click="categoryDialog = true"
          />
        </div>

        <v-text-field
          v-model.number="form.amount"
          label="المبلغ"
          type="number"
          :rules="[rules.required, rules.amountGT]"
          variant="outlined"
          density="comfortable"
          rounded="lg"
          prefix="$"
          class="mb-2"
        />

        <v-text-field
          v-model="form.date"
          label="التاريخ"
          type="date"
          variant="outlined"
          density="comfortable"
          rounded="lg"
          class="mb-2"
        />

        <v-textarea
          v-model="form.description"
          label="الوصف"
          :rules="[rules.maxLen(500)]"
          variant="outlined"
          density="comfortable"
          rounded="lg"
          rows="2"
          counter="500"
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

    <!-- ─── مودال إضافة تصنيف سريع ──────────────────────────────────────── -->
    <AppModal
      v-model="categoryDialog"
      title="إضافة تصنيف جديد"
      :max-width="420"
    >
      <v-form v-model="categoryFormValid" @submit.prevent="handleAddCategory">
        <v-text-field
          v-model="newCategoryName"
          label="اسم التصنيف"
          :rules="[rules.required]"
          variant="outlined"
          density="comfortable"
          rounded="lg"
          autofocus
        />
      </v-form>
      <template #actions>
        <v-spacer />
        <v-btn variant="text" @click="categoryDialog = false">إلغاء</v-btn>
        <v-btn
          color="accent"
          :loading="expenseStore.savingCategory"
          :disabled="!newCategoryName.trim()"
          @click="handleAddCategory"
        >
          إضافة
        </v-btn>
      </template>
    </AppModal>

    <!-- ─── مودال تأكيد الحذف ──────────────────────────────────────────── -->
    <AppModal v-model="deleteDialog" title="تأكيد الحذف" :max-width="420">
      <div class="d-flex flex-column align-center text-center pa-4 ga-4">
        <v-avatar color="error" variant="tonal" size="64" rounded="xl">
          <v-icon icon="mdi-delete-outline" size="32" color="error" />
        </v-avatar>
        <p class="text-body-1 font-weight-bold">
          هل أنت متأكد من حذف هذا المصروف؟ سيتم استبعاده من الإجماليات المالية
        </p>
        <div class="d-flex ga-3 w-100">
          <v-btn
            variant="tonal"
            color="secondary"
            block
            style="text-transform: none"
            @click="deleteDialog = false"
          >
            إلغاء
          </v-btn>
          <v-btn
            color="error"
            block
            :loading="expenseStore.loading"
            style="text-transform: none; font-weight: 600"
            @click="handleDelete"
          >
            نعم، احذف
          </v-btn>
        </div>
      </div>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { useCustomerStore } from "../store/customer.store";
import AppModal from "@/shared/components/AppModal.vue";
import type { CustomerCreateDto } from "../models/customer.model";

const customerStore = useCustomerStore();
const dialogOpen = ref(false);
const saving = ref(false);
const formValid = ref(false);

const form = reactive<CustomerCreateDto>({ name: "", phone: "", notes: "" });

const rules = { required: (v: string) => !!v || "هذا الحقل مطلوب" };

onMounted(() => customerStore.fetchCustomers());

async function handleSave() {
  if (!formValid.value) return;
  saving.value = true;
  try {
    await customerStore.createCustomer({ ...form });
    dialogOpen.value = false;
    form.name = "";
    form.phone = "";
    form.notes = "";
  } finally {
    saving.value = false;
  }
}

const headers = [
  { title: "الاسم", key: "name" },
  { title: "رقم الهاتف", key: "phone" },
  { title: "عدد عمليات الشراء", key: "totalPurchases" },
  { title: "ملاحظات", key: "notes" },
];
</script>

<template>
  <div>
    <div class="md:flex align-center justify-space-between mb-6">
      <div>
        <div class="d-flex align-center ga-3 mb-1">
          <v-avatar color="accent" rounded="lg" size="40">
            <v-icon icon="mdi-account-group-outline" color="white" size="22" />
          </v-avatar>
          <span class="text-2xl font-bold"> العملاء </span>
        </div>
        <span class="text-sm text-medium-emphasis"> قائمة عملاء المعرض </span>
      </div>
      <v-btn
        color="accent"
        prepend-icon="mdi-plus"
        rounded="lg"
        style="text-transform: none; font-weight: 600"
        @click="dialogOpen = true"
      >
        إضافة عميل
      </v-btn>
    </div>

    <v-card class="app-card" no-padding>
      <v-data-table
        :headers="headers"
        :items="customerStore.customers"
        :loading="customerStore.loading"
        no-data-text="لا يوجد عملاء حتى الآن"
        loading-text="جاري التحميل..."
        items-per-page="10"
        class="rounded-lg"
      />
    </v-card>

    <AppModal v-model="dialogOpen" title="إضافة عميل جديد">
      <v-form v-model="formValid" @submit.prevent="handleSave">
        <v-text-field
          v-model="form.name"
          label="اسم العميل"
          :rules="[rules.required]"
          variant="outlined"
          density="comfortable"
          rounded="lg"
          class="mb-2"
        />
        <v-text-field
          v-model="form.phone"
          label="رقم الهاتف"
          :rules="[rules.required]"
          variant="outlined"
          density="comfortable"
          rounded="lg"
          class="mb-2"
        />
        <v-textarea
          v-model="form.notes"
          label="ملاحظات"
          variant="outlined"
          density="comfortable"
          rounded="lg"
          rows="2"
        />
      </v-form>
      <template #actions>
        <v-spacer />
        <v-btn variant="text" @click="dialogOpen = false">إلغاء</v-btn>
        <v-btn color="accent" :loading="saving" @click="handleSave">حفظ</v-btn>
      </template>
    </AppModal>
  </div>
</template>

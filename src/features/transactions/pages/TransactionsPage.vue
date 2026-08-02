<script setup lang="ts">
import { onMounted, computed } from "vue";
import { useTransactionStore } from "../store/transaction.store";
import { formatCurrency, formatDate } from "@/core/utils/formatters";

const transactionStore = useTransactionStore();

onMounted(() => transactionStore.fetchTransactions());

const totalIncome = computed(() =>
  transactionStore.transactions
    .filter((t) => t.type === "Income")
    .reduce((s, t) => s + t.amount, 0),
);
const totalExpense = computed(() =>
  transactionStore.transactions
    .filter((t) => t.type === "Expense")
    .reduce((s, t) => s + t.amount, 0),
);
const net = computed(() => totalIncome.value - totalExpense.value);

function getEntityLabel(entity: string) {
  switch (entity) {
    case "Maintenance":
      return "صيانة";
    case "Sale":
      return "بيع";
    case "Car":
      return "شراء سيارة";
    default:
      return entity;
  }
}

function getEntityColor(entity: string) {
  switch (entity) {
    case "Maintenance":
      return "warning";
    case "Sale":
      return "teal";
    case "Car":
      return "info"; // 🔥 لون مميز للشراء
    default:
      return "grey";
  }
}

function getEntityIcon(entity: string) {
  switch (entity) {
    case "Maintenance":
      return "mdi-wrench";
    case "Sale":
      return "mdi-cash-check";
    case "Car":
      return "mdi-car"; // 🔥 أيقونة شراء
    default:
      return "mdi-help-circle";
  }
}
const headers = [
  { title: "النوع", key: "type" },

  { title: "الوصف", key: "description" },
  { title: "القيد", key: "relatedEntity" },
  { title: "المبلغ", key: "amount" },
  { title: "التاريخ", key: "date" },
];
</script>

<template>
  <div>
    <div class="d-flex flex-column mb-6">
      <span class="font-weight-bold text-2xl">العمليات المالية</span>
      <span class="text-sm text-medium-emphasis"
        >سجل كل الإيرادات والمصروفات</span
      >
    </div>

    <v-row class="mb-2">
      <v-col cols="12" sm="4">
        <v-card class="app-card pa-5">
          <span class="text-caption text-medium-emphasis">إجمالي الدخل</span>
          <div class="text-h6 font-weight-bold text-success mt-1">
            {{ formatCurrency(totalIncome) }}
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="4">
        <v-card class="app-card pa-5">
          <span class="text-caption text-medium-emphasis"
            >إجمالي المصروفات</span
          >
          <div class="text-h6 font-weight-bold text-error mt-1">
            {{ formatCurrency(totalExpense) }}
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="4">
        <v-card class="app-card pa-5">
          <span class="text-caption text-medium-emphasis">صافي الربح</span>
          <div class="text-h6 font-weight-bold text-gold mt-1">
            {{ formatCurrency(net) }}
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-card class="app-card mt-4" no-padding>
      <v-data-table
        :headers="headers"
        :items="transactionStore.transactions"
        :loading="transactionStore.loading"
        no-data-text="لا توجد عمليات مالية"
      >
        <template #item.type="{ item }">
          <v-chip
            :color="item.type === 'Income' ? 'success' : 'error'"
            size="small"
            variant="tonal"
          >
            {{ item.type === "Income" ? "دخل" : "مصروف" }}
          </v-chip>
        </template>
        <template #item.relatedEntity="{ item }">
          <v-chip
            :color="getEntityColor(item.relatedEntity)"
            size="small"
            variant="tonal"
            :prepend-icon="getEntityIcon(item.relatedEntity)"
          >
            {{ getEntityLabel(item.relatedEntity) }}
          </v-chip>
        </template>
        <template #item.amount="{ item }">
          <span
            :class="item.type === 'Income' ? 'text-success' : 'text-error'"
            class="font-weight-bold"
          >
            {{ formatCurrency(item.amount) }}
          </span>
        </template>
        <template #item.date="{ item }">{{ formatDate(item.date) }}</template>
      </v-data-table>
    </v-card>
  </div>
</template>

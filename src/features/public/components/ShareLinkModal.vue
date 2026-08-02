<script setup lang="ts">
import { reactive, ref } from "vue";
import { shareService } from "../services/share.service";
import { useUiStore } from "@/core/store/ui.store";
import type { ContactEntry } from "../models/share.model";
import AppModal from "@/shared/components/AppModal.vue";

const props = defineProps<{ carId: number }>();
const emit = defineEmits<{ "update:modelValue": [boolean] }>();
const show = defineModel<boolean>({ default: false });

const uiStore = useUiStore();
const loading = ref(false);
const generatedUrl = ref<string | null>(null);
const copied = ref(false);
const step = ref<"form" | "result">("form");

const form = reactive({
  contactAddress: "",
  expiresAt: "",
  contacts: [{ label: "هاتف", value: "" }] as ContactEntry[],
});

const contactLabelOptions = ["هاتف", "واتساب", "تيليغرام", "إيميل", "أخرى"];

function addContact() {
  form.contacts.push({ label: "هاتف", value: "" });
}

function removeContact(i: number) {
  form.contacts.splice(i, 1);
}

async function generate() {
  loading.value = true;
  try {
    const { data: envelope } = await shareService.generateLink(props.carId, {
      contactAddress: form.contactAddress || undefined,
      contacts: form.contacts.filter((c) => c.value.trim()),
      expiresAt: form.expiresAt || null,
    });
    generatedUrl.value = envelope.data.url;
    step.value = "result";
  } catch (err: any) {
    uiStore.showAlert(
      err?.response?.data?.message || "فشل توليد رابط المشاركة",
      "error",
    );
  } finally {
    loading.value = false;
  }
}

async function copyUrl() {
  if (!generatedUrl.value) return;
  await navigator.clipboard.writeText(generatedUrl.value);
  copied.value = true;
  setTimeout(() => (copied.value = false), 2500);
}

function reset() {
  step.value = "form";
  generatedUrl.value = null;
  form.contactAddress = "";
  form.expiresAt = "";
  form.contacts = [{ label: "هاتف", value: "" }];
}

function close() {
  show.value = false;
  setTimeout(reset, 300);
}
</script>

<template>
  <AppModal
    v-model="show"
    :title="step === 'form' ? 'مشاركة السيارة' : 'تم توليد الرابط'"
    :max-width="560"
    persistent
  >
    <!-- ── Step 1: Form ──────────────────────────────────────────── -->
    <div v-if="step === 'form'">
      <v-text-field
        v-model="form.contactAddress"
        label="عنوان التواصل (اختياري)"
        placeholder="مثال: طرابلس، شارع الجمهورية"
        prepend-inner-icon="mdi-map-marker-outline"
        class="mb-2"
      />

      <v-text-field
        v-model="form.expiresAt"
        label="تاريخ انتهاء الرابط (اختياري)"
        type="datetime-local"
        prepend-inner-icon="mdi-clock-outline"
        class="mb-4"
      />

      <!-- جهات التواصل -->
      <div class="mb-2">
        <div class="d-flex align-center justify-space-between mb-3">
          <span class="font-weight-bold">جهات التواصل</span>
          <v-btn
            size="small"
            variant="tonal"
            color="accent"
            prepend-icon="mdi-plus"
            style="text-transform: none"
            @click="addContact"
          >
            إضافة
          </v-btn>
        </div>

        <div
          v-for="(contact, i) in form.contacts"
          :key="i"
          class="d-flex ga-2 mb-2"
        >
          <v-select
            v-model="contact.label"
            :items="contactLabelOptions"
            density="comfortable"
            hide-details
            style="max-width: 130px"
          />
          <v-text-field
            v-model="contact.value"
            :placeholder="
              contact.label === 'إيميل' ? 'example@email.com' : '+218...'
            "
            density="comfortable"
            hide-details
            class="flex-grow-1"
          />
          <v-btn
            icon="mdi-close"
            size="small"
            variant="text"
            color="error"
            :disabled="form.contacts.length === 1"
            @click="removeContact(i)"
          />
        </div>
      </div>
    </div>

    <!-- ── Step 2: Result ────────────────────────────────────────── -->
    <div v-else class="text-center">
      <v-avatar
        color="success"
        variant="tonal"
        size="64"
        rounded="xl"
        class="mb-4"
      >
        <v-icon icon="mdi-check-circle-outline" size="34" color="success" />
      </v-avatar>
      <p class="text-body-2 text-medium-emphasis mb-4">
        تم توليد رابط المشاركة بنجاح. شارك هذا الرابط مع عملائك
      </p>

      <!-- الرابط -->
      <v-card
        class="pa-3 mb-4 text-start"
        color="surface"
        variant="outlined"
        rounded="lg"
      >
        <div class="d-flex align-center ga-2">
          <v-icon icon="mdi-link-variant" color="accent" size="18" />
          <span
            class="text-body-2 flex-grow-1"
            style="word-break: break-all; direction: ltr"
          >
            {{ generatedUrl }}
          </span>
        </div>
      </v-card>

      <div class="d-flex ga-3 justify-center">
        <v-btn
          :color="copied ? 'success' : 'accent'"
          :prepend-icon="copied ? 'mdi-check' : 'mdi-content-copy'"
          style="text-transform: none; font-weight: 600"
          @click="copyUrl"
        >
          {{ copied ? "تم النسخ!" : "نسخ الرابط" }}
        </v-btn>
        <v-btn
          variant="tonal"
          color="info"
          prepend-icon="mdi-open-in-new"
          style="text-transform: none"
          :href="generatedUrl!"
          target="_blank"
        >
          معاينة
        </v-btn>
      </div>
    </div>

    <!-- ── Actions ───────────────────────────────────────────────── -->
    <template #actions>
      <v-btn
        variant="text"
        color="secondary"
        style="text-transform: none"
        @click="close"
      >
        {{ step === "result" ? "إغلاق" : "إلغاء" }}
      </v-btn>
      <v-spacer />
      <v-btn
        v-if="step === 'form'"
        color="accent"
        :loading="loading"
        prepend-icon="mdi-share-variant"
        style="text-transform: none; font-weight: 600"
        @click="generate"
      >
        توليد الرابط
      </v-btn>
      <v-btn
        v-else
        variant="tonal"
        color="secondary"
        prepend-icon="mdi-refresh"
        style="text-transform: none"
        @click="reset"
      >
        توليد رابط جديد
      </v-btn>
    </template>
  </AppModal>
</template>

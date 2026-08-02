<script setup lang="ts">
import { reactive, ref, watch } from "vue";
import type { UserCreateDto, UserUpdateDto } from "../models/user.model";
import { USER_ROLES } from "../models/user.model";

const props = defineProps<{
  initialValue?: Partial<UserCreateDto>;
  mode: "create" | "edit";
  loading?: boolean;
}>();

const emit = defineEmits<{
  submit: [UserCreateDto | UserUpdateDto];
  cancel: [];
}>();

const formValid = defineModel<boolean>("valid", { default: false });

const form = reactive({
  username: props.initialValue?.username || "",
  email: props.initialValue?.email || "",
  password: "",
  role: props.initialValue?.role || "User",
  permissionIds: [],
});

const showPassword = ref(false);

watch(
  () => props.initialValue,
  (val) => {
    if (val) {
      form.username = val.username || "";
      form.email = val.email || "";
      form.role = val.role || "User";
    }
  },
);

const rules = {
  required: (v: string) => !!v || "هذا الحقل مطلوب",
  email: (v: string) => /.+@.+\..+/.test(v) || "البريد الإلكتروني غير صحيح",
  minLength: (n: number) => (v: string) =>
    v.length >= n || `يجب أن يكون ${n} أحرف على الأقل`,
};

function handleSubmit() {
  if (props.mode === "create") {
    emit("submit", { ...form } as UserCreateDto);
  } else {
    const { username, email, role } = form;
    emit("submit", { username, email, role } as UserUpdateDto);
  }
}
</script>

<template>
  <v-form v-model="formValid" @submit.prevent="handleSubmit">
    <v-row>
      <v-col cols="12" md="6">
        <v-text-field
          v-model="form.username"
          label="اسم المستخدم"
          prepend-inner-icon="mdi-account-outline"
          :rules="[rules.required, rules.minLength(3)]"
        />
      </v-col>

      <v-col cols="12" md="6">
        <v-text-field
          v-model="form.email"
          label="البريد الإلكتروني"
          type="email"
          prepend-inner-icon="mdi-email-outline"
          :rules="[rules.required, rules.email]"
        />
      </v-col>

      <v-col v-if="mode === 'create'" cols="12" md="6">
        <v-text-field
          v-model="form.password"
          label="كلمة المرور"
          :type="showPassword ? 'text' : 'password'"
          prepend-inner-icon="mdi-lock-outline"
          :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
          :rules="[rules.required, rules.minLength(6)]"
          @click:append-inner="showPassword = !showPassword"
        />
      </v-col>

      <v-col cols="12" md="6">
        <v-select
          v-model="form.role"
          label="الدور"
          :items="USER_ROLES"
          prepend-inner-icon="mdi-shield-account-outline"
          :rules="[rules.required]"
        />
      </v-col>

      <v-col cols="12" class="d-flex justify-end ga-3">
        <v-btn
          variant="tonal"
          color="secondary"
          style="text-transform: none"
          @click="emit('cancel')"
        >
          إلغاء
        </v-btn>
        <v-btn
          type="submit"
          color="accent"
          :loading="loading"
          :disabled="!formValid"
          style="text-transform: none; font-weight: 600"
        >
          {{ mode === "create" ? "إضافة المستخدم" : "حفظ التعديلات" }}
        </v-btn>
      </v-col>
    </v-row>
  </v-form>
</template>

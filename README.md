# 🚗 Car Dealer Management System — Frontend

واجهة مستخدم (Frontend) لنظام إدارة معارض السيارات، مبنية وفق المواصفات الكاملة الموجودة في
`Frontend Specification - Car Dealer Management System.docx`.

## 🧰 التقنيات المستخدمة

- **Vue 3** (Composition API + `<script setup>`)
- **TypeScript**
- **Vuetify 3** (مكونات UI جاهزة، مع تخصيص الثيم)
- **Tailwind CSS** (utility classes تكميلية مع Vuetify، `preflight` معطّل لتجنب التعارض)
- **MDI Icons** (`@mdi/font`)
- **@vueuse/motion** (أنيميشن: Fade In / Slide Up / Hover)
- **Vue Router 4** + **Pinia** (State Management)
- **Axios** (API Calls + JWT Interceptors)

## 🎨 الهوية البصرية

| العنصر | القيمة |
| --- | --- |
| Primary (Navy Dark) | `#0D1B2A` |
| Secondary (Dark Blue) | `#1B263B` |
| Accent (Gold) | `#D4AF37` |
| Gray | `#6C757D` |
| Background Light | `#F5F7FA` |
| الخط | Cairo (Google Fonts) |

يدعم المشروع **Dark Mode** كامل عبر زر تبديل في الـ Topbar، متزامن مع ثيم Vuetify ومتغيرات CSS، ويُحفظ الاختيار في `localStorage`.
الواجهة بالكامل **RTL** (`dir="rtl"` + `vuetify rtl: true`).

## 🧱 هيكلية المشروع (Feature-Based)

```
src/
├── core/                 # عناصر مشتركة لكل المشروع
│   ├── api/               # Axios instance + interceptors
│   ├── router/            # Vue Router + Auth Guard
│   ├── store/             # Global stores (UI: dark mode, sidebar)
│   ├── layouts/           # MainLayout, AuthLayout, Sidebar, Topbar
│   ├── plugins/           # Vuetify, Motion
│   └── utils/              # Formatters (currency, date, profit)
│
├── features/              # كل ميزة معزولة بالكامل
│   ├── cars/               # CRUD + صور + فلترة + بحث
│   ├── customers/
│   ├── sales/
│   ├── maintenances/
│   ├── transactions/
│   ├── dashboard/
│   └── auth/                # JWT Login + Route Guards
│       └── (components | pages | models | services | store | routes.ts)
│
├── shared/                  # مكونات قابلة لإعادة الاستخدام
│   └── components/          # AppButton, AppCard, AppInput, AppModal
│
└── assets/styles/main.css   # Tailwind + Cairo font + CSS variables
```

كل Feature مستقل تمامًا (لا تعتمد على غيرها مباشرة)، ويتواصل فقط عبر الـ API.

## 🔌 ربط الـ Backend

ضع رابط الـ API في ملف `.env` (انظر `.env.example`):

```
VITE_API_BASE_URL=https://localhost:5001/api
```

نقاط النهاية (Endpoints) المستخدمة مطابقة تمامًا للمواصفات: `/api/cars`, `/api/cars/{id}/images`,
`/api/customers`, `/api/sales`, `/api/maintenances/car/{carId}`, `/api/auth/login`.

## ▶️ التشغيل

```bash
npm install
npm run dev      # تشغيل بيئة التطوير على http://localhost:5173
npm run build    # بناء نسخة الإنتاج (type-check + vite build)
npm run preview  # معاينة نسخة الإنتاج
```

## ✅ الحالة الحالية

- الهيكلية الكاملة وفق المواصفات (core / features / shared).
- صفحات: Dashboard, Cars (List/Add/Details), Customers, Sales, Maintenances, Transactions, Login.
- Stores (Pinia) و Services (Axios) لكل Feature، جاهزة للربط الفعلي مع .NET API.
- Dark Mode + Sidebar + Topbar + أنيميشن دخول للصفحات والبطاقات.
- `npm run build` يعمل بدون أي أخطاء (type-check ناجح 100%).

### 🧪 خطوات لاحقة مقترحة

- ربط نقاط النهاية الفعلية بدل بيانات الـ Dashboard التجريبية (fallback demo data).
- إضافة Pagination فعلي لجدول السيارات/العملاء عند ربط الباك اند.
- إضافة Unit Tests (Vitest) للـ stores والـ composables.

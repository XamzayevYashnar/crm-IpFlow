# BACKEND_MAP

Format: SAHIFA → API → METHOD → MAQSAD → PERMISSION

Baza URL: `http://localhost:3010/api/v1` (`.env`dagi `PORT`ga qarab o'zgaradi)

## Ishlaydigan (real, Prisma bilan bog'langan)

| Sahifa | API | Method | Maqsad | Permission |
|---|---|---|---|---|
| Login (1-qadam) | /auth/sign/in | POST | Email+parol tekshirish, OTP yuborish | ochiq |
| Login (2-qadam) | /auth/verify/otp | POST | OTP tasdiqlash, cookie o'rnatish | ochiq |
| — | /auth/refresh | POST | accessToken yangilash (refreshToken cookie orqali) | ochiq |
| Materiallar | /material | GET/POST | Materiallar ro'yxati / qo'shish | himoyasiz (guard yo'q) |
| Materiallar | /material/:id | GET/PATCH/DELETE | Bitta material bilan ishlash | himoyasiz (guard yo'q) |
| Ombor → Kirim/Chiqim | /movement | GET/POST | Harakatlar ro'yxati / yangi kirim-chiqim (balans avtomatik yangilanadi) | himoyasiz (guard yo'q) |
| Ombor → Kirim/Chiqim | /movement/:id | GET/PATCH/DELETE | Bitta harakat (PATCH faqat `reason`ni o'zgartiradi) | himoyasiz (guard yo'q) |
| Xodimlar | /admin | GET/POST | Xodimlar ro'yxati (SUPER_ADMIN rolidagilar chiqarib tashlanadi) / yangi xodim | **SUPER_ADMIN** (guard ishlaydi) |
| Xodimlar | /admin/:id | GET/PATCH/DELETE | Bitta xodim (DELETE = soft, statusni BLOCKED qiladi) | **SUPER_ADMIN** (guard ishlaydi) |

## Skelet/muammoli

| Sahifa | Holat |
|---|---|
| Rollar ro'yxati | `roleId` yuborish uchun rollarni tanlash imkoni yo'q — API mavjud emas ([BACKEND_ISSUES.md](./BACKEND_ISSUES.md) #2) |

## Umuman yo'q (Prisma modeli bor, controller yo'q)

| Sahifa | Kutilayotgan modul |
|---|---|
| Davomat | attendance |
| Modellar | product-model |
| Operatsiyalar | operation |
| Mijozlar | customer |
| Buyurtmalar | order |
| Partiyalar | order-batch |
| Ishlab chiqarish | work-assignment |
| Ruxsatlar (UI) | Permission/UserRole schema'da bor, boshqarish uchun endpoint yo'q |

To'liq muammolar ro'yxati va sabablari: [BACKEND_ISSUES.md](./BACKEND_ISSUES.md)

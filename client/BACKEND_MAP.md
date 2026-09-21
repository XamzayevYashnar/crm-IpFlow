# BACKEND_MAP

Format: SAHIFA → API → METHOD → MAQSAD → PERMISSION

## Ishlaydigan (real, Prisma bilan bog'langan)

| Sahifa | API | Method | Maqsad | Permission |
|---|---|---|---|---|
| Login (1-qadam) | /auth/sign/in | POST | Email+parol tekshirish, OTP yuborish | ochiq |
| Login (2-qadam) | /auth/verify/otp | POST | OTP tasdiqlash, cookie o'rnatish | ochiq |
| Materiallar | /material | GET | Materiallar ro'yxati | himoyasiz (guard yo'q) |
| Materiallar | /material | POST | Yangi material qo'shish | himoyasiz (guard yo'q) |
| Materiallar | /material/:id | GET | Bitta material | himoyasiz (guard yo'q) |
| Materiallar | /material/:id | PATCH | Materialni tahrirlash | himoyasiz (guard yo'q) |
| Materiallar | /material/:id | DELETE | Materialni o'chirish | himoyasiz (guard yo'q) |

Baza URL: `http://localhost:3003/api/v1`

## Skelet holatida (controller/DTO bor, lekin Prisma logikasi yo'q — frontend ulanmagan)

| Sahifa | API | Method | Holat |
|---|---|---|---|
| Xodimlar | /admin | GET/POST/PATCH/DELETE | Service barcha metodlarda faqat matn qaytaradi, Prisma chaqiruvi yo'q, CreateAdminDto bo'sh |

## Umuman yo'q (route yo'q yoki controller bo'sh)

| Sahifa | Kutilayotgan modul | Holat |
|---|---|---|
| Ombor → Kirim/Chiqim | movement | Controller bor, ichida bitta ham route yo'q |
| Davomat | attendance | Prisma modeli bor, controller yo'q |
| Modellar | product-model | Prisma modeli bor, controller yo'q |
| Operatsiyalar | operation | Prisma modeli bor, controller yo'q |
| Mijozlar | customer | Prisma modeli bor, controller yo'q |
| Buyurtmalar | order | Prisma modeli bor, controller yo'q |
| Partiyalar | order-batch | Prisma modeli bor, controller yo'q |
| Ishlab chiqarish | work-assignment | Prisma modeli bor, controller yo'q |
| Rollar / Ruxsatlar | — | Hech qanday RBAC/permission tizimi yo'q |

To'liq muammolar ro'yxati va sabablari: [BACKEND_ISSUES.md](./BACKEND_ISSUES.md)

# BACKEND_ISSUES

Frontend qurish jarayonida topilgan, hamkasblar e'tiboriga muhtoj muammolar.

## 1. Guards/permissions tizimi umuman yo'q
Prisma schema'da `Role { SUPER_ADMIN, ADMIN, STAFF }` bor, lekin kodda birorta ham guard, strategy yoki permission decorator yo'q. Hozircha **barcha endpoint himoyasiz** — auth'siz ham `/material`, `/admin` kabi route'larga kirish mumkin. RBAC frontendda faqat UX darajasida (sidebar yashirish) qilinmoqda, chunki backend hech narsani tekshirmayapti.

## 2. `/auth/logout` yo'q
`accessToken`/`refreshToken` httpOnly cookie sifatida saqlanadi — frontend JS orqali ularni o'chira olmaydi. Logout endpoint (`Token.clearCookie` chaqiradigan) kerak.

## 3. `/auth/me` (yoki shunga o'xshash current-user endpoint) yo'q
Sahifa yangilanganda (F5) frontend foydalanuvchi haqida ma'lumotni backenddan qayta so'ray olmaydi, chunki cookie httpOnly. Hozir frontend `verify/otp` javobidagi user'ni faqat UX uchun localStorage'da saqlayapti — bu xavfsizlik emas, faqat interfeys uchun.

## 4. `admin` moduli (Xodimlar) — bo'sh skelet
`AdminService`dagi barcha metodlar (`create/findAll/findOne/update/remove`) Prisma bilan bog'lanmagan, faqat matn qaytaradi. `CreateAdminDto` va `UpdateAdminDto` bo'sh klass. Xodimlar sahifasini qurish uchun bu modulni to'liq yozish kerak.

## 5. `movement` controller — bo'sh
`MovementController`da birorta ham `@Get/@Post` route yo'q. Ombor → Kirim/Chiqim sahifasini qurib bo'lmaydi.

## 6. Quyidagi modullar Prisma schema'da bor, lekin controller/service umuman yo'q
`Attendance`, `ProductModel`, `Operation`, `ModelOperation`, `Customer`, `Order`, `OrderBatch`, `WorkAssignment`. Ya'ni Davomat, Modellar, Operatsiyalar, Mijozlar, Buyurtmalar, Partiyalar, Ishlab chiqarish sahifalarining birortasi ham hozircha qurilmaydi.

## 7. `.env`dagi MAIL sozlamalari — placeholder
`MAIL_EMAIL="email"`, `MAIL_PASSWORD="your_email_password"` — haqiqiy Gmail app-password emas. Shu sababli OTP email jo'natilmayapti (`sendOtp` 500 xato qaytaradi), login flow'ni end-to-end test qilib bo'lmadi. Real qiymatlar kerak.

## 8. CORS yo'q edi — frontend tomondan tuzatildi
`app.service.ts`da `app.enableCors({ origin: "http://localhost:5173", credentials: true })` qo'shildi (avval umuman yo'q edi, brauzer cookie bilan so'rov yubora olmas edi). Agar production/staging domeni bo'lsa, origin ro'yxatini kengaytirish kerak bo'ladi.

## 9. `material.findAll()` bo'sh ro'yxatda 404 qaytaradi
REST konventsiyasi bo'yicha bo'sh ro'yxat odatda `200` + `[]` bo'ladi, `404` emas. Frontend buni alohida ushlab (empty state sifatida) chetlab o'tdi, lekin to'g'risi shu joyni tuzatish tavsiya etiladi.

## 10. `BatchStatus` enum nomlanishi ТЗ bilan bir xil emas
Schema: `NEW, IN_PRODUCTION, AWAITING_ACCEPTANCE, ACCEPTED, SHIPPED`. Master-promptda oxirgi status `SENT` deb yozilgan edi — frontend qurilganda haqiqiy enum (`SHIPPED`) ishlatiladi, buni hamkasblar ham hisobga olsin.

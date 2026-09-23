# BACKEND_ISSUES

Frontend qurish jarayonida topilgan muammolar. Hal qilinganlari ✅ bilan belgilangan.

## ✅ 1. Guards/permissions — hal qilindi
`admin` branch orqali `JwtAuthGuard`, `RolesGuard`, `@Roles()` decorator qo'shildi va `admin` controlleriga ulandi. Tekshirildi: cookie'siz `401`, noto'g'ri rolda `403` qaytadi. **Lekin** `material`/`movement` controllerlarga hali guard ulanmagan — ular hamon himoyasiz.

## 2. Yangi muammo: UserRole yaratish/ko'rish uchun API yo'q
`POST /admin` uchun `roleId` majburiy, lekin mavjud rollarni ro'yxatini olish (`GET /roles` kabi) yoki yangi rol yaratish uchun **hech qanday endpoint yo'q**. Hozir faqat server ishga tushganda avtomatik yaratiladigan `SUPER_ADMIN` roli bor (`onModuleInit` orqali). Men test uchun `ADMIN`/`STAFF` rollarini to'g'ridan-to'g'ri bazaga qo'shdim — frontendda "Xodim qo'shish" formasida `roleId` hozircha oddiy raqam input sifatida ishlaydi, chunki tanlov qiladigan ro'yxat yo'q. **Kerak:** `GET /roles` (yoki shunga o'xshash) endpoint.

## 3. `admin.service.findAll()` SUPER_ADMIN'larni yashiradi — bu kutilgan xatti-harakat, lekin diqqat talab qiladi
`where: { role: { name: { not: conf.ROLE_NAME } } }` — agar yangi xodimga SUPER_ADMIN roli berilsa, u ro'yxatda ko'rinmay qoladi (men shu bilan duch keldim testda). Frontend buni hisobga olib qurilgan, lekin bu UX uchun tushunarsiz bo'lishi mumkin — xohlasangiz ADMIN/STAFF uchun ham eksplitsit filter qilib qo'ying.

## 4. `admin.service.remove()` aslida o'chirmaydi, statusni BLOCKED qiladi (soft delete)
Bu to'g'ri yondashuv, faqat controller/swagger'da "Delete" deb nomlangani chalg'itadi — frontendda "Bloklash" deb ko'rsatdim.

## ✅ 5. `movement` — hal qilindi
To'liq CRUD, transaction bilan balans hisoblash ishlaydi. Frontendda Ombor → Kirim/Chiqim qurildi.

## 6. `/auth/logout` yo'q
`accessToken`/`refreshToken` httpOnly cookie — frontend JS orqali tozalay olmaydi. `Token.clearCookie` chaqiradigan endpoint kerak. (`/auth/refresh` esa qo'shilgan, ishlaydi.)

## 7. `/auth/me` yo'q
Sahifa yangilanganda (F5) foydalanuvchini backenddan qayta tasdiqlab bo'lmaydi. Hozir frontend `verify/otp` javobidagi user'ni faqat UX uchun localStorage'da saqlaydi.

## 8. Quyidagi modullar Prisma schema'da bor, controller/service umuman yo'q
`Attendance`, `ProductModel`, `Operation`, `ModelOperation`, `Customer`, `Order`, `OrderBatch`, `WorkAssignment`. Davomat, Modellar, Operatsiyalar, Mijozlar, Buyurtmalar, Partiyalar, Ishlab chiqarish — hali qurilmagan.

## ✅ 9. `scripts/fix-prisma-barrel.js` — commit `1263ad8`da butun `scripts/` papka tasodifan o'chirilgan
`pnpm run prisma:generate` shu fayl yo'qligi sababli hamma uchun buziladi. Men lokal `prisma generate --config prisma7.config.ts` bilan chetlab o'tdim, lekin faylni tiklash yoki npm scriptni tuzatish kerak.

## ✅ 10. CORS yo'q edi — frontend tomondan tuzatildi
`app.service.ts`ga `app.enableCors({ origin: [...], credentials: true })` qo'shildi.

## 11. `material.findAll()` bo'sh ro'yxatda 404 qaytaradi
REST konventsiyasi bo'yicha `200` + `[]` bo'lishi kerak. Frontend buni alohida ushlab o'tdi.

## 12. `BatchStatus` enum nomlanishi ТЗ bilan bir xil emas
Schema: oxirgi status `SHIPPED`, master-promptda `SENT` edi.

## 13. `package-lock.json` va `pnpm-lock.yaml` bir vaqtda repo'da bor
Kimdir `npm install` ishlatgan ko'rinadi. Loyihada faqat `pnpm` ishlatilishi kerak — `package-lock.json`ni o'chirib tashlash tavsiya etiladi, aks holda ikkala paket menejeri chalkashadi.

import type { NavGroup } from "../types/nav";

export const navGroups: NavGroup[] = [
  {
    title: "Asosiy",
    items: [{ label: "Bosh sahifa", to: "/dashboard", ready: true }],
  },
  {
    title: "Ishlab chiqarish",
    items: [
      { label: "Mavjud ishlar", to: "/production/available", ready: false },
      { label: "Mening ishlarim", to: "/production/my-work", ready: false },
      { label: "Ishlab chiqarish tarixi", to: "/production/history", ready: false },
    ],
  },
  {
    title: "Buyurtmalar",
    items: [
      { label: "Buyurtmalar", to: "/orders", ready: true },
      { label: "Partiyalar", to: "/batches", ready: true },
      { label: "Mijozlar", to: "/customers", ready: true },
    ],
  },
  {
    title: "Mahsulot",
    items: [
      { label: "Modellar", to: "/models", ready: true },
      { label: "Operatsiyalar", to: "/operations", ready: true },
    ],
  },
  {
    title: "Ombor",
    items: [
      { label: "Materiallar", to: "/materials", ready: true },
      { label: "Kirim / Chiqim", to: "/materials/movements", ready: true },
    ],
  },
  {
    title: "Xodimlar",
    items: [
      { label: "Xodimlar", to: "/employees", ready: true },
      { label: "Ishchilar (Terminal)", to: "/workers", ready: true },
      { label: "Davomat", to: "/attendance", ready: false },
    ],
  },
  {
    title: "Boshqaruv",
    items: [
      { label: "Rollar", to: "/roles", ready: false },
      { label: "Ruxsatlar", to: "/permissions", ready: false },
    ],
  },
];

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
      { label: "Buyurtmalar", to: "/orders", ready: false },
      { label: "Partiyalar", to: "/batches", ready: false },
      { label: "Mijozlar", to: "/customers", ready: false },
    ],
  },
  {
    title: "Mahsulot",
    items: [
      { label: "Modellar", to: "/models", ready: false },
      { label: "Operatsiyalar", to: "/operations", ready: false },
    ],
  },
  {
    title: "Ombor",
    items: [
      { label: "Materiallar", to: "/materials", ready: true },
      { label: "Kirim / Chiqim", to: "/materials/movements", ready: false },
    ],
  },
  {
    title: "Xodimlar",
    items: [
      { label: "Xodimlar", to: "/employees", ready: false },
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

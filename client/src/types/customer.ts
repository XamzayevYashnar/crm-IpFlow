export interface Customer {
  id: number;
  name: string;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerFormValues {
  name: string;
  phone?: string;
}

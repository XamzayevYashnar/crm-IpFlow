export interface Operation {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OperationFormValues {
  name: string;
  description?: string;
}

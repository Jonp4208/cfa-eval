export interface Store {
  _id: string;
  name: string;
  storeNumber: string;
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

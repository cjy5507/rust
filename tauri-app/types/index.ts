export interface IStoreSettings {
  id?: string;
  store: string;
  startTime: string;
  visitDate: string;
  visitTime: string;
}

export interface IUserStoreSetting {
  email: string;
  password?: string;
  carrier: string;
  storeSettings: IStoreSettings[];
}

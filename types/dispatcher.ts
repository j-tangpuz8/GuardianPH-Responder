export type DispatcherType = "Guardian" | "LGU";

export interface Dispatcher {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dispatcherType: DispatcherType;
}

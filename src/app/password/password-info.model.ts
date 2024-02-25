export interface PasswordInfo {
  type: PasswordInfoType;
  title: string;
  description: string;
}

export enum PasswordInfoType {
  Achievement = 0,
  Info = 1,
  Warning = 2,
  Critical = 3,
  Easteregg = 4
}

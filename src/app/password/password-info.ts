export class PasswordInfo {
  constructor(public type: PasswordInfoType, public title: string, public description: string) {}
}

export enum PasswordInfoType {
  Achievement = 0,
  Info = 1,
  Warning = 2,
  Critical = 3,
  Easteregg = 4
}

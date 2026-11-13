export type UserRole = "sd" | "smp" | "guru";
export type AuthMode = "login" | "register";

export interface BaseUser {
  id: string;
  name: string;
  role: UserRole;
  token: string;
}

export interface SdUser extends BaseUser {
  role: "sd";
  nisn: string;
  grade: string;
  parentName: string;
}

export interface SmpUser extends BaseUser {
  role: "smp";
  nisn: string;
  grade: string;
  contact: string;
}

export interface GuruUser extends BaseUser {
  role: "guru";
  nuptkOrNip: string;
  subject: string;
  email: string;
}

export type AuthUser = SdUser | SmpUser | GuruUser;

export interface RegisterSdPayload {
  role: "sd";
  fullName: string;
  nisn: string;
  grade: string;
  parentName: string;
  password: string;
}

export interface RegisterSmpPayload {
  role: "smp";
  fullName: string;
  nisn: string;
  grade: string;
  contact: string;
  password: string;
}

export interface RegisterGuruPayload {
  role: "guru";
  fullNameWithTitle: string;
  nipOrNuptk: string;
  subject: string;
  email: string;
  password: string;
}

export type RegisterPayload = RegisterSdPayload | RegisterSmpPayload | RegisterGuruPayload;

export interface LoginPayload {
  role: UserRole;
  identifier: string;
  password: string;
}

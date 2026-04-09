export interface IRegisterUser {
  email: string;
  password: string;
  name: string;
  profileImage?: string;
}

export interface ILoginUser {
  email: string;
  password: string;
}

export interface ISocialAuth {
  firebaseUid: string;
  email: string;
  name: string;
  profileImage?: string;
}
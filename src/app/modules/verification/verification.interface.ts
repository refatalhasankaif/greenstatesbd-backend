import { VerificationStatus } from "../../../generated/prisma/enums";

export interface ICreateVerificationRequest {
  documentUrl: string;
  note?: string;
}

export interface IUpdateVerificationStatus {
  status: VerificationStatus;
}
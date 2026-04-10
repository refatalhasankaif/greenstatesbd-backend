import { Division, PropertyType } from "../../../generated/prisma/enums";

export interface IUpdatePropertyPayload {
  title?: string;
  description?: string;
  basePrice?: number;
  location?: Division;
  address?: string;
  type?: PropertyType;
}
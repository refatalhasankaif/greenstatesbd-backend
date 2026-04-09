import { z } from "zod";
import { ReportType, ReportStatus } from "../../../generated/prisma/enums";

const createReportValidation = z.object({
    body: z.object({
        propertyId: z.string().uuid(),
        type: z.nativeEnum(ReportType),
        message: z.string().optional(),
    }),
});

const updateReportStatusValidation = z.object({
    body: z.object({
        status: z.nativeEnum(ReportStatus),
    }),
});

export const reportValidation = {
    createReportValidation,
    updateReportStatusValidation,
};
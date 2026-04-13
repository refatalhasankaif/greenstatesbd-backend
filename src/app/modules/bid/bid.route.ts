import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { Role } from "../../../generated/prisma/enums";
import { bidValidation } from "./bid.validation";
import { bidController } from "./bid.controller";

const router = Router();

router.post(
    "/",
    checkAuth(Role.USER),
    validateRequest(bidValidation.createBidValidation),
    bidController.createBid
);

router.get(
    "/me",
    checkAuth(Role.USER),
    bidController.getMyBids
);

router.get(
    "/:id",
    checkAuth(Role.USER),
    bidController.getBidById
);

router.patch(
    "/:id/accept",
    checkAuth(Role.USER),
    bidController.acceptBid
);

router.get(
    "/property/:id",
    bidController.getBidsByProperty
);

router.get(
    "/",
    checkAuth(Role.ADMIN, Role.MANAGER),
    bidController.getAllBids
);

router.patch(
    "/:id/status",
    checkAuth(Role.ADMIN, Role.MANAGER),
    bidController.updateBidStatus
);

router.patch(
    "/close/:id",
    checkAuth(Role.ADMIN, Role.MANAGER),
    bidController.closeBidding
);

export const bidRoutes = router;
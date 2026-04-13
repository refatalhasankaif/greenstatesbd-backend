import { Router } from "express";
import { galleryController } from "./gallery.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import multer from "multer";

const upload = multer({ dest: "uploads/" });

const router = Router();

router.post(
    "/",
    checkAuth(Role.USER),
    upload.single("image"),
    galleryController.createGallery
);

router.get("/", galleryController.getAllGallery);

router.get(
    "/me",
    checkAuth(Role.USER),
    galleryController.getMyGallery
);

router.get(
    "/liked",
    checkAuth(Role.USER),
    galleryController.getLikedIds
);

router.delete(
    "/:id",
    checkAuth(Role.USER, Role.ADMIN),
    galleryController.deleteGallery
);

router.patch(
    "/:id/block",
    checkAuth(Role.ADMIN, Role.MODERATOR),
    galleryController.toggleBlockGallery
);

router.post(
    "/:id/like",
    checkAuth(Role.USER),
    galleryController.likeGallery
);

export const galleryRoutes = router;
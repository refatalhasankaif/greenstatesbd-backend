import { prisma } from "../../lib/prisma";
import { uploadToCloudinary } from "../../utils/uploadToCloudinary";

export const createProperty = async (req: any) => {
  const user = req.user;
  const files = req.files as Express.Multer.File[];

  // upload images (max 5)
  const uploadedImages = await Promise.all(
    files.slice(0, 5).map((file) => uploadToCloudinary(file))
  );

  const imageUrls = uploadedImages.map((img: any) => img.secure_url);

  const property = await prisma.property.create({
    data: {
      title: req.body.title,
      description: req.body.description,
      basePrice: Number(req.body.basePrice),

      location: req.body.location,
      address: req.body.address,

      type: req.body.type,

      biddingStart: req.body.biddingStart
        ? new Date(req.body.biddingStart)
        : null,
      biddingEnd: req.body.biddingEnd
        ? new Date(req.body.biddingEnd)
        : null,

      ownerId: user.id,

      images: {
        create: imageUrls.map((url: string) => ({
          url,
        })),
      },
    },
    include: {
      images: true,
    },
  });

  return property;
};
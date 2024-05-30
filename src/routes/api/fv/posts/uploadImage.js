import AdvancedHandler from "@lib/AdvancedServer/AdvancedHandler";
import AdvancedRouter from "@lib/AdvancedServer/AdvancedRouter";
import isAuthenticated from "middleware/isAuthenticated";
import upload from "config/multer_config";
import sharp from "sharp";
import { uploadToS3 } from "config/multer_config";

const router = new AdvancedRouter();
router.middleware.POST([isAuthenticated, upload.single("image")]);
const allowedFileMimeTypes = [
  "image/jpeg",
  "image/avif",
  "image/png",
  "image/webp",
  "image/tiff",
];
router.POST(
  new AdvancedHandler().route(async (req, res) => {
    if (!allowedFileMimeTypes.includes(req.file.mimetype)) {
      res.status(400).json({
        error: `Invalid file format. Allowed types are ${allowedFileMimeTypes.join(
          ", "
        )}`,
      });
      return;
    }
    const resizedBuffer = await new Promise((res, rej) =>
      sharp(req.file.buffer)
        .resize({
          width: 500,
          height: 500,
          fit: "inside",
          withoutEnlargement: true,
        })
        .toFormat("jpeg")
        .toBuffer((err, data, info) => {
          if (err) {
            rej(err);
          }

          res(data);
        })
    );

    const imageLocation = await uploadToS3(resizedBuffer, "posts/");
    res.json({ imageLocation });
  })
);

export default router;

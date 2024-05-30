import multer from "multer";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  region: "eu-central-1",
});

const upload = multer({
  // storage: multerS3({
  //   s3,
  //   bucket: "forexview",
  //   metadata: function (req, file, cb) {
  //     cb(null, { fieldName: file.fieldname });
  //   },
  //   key: function (req, file, cb) {
  //     const fileExtension = file.originalname.split(".").pop();
  //     const uniqueKey = Date.now().toString() + "." + fileExtension;
  //     cb(null, uniqueKey);
  //   },
  // }),
  // contentType: multerS3.AUTO_CONTENT_TYPE,
  // acl: "public-read", // Allow read permission to be public
  // limits: {
  //   fileSize: 1000000, //maximux size for uploading 1mb
  // },
  // fileFilter: function (req, file, cb) {
  //   //filter out the file that we doesn't want to upload
  //   if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
  //     // only valid image formats are allowed to upload
  //     return cb(new Error("Invalid file format!"));
  //   }
  //   cb(undefined, true); //pass 'flase' if u want to reject upload
  // },
});

const uploadToS3 = async (file, folder) => {
  const uniqueKey = folder + Date.now().toString() + ".jpg";
  const uploadParams = {
    Bucket: "forexview",
    Key: uniqueKey,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  try {
    await s3.send(new PutObjectCommand(uploadParams));
    return `https://forexview.s3.eu-central-1.amazonaws.com/` + uniqueKey;
  } catch (error) {
    console.error("Error uploading file to S3:");
    throw error;
  }
};

export default upload;
export { uploadToS3 };

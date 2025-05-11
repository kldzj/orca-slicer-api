import multer from "multer";

const storage = multer.memoryStorage();

export const uploadJson = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/json") {
      console.error("Invalid file type");
      return cb(null, false);
    }
    cb(null, true);
  },
  limits: { fileSize: 4_000_000 },
});

export const uploadModel = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ["model/stl", "application/step", "model/3mf"];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      console.error("Invalid file type");
      return cb(null, false);
    }
    cb(null, true);
  },
  limits: { fileSize: 100_000_000 },
});

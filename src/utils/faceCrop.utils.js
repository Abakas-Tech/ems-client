// Client-side face detection + passport-style 3:4 crop, used by the Worker
// Form (Personal Information) to build "Photo 3x4" from the "Photo
// Standing" upload. Everything runs in the browser: the photo is never sent
// anywhere for detection.
//
// Detection uses MediaPipe Tasks Vision (BlazeFace full-range model, made
// for faces further from the camera, as in a standing photo). The Wasm
// runtime and the model are bundled with the app and only downloaded the
// first time a photo is processed.
import wasmLoaderPath from "@mediapipe/tasks-vision/vision_wasm_internal.js?url";
import wasmBinaryPath from "@mediapipe/tasks-vision/vision_wasm_internal.wasm?url";
import noSimdLoaderPath from "@mediapipe/tasks-vision/vision_wasm_nosimd_internal.js?url";
import noSimdBinaryPath from "@mediapipe/tasks-vision/vision_wasm_nosimd_internal.wasm?url";
import faceModelPath from "../assets/models/blaze_face_full_range.tflite?url";

// Output: 3:4 portrait at the Standing Photo's own resolution — the crop is
// copied pixel for pixel (never enlarged, which is what made it blurry),
// in the same format as the original (PNG stays PNG, anything else is a
// high-quality JPEG). Only very large crops are scaled down, to this
// height, to keep the upload size reasonable.
const MAX_OUTPUT_HEIGHT = 2400;
const JPEG_QUALITY = 0.95;

// Framing with padding around the person. The detector's box covers
// roughly brow-to-chin; at ~22% of the photo height the head (with hair)
// is about a third of the photo, with space above the head and the
// shoulders and upper body below — not a tight close-up of the face. The
// face center sits at 32% from the top.
const FACE_HEIGHT_RATIO = 0.22;
const FACE_CENTER_Y = 0.32;

const MIN_CONFIDENCE = 0.5;

// In a full-length standing photo the face is small, so if nothing is
// found on the whole image the top part (where the head is) is searched
// again, enlarged. Regions are fractions of the image height from the top.
const SEARCH_REGIONS = [1, 0.55, 0.35];

let detectorPromise = null;

const getFaceDetector = () => {
  if (!detectorPromise) {
    detectorPromise = (async () => {
      const { FaceDetector, FilesetResolver } = await import(
        "@mediapipe/tasks-vision"
      );
      const simd = await FilesetResolver.isSimdSupported();
      const fileset = simd
        ? { wasmLoaderPath, wasmBinaryPath }
        : {
            wasmLoaderPath: noSimdLoaderPath,
            wasmBinaryPath: noSimdBinaryPath,
          };
      return FaceDetector.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: faceModelPath, delegate: "CPU" },
        runningMode: "IMAGE",
        minDetectionConfidence: MIN_CONFIDENCE,
      });
    })().catch((error) => {
      detectorPromise = null; // allow a retry on the next photo
      throw error;
    });
  }
  return detectorPromise;
};

// Decodes the file into an <img> (browsers apply the EXIF orientation, so
// phone photos come out upright).
const loadImage = (file) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("The photo could not be read"));
    };
    img.src = url;
  });

const detectFaces = async (detector, img) => {
  const width = img.naturalWidth;
  const height = img.naturalHeight;

  for (const fraction of SEARCH_REGIONS) {
    let source = img;
    let regionHeight = height;

    if (fraction < 1) {
      regionHeight = Math.round(height * fraction);
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = regionHeight;
      canvas.getContext("2d").drawImage(img, 0, 0);
      source = canvas;
    }

    const { detections = [] } = detector.detect(source);
    const faces = detections
      .filter((d) => d.boundingBox)
      .filter((d) => (d.categories?.[0]?.score ?? 1) >= MIN_CONFIDENCE)
      .map((d) => d.boundingBox);

    if (faces.length > 0) return faces;
  }
  return [];
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

// 3:4 crop around one face box, kept inside the image.
const cropAroundFace = (box, imageWidth, imageHeight) => {
  let cropHeight = box.height / FACE_HEIGHT_RATIO;
  let cropWidth = (cropHeight * 3) / 4;

  // Too big for the photo (e.g. a close-up): the largest 3:4 area that fits
  if (cropWidth > imageWidth) {
    cropWidth = imageWidth;
    cropHeight = (cropWidth * 4) / 3;
  }
  if (cropHeight > imageHeight) {
    cropHeight = imageHeight;
    cropWidth = (cropHeight * 3) / 4;
  }

  const centerX = box.originX + box.width / 2;
  const centerY = box.originY + box.height / 2;

  return {
    x: clamp(centerX - cropWidth / 2, 0, imageWidth - cropWidth),
    y: clamp(centerY - cropHeight * FACE_CENTER_Y, 0, imageHeight - cropHeight),
    width: cropWidth,
    height: cropHeight,
  };
};

const canvasToFile = (canvas, name, type) =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob
          ? resolve(new File([blob], name, { type }))
          : reject(new Error("The 3x4 photo could not be created")),
      type,
      type === "image/jpeg" ? JPEG_QUALITY : undefined,
    );
  });

/*
 * Builds a passport-style 3:4 photo from a standing photo.
 * Resolves to:
 *   { status: "ok", file }        — exactly one face; `file` is a JPEG
 *   { status: "no_face" }         — no face found
 *   { status: "multiple_faces", count } — more than one person
 * Rejects if the detector or the image can't be loaded.
 * The original file is never modified.
 */
export const generatePhoto3x4FromStanding = async (standingFile) => {
  const [detector, img] = await Promise.all([
    getFaceDetector(),
    loadImage(standingFile),
  ]);

  const faces = await detectFaces(detector, img);
  if (faces.length === 0) return { status: "no_face" };
  if (faces.length > 1) {
    return { status: "multiple_faces", count: faces.length };
  }

  const crop = cropAroundFace(faces[0], img.naturalWidth, img.naturalHeight);

  // Whole pixels, exact 3:4, never larger than the crop itself (no
  // enlarging), so the proportions and sharpness match the original.
  const cropX = Math.floor(crop.x);
  const cropY = Math.floor(crop.y);
  const cropWidth = Math.floor(crop.width / 3) * 3;
  const cropHeight = (cropWidth / 3) * 4;
  const scale = Math.min(1, MAX_OUTPUT_HEIGHT / cropHeight);
  const outWidth = Math.floor((cropWidth * scale) / 3) * 3;
  const outHeight = (outWidth / 3) * 4;

  const canvas = document.createElement("canvas");
  canvas.width = outWidth;
  canvas.height = outHeight;
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = scale < 1;
  ctx.imageSmoothingQuality = "high";
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, outWidth, outHeight);
  ctx.drawImage(
    img,
    cropX,
    cropY,
    cropWidth,
    cropHeight,
    0,
    0,
    outWidth,
    outHeight,
  );

  const isPng = standingFile.type === "image/png";
  const type = isPng ? "image/png" : "image/jpeg";
  const baseName = (standingFile.name || "photo").replace(/\.[^.]+$/, "");
  const file = await canvasToFile(
    canvas,
    `${baseName}_3x4.${isPng ? "png" : "jpg"}`,
    type,
  );
  return { status: "ok", file };
};

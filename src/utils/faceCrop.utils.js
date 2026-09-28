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

// Output: 600×800 JPEG (3:4 portrait).
const OUTPUT_WIDTH = 600;
const OUTPUT_HEIGHT = 800;
const OUTPUT_QUALITY = 0.92;

// Framing. The detector's box covers roughly brow-to-chin, so a box
// height of ~35% of the photo gives a head (with hair) of a bit under half
// the photo, with the shoulders/upper chest below — a passport-style
// framing that also leaves room for hair on full-length photos. The face
// center sits a little above the middle of the photo.
const FACE_HEIGHT_RATIO = 0.35;
const FACE_CENTER_Y = 0.45;

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

const canvasToFile = (canvas, name) =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob
          ? resolve(new File([blob], name, { type: "image/jpeg" }))
          : reject(new Error("The 3x4 photo could not be created")),
      "image/jpeg",
      OUTPUT_QUALITY,
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

  const canvas = document.createElement("canvas");
  canvas.width = OUTPUT_WIDTH;
  canvas.height = OUTPUT_HEIGHT;
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT);
  ctx.drawImage(
    img,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    OUTPUT_WIDTH,
    OUTPUT_HEIGHT,
  );

  const baseName = (standingFile.name || "photo").replace(/\.[^.]+$/, "");
  const file = await canvasToFile(canvas, `${baseName}_3x4.jpg`);
  return { status: "ok", file };
};

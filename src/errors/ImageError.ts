export class ImageError extends Error {
  message = "File is not an image";
  code = "file:notimage";
}

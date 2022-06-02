export class SavingFileError extends Error {
  message = "Error while saving images on the server";
  code = "server:filesaving";
}

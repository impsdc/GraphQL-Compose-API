export class NotFoundError extends Error {
  message = "Item not found";
  code = "item:notfound";
}

export class NotLoggedError extends Error {
  message = "You aren't logged in";
  code = "login:not";
}

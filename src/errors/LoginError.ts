export class LoginError extends Error {
  message = "Incorrect password or username";
  code = "login:incorrect";
}

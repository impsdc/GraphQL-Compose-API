export class RoleError extends Error {
  message = "You don't have the required role for this action";
  code = "role:incorrect";
}

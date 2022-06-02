import { Context, Next } from "graphql-composer";
import { ApolloError } from "apollo-server";

export async function verifyJwt(args, context: Context, next: Next) {
  if (!context.context.token)
    throw new ApolloError("No token provided", "token:not(received)");

  if (!context.context.user)
    throw new ApolloError("Unauthorized", "token:not(comply)");
  console.log(context.context.user);
  await next();
}

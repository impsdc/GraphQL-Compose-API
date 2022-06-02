import { ObjectType, Field } from "graphql-composer-decorators";
import { User } from "../models/User";
import { sign } from "jsonwebtoken";

export interface LoggedInfos {
  username: string;
  id: string;
}

@ObjectType()
export class Logged {
  @Field()
  token: string;

  @Field()
  user: User;

  constructor(user: User) {
    const loggedInfos: LoggedInfos = {
      username: user.username,
      id: user.id,
    };

    const token = sign(loggedInfos, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    this.token = token;
    this.user = user;
  }
}

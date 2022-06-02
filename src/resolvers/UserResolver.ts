import {
  Query,
  Mutation,
  Arg,
  Resolver,
  Args,
  Middlewares,
} from "graphql-composer-decorators";
import { ArgsFactory, Parser } from "graphql-composer-typeorm";
import { KeyValue, Context } from "graphql-composer";
import { ApolloError } from "apollo-server";
import { User } from "../models/User";
import { CRUD } from "../classes/CRUD";
import { Logged } from "../responses/Logged";
import { compare } from "bcrypt";
import { createQueryBuilder } from "typeorm";

const args = ArgsFactory.create(User);
const parser = new Parser(User, args);

@Resolver()
export class UserResolver {
  crud: CRUD<typeof User>;

  constructor() {
    this.crud = new CRUD(User);
  }

  private isUsernameInvalid(username: string) {
    const match = /^([a-z]|_|[0-9])+$/g;
    return !match.test(username);
  }

  // private isPasswordInvalid(password: string) {
  //   const match = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
  //   return !match.test(password);
  // }

  @Query((type) => [User])
  async getUsers(@Args(args) _: KeyValue, context: Context) {
    const query = await parser.buildQuery(context);
    return query.getMany();
  }

  @Query((type) => User)
  async getUser(@Args(args) _: KeyValue, context: Context) {
    const query = await parser.buildQuery(context);
    const user = await query.getOne();
    if (!user)
      throw new ApolloError("This user doesn't exists", "user:not(found)");
    return query.getOne();
  }

  @Mutation((type) => User)
  async register(
    @Arg("username") username: string,
    @Arg("password") password: string,
  ) {
    if (username !== undefined && username.length > 3 && username.length > 40) {
      throw new ApolloError(
        "The name is too big (max 40)",
        "name:toobig:max(40)|min(3)",
      );
    }

    if (this.isUsernameInvalid(username)) {
      throw new ApolloError(
        "Your username is invalid",
        "username:invalid:lower|char(_)|number(0,9)",
      );
    }

    // if (this.isPasswordInvalid(password)) {
    //   throw new ApolloError(
    //     "Your password is invalid",
    //     "password:invalid:min(8)|required(upper,lower,number)",
    //   );
    // }

    const user = await User.init(username, password);

    const alreadyExistsUsername = await User.findOne({ username });
    if (alreadyExistsUsername) {
      throw new ApolloError("This username is already in use", "username:dup");
    }

    try {
      await user.save();
    } catch (err) {
      if (err.code === "ER_DUP_ENTRY") {
        throw new ApolloError(
          "Error while creating your account",
          "user:error",
        );
      }
    }

    return user;
  }

  @Mutation((type) => Logged)
  async login(
    @Arg("username") username: string,
    @Arg("password") password: string,
  ) {
    const err = new ApolloError("This user doesn't exists", "user:not(found)");

    const user = await createQueryBuilder(User, "u")
      .where("u.username = :username", {
        username: username,
      })
      .orWhere("u.username = :username", { username: username })
      .getOne();

    if (!user) {
      throw err;
    }

    const passwordOk = await compare(password, user.password);

    if (!passwordOk) {
      throw err;
    }

    return new Logged(user);
  }

  @Query()
  refreshToken(): User {
    return undefined;
  }

  @Mutation(() => User)
  async updateUser(@Args() user: User) {
    const isUser = await User.findOne(user.id);
    if (!isUser)
      throw new ApolloError("This user doesn't exists", "user:not(found)");
    const alreadyExistsUsername = await User.findOne({
      where: {
        username: user.username,
      },
    });
    if (alreadyExistsUsername)
      throw new ApolloError("This username is already in use", "username:dup");

    isUser.username = user.username;

    try {
      await isUser.save();
      return isUser;
    } catch (err) {
      console.log(err);
    }
  }

  @Mutation((type) => User)
  async deleteUser(@Arg("id") id: string) {
    const exists = await User.findOne(id);
    if (!exists)
      throw new ApolloError("This user doesn't exists", "data:notfound");
    await this.crud.delete(id);
    return exists;
  }
}

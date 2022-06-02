import {
  Resolver,
  Query,
  Arg,
  Args,
  Mutation,
  Middlewares,
} from "graphql-composer-decorators";
import { ArgsFactory, Parser } from "graphql-composer-typeorm";
import { Tag } from "../models/Tag";
import { Album } from "../models/Album";
import { ApolloError } from "apollo-server";
import { CRUD } from "../classes/CRUD";
import { KeyValue, Context } from "graphql-composer";
import { verifyJwt } from "../middlewares/JwtMiddleware";

const args = ArgsFactory.create(Tag);
const parser = new Parser(Tag, args);

@Resolver()
export class TagResolver {
  crud: CRUD<typeof Tag>;

  constructor() {
    this.crud = new CRUD(Tag);
  }

  @Middlewares(verifyJwt)
  @Query((type) => [Tag])
  async getTags(@Args(args) _: KeyValue, context: Context) {
    const query = await parser.buildQuery(context);
    const tag = await query.getMany();
    return tag;
  }

  @Query((type) => Tag)
  async getTag(@Args(args) _: KeyValue, context: Context) {
    const query = await parser.buildQuery(context);
    const tag = await query.getOne();
    return tag;
  }

  //   @Mutation(() => Tag)
  //   async updateTag(@Args() tag: Tag) {
  //     try {
  //       const tagCreated = await this.crud.update(tag);
  //       return tagCreated;
  //     } catch (err) {
  //       console.log(err);
  //     }
  //   }

  //   @Mutation((type) => Tag)
  //   async deleteTag(@Arg("id") id: string) {
  //     const exists = await Tag.findOne(id);
  //     if (!exists)
  //       throw new ApolloError("This tag doesn't exists", "data:notfound");

  //     await this.crud.delete(id);
  //     return exists;
  //   }
}

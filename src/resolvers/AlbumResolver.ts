import {
  Resolver,
  Query,
  Arg,
  Args,
  Mutation,
  Middlewares,
} from "graphql-composer-decorators";
import { ArgsFactory, Parser } from "graphql-composer-typeorm";
import { Album } from "../models/Album";
import { User } from "../models/User";
import { ApolloError } from "apollo-server";
import { CRUD } from "../classes/CRUD";
import { KeyValue, Context } from "graphql-composer";
import { verifyJwt } from "../middlewares/JwtMiddleware";
import { checkAccessData, TagCheck } from "../classes/Utils";
import * as merge from "lodash.merge";
import { ALL } from "dns";

const args = ArgsFactory.create(Album);
const parser = new Parser(Album, args);

@Middlewares(verifyJwt)
@Resolver()
export class AlbumResolver {
  crud: CRUD<typeof Album>;

  constructor() {
    this.crud = new CRUD(Album);
  }

  @Query((type) => [Album])
  async getAlbums(@Args(args) _: KeyValue, context: Context) {
    const query = await parser.buildQuery(context);
    const album = await query.getMany();
    if (album.length == 0) return album;
    // if (!context.rawArgs.where.readable)
    //   checkAccessData(context.context.user.id, album[0].user.id);
    return album;
  }

  @Query((type) => Album)
  async getAlbum(@Args(args) _: KeyValue, context: Context) {
    const query = await parser.buildQuery(context);
    const album = await query.getOne();
    if (!album)
      throw new ApolloError("This album doesn't exists", "album:not(found)");
    if (!context.rawArgs.where.readable)
      checkAccessData(context.context.user.id, album.user.id);
    return album;
  }

  @Mutation(() => Album)
  async updateAlbum(@Args() album: Album, context: Context) {
    // update Album
    if (album.id) {
      const existingAlbum = await Album.findOne(album.id);
      checkAccessData(context.context.user.id, existingAlbum.user.id);
      if (!existingAlbum)
        throw new ApolloError("This album doesn't exists", "album:not(found)");
      if (album.user?.id) {
        const user = await User.findOne(album.user.id);
        if (!user)
          throw new ApolloError("This user doesn't exists", "user:not(found)");
      }

      const tags = await TagCheck(album.tag);
      existingAlbum.name = album.name;
      existingAlbum.readable = album.readable;
      existingAlbum.user = album.user;
      existingAlbum.tag = tags;

      return await Album.save(existingAlbum);
    }
    console.log(context.context.user.id);
    console.log(album.user.id);
    checkAccessData(context.context.user.id, album.user.id);
    // create Album
    try {
      const tags = await TagCheck(album.tag);
      const newAlbum = await Album.init(
        album.name,
        album.readable,
        album.user,
        tags,
      );
      console.log(newAlbum);

      const lol = await this.crud.create(newAlbum);
      console.log(lol);
      return lol;
    } catch (err) {
      console.log(err);
    }
  }

  @Mutation((type) => Album)
  async deleteAlbum(@Arg("id") id: string, context: Context) {
    const exists = await Album.findOne(id);
    checkAccessData(context.context.user.id, exists.user.id);
    if (!exists)
      throw new ApolloError("This album doesn't exists", "data:notfound");

    await this.crud.delete(id);
    return exists;
  }
}

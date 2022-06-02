import {
  Resolver,
  Query,
  Arg,
  Args,
  Mutation,
  Middlewares,
} from "graphql-composer-decorators";
import { ArgsFactory, Parser } from "graphql-composer-typeorm";
import { Image } from "../models/Image";
import { ApolloError } from "apollo-server";
import { File } from "../classes/File";
import { FileUpload } from "graphql-upload";
import { SavingFileError } from "../errors/SavingFileError";
import { CRUD } from "../classes/CRUD";
import { KeyValue, Context } from "graphql-composer";
import { Album } from "../models/Album";
import { verifyJwt } from "../middlewares/JwtMiddleware";
import { checkAccessData } from "../classes/Utils";
import { createQueryBuilder } from "typeorm";

const args = ArgsFactory.create(Image);
const parser = new Parser(Image, args);
@Middlewares(verifyJwt)
@Resolver()
export class ImageResolver {
  crud: CRUD<typeof Image>;

  constructor() {
    this.crud = new CRUD(Image);
  }

  @Query((type) => [Image])
  async getImages(@Args(args) _: KeyValue, context: Context) {
    const query = await parser.buildQuery(context);
    return query.getMany();
  }

  @Query((type) => Image)
  async getImage(@Args(args) _: KeyValue, context: Context) {
    const query = await parser.buildQuery(context);
    const image = await query.getOne();
    if (!image)
      throw new ApolloError("This image doesn't exists", "image:not(found)");
    return image;
  }

  @Mutation(() => Image)
  async updateImage(@Args() image: Image, context: Context) {
    if (!image.path)
      throw new ApolloError("No image has been sent", "image:not'(received)");

    if (!image.album.id)
      throw new ApolloError("Album id is missing", "albumId:not'(received)");

    const album = await Album.findOne(image.album.id);

    if (!album)
      throw new ApolloError("AlbumId is not valid", "album:not'(exist)");

    checkAccessData(context.context.user.id, album.user.id);

    const thumb = await File.create(image.path as any as Promise<FileUpload>);

    try {
      await thumb.saveImageAndWebp();
    } catch (err) {
      throw new SavingFileError();
    }

    image.path = thumb.name;

    try {
      return await this.crud.update(image);
    } catch (err) {
      console.log(err);
    }
  }

  @Mutation((type) => Image)
  async deleteImage(@Arg("id") id: string, context: Context) {
    const exists = await Image.findOne(id);
    const imageWithAlbum = await createQueryBuilder(Image, "image")
      .where("image.id = :id", {
        id: exists.id,
      })
      .leftJoinAndSelect("image.album", "album")
      .leftJoinAndSelect("album.user", "user")
      .getOne();
    checkAccessData(context.context.user.id, imageWithAlbum.album.user.id);
    if (!exists)
      throw new ApolloError("This image doesn't exists", "data:notfound");

    await this.crud.delete(id);
    return exists;
  }
}

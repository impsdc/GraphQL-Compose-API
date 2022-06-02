import {
  ObjectType,
  InputType,
  Field,
  InputField,
  ObjectField,
} from "graphql-composer-decorators";
import {
  OneToMany,
  Entity,
  Column,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Album } from "./Album";
import { BaseModel } from "./BaseModel";
import { FileUpload } from "graphql-upload";
import { GraphQLUpload } from "apollo-server";

@ObjectType()
@InputType("ImageInput")
@Entity("images")
export class Image extends BaseModel {
  static async init(path: string) {
    const image = new Image();

    image.path = path;

    return image;
  }

  @Field((type) => String)
  @InputField((type) => GraphQLUpload)
  @Column({ type: "varchar", nullable: true })
  path?: string | Promise<FileUpload>;

  @Field((type) => Album)
  @ObjectField((type) => Album)
  @ManyToOne((type) => Album, (c) => c.images)
  album: Album;
}

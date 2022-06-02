import {
  Entity,
  Column,
  ManyToMany,
  ManyToOne,
  OneToOne,
  OneToMany,
  JoinColumn,
  JoinTable,
} from "typeorm";
import {
  ObjectType,
  InputType,
  Field,
  InputField,
  ObjectField,
} from "graphql-composer-decorators";
import { BaseModel } from "./BaseModel";
import { Image } from "./Image";
import { User } from "./User";
import { N } from "graphql-composer";
import { Tag } from "./Tag";

@ObjectType({ nullable: true })
@InputType("AlbumInput")
@Entity("albums")
export class Album extends BaseModel {
  static async init(name: string, readable: boolean, user: User, tag: Tag[]) {
    const album = new Album();

    album.name = name;
    album.readable = readable;
    album.user = user;
    album.tag = tag;

    return album;
  }

  @Field((type) => N(String))
  @Column()
  name: string;

  @Field((type) => N(Boolean))
  @Column()
  readable: boolean;

  @Field((type) => N([Image]))
  @OneToMany((type) => Image, (p) => p.album, { eager: true })
  @JoinColumn()
  images: Image[];

  @Field((type) => N(User))
  @ManyToOne((type) => User, (user) => user.albums, { eager: true })
  user: User;

  @Field((type) => N([Tag]))
  @ManyToMany((type) => Tag, (m) => m.album, {
    cascade: true,
    eager: true,
  })
  @JoinTable({
    name: "album_tags",
    joinColumn: {
      name: "album",
      referencedColumnName: "id",
    },
    inverseJoinColumn: {
      name: "tag",
      referencedColumnName: "id",
    },
  })
  tag: Tag[];
}

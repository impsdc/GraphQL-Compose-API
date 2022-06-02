import {
  ObjectType,
  InputType,
  Field,
  InputField,
  ObjectField,
} from "graphql-composer-decorators";
import { ManyToMany, Entity, Column } from "typeorm";
import { Album } from "./Album";
import { BaseModel } from "./BaseModel";
import { N } from "graphql-composer";

@ObjectType()
@InputType("TagInput")
@Entity("tags")
export class Tag extends BaseModel {
  static async init(hashtag: string) {
    const tagEntity = new Tag();

    tagEntity.hashtag = hashtag;

    return tagEntity;
  }

  @Field((type) => String)
  @Column()
  hashtag: string;

  @Field((type) => N(Album))
  @ObjectField((type) => [Album])
  @ManyToMany((type) => Album, (m) => m.tag)
  album: Album[];
}

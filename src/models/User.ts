import {
  Entity,
  Column,
  ManyToMany,
  ManyToOne,
  OneToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import {
  ObjectType,
  InputType,
  Field,
  InputField,
  ObjectField,
} from "graphql-composer-decorators";
import { BaseModel } from "./BaseModel";
import { hash } from "bcrypt";
import { Album } from "./Album";
import { N } from "graphql-composer";

@ObjectType()
@InputType("UserInput")
@Entity("users")
export class User extends BaseModel {
  static async init(username: string, password: string) {
    const user = new User();

    user.username = username;
    user.password = await hash(password, 10);

    return user;
  }

  @Field((type) => N(String))
  @Column({ unique: true })
  username: string;

  @InputField((type) => N(String))
  @Column()
  password: string;

  @ObjectField((type) => [Album])
  @OneToMany((type) => Album, (album) => album.user)
  albums: Album[];
}

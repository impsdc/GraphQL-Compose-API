import {
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
} from "typeorm";
import {
  ObjectType,
  Field,
  InputType,
  ObjectField,
  InputField,
} from "graphql-composer-decorators";
import { N } from "graphql-composer";

@ObjectType({ hidden: true })
@InputType({ hidden: true })
export class BaseModel extends BaseEntity {
  @Field()
  @InputField((type) => N(String))
  @PrimaryGeneratedColumn()
  id: string;

  @ObjectField()
  @Column("timestamp", {
    precision: 6,
    default: () => "CURRENT_TIMESTAMP(6)",
  })
  insertTime: Date;

  @ObjectField()
  @Column("timestamp", {
    precision: 6,
    default: () => "CURRENT_TIMESTAMP(6)",
  })
  @UpdateDateColumn()
  updateTime: Date;
}

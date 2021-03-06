import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, ObjectType } from "type-graphql";

@ObjectType()
@Entity()
export class Sample {
  @Field()
  @PrimaryKey()
  id!: number;

  @Field(() => String)
  @Property({ type: "date" })
  createdAt? = new Date();

  @Field(() => String)
  @Property({ type: "date", onUpdate: () => new Date() })
  updatedAt? = new Date();

  @Field()
  @Property({ type: "text" })
  title!: string;

  @Field()
  @Property({ type: "text" })
  desc!: string;

  @Field()
  @Property({ type: "text" })
  imagesrc!: string;

  @Field()
  @Property({ type: "text" })
  url!: string;
}

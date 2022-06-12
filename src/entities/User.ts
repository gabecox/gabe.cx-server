import {
  Cascade,
  // Cascade,
  Collection,
  Entity,
  OneToMany,
  PrimaryKey,
  Property,
} from "@mikro-orm/core";
import { Field, InputType, ObjectType } from "type-graphql";
import { Post } from "./Post";

@InputType()
export class UserCredentials {
  @Field()
  username: string;
  @Field()
  password: string;
  @Field()
  email: string;
}

@InputType()
export class LoginCredentials {
  @Field()
  usernameOrEmail: string;
  @Field()
  password: string;
}

@ObjectType()
@Entity()
export class User {
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
  @Property({ type: "text", unique: true })
  username!: string;

  @Field()
  @Property({ type: "text", unique: true })
  email!: string;

  @Property({ type: "text" })
  password!: string;

  @Field(() => [Post])
  @OneToMany(() => Post, (post) => post.owner, { cascade: [Cascade.ALL] })
  posts = new Collection<Post>(this);
}

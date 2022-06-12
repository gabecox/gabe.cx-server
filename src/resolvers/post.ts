import { Post, PostInput } from "../entities/Post";
import { MyContext } from "../types";
import {
  Arg,
  Ctx,
  Int,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { isAuth } from "../middleware/isAuth";
import { QueryOrder } from "@mikro-orm/core";

@Resolver()
export class PostResolver {
  @Query(() => Post, { nullable: true })
  post(@Arg("id") id: number, @Ctx() { em }: MyContext): Promise<Post | null> {
    return em.findOne(Post, { id });
  }

  // @Query(() => PaginatedPosts)
  // async posts(
  //   @Arg("limit", () => Int) limit: number,
  //   @Arg("cursor", () => String, { nullable: true }) cursor: string | null,
  //   @Ctx() { em }: MyContext
  // ): Promise<PaginatedPosts> {
  //   const realLimit = Math.min(limit, 20);
  //   const posts = await em
  //     .qb(Post)
  //     .select("*")
  //     .where(!!cursor ? { createdAt: { $lt: new Date(parseInt(cursor)) } } : {})
  //     .limit(realLimit + 1)
  //     .orderBy({ createdAt: QueryOrder.DESC });

  //   return {
  //     posts: posts.slice(0, realLimit),
  //     hasMore: realLimit + 1 === posts.length,
  //   };
  // }

  @Query(() => [Post])
  async posts(
    @Arg("limit", () => Int) limit: number,
    @Arg("page", () => Int, { nullable: true }) page: number | null,
    @Ctx() { em }: MyContext
  ): Promise<Post[]> {
    const realLimit = Math.min(limit, 20);
    const posts = await em
      .qb(Post)
      .select("*")
      .offset(realLimit * (page ? page - 1 : 0))
      .limit(realLimit)
      // .orderBy({ id: QueryOrder.DESC });
      .orderBy({ createdAt: QueryOrder.DESC });

    return posts;
  }

  @Mutation(() => Post)
  @UseMiddleware(isAuth)
  async createPost(
    @Arg("options") options: PostInput,
    @Ctx() { em, req }: MyContext
  ): Promise<Post> {
    const post = em.create(Post, {
      ...options,
      ownerId: req.session.userId,
    });
    await em.persistAndFlush(post);
    // user?.posts.add(post);
    return post;
  }

  @Mutation(() => Post, { nullable: true })
  @UseMiddleware(isAuth)
  async updatePost(
    @Arg("id") id: number,
    @Arg("options") options: PostInput,
    @Ctx() { em }: MyContext
  ): Promise<Post | null> {
    const post = await em.findOne(Post, { id });
    if (!post) {
      return null;
    }
    if (typeof options.title !== undefined && options.title !== "") {
      post.title = options.title;
    }
    if (typeof options.body !== undefined && options.body !== "") {
      post.body = options.body;
    }
    await em.persistAndFlush(post);
    return post;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deletePost(
    @Arg("id") id: number,
    @Ctx() { em }: MyContext
  ): Promise<boolean> {
    await em.nativeDelete(Post, { id });
    return true;
  }
}

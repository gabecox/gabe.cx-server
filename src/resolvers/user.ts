import {
  Arg,
  Ctx,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import argon2 from "argon2";
import { v4 } from "uuid";
import { MyContext } from "../types";
import { User, UserCredentials, LoginCredentials } from "../entities/User";
import { FORGOT_PASSWORD_PREFIX } from "../constants";
import { validateCredentials } from "../utils/validations";
import { sendEmail } from "../utils/sendEmail";
import { isGabe } from "../middleware/isGabe";

@ObjectType()
export class FieldError {
  @Field()
  field: string;

  @Field()
  message: string;
}

@ObjectType()
export class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {
  @Query(() => User, { nullable: true })
  async me(@Ctx() { em, req }: MyContext) {
    if (!req.session.userId) {
      //not logged in
      return null;
    }

    const user = await em.findOne(User, { id: req.session.userId });
    return user;
  }

  @Mutation(() => UserResponse)
  @UseMiddleware(isGabe)
  async register(
    @Arg("options") options: UserCredentials,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const errors = validateCredentials(options);
    if (errors) {
      return { errors };
    }

    const hashedPassword = await argon2.hash(options.password);
    const user = em.create(User, {
      username: options.username,
      email: options.email,
      password: hashedPassword,
    });
    try {
      await em.persistAndFlush(user);
    } catch (err) {
      if (err.code === "23505" || err.detail.includes("already exists")) {
        return {
          errors: [
            err.constraint === "user_email_unique"
              ? {
                  field: "email",
                  message: "email is already in use",
                }
              : {
                  field: "username",
                  message: "username is already in use",
                },
          ],
        };
      }
      console.log("message", err.message, "code", err.code);
    }

    req.session.userId = user.id;

    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("options") options: LoginCredentials,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const user = await em.findOne(
      User,
      options.usernameOrEmail.includes("@")
        ? { email: options.usernameOrEmail }
        : { username: options.usernameOrEmail }
    );
    if (!user) {
      return {
        errors: [
          {
            field: "usernameOrEmail",
            message: "invalid username or email",
          },
        ],
      };
    }
    const valid = await argon2.verify(user.password, options.password);
    if (!valid) {
      return {
        errors: [
          {
            field: "password",
            message: "invalid password",
          },
        ],
      };
    }

    req.session.userId = user.id;

    return {
      user,
    };
  }

  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: MyContext) {
    return new Promise((resolve) => {
      req.session.destroy((err) => {
        res.clearCookie(process.env.COOKIE_NAME);
        if (err) {
          console.log(err);
          resolve(false);
          return;
        }

        resolve(true);
      });
    });
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isGabe)
  async forgotPassword(
    @Arg("email") email: string,
    @Ctx() { em, redis }: MyContext
  ) {
    const user = await em.findOne(User, { email });
    if (user) {
      // send email
      const token = v4();

      await redis.set(
        FORGOT_PASSWORD_PREFIX + token,
        user.id,
        "EX",
        1000 * 60 * 60 * 2
      ); // 2 hours

      sendEmail(
        email,
        `<a href="http://localhost:3000/change-password/${token}"> reset password </a>`
      );
    }
    return true;
  }

  //   @Mutation(() => Boolean)
  //   async changePassword(
  //     @Arg("token") token: string,
  //     @Arg("newPassword") newPassword: string,

  //     @Ctx() { em, redis }: MyContext
  //   ) {

  //   }
}

import { MyContext } from "src/types";
import { MiddlewareFn } from "type-graphql";

export const isGabe: MiddlewareFn<MyContext> = ({ context }, next) => {
  if (
    !process.env.GABE_UID ||
    context.req.session.userId?.toString() !== process.env.GABE_UID
  ) {
    throw new Error("Not Gabe");
  }
  return next();
};

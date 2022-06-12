import { EntityManager } from "@mikro-orm/postgresql";
import { Request, Response } from "express";
import Redis from "ioredis";

declare module "express-session" {
  interface SessionData {
    userId: number;
  }
}

export type MyContext = {
  em: EntityManager;
  req: Request;
  res: Response;
  redis: Redis;
};

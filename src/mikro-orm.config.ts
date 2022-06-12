import { __prod__ } from "./constants";
import path from "path";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import { Options } from "@mikro-orm/core";
import { User } from "./entities/User";
import { Post } from "./entities/Post";
import { Sample } from "./entities/Sample";

export default {
  seeder: {
    path: path.join(__dirname, "./seeders"),
    defaultSeeder: "DatabaseSeeder", // default seeder class name
    glob: "!(*.d).{js,ts}",
  },
  migrations: {
    path: path.join(__dirname, "./migrations"),
    glob: "!(*.d).{js,ts}",
  },
  entities: [User, Post, Sample],
  clientUrl: process.env.DATABASE_URL,
  type: "postgresql",
  debug: !__prod__,
  allowGlobalContext: true,
} as Options<PostgreSqlDriver>;

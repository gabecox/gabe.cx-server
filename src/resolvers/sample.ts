import { Sample } from "../entities/Sample";
import { MyContext } from "../types";
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { isAuth } from "../middleware/isAuth";

@InputType()
export class SampleType {
  @Field()
  title: string;
  @Field()
  desc: string;
  @Field()
  imagesrc: string;
  @Field()
  url: string;
}

@Resolver()
export class SampleResolver {
  @Query(() => [Sample])
  samples(@Ctx() { em }: MyContext): Promise<Sample[]> {
    return em.find(Sample, {});
  }

  @Mutation(() => Sample)
  @UseMiddleware(isAuth)
  async createSample(
    @Arg("options") options: SampleType,
    @Ctx() { em }: MyContext
  ): Promise<Sample> {
    const sample = em.create(Sample, {
      ...options,
    });
    await em.persistAndFlush(sample);
    return sample;
  }

  @Mutation(() => Sample, { nullable: true })
  async updateSample(
    @Arg("id") id: number,
    @Arg("options") options: SampleType,
    @Ctx() { em }: MyContext
  ): Promise<Sample | null> {
    const sample = await em.findOne(Sample, { id });
    if (!sample) {
      return null;
    }
    if (typeof options.title !== undefined && options.title !== "") {
      sample.title = options.title;
    }
    if (typeof options.desc !== undefined && options.desc !== "") {
      sample.desc = options.desc;
    }
    if (typeof options.imagesrc !== undefined && options.imagesrc !== "") {
      sample.imagesrc = options.imagesrc;
    }
    if (typeof options.url !== undefined && options.url !== "") {
      sample.url = options.url;
    }
    await em.persistAndFlush(sample);
    return sample;
  }

  @Mutation(() => Boolean)
  async deleteSample(
    @Arg("id") id: number,
    @Ctx() { em }: MyContext
  ): Promise<boolean> {
    await em.nativeDelete(Sample, { id });
    return true;
  }
}

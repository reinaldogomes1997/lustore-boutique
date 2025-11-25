import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { getAllProducts, createProduct, updateProduct, deleteProduct, getAllCoupons, createCoupon, updateCoupon, deleteCoupon } from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  products: router({
    list: publicProcedure.query(() => getAllProducts()),
    create: publicProcedure
      .input(z.object({
        title: z.string(),
        price: z.number(),
        size: z.string(),
        color: z.string(),
        img: z.string(),
        sku: z.string(),
        stock: z.number(),
      }))
      .mutation(({ input }) => createProduct(input)),
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        price: z.number().optional(),
        size: z.string().optional(),
        color: z.string().optional(),
        img: z.string().optional(),
        sku: z.string().optional(),
        stock: z.number().optional(),
      }))
      .mutation(({ input }) => {
        const { id, ...data } = input;
        return updateProduct(id, data);
      }),
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => deleteProduct(input.id)),
  }),

  coupons: router({
    list: publicProcedure.query(() => getAllCoupons()),
    create: publicProcedure
      .input(z.object({
        code: z.string(),
        type: z.enum(["fixed", "percentage"]),
        value: z.number(),
        active: z.number().optional(),
        description: z.string().optional(),
      }))
      .mutation(({ input }) => createCoupon(input)),
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        code: z.string().optional(),
        type: z.enum(["fixed", "percentage"]).optional(),
        value: z.number().optional(),
        active: z.number().optional(),
        description: z.string().optional(),
      }))
      .mutation(({ input }) => {
        const { id, ...data } = input;
        return updateCoupon(id, data);
      }),
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => deleteCoupon(input.id)),
  }),
});

export type AppRouter = typeof appRouter;

import { inferAsyncReturnType, initTRPC } from "@trpc/server";
import express from "express";
import * as trpcExpress from "@trpc/server/adapters/express";
import { z } from "zod";

// created for each request
const createContext = ({
  req,
  res,
}: trpcExpress.CreateExpressContextOptions) => ({});
type Context = inferAsyncReturnType<typeof createContext>;

const t = initTRPC.context<Context>().create();

export const appRouter = t.router({
  getUser: t.procedure.input(z.string()).query((req) => {
    req.input;
    return { id: req.input, name: "Bilbo" };
  }),
  createUser: t.procedure
    .input(z.object({ name: z.string().min(5) }))
    .mutation(async (req) => {
      return {};
    }),
});

const app = express();
app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);
app.options("/*", function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "localhost:5173");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Content-Length, X-Requested-With"
  );
  res.send(200);
});
app.listen(4000);

export type AppRouter = typeof appRouter;

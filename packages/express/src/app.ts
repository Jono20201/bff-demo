import { inferAsyncReturnType, initTRPC } from '@trpc/server';
import * as trpcExpress from '@trpc/server/adapters/express';
import { Express } from 'express';
import { z } from 'zod';

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
        return { id: req.input, name: 'Bilbo' };
    }),
    createUser: t.procedure
        .input(z.object({ name: z.string().min(5) }))
        .mutation(async (req) => {
            return {};
        }),
});

export const injectTrpcMiddlware = (app: Express) =>
    app.use(
        '/trpc',
        trpcExpress.createExpressMiddleware({
            router: appRouter,
            createContext,
        }),
    );

export type AppRouter = typeof appRouter;

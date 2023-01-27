import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "../../../express/src/index";
export const trpc = createTRPCReact<AppRouter>();

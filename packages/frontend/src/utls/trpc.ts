import { createTRPCReact } from '@trpc/react-query';

import type { AppRouter } from '../../../express/src/app';

export const trpc = createTRPCReact<AppRouter>();

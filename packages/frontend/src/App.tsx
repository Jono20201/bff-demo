import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { useState } from 'react';

import './App.css';
import reactLogo from './assets/react.svg';
import Test from './components/test';
import { trpc } from './utls/trpc';

function App() {
    const [count, setCount] = useState(0);
    const [queryClient] = useState(() => new QueryClient());
    const [trpcClient] = useState(() =>
        trpc.createClient({
            links: [
                httpBatchLink({
                    url: 'https://ba5ckhsz40.execute-api.eu-west-1.amazonaws.com/dev/trpc',
                }),
            ],
        }),
    );
    return (
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
            <QueryClientProvider client={queryClient}>
                <Test />
            </QueryClientProvider>
        </trpc.Provider>
    );
}

export default App;

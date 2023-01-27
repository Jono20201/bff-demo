import { useState } from "react";
import "./App.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc } from "./utls/trpc";
import { httpBatchLink } from "@trpc/client";
import Test from "./components/test";

function App() {
  const [count, setCount] = useState(0);
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: "http://localhost:4000/trpc",
        }),
      ],
    })
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

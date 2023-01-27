import { trpc } from "../utls/trpc";

export default function IndexPage() {
  const hello = trpc.getUser.useQuery("id");
  if (!hello.data) return <div>Loading...</div>;
  return (
    <div>
      <p>{hello.data.name}</p>
    </div>
  );
}

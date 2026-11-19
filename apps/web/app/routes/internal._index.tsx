import { useRouteLoaderData } from "react-router";

export default function InternalHome() {
  const data = useRouteLoaderData("routes/internal") as { user: { email: string } } | undefined;
  return (
    <main className="p-8">
      <h1>Internal</h1>
      <p>Signed in as {data?.user.email}</p>
    </main>
  );
}

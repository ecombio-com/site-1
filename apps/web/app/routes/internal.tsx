import { Outlet, redirect } from "react-router";
import type { Route } from "./+types/internal";
import { getAuthUser } from "~/lib/auth.server";

export async function loader({ request, context }: Route.LoaderArgs) {
  const user = await getAuthUser(request, context.env);
  if (!user || user.role !== "admin") throw redirect("/internal/login");
  return { user };
}

export default function InternalLayout() {
  return <Outlet />;
}

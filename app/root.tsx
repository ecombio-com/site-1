import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import {
  createPredictiveSearchServerHandlers,
  createShopifyRequestContext,
  createStorefrontClient,
  handleShopifyRedirects,
  handleShopifyRoutes,
} from "@shopify/hydrogen";
import {i18n} from "./lib/i18n";
import {routeTemplates} from "./lib/route-templates";
import {storefrontContext} from "./lib/storefront-context";
import {cartHandlers} from "./lib/cart-handlers";
import {CartProvider} from "./lib/cart";

const predictiveSearchHandlers = createPredictiveSearchServerHandlers();

export const middleware: Route.MiddlewareFunction[] = [
  async ({context, request}, next) => {
    const requestContext = createShopifyRequestContext({request, i18n});
    const storefrontClient = createStorefrontClient({
      type: "public",
      requestContext,
      config: {
        storeDomain: process.env.PUBLIC_STORE_DOMAIN || "mock.shop",
        publicStorefrontToken: process.env.PUBLIC_STOREFRONT_API_TOKEN,
      },
    });

    const shopifyRoute = handleShopifyRoutes({
      request,
      requestContext,
      storefrontClient,
      routeTemplates,
      handlers: [cartHandlers, predictiveSearchHandlers],
    });
    if (shopifyRoute) return shopifyRoute;

    context.set(storefrontContext, storefrontClient);
    const response = await next();
    if (response.status === 404) {
      const redirect = await handleShopifyRedirects({
        request,
        storefrontClient,
        routeTemplates,
      });
      if (redirect) return redirect;
    }
    requestContext.applyResponseHeaders(response.headers);
    return response;
  },
];

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export async function loader({context}: Route.LoaderArgs) {
  const storefrontClient = context.get(storefrontContext);
  const cartData = cartHandlers.get({storefrontClient}).then(({data}) => data);
  return {cartData};
}

export default function App({loaderData}: Route.ComponentProps) {
  return (
    <CartProvider initialData={loaderData.cartData}>
      <header>
        <nav>
          <a href="/">Home</a>
          <a href="/collections">Collections</a>
          <a href="/search">Search</a>
          <a href="/cart">Cart</a>
          <a href="/account">Account</a>
        </nav>
      </header>
      <Outlet />
      <footer><a href="/cart">View cart</a></footer>
    </CartProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}

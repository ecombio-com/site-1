import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("collections", "routes/collections.tsx"),
  route("collections/:handle", "routes/collection.tsx"),
  route("products/:handle", "routes/product.tsx"),
  route("search", "routes/search.tsx"),
  route("cart", "routes/cart.tsx"),
  route("account", "routes/account.tsx"),
  route("robots.txt", "routes/robots.txt.tsx"),
  route("*", "routes/catchall.tsx"),
] satisfies RouteConfig;

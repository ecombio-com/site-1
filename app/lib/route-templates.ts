import {defineShopifyRouteTemplates} from "@shopify/hydrogen";

// Shopify standard storefront routes are handled at their default paths.
export const routeTemplates = defineShopifyRouteTemplates({
  product: "/products/:productHandle",
  collection: "/collections/:collectionHandle",
  collectionList: "/collections",
  cart: "/cart",
  search: "/search",
});

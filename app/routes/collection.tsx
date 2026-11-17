import {gql} from "@shopify/hydrogen";
import {Link} from "react-router";
import type {Route} from "./+types/collection";
import {storefrontContext} from "../lib/storefront-context";
import {formatPrice} from "../lib/money";

const QUERY = gql(`query Collection($handle: String!, $country: CountryCode, $language: LanguageCode)
@inContext(country: $country, language: $language) {
  collection(handle: $handle) {
    id title description
    products(first: 24) { nodes {
      id title handle featuredImage { url altText }
      priceRange { minVariantPrice { amount currencyCode } }
    } }
  }
}`);

export async function loader({context, params}: Route.LoaderArgs) {
  const {data, errors} = await context.get(storefrontContext).graphql(QUERY, {variables: {handle: params.handle}});
  if (errors) throw new Response("Storefront query failed", {status: 500});
  if (!data?.collection) throw new Response("Collection not found", {status: 404});
  return data.collection;
}

export default function Collection({loaderData}: Route.ComponentProps) {
  const products = loaderData.products?.nodes ?? [];
  return <main><h1>{loaderData.title}</h1>{loaderData.description ? <p>{loaderData.description}</p> : null}
    {products.length === 0 ? <p>No products found.</p> : <div className="grid">{products.map((product) => (
      <Link key={product.id} to={`/products/${product.handle}`}>
        {product.featuredImage ? <img src={product.featuredImage.url} alt={product.featuredImage.altText ?? ""} /> : null}
        <strong>{product.title}</strong>
        <span>{formatPrice(product.priceRange.minVariantPrice)}</span>
      </Link>
    ))}</div>}
  </main>;
}

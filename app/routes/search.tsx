import {gql} from "@shopify/hydrogen";
import {Link, Form} from "react-router";
import type {Route} from "./+types/search";
import {storefrontContext} from "../lib/storefront-context";
import {formatPrice} from "../lib/money";

const QUERY = gql(`query Search($term: String!, $country: CountryCode, $language: LanguageCode)
@inContext(country: $country, language: $language) {
  search(query: $term, first: 24, types: [PRODUCT]) {
    nodes {
      ... on Product {
        id title handle featuredImage { url altText }
        priceRange { minVariantPrice { amount currencyCode } }
      }
    }
  }
}`);

export async function loader({context, request}: Route.LoaderArgs) {
  const term = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (!term) return {term, products: []};
  const {data, errors} = await context.get(storefrontContext).graphql(QUERY, {variables: {term}});
  if (errors) throw new Response("Storefront query failed", {status: 500});
  return {term, products: data?.search.nodes ?? []};
}

export default function Search({loaderData}: Route.ComponentProps) {
  return <main><h1>Search</h1><Form method="get"><label>Query<input name="q" defaultValue={loaderData.term} /></label><button>Search</button></Form>
    {loaderData.term ? <section><h2>Results for "{loaderData.term}"</h2>{loaderData.products.length === 0 ? <p>No results found.</p> :
      <div className="grid">{loaderData.products.map((product) => (
        "handle" in product ? <Link key={product.id} to={`/products/${product.handle}`}>
          {product.featuredImage ? <img src={product.featuredImage.url} alt={product.featuredImage.altText ?? ""} /> : null}
          <strong>{product.title}</strong><span>{formatPrice(product.priceRange.minVariantPrice)}</span>
        </Link> : null
      ))}</div>}</section> : null}</main>;
}

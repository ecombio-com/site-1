import {gql} from "@shopify/hydrogen";
import {Link} from "react-router";
import type {Route} from "./+types/collections";
import {storefrontContext} from "../lib/storefront-context";

const QUERY = gql(`query Collections($country: CountryCode, $language: LanguageCode)
@inContext(country: $country, language: $language) {
  collections(first: 100) { nodes { id title handle image { url altText } } }
}`);

export async function loader({context}: Route.LoaderArgs) {
  const {data, errors} = await context.get(storefrontContext).graphql(QUERY);
  if (errors) throw new Response("Storefront query failed", {status: 500});
  return data;
}

export default function Collections({loaderData}: Route.ComponentProps) {
  const collections = loaderData.collections?.nodes ?? [];
  return <main><h1>Collections</h1>{collections.length === 0 ? <p>No collections found.</p> : (
    <div className="grid">{collections.map((collection) => (
      <Link key={collection.id} to={`/collections/${collection.handle}`}>
        {collection.image ? <img src={collection.image.url} alt={collection.image.altText ?? ""} /> : null}
        <strong>{collection.title}</strong>
      </Link>
    ))}</div>
  )}</main>;
}

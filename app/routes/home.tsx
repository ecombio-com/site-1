import type {Route} from "./+types/home";
import {gql, type StorefrontApi} from "@shopify/hydrogen";
import {Link} from "react-router";
import {storefrontContext} from "../lib/storefront-context";
import {formatPrice} from "../lib/money";

const HOME_QUERY = gql(`
  query Home($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    collections(first: 8) {
      nodes { id title handle image { url altText } }
    }
    products(first: 12) {
      nodes {
        id title handle
        featuredImage { url altText }
        priceRange { minVariantPrice { amount currencyCode } }
      }
    }
  }
`);

type HomeData = StorefrontApi.ResultOf<typeof HOME_QUERY>;

export function meta({}: Route.MetaArgs) {
  return [{title: "MVP Storefront"}, {name: "description", content: "Shop the collection"}];
}

export async function loader({context}: Route.LoaderArgs) {
  const storefront = context.get(storefrontContext);
  const {data, errors} = await storefront.graphql(HOME_QUERY);
  if (errors) throw new Response("Storefront query failed", {status: 500});
  return data as HomeData;
}

export default function Home({loaderData}: Route.ComponentProps) {
  const collections = loaderData.collections?.nodes ?? [];
  const products = loaderData.products?.nodes ?? [];
  return (
    <main>
      <h1>Shop the collection</h1>
      <section>
        <h2>Collections</h2>
        {collections.length === 0 ? <p>No collections found.</p> : (
          <div className="grid">
            {collections.map((collection) => (
              <Link key={collection.id} to={`/collections/${collection.handle}`}>
                {collection.image ? <img src={collection.image.url} alt={collection.image.altText ?? ""} /> : null}
                <strong>{collection.title}</strong>
              </Link>
            ))}
          </div>
        )}
      </section>
      <section>
        <h2>Products</h2>
        {products.length === 0 ? <p>No products found.</p> : (
          <div className="grid">
            {products.map((product) => (
              <Link key={product.id} to={`/products/${product.handle}`}>
                {product.featuredImage ? <img src={product.featuredImage.url} alt={product.featuredImage.altText ?? ""} /> : null}
                <strong>{product.title}</strong>
                <span>{formatPrice(product.priceRange.minVariantPrice)}</span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

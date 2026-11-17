import {gql, getSelectedProductOptions} from "@shopify/hydrogen";
import type {Route} from "./+types/product";
import {storefrontContext} from "../lib/storefront-context";
import {formatPrice} from "../lib/money";
import {ProductProvider, useProductForm} from "../lib/product";

const PRODUCT_QUERY = gql(`
  query Product($handle: String!, $selectedOptions: [SelectedOptionInput!]!, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      id handle title description
      options { name optionValues { name firstSelectableVariant { id availableForSale } } }
      selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
        id availableForSale title
        price { amount currencyCode }
        compareAtPrice { amount currencyCode }
        image { url altText }
      }
      featuredImage { url altText }
    }
  }
`);

export async function loader({context, params, request}: Route.LoaderArgs) {
  const selectedOptions = getSelectedProductOptions({searchParams: new URL(request.url).searchParams});
  const {data, errors} = await context.get(storefrontContext).graphql(PRODUCT_QUERY, {
    variables: {handle: params.handle, selectedOptions},
  });
  if (errors) {
    console.error("[hydrogen] Product query failed", errors);
    throw new Response("Product query failed", {status: 500});
  }
  if (!data?.product) throw new Response("Product not found", {status: 404});
  return data.product;
}

export default function Product({loaderData}: Route.ComponentProps) {
  return (
    <ProductProvider product={loaderData}>
      <ProductContent product={loaderData} />
    </ProductProvider>
  );
}

function ProductContent({product: loaderData}: {product: any}) {
  const {formProps, register, selectedVariant, pending} = useProductForm();
  const variant = loaderData.selectedOrFirstAvailableVariant;
  return <main><h1>{loaderData.title}</h1>
    {variant?.image ? <img src={variant.image.url} alt={variant.image.altText ?? loaderData.title} /> :
      loaderData.featuredImage ? <img src={loaderData.featuredImage.url} alt={loaderData.featuredImage.altText ?? loaderData.title} /> : null}
    {variant?.price ? <p>{formatPrice(variant.price)}</p> : null}
    {loaderData.description ? <p>{loaderData.description}</p> : null}
    {loaderData.options.map((option: any) => <div key={option.name}><strong>{option.name}</strong><div>{option.optionValues.map((value: any) =>
      <a key={value.name} href={`?${encodeURIComponent(option.name)}=${encodeURIComponent(value.name)}`}>{value.name}</a>
    )}</div></div>)}
    {variant ? <form {...formProps()}>
      <input type="hidden" {...register("merchandiseId", {})} />
      <input {...register("quantity", {value: 1})} />
      <button {...register("addToCart", {})} disabled={!selectedVariant?.availableForSale || pending}>
        {selectedVariant?.availableForSale ? "Add to cart" : "Sold out"}
      </button>
    </form> : null}
  </main>;
}

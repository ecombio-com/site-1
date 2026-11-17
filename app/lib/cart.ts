import {createCartComponents} from "@shopify/hydrogen/react";
import type {cartHandlers} from "./cart-handlers";

export const {
  CartProvider,
  useCart,
  useCartActions,
  useCartForm,
  useSuspenseCart,
} = createCartComponents<typeof cartHandlers>();

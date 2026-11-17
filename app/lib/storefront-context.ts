import {createContext} from "react-router";
import type {StorefrontClient} from "@shopify/hydrogen";

export const storefrontContext = createContext<StorefrontClient>();

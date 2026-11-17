import {formatMoney, type MoneyV2} from "@shopify/hydrogen";

export function formatPrice(money: MoneyV2): string {
  return formatMoney(money, {locale: "en-US"}).toString();
}

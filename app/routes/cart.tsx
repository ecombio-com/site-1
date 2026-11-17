import {useCart, useCartForm} from "../lib/cart";

function CartLine({line}: {line: any}) {
  const {formProps, register} = useCartForm();
  const merchandise = line.merchandise;
  return (
    <li>
      {merchandise?.image ? <img src={merchandise.image.url} alt={merchandise.image.altText ?? ""} /> : null}
      <strong>{merchandise?.product?.title ?? merchandise?.title ?? "Product"}</strong>
      <form {...formProps()}>
        <button {...register("set")} hidden />
        <input type="hidden" {...register("lineId", {value: line.id})} />
        <button {...register("decrease")} aria-label="Decrease quantity">-</button>
        <input {...register("quantity", {value: line.quantity, interactive: true})} />
        <button type="submit" {...register("increase")} aria-label="Increase quantity">+</button>
        <button type="submit" {...register("remove")}>Remove</button>
      </form>
    </li>
  );
}

export default function Cart() {
  const loading = useCart((state) => state.loading);
  const lines = useCart((state) => state.data.lines.nodes);
  if (loading) return <main><p role="status">Loading cart...</p></main>;
  if (lines.length === 0) return <main><h1>Your cart</h1><p>Your cart is empty.</p></main>;
  return <main><h1>Your cart</h1><ul>{lines.map((line) => <CartLine key={line.id} line={line} />)}</ul></main>;
}

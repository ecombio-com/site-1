export default function CatchAll() {
  throw new Response("Not found", {status: 404});
}

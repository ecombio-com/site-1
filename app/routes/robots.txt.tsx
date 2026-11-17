export function loader() {
  return new Response(
    "User-agent: *\nDisallow: /cart\nDisallow: /account\nDisallow: /api/\nDisallow: /checkout\n",
    {headers: {"Content-Type": "text/plain"}},
  );
}

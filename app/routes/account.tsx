export default function Account() {
  return (
    <main>
      <h1>Account</h1>
      <p>Sign in to view your Shopify account.</p>
      <a href="/account/login?return_to=/account">Sign in</a>
      <form method="post" action="/account/logout">
        <button type="submit">Log out</button>
      </form>
    </main>
  );
}

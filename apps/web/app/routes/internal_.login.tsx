import { useState } from "react";

export default function InternalLogin() {
  const [error, setError] = useState("");
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/sign-in/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: f.get("email"), password: f.get("password") }),
    });
    if (res.ok) window.location.href = "/internal";
    else setError("Sign-in failed");
  }
  return (
    <main className="p-8">
      <form onSubmit={onSubmit}>
        <input name="email" type="email" placeholder="Email" required />
        <input name="password" type="password" placeholder="Password" required />
        <button type="submit">Sign in</button>
        {error ? <p>{error}</p> : null}
      </form>
    </main>
  );
}

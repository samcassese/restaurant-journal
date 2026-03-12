"use client";

import { signInWithGoogle, signInWithApple } from "@/app/actions/auth";

export function SignInButtons() {
  return (
    <div className="flex flex-col gap-2">
      <form action={signInWithGoogle}>
        <button
          type="submit"
          className="w-full py-2.5 px-4 rounded-md border border-stone-300 bg-white text-stone-800 text-sm hover:border-stone-400 hover:bg-stone-50 transition"
        >
          Continue with Google
        </button>
      </form>
      <form action={signInWithApple}>
        <button
          type="submit"
          className="w-full py-2.5 px-4 rounded-md border border-stone-300 bg-white text-stone-800 text-sm hover:border-stone-400 hover:bg-stone-50 transition"
        >
          Continue with Apple
        </button>
      </form>
    </div>
  );
}

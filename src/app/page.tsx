import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SignInButtons } from "@/components/sign-in-buttons";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (session) redirect("/feed");

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-brand-50">
      <div className="max-w-md w-full text-center space-y-8">
        <h1 className="text-3xl font-semibold tracking-tight text-stone-900">
          Restaurant Journal
        </h1>
        <p className="text-stone-600">
          Track where you’ve eaten, rate spots, and discover restaurants through your friends — like Letterboxd for food.
        </p>
        <SignInButtons />
        <p className="text-xs text-stone-500">
          By continuing, you agree to our Terms and Privacy Policy.
        </p>
      </div>
    </main>
  );
}

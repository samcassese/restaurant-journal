import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AppNav } from "@/components/app-nav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/");

  return (
    <div className="min-h-screen flex flex-col">
      <AppNav />
      <main className="flex-1">{children}</main>
    </div>
  );
}

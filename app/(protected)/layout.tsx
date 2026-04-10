import { redirect } from "next/navigation";
import { getSession } from "@/lib/server/auth";
import Navbar from "@/components/Navbar";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="flex min-h-screen">
      <Navbar user={{ name: session.name, email: session.email }} />
      <main className="flex-1 ml-64 min-h-screen">{children}</main>
    </div>
  );
}

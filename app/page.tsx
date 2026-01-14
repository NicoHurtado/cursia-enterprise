import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin");
  }

  // Redirect based on role
  switch (session.user.role) {
    case "ADMIN":
      redirect("/admin");
      return;
    case "CLIENT":
      redirect("/client");
      return;
    case "EMPLOYEE":
      redirect("/employee");
      return;
    case "CONTRACT_ADMIN":
      redirect("/employee");
      return;
    default:
      redirect("/auth/signin");
      return;
  }
}


import { redirect } from "next/navigation";
import { currentActor } from "@/lib/auth/current-user";
import { can } from "@/lib/auth/permissions";

export default async function OwnerLayout({children}:{children:React.ReactNode}) {
 const actor = await currentActor();
 if (!actor) redirect("/auth");
 if (!can(actor.role,"ads.review")) redirect("/");
 return <>{children}</>;
}

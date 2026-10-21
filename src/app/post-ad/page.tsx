import { redirect } from "next/navigation";
import { currentActor } from "@/lib/auth/current-user";
import { can } from "@/lib/auth/permissions";
import PostAdForm from "./PostAdForm";

export default async function PostAd(){
 const actor=await currentActor();
 if(!actor)redirect("/auth?next=/post-ad");
 if(!can(actor.role,"ads.create"))redirect("/");
 return <main className="formPage"><div className="formShell"><a href="/" className="back">← العودة لسوقنا</a><div className="formTitle"><span>1</span><div><h1>أضف إعلانك</h1><p>اكتب بيانات واضحة علشان إعلانك يوصل للمشتري المناسب.</p></div></div><PostAdForm/></div></main>
}

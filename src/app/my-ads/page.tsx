import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { currentActor } from "@/lib/auth/current-user";

export const dynamic="force-dynamic";

const labels:Record<string,string>={PENDING:"قيد المراجعة",ACTIVE:"منشور",REJECTED:"مرفوض",SOLD:"تم البيع",ARCHIVED:"مؤرشف"};
export default async function MyAdsPage(){
 const actor=await currentActor();
 if(!actor)redirect("/auth?next=/my-ads");
 const ads=await db.ad.findMany({where:{ownerId:actor.id},orderBy:{createdAt:"desc"},select:{id:true,title:true,price:true,status:true,createdAt:true,images:{orderBy:{position:"asc"},take:1,select:{url:true}},category:{select:{nameAr:true}}}});
 return <main className="searchPage"><header className="searchHeader"><Link href="/" className="authLogo">SOUQNA <span>سوقنا</span></Link><Link className="post" href="/post-ad">+ أضف إعلانك</Link></header><section className="searchBody"><div className="resultsTop"><div><h1>إعلاناتي</h1><p>تابع إعلاناتك وحالة المراجعة والنشر.</p></div></div>{ads.length===0?<div className="emptyState"><strong>لم تضف أي إعلان بعد</strong><span>أضف أول إعلان ليظهر هنا وتتابع حالته.</span><Link className="primary" href="/post-ad">أضف إعلانك</Link></div>:<div className="listingGrid">{ads.map(ad=><article className="listingCard" key={ad.id}><div className="listingImage">{ad.images[0]?<img src={ad.images[0].url} alt=""/>:<span>📷</span>}<b>{labels[ad.status]||ad.status}</b></div><div className="listingInfo"><small>{ad.category.nameAr} • {new Intl.DateTimeFormat("ar-EG",{dateStyle:"medium"}).format(ad.createdAt)}</small><h2>{ad.title}</h2><strong>{ad.price?`${Number(ad.price).toLocaleString("ar-EG")} ج.م`:"السعر عند التواصل"}</strong>{ad.status==="ACTIVE"&&<Link href={`/ad/${ad.id}`}>عرض الإعلان ←</Link>}</div></article>)}</div>}</section></main>;
}

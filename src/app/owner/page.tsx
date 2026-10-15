import Link from "next/link";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export default async function OwnerDashboard() {
 const [users,active,pending,rejected,recent] = await Promise.all([
 db.user.count(),db.ad.count({where:{status:"ACTIVE"}}),
 db.ad.count({where:{status:"PENDING"}}),db.ad.count({where:{status:"REJECTED"}}),
 db.ad.findMany({where:{status:"PENDING"},orderBy:{createdAt:"asc"},take:8,include:{category:{select:{nameAr:true}}}})
 ]);
 const stats=[["المستخدمون",users],["الإعلانات النشطة",active],["بانتظار المراجعة",pending],["الإعلانات المرفوضة",rejected]] as const;
 return <main className="owner"><aside className="ownerSide"><div className="ownerBrand">SOUQNA <small>OWNER</small></div><nav><Link href="/owner">لوحة التحكم</Link><Link href="/owner/ads">إدارة الإعلانات</Link><Link href="/owner/categories">إدارة الأقسام</Link><Link href="/">الموقع الرئيسي</Link></nav></aside>
 <section className="ownerMain"><header className="ownerTop"><div><h1>لوحة المالك</h1><p>بيانات مباشرة من قاعدة بيانات SOUQNA</p></div><span className="ownerBadge">ADMINISTRATION</span></header>
 <div className="statGrid">{stats.map(([label,value])=><article className="stat" key={label}><span>{label}</span><strong>{value.toLocaleString("ar-EG")}</strong></article>)}</div>
 <div className="ownerGrid"><article className="panel"><div className="panelHead"><h2>إعلانات تنتظر المراجعة</h2><Link href="/owner/ads">عرض الكل</Link></div>
 <div className="table">{recent.length?recent.map(ad=><div className="tableRow" key={ad.id}><span>#{ad.id.slice(-6)}</span><strong>{ad.title}</strong><span>{ad.category.nameAr}</span><b>{ad.price?Number(ad.price).toLocaleString("ar-EG")+" ج.م":"السعر عند التواصل"}</b><Link href="/owner/ads">مراجعة</Link></div>):<p>لا توجد إعلانات تنتظر المراجعة.</p>}</div></article></div>
 </section></main>;
}

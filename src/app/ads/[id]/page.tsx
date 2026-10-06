import { notFound } from "next/navigation";
import { db } from "@/lib/db";
type Props = { params: Promise<{ id: string }> };
export default async function AdDetails({ params }: Props) {
 const { id } = await params;
 const ad = await db.ad.findFirst({where:{id,status:"ACTIVE"},include:{images:{orderBy:{position:"asc"}},owner:{select:{name:true,phone:true,role:true}},category:{select:{nameAr:true}},governorate:{select:{nameAr:true}},area:{select:{nameAr:true}}}});
 if(!ad) notFound();
 return <main className="detailPage"><header className="searchHeader"><a href="/" className="authLogo">SOUQNA <span>سوقنا</span></a><a className="post" href="/post-ad">+ أضف إعلانك</a></header><div className="detailShell"><a href="/search" className="back">← العودة للإعلانات</a><div className="detailGrid"><section><div className="galleryMain">{ad.images[0]?<img src={ad.images[0].url} alt={ad.title}/>:<div className="photoPlaceholder">📷<span>صور الإعلان ستظهر هنا</span></div>}</div><article className="detailCard"><small>{ad.category.nameAr} • {ad.governorate.nameAr}{ad.area?` • ${ad.area.nameAr}`:""}</small><h1>{ad.title}</h1><div className="detailPrice">{ad.price?`${Number(ad.price).toLocaleString("ar-EG")} ج.م`:"السعر عند التواصل"}</div><hr/><h2>الوصف</h2><p className="description">{ad.description}</p></article></section><aside className="sellerCard"><span>البائع</span><h2>{ad.owner.name}</h2>{ad.owner.role==="BUSINESS"&&<b className="businessBadge">حساب تجاري</b>}<button className="primary">إظهار رقم الهاتف</button><button className="secondary">مراسلة البائع</button><a className="favoriteBtn" href="/favorites">♡ إضافة للمفضلة</a><small>لا تحول أي مبالغ قبل معاينة المنتج والتأكد منه.</small></aside></div></div></main>;
}

import Link from "next/link";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const fallbackIcons: Record<string,string> = {
  vehicles:"🚗", properties:"🏠", electronics:"📱", "furniture-appliances":"🛋️",
  jobs:"💼", services:"🛠️", fashion:"👕", equipment:"🚜", other:"📦"
};

export default async function Home() {
  const categories = await db.category.findMany({
    where:{active:true,parentId:null},
    orderBy:[{sortOrder:"asc"},{nameAr:"asc"}],
    select:{id:true,nameAr:true,slug:true,icon:true,imageUrl:true}
  });
  return <><header className="header"><div className="shell nav"><Link className="logo" href="/">SOUQNA <span>سوقنا</span></Link><nav className="navlinks"><Link href="/">الرئيسية</Link><a href="#categories">الأقسام</a><Link href="/favorites">المفضلة</Link><Link href="/my-ads">إعلاناتي</Link><Link href="/auth">دخول / حساب جديد</Link></nav><Link className="post" href="/post-ad">＋ أضف إعلانك</Link></div></header>
  <main><section className="hero shell"><div className="heroBadge">سوقك المحلي الأقرب ليك</div><h1>بيع واشتري بسهولة<br/><span>كل اللي حواليك في مكان واحد</span></h1><p>اكتشف أفضل الإعلانات والخدمات داخل الفيوم، بتجربة أسرع وأوضح.</p><form className="search" action="/search"><input name="q" aria-label="بحث" placeholder="ابحث عن سيارة، شقة، موبايل أو خدمة..." /><select name="governorate" aria-label="المنطقة" defaultValue=""><option value="">كل الفيوم</option></select><button>⌕ بحث</button></form></section>
  <section id="categories" className="section shell"><div className="sectionTitle"><div><small>استكشف سوقنا</small><h2>تصفح الأقسام</h2></div><Link href="/search">عرض كل الإعلانات ←</Link></div><div className="categories">{categories.map(cat=><Link className="categoryCard" href={`/search?categoryId=${cat.id}`} key={cat.id}>{cat.imageUrl?<span className="categoryVisual"><img src={cat.imageUrl} alt="" /></span>:<span className="categoryIcon">{cat.icon||fallbackIcons[cat.slug]||"◈"}</span>}<strong>{cat.nameAr}</strong><small>تصفح الإعلانات</small></Link>)}</div></section></main>
  <footer className="footer"><div className="shell footerInner"><div><strong>SOUQNA</strong><span>سوقنا</span></div><p>سوق محلي يبدأ من الفيوم، ويتوسع معاك لكل مصر.</p></div></footer></>;
}

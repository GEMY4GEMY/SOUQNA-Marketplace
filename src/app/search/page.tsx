import { db } from "@/lib/db";

type Props = { searchParams: Promise<{ q?: string; category?: string; area?: string }> };

export default async function SearchPage({ searchParams }: Props) {
  const p = await searchParams;
  const q = (p.q || "").trim();
  const ads = await db.ad.findMany({
    where: {
      status: "ACTIVE",
      ...(q ? { OR: [{ title: { contains: q, mode: "insensitive" as const } }, { description: { contains: q, mode: "insensitive" as const } }] } : {}),
      ...(p.category ? { category: { slug: p.category } } : {}),
      ...(p.area ? { area: { slug: p.area } } : {}),
    },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take: 50,
    select: { id: true, title: true, price: true, featured: true, images: { orderBy: { position: "asc" }, take: 1, select: { url: true } }, category: { select: { nameAr: true } }, area: { select: { nameAr: true } } },
  });

  return <main className="searchPage">
    <header className="searchHeader"><a href="/" className="authLogo">SOUQNA <span>سوقنا</span></a><a className="post" href="/post-ad">+ أضف إعلانك</a></header>
    <section className="searchBody">
      <div className="resultsTop"><div><h1>نتائج البحث</h1><p>{q ? `نتائج عن “${q}”` : "كل الإعلانات المتاحة"} — {ads.length} إعلان</p></div></div>
      {ads.length === 0 ? <div className="emptyState"><strong>لا توجد نتائج حاليًا</strong><span>جرّب كلمة بحث مختلفة أو تصفح قسمًا آخر.</span></div> :
      <div className="listingGrid">{ads.map(ad => <a href={`/ads/${ad.id}`} className="listingCard" key={ad.id}>
        <div className="listingImage">{ad.images[0] ? <img src={ad.images[0].url} alt="" /> : <span>📷</span>}{ad.featured && <b>مميز</b>}</div>
        <div className="listingInfo"><small>{ad.category.nameAr}{ad.area ? ` • ${ad.area.nameAr}` : ""}</small><h2>{ad.title}</h2><strong>{ad.price ? `${Number(ad.price).toLocaleString("ar-EG")} ج.م` : "السعر عند التواصل"}</strong></div>
      </a>)}</div>}
    </section>
  </main>;
}

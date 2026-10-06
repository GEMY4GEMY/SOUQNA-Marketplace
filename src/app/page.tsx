const categories = [
  ["🚗", "سيارات ومركبات"],
  ["🏠", "عقارات"],
  ["📱", "موبايلات وإلكترونيات"],
  ["🛋️", "أثاث وأجهزة"],
  ["💼", "وظائف"],
  ["🛠️", "خدمات"],
  ["👕", "أزياء"],
  ["🐾", "حيوانات"],
  ["🚜", "معدات"],
  ["📦", "متفرقات"],
];

export default function Home() {
  return (
    <>
      <header className="header">
        <div className="shell nav">
          <div className="logo">SOUQNA <span>سوقنا</span></div>
          <nav className="navlinks"><a href="#">الرئيسية</a><a href="#categories">الأقسام</a><a href="/favorites">المفضلة</a><a href="/auth">دخول / حساب جديد</a></nav>
          <a className="post" href="/post-ad">+ أضف إعلانك</a>
        </div>
      </header>
      <main>
        <section className="hero shell">
          <h1>كل اللي حواليك… <span style={{color:"var(--brand)"}}>في مكان واحد</span></h1>
          <p>بيع، اشتري، واكتشف أفضل العروض والخدمات داخل الفيوم.</p>
          <form className="search" action="/search">
            <input name="q" aria-label="بحث" placeholder="بتدور على إيه؟ سيارة، شقة، موبايل..." />
            <select aria-label="المنطقة" defaultValue="fayoum"><option value="fayoum">كل الفيوم</option><option>مدينة الفيوم</option><option>سنورس</option><option>إطسا</option><option>طامية</option><option>أبشواي</option><option>يوسف الصديق</option></select>
            <button>بحث</button>
          </form>
        </section>
        <section id="categories" className="section shell">
          <h2>تصفح الأقسام</h2>
          <div className="categories">{categories.map(([icon,name]) => <a className="card" href="#" key={name}><span className="icon">{icon}</span><strong>{name}</strong></a>)}</div>
        </section>
      </main>
      <footer className="footer"><div className="shell"><strong>SOUQNA</strong> — سوق محلي يبدأ من الفيوم وقابل للتوسع لكل مصر.</div></footer>
    </>
  );
}

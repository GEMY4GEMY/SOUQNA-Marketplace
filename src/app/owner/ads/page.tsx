const ads = [
  ["#5812","iPhone 15 Pro 256GB","أحمد محمد","موبايلات","28,500","قيد المراجعة"],
  ["#5811","شقة للبيع - المسلة","محمد علي","عقارات","1,850,000","قيد المراجعة"],
  ["#5809","Kia Sportage 2021","كريم حسن","سيارات","1,420,000","نشط"],
  ["#5807","غرفة نوم كاملة","محمود السيد","أثاث","32,000","مرفوض"],
];

export default function OwnerAds() {
 return <main className="managementPage"><header><div><a href="/owner">← لوحة المالك</a><h1>إدارة الإعلانات</h1><p>مراجعة ومتابعة جميع إعلانات المنصة.</p></div><button>تصدير</button></header>
 <div className="filterBar"><input placeholder="بحث برقم أو عنوان الإعلان..." /><select><option>كل الحالات</option><option>قيد المراجعة</option><option>نشط</option><option>مرفوض</option></select><select><option>كل الأقسام</option><option>سيارات</option><option>عقارات</option><option>موبايلات</option></select></div>
 <section className="managementTable"><div className="mRow mHead"><span>الرقم</span><span>الإعلان</span><span>البائع</span><span>القسم</span><span>السعر</span><span>الحالة</span><span>إجراء</span></div>
 {ads.map(a=><div className="mRow" key={a[0]}>{a.map((v,i)=><span key={i} className={i===5?"status":""}>{v}</span>)}<span><button className="tiny">مراجعة</button></span></div>)}</section></main>
}

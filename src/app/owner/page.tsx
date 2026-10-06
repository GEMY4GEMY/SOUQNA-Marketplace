const stats = [
  ["المستخدمون","24,580","+8.2%"],
  ["الإعلانات النشطة","8,420","+5.4%"],
  ["بانتظار المراجعة","84","يتطلب إجراء"],
  ["إيراد الشهر","82,600 ج.م","+12.1%"],
];

const pending = [
  ["#5812","iPhone 15 Pro 256GB","موبايلات","28,500 ج.م"],
  ["#5811","شقة للبيع - المسلة","عقارات","1,850,000 ج.م"],
  ["#5809","Kia Sportage 2021","سيارات","1,420,000 ج.م"],
];

export default function OwnerDashboard() {
  return (
    <main className="owner">
      <aside className="ownerSide">
        <div className="ownerBrand">SOUQNA <small>OWNER</small></div>
        <nav>
          {["لوحة التحكم","الإعلانات","المستخدمون","التجار","المدفوعات","الباقات","الأقسام","المناطق","البلاغات","الموظفون","سجل العمليات","الإعدادات"].map((x,i)=><a className={i===0?"active":""} href="#" key={x}>{x}</a>)}
        </nav>
      </aside>
      <section className="ownerMain">
        <header className="ownerTop"><div><h1>لوحة المالك</h1><p>نظرة شاملة على أداء SOUQNA</p></div><span className="ownerBadge">SUPER OWNER</span></header>
        <div className="statGrid">{stats.map(([label,value,note])=><article className="stat" key={label}><span>{label}</span><strong>{value}</strong><small>{note}</small></article>)}</div>
        <div className="ownerGrid">
          <article className="panel">
            <div className="panelHead"><h2>إعلانات تنتظر المراجعة</h2><a href="#">عرض الكل</a></div>
            <div className="table">
              {pending.map(([id,title,cat,price])=><div className="tableRow" key={id}><span>{id}</span><strong>{title}</strong><span>{cat}</span><b>{price}</b><button>مراجعة</button></div>)}
            </div>
          </article>
          <article className="panel">
            <div className="panelHead"><h2>إجراءات سريعة</h2></div>
            <div className="quick"><button>+ إضافة قسم</button><button>+ إضافة منطقة</button><button>إدارة الموظفين</button><button>الأسعار والباقات</button></div>
          </article>
        </div>
      </section>
    </main>
  );
}

const users = [
 ["Ahmed Mohamed","010•••••234","USER","نشط","12"],
 ["Fayoum Cars","011•••••908","BUSINESS","نشط","84"],
 ["Sara Ali","012•••••117","USER","نشط","3"],
 ["Omar Hassan","015•••••445","USER","موقوف","0"],
];

export default function OwnerUsers(){
 return <main className="managementPage"><header><div><a href="/owner">← لوحة المالك</a><h1>المستخدمون والحسابات</h1><p>الإدارة التشغيلية للحسابات مع حماية حساب المالك.</p></div><button>+ إضافة موظف</button></header>
 <div className="notice">🔒 حساب <b>SUPER_OWNER</b> لا يمكن لمشرف أو مدير تخفيض صلاحيته أو حذفه.</div>
 <div className="filterBar"><input placeholder="بحث بالاسم أو الهاتف..." /><select><option>كل الأدوار</option><option>USER</option><option>BUSINESS</option><option>MODERATOR</option></select></div>
 <section className="managementTable"><div className="mRow usersRow mHead"><span>الاسم</span><span>الهاتف</span><span>الدور</span><span>الحالة</span><span>الإعلانات</span><span>إجراء</span></div>
 {users.map(u=><div className="mRow usersRow" key={u[0]}>{u.map((v,i)=><span key={i}>{v}</span>)}<span><button className="tiny">فتح</button></span></div>)}</section></main>
}

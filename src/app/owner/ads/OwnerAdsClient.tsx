"use client";
import {useCallback,useEffect,useState} from "react";
type Ad={id:string;title:string;price:string|null;status:string;owner:{name:string};category:{nameAr:string};area:{nameAr:string}|null};
const states=[["PENDING","قيد المراجعة"],["ACTIVE","نشط"],["REJECTED","مرفوض"],["SOLD","تم البيع"],["EXPIRED","منتهي"],["ARCHIVED","مؤرشف"]] as const;
export default function OwnerAdsClient(){
 const [status,setStatus]=useState("PENDING"),[ads,setAds]=useState<Ad[]>([]),[loading,setLoading]=useState(true),[busy,setBusy]=useState<string|null>(null),[error,setError]=useState("");
 const load=useCallback(async()=>{setLoading(true);setError("");try{const res=await fetch("/api/owner/ads?status="+status,{cache:"no-store"});if(!res.ok)throw new Error("تعذر تحميل الإعلانات");const data=await res.json();setAds(data.ads||[]);}catch(e){setError(e instanceof Error?e.message:"حدث خطأ");}finally{setLoading(false)}},[status]);
 useEffect(()=>{void load()},[load]);
 async function moderate(id:string,decision:"APPROVE"|"REJECT"){if(!window.confirm(decision==="APPROVE"?"تأكيد نشر الإعلان؟":"تأكيد رفض الإعلان؟"))return;setBusy(id);setError("");try{const res=await fetch("/api/owner/ads/"+id+"/moderate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({decision})});if(!res.ok)throw new Error("تعذر تنفيذ القرار، قد يكون الإعلان تمت مراجعته بالفعل");await load();}catch(e){setError(e instanceof Error?e.message:"حدث خطأ");}finally{setBusy(null)}}
 return <main className="managementPage"><header><div><a href="/owner">← لوحة المالك</a><h1>إدارة الإعلانات</h1><p>إعلانات حقيقية من قاعدة البيانات — حتى 100 إعلان لكل حالة.</p></div><button onClick={()=>void load()} disabled={loading}>تحديث</button></header>
 <div className="filterBar"><label>حالة الإعلان: <select value={status} onChange={e=>setStatus(e.target.value)}>{states.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label></div>
 {error&&<p role="alert">{error}</p>}{loading?<p>جاري تحميل الإعلانات...</p>:ads.length===0?<p>لا توجد إعلانات في هذه الحالة.</p>:<section className="managementTable"><div className="mRow mHead"><span>الرقم</span><span>الإعلان</span><span>البائع</span><span>القسم</span><span>السعر</span><span>الحالة</span><span>إجراء</span></div>
 {ads.map(ad=><div className="mRow" key={ad.id}><span>#{ad.id.slice(-6)}</span><span>{ad.title}</span><span>{ad.owner.name}</span><span>{ad.category.nameAr}</span><span>{ad.price?Number(ad.price).toLocaleString("ar-EG"):"—"}</span><span className="status">{states.find(s=>s[0]===ad.status)?.[1]||ad.status}</span><span>{ad.status==="PENDING"?<><button className="tiny" disabled={busy===ad.id} onClick={()=>void moderate(ad.id,"APPROVE")}>قبول</button>{" "}<button className="tiny" disabled={busy===ad.id} onClick={()=>void moderate(ad.id,"REJECT")}>رفض</button></>:"—"}</span></div>)}</section>}
 </main>;
}

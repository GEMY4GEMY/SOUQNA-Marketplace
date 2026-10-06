"use client";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Area={id:string;nameAr:string;slug:string};
type Governorate={id:string;nameAr:string;slug:string;areas:Area[]};
type Category={id:string;nameAr:string;slug:string};
type Meta={categories:Category[];governorates:Governorate[]};

export default function PostAdForm(){
 const router=useRouter();
 const [meta,setMeta]=useState<Meta|null>(null);
 const [gov,setGov]=useState("");
 const [message,setMessage]=useState("");
 const [busy,setBusy]=useState(false);
 useEffect(()=>{fetch("/api/meta").then(r=>r.json()).then(setMeta).catch(()=>setMessage("تعذر تحميل الأقسام والمناطق."))},[]);
 const areas=useMemo(()=>meta?.governorates.find(x=>x.id===gov)?.areas??[],[meta,gov]);

 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();setBusy(true);setMessage("");
  const fd=new FormData(e.currentTarget);
  const payload={title:fd.get("title"),description:fd.get("description"),price:fd.get("price"),categoryId:fd.get("categoryId"),governorateId:fd.get("governorateId"),areaId:fd.get("areaId")};
  const res=await fetch("/api/ads",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
  const data=await res.json().catch(()=>({}));
  if(res.status===401){router.push("/auth");return}
  if(!res.ok){setMessage(data.details?.join(" ")||"تعذر إرسال الإعلان.");setBusy(false);return}
  setMessage("تم إرسال الإعلان للمراجعة بنجاح.");setBusy(false);e.currentTarget.reset();setGov("");
 }
 return <form className="adForm" onSubmit={submit}>
  <section className="formCard"><h2>تفاصيل الإعلان</h2>
   <label>عنوان الإعلان<input name="title" required minLength={5} maxLength={90} placeholder="مثال: iPhone 15 Pro بحالة ممتازة"/></label>
   <div className="form2">
    <label>القسم<select name="categoryId" required defaultValue=""><option value="" disabled>اختر القسم</option>{meta?.categories.map(x=><option value={x.id} key={x.id}>{x.nameAr}</option>)}</select></label>
    <label>المحافظة<select name="governorateId" required value={gov} onChange={e=>setGov(e.target.value)}><option value="">اختر المحافظة</option>{meta?.governorates.map(x=><option value={x.id} key={x.id}>{x.nameAr}</option>)}</select></label>
   </div>
   <label>المنطقة<select name="areaId" defaultValue=""><option value="">اختر المنطقة</option>{areas.map(x=><option value={x.id} key={x.id}>{x.nameAr}</option>)}</select></label>
   <label>الوصف<textarea name="description" required minLength={20} maxLength={5000} rows={7} placeholder="اكتب المواصفات والحالة وأي تفاصيل مهمة..."/></label>
   <label>السعر (جنيه)<input name="price" type="number" min="0" step="1" placeholder="0"/></label>
  </section>
  <section className="formCard"><h2>صور الإعلان</h2><div className="uploadBox"><strong>الصور — المرحلة التالية</strong><span>تم تجهيز قاعدة البيانات للصور، وسيتم ربط التخزين والرفع المباشر قبل النشر التجريبي.</span></div></section>
  {message&&<div className="notice">{message}</div>}
  <div className="formActions"><button type="submit" className="primary" disabled={busy}>{busy?"جاري الإرسال...":"إرسال للمراجعة"}</button></div>
 </form>
}

"use client";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Area={id:string;nameAr:string;slug:string};
type Governorate={id:string;nameAr:string;slug:string;areas:Area[]};
type Category={id:string;nameAr:string;slug:string;children:{id:string;nameAr:string;slug:string;icon:string|null}[]};
type Meta={categories:Category[];governorates:Governorate[]};

export default function PostAdForm(){
 const router=useRouter();
 const [meta,setMeta]=useState<Meta|null>(null);
 const [gov,setGov]=useState("");
 const [message,setMessage]=useState("");
 const [busy,setBusy]=useState(false);
 const [images,setImages]=useState<File[]>([]);
 const [previews,setPreviews]=useState<string[]>([]);
 const [createdId,setCreatedId]=useState<string|null>(null);
 useEffect(()=>{const urls=images.map(file=>URL.createObjectURL(file));setPreviews(urls);return ()=>urls.forEach(url=>URL.revokeObjectURL(url));},[images]);
 useEffect(()=>{fetch("/api/meta").then(r=>r.json()).then(setMeta).catch(()=>setMessage("تعذر تحميل الأقسام والمناطق."))},[]);
 const areas=useMemo(()=>meta?.governorates.find(x=>x.id===gov)?.areas??[],[meta,gov]);

 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();setBusy(true);setMessage("");
  const fd=new FormData(e.currentTarget);
  const payload={title:fd.get("title"),description:fd.get("description"),price:fd.get("price"),categoryId:fd.get("categoryId"),governorateId:fd.get("governorateId"),areaId:fd.get("areaId")};
  let id=createdId;
  try{
  if(!id){const res=await fetch("/api/ads",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
  const data=await res.json().catch(()=>({}));
  if(res.status===401){router.push("/auth");return}
  if(!res.ok){setMessage(data.details?.join(" ")||"تعذر إرسال الإعلان.");return}
  id=data.ad.id;setCreatedId(id);}

  if(images.length){const imageForm=new FormData();images.forEach(file=>imageForm.append("images",file));const upload=await fetch(`/api/ads/${id}/images`,{method:"POST",body:imageForm});if(!upload.ok){setMessage("تم إنشاء الإعلان، لكن تعذر رفع بعض الصور. يمكنك استكمال الصور لاحقًا.");setBusy(false);return}}
  setMessage("تم إرسال الإعلان للمراجعة بنجاح.");e.currentTarget.reset();setGov("");setImages([]);setCreatedId(null);
  }catch{setMessage(id?"الإعلان محفوظ، لكن تعذر إكمال رفع الصور. حاول مرة أخرى.":"حدث خطأ في الاتصال؛ تحقق من إعلاناتك قبل إعادة المحاولة.");}finally{setBusy(false)}
 }
 return <form className="adForm" onSubmit={submit}>
  <section className="formCard"><h2>تفاصيل الإعلان</h2>
   <label>عنوان الإعلان<input name="title" required minLength={5} maxLength={90} placeholder="مثال: iPhone 15 Pro بحالة ممتازة"/></label>
   <div className="form2">
    <label>القسم<select name="categoryId" required defaultValue=""><option value="" disabled>اختر القسم</option>{meta?.categories.map(x=><optgroup key={x.id} label={x.nameAr}><option value={x.id}>{x.nameAr} — عام</option>{x.children.map(child=><option value={child.id} key={child.id}>{child.nameAr}</option>)}</optgroup>)}</select></label>
    <label>المحافظة<select name="governorateId" required value={gov} onChange={e=>setGov(e.target.value)}><option value="">اختر المحافظة</option>{meta?.governorates.map(x=><option value={x.id} key={x.id}>{x.nameAr}</option>)}</select></label>
   </div>
   <label>المنطقة<select name="areaId" defaultValue=""><option value="">اختر المنطقة</option>{areas.map(x=><option value={x.id} key={x.id}>{x.nameAr}</option>)}</select></label>
   <label>الوصف<textarea name="description" required minLength={20} maxLength={5000} rows={7} placeholder="اكتب المواصفات والحالة وأي تفاصيل مهمة..."/></label>
   <label>السعر (جنيه)<input name="price" type="number" min="0" step="1" placeholder="0"/></label>
  </section>
  
  <section className="formCard"><h2>صور الإعلان</h2><label className="uploadBox"><strong>أضف حتى 10 صور</strong><span>JPG / PNG / WEBP — الحد الأقصى 8 ميجابايت للصورة</span><input type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={busy||!!createdId} onChange={e=>{const selected=Array.from(e.target.files||[]);if(selected.length>10||selected.some(file=>file.size>8*1024*1024)){setMessage("الحد الأقصى 10 صور، وحجم كل صورة لا يتجاوز 8 ميجابايت.");e.target.value="";return}setMessage("");setImages(selected)}}/></label>{images.length>0&&<><div className="imagePreviewGrid">{images.map((file,i)=><div className="imagePreviewItem" key={file.name+i}><img src={previews[i]||""} alt={`الصورة ${i+1}`}/><button type="button" disabled={busy||!!createdId} aria-label="إزالة الصورة" onClick={()=>setImages(v=>v.filter((_,n)=>n!==i))}>×</button></div>)}</div><small>{images.length} / 10 صور</small></>}</section>
  {message&&<div className="notice" role="status">{message}</div>}
  <div className="formActions"><button type="submit" className="primary" disabled={busy}>{busy?"جاري الإرسال...":"إرسال للمراجعة"}</button></div>
 </form>
}

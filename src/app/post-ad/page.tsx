const categories = ["سيارات ومركبات","عقارات","موبايلات وإلكترونيات","أثاث وأجهزة","وظائف","خدمات","أزياء","حيوانات","معدات","متفرقات"];
const areas = ["مدينة الفيوم","سنورس","إطسا","طامية","أبشواي","يوسف الصديق"];

export default function PostAd() {
  return (
    <main className="formPage">
      <div className="formShell">
        <a href="/" className="back">← العودة لسوقنا</a>
        <div className="formTitle"><span>1</span><div><h1>أضف إعلانك</h1><p>اكتب بيانات واضحة علشان إعلانك يوصل للمشتري المناسب.</p></div></div>
        <form className="adForm">
          <section className="formCard">
            <h2>تفاصيل الإعلان</h2>
            <label>عنوان الإعلان<input required maxLength={90} placeholder="مثال: iPhone 15 Pro بحالة ممتازة" /></label>
            <div className="form2">
              <label>القسم<select required defaultValue=""><option value="" disabled>اختر القسم</option>{categories.map(x=><option key={x}>{x}</option>)}</select></label>
              <label>المنطقة<select required defaultValue=""><option value="" disabled>اختر المنطقة</option>{areas.map(x=><option key={x}>{x}</option>)}</select></label>
            </div>
            <label>الوصف<textarea required rows={7} placeholder="اكتب المواصفات والحالة وأي تفاصيل مهمة..." /></label>
            <div className="form2">
              <label>السعر (جنيه)<input type="number" min="0" placeholder="0" /></label>
              <label>رقم الهاتف<input inputMode="tel" placeholder="01xxxxxxxxx" /></label>
            </div>
          </section>
          <section className="formCard">
            <h2>صور الإعلان</h2>
            <div className="uploadBox"><strong>+ أضف صورًا</strong><span>سنربط رفع الصور بالتخزين في مرحلة الـBackend</span></div>
          </section>
          <div className="formActions"><button type="button" className="secondary">حفظ كمسودة</button><button type="submit" className="primary">إرسال للمراجعة</button></div>
        </form>
      </div>
    </main>
  );
}

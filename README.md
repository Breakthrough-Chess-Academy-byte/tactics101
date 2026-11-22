# Tactics 101 — تمارين التكتيك

صفحة واحدة (`index.html`) فيها 16 درس و288 تمرين، مع مزامنة التقدم مع Google Sheets بين المدرب والمتدربين.

## النشر على GitHub Pages

1. من صفحة الريبو: **Settings ← Pages**.
2. تحت **Build and deployment** اختار **Deploy from a branch**، والفرع `main` والمجلد `/ (root)`، واضغط **Save**.
3. بعد دقيقة أو اتنين اللينك هيبقى:
   `https://breakthrough-chess-academy-byte.github.io/tactics101/`

أي تعديل يتعمل push على `main` بيتنشر تلقائي.

## المزامنة مع Google Sheets

الصفحة بتبعت التقدم لـ Google Apps Script، والسكريبت بيكتبه في شيت.

1. اعمل Google Sheet جديد.
2. من الشيت: **Extensions ← Apps Script**.
3. امسح الكود اللي هناك والصق محتوى الملف [`apps-script/Code.gs`](apps-script/Code.gs)، واحفظ.
4. **Deploy ← New deployment** ← النوع **Web app**:
   - **Execute as:** Me
   - **Who has access:** Anyone
5. اضغط **Deploy**، وافق على الصلاحيات، وانسخ لينك الـ **Web app URL** (بينتهي بـ `/exec`).
6. في `index.html` دوّر على `SHEET_URL` وحط اللينك الجديد مكان القديم، واعمل commit.

ملاحظات:
- لو عدّلت الكود بعدين: **Deploy ← Manage deployments ← Edit ← Version: New version** عشان اللينك نفسه يفضل شغال.
- لو عايز كلمة سر: حطها في `SECRET` جوه `Code.gs` وفي `SHEET_SECRET` جوه `index.html` (نفس القيمة).
- البيانات بتتسجل في تاب اسمه `data` (الأعمدة: key, g, n, ex, t, ts).

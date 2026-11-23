# برنامج الأستاذ — Teacher's App

تطبيق ويب متكامل لمساعدة الأستاذ في تسيير عمله اليومي. يعمل مباشرة في المتصفح، بدون خادم وبدون تثبيت، وتُحفظ كل البيانات محليًا على جهازك (IndexedDB).

A complete, offline-first web app for teachers. Runs entirely in the browser (no server, no build step); all data is stored locally in IndexedDB. Arabic (RTL) and English (LTR).

## المميزات / Features

| القسم | ما يمكنك فعله |
|---|---|
| **ملفاتي الخاصة** | دبلومات، شهادة العمل، بطاقة التعريف، قرار التعيين، تقارير التفتيش… إضافة، معاينة (صور و PDF)، طباعة، تحميل، تعديل، حذف، تنبيه بالوثائق المنتهية الصلاحية |
| **الأقسام** | إنشاء الأقسام (المستوى، السنة، المادة، التوقيت) مع عدد التلاميذ |
| **التلاميذ** | إضافة/تعديل/حذف، صورة التلميذ، ملف التلميذ مع نتائجه، فرز وبحث، تحديد متعدد (حذف / نقل إلى قسم)، **استيراد** من Excel / CSV / JSON (تعرّف تلقائي على الأعمدة بالعربية والإنجليزية والفرنسية)، **تصدير** Excel / CSV / JSON، نموذج فارغ للاستيراد، **طباعة**: قائمة مفصلة، ورقة الغيابات، قائمة بأعمدة فارغة، بطاقات التلاميذ |
| **صب النقاط** | التقويم المستمر، فرض أو فرضان، الاختبار، حساب المعدل والرتبة والتقدير تلقائيًا، المعدل السنوي، إحصائيات القسم وتوزيع التقديرات، حفظ تلقائي، تنقل بلوحة المفاتيح، طباعة وتصدير كشف النقاط. المعاملات والعلامة القصوى قابلة للتعديل |
| **المذكرات** | محرر نصوص منسق مع جداول وصور، قالب جاهز لمراحل سير الدرس، مرفقات، طباعة |
| **الفروض والاختبارات** | نص الموضوع + الحل وسلم التنقيط (طباعة بدون حل أو مع الحل)، الفصل، القسم، المدة |
| **التمارين والأمثلة** | بنك تمارين مع النوع، الصعوبة، الكلمات المفتاحية والحل |
| **الرسومات** | محرر رسم (قلم، خط، سهم، مستطيل، دائرة، مثلث، نص، ممحاة، ورق مربعات/نقاط/أسطر، تراجع/إعادة، إدراج صورة) أو رفع صور |
| **البحث السريع** | `Ctrl + K` أو `/` للبحث في كل شيء (يتجاهل الهمزات والتشكيل والتاء المربوطة) |
| **الإعدادات** | العربية / English، 5 مظاهر (فاتح، داكن، ورقي، ليلي، حسب النظام)، اللون الرئيسي، 11 خطًا عربيًا، حجم الخط، الاستدارة والكثافة، معلومات الأستاذ في ترويسة الطباعة، طريقة حساب المعدلات، نسخة احتياطية واسترجاع |

## التشغيل / Running

افتح `index.html` مباشرة في المتصفح، أو (أفضل، لتفعيل العمل دون اتصال):

```bash
python3 -m http.server 8080
# ثم افتح http://localhost:8080
```

يمكن نشره على أي استضافة ملفات ثابتة (GitHub Pages، Netlify…). ويمكن تثبيته كتطبيق (PWA).

## ملاحظات / Notes

- **البيانات محلية**: كل متصفح/جهاز له بياناته. استعمل *الإعدادات ← تصدير نسخة احتياطية* بانتظام، واسترجعها على جهاز آخر.
- الخطوط تُحمَّل من Google Fonts عند توفر الاتصال، وإلا يُستعمل خط النظام.
- مكتبة Excel ([SheetJS](https://sheetjs.com), Apache-2.0) مضمّنة في `assets/vendor/`.

## البنية / Structure

```
index.html              app shell
assets/css/app.css      themes, RTL/LTR layout, responsive styles
assets/js/i18n.js       Arabic / English dictionary
assets/js/db.js         IndexedDB storage
assets/js/ui.js         icons, modals, toasts, printing, rich-text editor
assets/js/settings.js   settings page, themes, fonts, backup/restore
assets/js/schemas.js    field definitions for each module
assets/js/crud.js       generic list / form / preview / print
assets/js/students.js   students, profile, import/export, print sheets
assets/js/grades.js     grade entry, averages, ranking, statistics
assets/js/drawings.js   canvas drawing editor
assets/js/search.js     global quick search
assets/js/dashboard.js  home page
assets/js/app.js        router & navigation
sw.js                   offline cache (service worker)
```

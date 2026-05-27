<<<<<<< HEAD
# 📻 Arabic Radio | راديو العرب

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/Saeed-Badr/Arabic-Radio/releases)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Electron](https://img.shields.io/badge/Electron-41.x-47848f.svg)](https://electronjs.org)

**Arabic Radio** هو تطبيق سطح مكتب متقدم للمنصة Windows (Electron) يوفر آلاف المحطات الإذاعية العربية والعالمية، مع مؤثرات صوتية محترفة، تايمر، تسجيل البث المباشر، وواجهة مستخدم حديثة تدعم اللغتين العربية والإنجليزية بشكل كامل.

**Arabic Radio** is an advanced desktop application (Electron) for Windows, offering thousands of Arabic and international radio stations with professional audio effects, timer, live recording, and a modern bilingual UI (Arabic/English).

![لقطة واجهة التطبيق](screenshot.png)

---

## ✨ الميزات الرئيسية | Main Features

- 🎙️ **آلاف المحطات الإذاعية** من جميع الدول العربية والعالم، مع إمكانية الإضافة والحذف والاستيراد/التصدير.
- 🌐 **دعم كامل للغتين** العربية (RTL) والإنجليزية (LTR) مع تبديل فوري.
- 🎛️ **مؤثرات صوتية متقدمة**:
  - ضاغط الصوت (Compressor)
  - فصل الاستيريو (يسار / يمين / وسط)
  - تغيير جهاز الإخراج الصوتي (Output Device)
- ⏱️ **مؤقت إيقاف التشغيل** (20, 40, 60, 80 دقيقة) مع عرض الوقت المتبقي.
- ⏫ **مؤقت تصاعدي** (Timer Up) لمعرفة مدة استماعك الحالية.
- 🔴 **تسجيل البث المباشر** وحفظه بصيغة WebM.
- 💾 **سجل الاستماع** (آخر 100 محطة) مع إمكانية البحث والتصدير والمسح التلقائي.
- ❤️ **المفضلة** لحفظ المحطات المفضلة لديك.
- 🔍 **البحث المتقدم**:
  - بحث محلي في المحطات المحملة.
  - بحث عبر **Radio Browser API** (آلاف المحطات الإضافية).
- 🎨 **ثلاثة مظاهر (Themes)**:
  - الوضع الافتراضي (كحلي)
  - الوضع الداكن عالي التباين
  - الوضع الفاتح
  - 🆕 الوضع الأحمر (Red Theme)
- ⌨️ **اختصارات لوحة مفاتيح شاملة** (أكثر من 50 اختصاراً).
- 📦 **تحديث تلقائي** عبر GitHub Releases (باستخدام `electron-updater`).
- 🔧 **وضع مصغر (Compact Mode)** لمشاهدة شريط التشغيل فقط.
- 📁 **استيراد / تصدير** قائمة المحطات (JSON).
- 🖼️ **تغيير أيقونة المحطة** يدوياً (صور من المستخدم).

---

## 📦 متطلبات التشغيل | Requirements

- نظام التشغيل: **Windows 7 / 8 / 10 / 11** (64-bit)
- (اختياري) اتصال بالإنترنت للبحث عبر API وللتحديثات التلقائية.

---

## 🚀 تحميل وتثبيت | Download & Install

يمكنك تحميل أحدث إصدار من [صفحة الإصدارات](https://github.com/Saeed-Badr/Arabic-Radio/releases).

- **`Arabic Radio Setup X.X.X.exe`** – المثبت القياسي (NSIS) مع خيار اختيار مجلد التثبيت وإنشاء اختصارات.
- **`Arabic Radio X.X.X.exe`** – النسخة المحمولة (Portable) التي لا تحتاج إلى تثبيت.

بعد التثبيت، سيتم إنشاء مجلد `%APPDATA%\Arabic Radio` لحفظ التفضيلات والملفات.

---

## 🛠️ بناء التطبيق من المصدر | Build from Source

1. **استنساخ المستودع**
   ```bash
   git clone https://github.com/Saeed-Badr/Arabic-Radio.git
   cd Arabic-Radio

تثبيت الاعتماديات
npm install

تشغيل وضع التطوير
npm start

بناء التطبيق للإنتاج
npm run dist

ستجد ملفات الإخراج في مجلد dist/.

⌨️ أبرز اختصارات لوحة المفاتيح | Key Shortcuts

الاختصار	                                               الوظيفة

Ctrl+Shift+1 ... 4	تعيين مؤقت إيقاف (20-80 دقيقة)
Ctrl+Shift+A / D	تفعيل / تعطيل التشغيل التلقائي للمحطة الأخيرة
Ctrl+Shift+V / B	تفعيل / تعطيل المؤثرات البصرية (Visualizer)
Ctrl+Shift+R / U	إظهار / إخفاء أيقونة التسجيل
Ctrl+Shift+5 ... 8	تغيير تأخير التشغيل التلقائي (0.5 – 3 ثوانٍ)
Ctrl+Shift+F10 ... F12	تغيير حجم الخط (صغير – متوسط – كبير)
Ctrl+Shift+F1 ... F4	تغيير المظهر (افتراضي – داكن – فاتح – أحمر)
Ctrl+Shift+K	                عرض نافذة جميع الاختصارات
Ctrl+Shift+U	                البحث عن تحديثات (في النسخة المثبتة)
Ctrl+Shift+G	                فتح صفحة GitHub (مفتوح المصدر)
Ctrl+P / Space	                تشغيل / إيقاف مؤقت
Ctrl+1 ... 5     	التبديل بين التبويبات (المحطات – المفضلة – البحث – الإضافة – السجل)
Ctrl+O / Shift+O	فتح رابط بث مباشر (URL)
Ctrl+Q / Ctrl+W	                الخروج من التطبيق

لعرض جميع الاختصارات داخل التطبيق: Ctrl+Shift+K أو من قائمة مساعدة → اختصارات لوحة المفاتيح.

🔄 آلية التحديث التلقائي | Auto Updates
يستخدم التطبيق مكتبة electron-updater.

عند بدء التشغيل، يتحقق من وجود إصدار جديد على GitHub Releases.

إذا توفر تحديث، سيظهر إشعار للمستخدم ويمكنه تثبيته فوراً (سيتم إعادة تشغيل التطبيق).

يمكنك أيضاً التحقق يدوياً من خلال مساعدة → البحث عن تحديثات (Ctrl+Shift+U).

ملاحظة: خاصية التحديث التلقائي تعمل فقط في النسخة المثبتة (Installer)، وليس في النسخة المحمولة أو بيئة التطوير.

📄 هيكل المشروع | Project Structure
text
Arabic-Radio/
├── main.js                 # عملية Electron الرئيسية
├── preload.js              # Bridge آمن بين العمليات
├── package.json            # إعدادات المشروع والتحديثات
├── src/
│   ├── index.html          # الواجهة الرئيسية
│   ├── style.css           # التنسيقات والثيمات
│   ├── assets/             # أيقونات وأعلام وصور
│   ├── *.js                # جميع ملفات المنطق (appInit, i18n, stations, settings, ...)
│   └── ...
├── dist/                   # مخرجات البناء (يتم إنشاؤها بعد npm run dist)
└── README.md

🤝 المساهمة | Contributing
المشروع مفتوح المصدر تحت رخصة MIT. نرحب بأي مساهمات (تحسينات، إصلاح أخطاء، ترجمات إضافية، إلخ).

قم بعمل Fork للمستودع.

أنشئ فرعاً جديداً للميزة (git checkout -b feature/amazing-feature).

commit التغييرات (git commit -m 'Add some amazing feature').

ادفع إلى الفرع (git push origin feature/amazing-feature).

افتح طلب سحب (Pull Request).

📜 الترخيص | License
هذا المشروع مرخص بموجب MIT License. يمكنك استخدامه وتعديله وتوزيعه بحرية مع الاحتفاظ بإشعار حقوق الملكية.

📧 تواصل | Contact
البريد الإلكتروني: saeedbadr112@hotmail.com

GitHub: Saeed-Badr

⭐ إذا أعجبك التطبيق، لا تنسى وضع نجمة (Star) على المستودع!
⭐ If you like the app, don't forget to star the repository!

=======
# Arabic-Radio
Arabic Radio
>>>>>>> 789a63741302ea48cb2a99b0c9a2dfc8f2a866b7

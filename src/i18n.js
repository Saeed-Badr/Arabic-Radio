// الترجمة (i18n)
const translations = {
  ar: {
    app_title: "Arabic Radio",
    loading: "جاري تحميل المحطات...",
    no_stations: "📻 لا توجد محطات",
    no_stations_genre: "📻 لا توجد محطات في هذا التصنيف حالياً.",
    no_stations_country: "📻 لا توجد محطات لهذه الدولة حالياً.",
    no_favorites: "❤️ لا توجد محطات مفضلة. أضف من خلال نجمة المحطة.",
    no_history: "📋 لا توجد محطات في السجل بعد. استمع إلى أي محطة ستظهر هنا.",
    search_placeholder: "ابحث عن محطة إذاعة، أو مدينة...",
    search_results_for: "نتائج البحث عن:",
    search_empty: "🔍 اكتب كلمة للبحث في جميع المحطات.",
    no_search_results: "⚠️ لا توجد نتائج مطابقة للبحث.",
    add_station_title: "إضافة محطة إذاعية جديدة",
    station_name_label: "اسم المحطة:",
    station_url_label: "رابط البث (URL):",
    country_label: "الدولة:",
    selected: "تم اختيار",
    genre_label: "النوع (اختياري):",
    icon_url_label: "رابط الأيقونة (اختياري):",
    add_button: "إضافة",
    cancel_button: "إلغاء",
    tab_stations: "المحطات",
    tab_favorites: "المفضلة",
    tab_search: "نتائج البحث",
    tab_add_station: "إضافة محطة",
    tab_history: "السجل",
    play: "تشغيل",
    stop: "إيقاف",
    save_to_favorites: "حفظ",
    saved_to_favorites: "تم الحفظ",
    current_station_default: "لم يتم اختيار محطة",
    connecting: "جارٍ الاتصال...",
    stopped_auto: "تم إيقاف البث تلقائياً بعد المدة المحددة",
    timer_set: (minutes) => `تم ضبط إيقاف البث بعد ${minutes} دقيقة`,
    no_active_stream: "لا يوجد بث نشط لتحديد مدة الإيقاف",
    no_station_selected: "لم يتم اختيار محطة للتشغيل",
    playback_failed: "تعذر تشغيل البث - تأكد من الرابط",
    stream_error: "خطأ في البث",
    not_supported: "متصفحك لا يدعم تشغيل هذا النوع",
    hls_error: "فشل تشغيل البث",
    webview_error: "عذراً، لا يدعم التطبيق هذا النوع من البث",
    webview_working: "يعمل الآن (بث مباشر من الموقع)",
    added_to_favorites: "تمت الإضافة إلى المفضلة",
    removed_from_favorites: "تمت الإزالة من المفضلة",
    theme_default: "الافتراضي",
    theme_dark: "داكن (تباين عالٍ)",
    theme_light: "فاتح",
    theme_changed: (theme) => `تم تغيير المظهر إلى ${theme}`,
    menu_file: "ملف",
    menu_open_url: "فتح رابط البث",
    menu_add_station: "إضافة محطة جديدة",
    menu_import: "استيراد المحطات",
    menu_export: "تصدير المحطات",
    menu_exit: "خروج",
    menu_playback: "تشغيل",
    menu_resume: "استئناف",
    menu_stop_after: "إيقاف بعد مدة",
    menu_stop_now: "إيقاف الآن",
    menu_shuffle: "تشغيل عشوائي",
    menu_audio: "صوت",
    menu_compressor: "ضاغط",
    menu_stereo: "فصل ستيريو",
    menu_output: "جهاز إخراج",
    menu_view: "عرض",
    menu_history: "سجل",
    menu_settings: "الإعدادات",
    menu_always_on_top: "دائماً في المقدمة",
    menu_theme: "المظهر",
    menu_close_tab: "إغلاق التبويب الحالي",
    menu_help: "مساعدة",
    menu_shortcuts: "اختصارات لوحة المفاتيح",
    menu_debug: "تصحيح الأخطاء",
    menu_feedback: "إرسال ملاحظات",
    menu_about: "حول",
    menu_license: "الترخيص",
    menu_open_source: "مفتوح المصدر",
    menu_release_notes: "ملاحظات الإصدار",
    menu_hello: "مرحباً",
    settings_auto_resume: "تشغيل تلقائى للمحطة الأخيرة",
    settings_auto_resume_delay: "تأخير التشغيل التلقائي",
    settings_font_size: "حجم الخط",
    settings_language: "اللغة",
    settings_auto_clear_history: "مسح السجل كل 7 أيام",
    settings_visualizer: "مؤثرات الصوت البصرية",
    settings_record_icon: "أيقونة التسجيل",
    history_count: "عدد المحطات:",
    clear_history: "مسح الكل",
    export_history: "تصدير",
    search_history: "بحث في السجل...",
    delete_from_history: "حذف من السجل",
    no_history_filter: (keyword) => `🔍 لا توجد نتائج مطابقة للبحث "${keyword}"`,
    delete_station: "حذف المحطة",
    confirm_delete_station: (name) => `⚠️ هل أنت متأكد من حذف المحطة "${name}" نهائياً؟`,
    station_deleted: "🗑️ تم حذف المحطة بنجاح",
    timer_remaining: (minutes, seconds) => `⏱️ إيقاف بعد ${minutes}:${seconds}`,
    timer_up_format: (hours, minutes, seconds) => `${hours}:${minutes}:${seconds}`,
    recording: "🔴 جاري تسجيل البث...",
    recording_stopped: "✅ تم إيقاف تسجيل البث",
    recording_saved: "📀 تم حفظ التسجيل",
    recording_not_supported: "التسجيل غير مدعوم في هذا المتصفح",
    recording_failed: "فشل بدء التسجيل",
    output_device_changed: (label) => `🔊 تم تغيير جهاز الإخراج إلى: ${label}`,
    output_device_default: "🔊 تم تغيير جهاز الإخراج إلى: النظام الافتراضي",
    output_device_not_supported: "⚠️ ميزة تغيير جهاز الإخراج غير مدعومة في هذا المتصفح.",
    output_device_select: "اختيار جهاز...",
    output_device_selected: "الجهاز المختار",
    output_device_not_selected: "⚠️ لم يتم اختيار أي جهاز إخراج.",
    output_device_select_error: (msg) => `❌ فشل اختيار جهاز الإخراج: ${msg}`,
    output_device_changed_to_selected: "🔊 تم تغيير جهاز الإخراج إلى الجهاز المختار",
    output_device_change_error: (msg) => `❌ فشل تغيير جهاز الإخراج: ${msg}`,
    compressor_on: "✅ تم تفعيل ضاغط الصوت",
    compressor_off: "✅ تم إلغاء ضاغط الصوت",
    compressor_error: "خطأ في الضاغط",
    stereo_left: "🎧 توجيه الصوت إلى اليسار",
    stereo_right: "🎧 توجيه الصوت إلى اليمين",
    stereo_center: "🎵 إلغاء فصل الستيريو",
    stereo_error: "خطأ في الستيريو",
    confirm_clear_history: "⚠️ هل أنت متأكد من مسح سجل الاستماع بالكامل؟ لا يمكن التراجع.",
    confirm_exit: "هل تريد إغلاق التطبيق؟",
    confirm_auto_clear: "تم تفعيل مسح السجل التلقائي. هل تريد مسح السجل القديم الآن؟",
    no_history_to_export: "⚠️ لا يوجد سجل لتصديره",
    history_exported: "📁 تم تصدير السجل بنجاح",
    searching_online: "جاري البحث عبر الإنترنت...",
    opening_source: "🌐 جاري فتح صفحة المصدر المفتوح...",
    always_on_top_set: "تم ضبط النافذة دائماً في المقدمة",
    always_on_top_electron_only: "هذه الميزة تعمل فقط في تطبيق Electron",
    auto_resume_toggled: (status) => `✅ تم ${status === 'enabled' ? 'تفعيل' : 'تعطيل'} التشغيل التلقائي للمحطة الأخيرة`,
    checking_for_updates: "جاري البحث عن تحديثات...",
updates_only_in_production: "⚠️ ميزة البحث عن تحديثات تعمل فقط في النسخة المثبتة من التطبيق",
updates_not_supported: "⚠️ التحديثات غير مدعومة في هذا الإصدار",
    opening_email: "📧 سيتم فتح بريدك الإلكتروني لإرسال الملاحظات",
    version: "الإصدار 1.0.0",
    about_text: "تطبيق راديو متعدد المصادر يدعم المحطات العربية والعالمية، مع مؤثرات صوتية، تايمر، سجل استماع، وواجهة سهلة الاستخدام.\n\nجميع الحقوق محفوظة © 2026 سعيد بدر\nمرخص بموجب رخصة MIT",
    station_added: (name) => `✅ تمت إضافة المحطة: ${name}`,
    stations_imported: (count) => `تم استيراد ${count} محطة.`,
    invalid_file: "⚠️ الملف غير صالح",
    greeting_morning: "صباح الخير",
    greeting_evening: "مساء الخير",
    greeting_night: "مساء الخير",
    thank_you_message: "شكراً لاستخدامك تطبيق Arabic Radio.\nنتمنى لك وقتاً ممتعاً مع الموسيقى والإذاعات.",
    genre_variety: "متنوع",
    compact_mode: "وضع مصغر",
    exit_compact_mode: "خروج من المصغر",
    station_name_placeholder: "مثال: إذاعة القرآن الكريم",
    genre_placeholder: "مثل: ديني, موسيقى",
  worldwide: "عالمي",
  // المفاتيح الجديدة لتغيير الأيقونة:
  change_icon: "تغيير الأيقونة",
  icon_changed_success: "✅ تم تغيير الأيقونة بنجاح",
  icon_change_failed: "❌ فشل تغيير الأيقونة",
  icon_file_too_large: "⚠️ حجم الصورة كبير جداً (الحد الأقصى 2 ميغابايت)",
  theme_red: "أحمر",
  search_countries_placeholder: "🔍 بحث عن دولة أو تصنيف...",
  station_not_found: "⚠️ المحطة غير موجودة"
  },
  en: {
    app_title: "Arabic Radio",
    loading: "Loading stations...",
    no_stations: "📻 No stations available.",
    no_stations_genre: "📻 No stations in this genre currently.",
    no_stations_country: "📻 No stations for this country currently.",
    no_favorites: "❤️ No favorite stations. Add one by clicking the star.",
    no_history: "📋 No stations in history yet. Listen to any station and it will appear here.",
    search_placeholder: "Search for a radio station or city...",
    search_countries_placeholder: "🔍 Search for a country or category...",
    search_results_for: "Search results for:",
    search_empty: "🔍 Type a keyword to search all stations.",
    no_search_results: "⚠️ No matching results.",
    add_station_title: "Add New Radio Station",
    station_name_label: "Station Name:",
    station_url_label: "Stream URL:",
    country_label: "Country:",
    genre_label: "Genre (optional):",
    icon_url_label: "Icon URL (optional):",
    add_button: "Add",
    cancel_button: "Cancel",
    tab_stations: "Stations",
    tab_favorites: "Favorites",
    tab_search: "Search Results",
    tab_add_station: "Add Station",
    tab_history: "History",
    play: "Play",
    stop: "Stop",
    save_to_favorites: "Save",
    saved_to_favorites: "Saved",
    current_station_default: "No station selected",
    connecting: "Connecting...",
    stopped_auto: "Stream stopped automatically after timer",
    timer_set: (minutes) => `Auto-stop after ${minutes} minutes`,
    no_active_stream: "No active stream to set timer",
    no_station_selected: "No station selected",
    playback_failed: "Failed to play - check the stream URL",
    stream_error: "Stream error",
    not_supported: "Your browser does not support this stream type",
    hls_error: "Failed to play HLS stream",
    webview_error: "Sorry, this stream type is not supported",
    webview_working: "Now playing (live from website)",
    added_to_favorites: "Added to favorites",
    removed_from_favorites: "Removed from favorites",
    theme_default: "Default",
    theme_dark: "Dark (High Contrast)",
    theme_light: "Light",
    theme_changed: (theme) => `Theme changed to ${theme}`,
    menu_file: "File",
    menu_open_url: "Open Stream URL",
    menu_add_station: "Add New Station",
    menu_import: "Import Stations",
    menu_export: "Export Stations",
    menu_exit: "Exit",
    menu_playback: "Playback",
    menu_resume: "Resume",
    menu_stop_after: "Stop after",
    menu_stop_now: "Stop Now",
    menu_shuffle: "Shuffle Play",
    menu_audio: "Audio",
    menu_compressor: "Compressor",
    menu_stereo: "Stereo Separation",
    menu_output: "Output Device",
    menu_view: "View",
    selected: "Selected",
    menu_history: "History",
    menu_settings: "Settings",
    menu_always_on_top: "Always on Top",
    menu_theme: "Theme",
    menu_close_tab: "Close Current Tab",
    menu_help: "Help",
    menu_shortcuts: "Keyboard Shortcuts",
    menu_debug: "Debug Info",
    menu_feedback: "Send Feedback",
    menu_about: "About",
    menu_license: "License",
    menu_open_source: "Open Source",
    menu_release_notes: "Release Notes",
    menu_hello: "Hello",
    theme_red: "Red",
    settings_auto_resume: "Auto-resume last station",
    settings_auto_resume_delay: "Auto-resume delay",
    settings_font_size: "Font size",
    settings_language: "Language",
    settings_auto_clear_history: "Auto-clear history every 7 days",
    settings_visualizer: "Audio visualizer",
    settings_record_icon: "Record icon",
    history_count: "Stations:",
    clear_history: "Clear All",
    export_history: "Export",
    search_history: "Search history...",
    delete_from_history: "Delete from history",
    no_history_filter: (keyword) => `🔍 No results for "${keyword}"`,
    delete_station: "Delete station",
    confirm_delete_station: (name) => `⚠️ Are you sure you want to permanently delete "${name}"?`,
    station_deleted: "🗑️ Station deleted successfully",
    timer_remaining: (minutes, seconds) => `⏱️ Stop after ${minutes}:${seconds}`,
    timer_up_format: (hours, minutes, seconds) => `${hours}:${minutes}:${seconds}`,
    recording: "🔴 Recording stream...",
    recording_stopped: "✅ Recording stopped",
    recording_saved: "📀 Recording saved",
    recording_not_supported: "Recording not supported in this browser",
    recording_failed: "Failed to start recording",
    output_device_changed: (label) => `🔊 Output device changed to: ${label}`,
    output_device_default: "🔊 Output device changed to: System Default",
    output_device_not_supported: "⚠️ Output device selection not supported in this browser.",
    output_device_select: "Select device...",
    output_device_selected: "selected device",
    output_device_not_selected: "⚠️ No output device selected.",
    output_device_select_error: (msg) => `❌ Failed to select output device: ${msg}`,
    output_device_changed_to_selected: "🔊 Output device changed to selected device",
    output_device_change_error: (msg) => `❌ Failed to change output device: ${msg}`,
    compressor_on: "✅ Compressor enabled",
    compressor_off: "✅ Compressor disabled",
    compressor_error: "Compressor error",
    stereo_left: "🎧 Audio left channel only",
    stereo_right: "🎧 Audio right channel only",
    stereo_center: "🎵 Stereo restored",
    stereo_error: "Stereo error",
    confirm_clear_history: "⚠️ Are you sure you want to clear all history? This cannot be undone.",
    confirm_exit: "Do you want to close the application?",
    confirm_auto_clear: "Auto-clear history enabled. Do you want to clear old history now?",
    no_history_to_export: "⚠️ No history to export",
    history_exported: "📁 History exported successfully",
    searching_online: "Searching online...",
    opening_source: "🌐 Opening open source page...",
    always_on_top_set: "Window set to always on top",
    always_on_top_electron_only: "This feature only works in Electron app",
    auto_resume_toggled: (status) => `✅ Auto-resume ${status === 'enabled' ? 'enabled' : 'disabled'}`,
    opening_email: "📧 Opening your email client to send feedback",
    version: "Version 1.0.0",
    about_text: "Multi-source radio app supporting Arabic and international stations, with audio effects, timer, listening history, and easy-to-use interface.\n\nAll rights reserved © 2026 Saeed Badr\nLicensed under MIT License",
    station_added: (name) => `✅ Station added: ${name}`,
    stations_imported: (count) => `Imported ${count} stations.`,
    invalid_file: "⚠️ Invalid file",
    greeting_morning: "Good morning",
    greeting_evening: "Good evening",
    greeting_night: "Good evening",
    thank_you_message: "Thank you for using Arabic Radio.\nEnjoy your music and radio stations.",
    checking_for_updates: "Checking for updates...",
updates_only_in_production: "⚠️ Update check feature works only in the installed version of the app",
updates_not_supported: "⚠️ Updates not supported in this version",
    genre_variety: "Variety",
    compact_mode: "Compact Mode",
    exit_compact_mode: "Exit Compact Mode",
    station_name_placeholder: "e.g., BBC Radio",
    genre_placeholder: "e.g., Religious, Music",
  worldwide: "Worldwide",
  // New keys for changing icon:
  change_icon: "Change Icon",
  icon_changed_success: "✅ Icon changed successfully",
  icon_change_failed: "❌ Failed to change icon",
  icon_file_too_large: "⚠️ Image file too large (max 2 MB)",
  station_not_found: "⚠️ Station not found"
  }
};

let currentLanguage = localStorage.getItem('setting_language') || 'en';

function t(key, ...args) {
  let str = translations[currentLanguage]?.[key] || translations['ar'][key] || key;
  if (args.length) {
    if (typeof str === 'function') str = str(...args);
    else for (let i = 0; i < args.length; i++) str = str.replace(new RegExp(`\\{${i}\\}`, 'g'), args[i]);
  }
  return str;
}

function updateAllTexts() {
  // 1. تحديث العناصر التي تحمل data-i18n
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (key) {
      if (el.hasAttribute('data-i18n-placeholder')) {
        el.placeholder = t(key);
      } else {
        el.textContent = t(key);
      }
    }
  });
  
  // 2. تحديث placeholders الخاصة (لأن بعضها ليس له data-i18n-placeholder)
  const searchInput = document.getElementById('searchInput');
  if (searchInput) searchInput.placeholder = t('search_placeholder');
  const historySearch = document.getElementById('historySearchInput');
  if (historySearch) historySearch.placeholder = t('search_history');
  const countriesSearchInput = document.getElementById('countriesSearchInput');
if (countriesSearchInput) countriesSearchInput.placeholder = t('search_countries_placeholder');
  
  // 2b. تحديث placeholder لحقل اسم المحطة والنوع
  const stationNameInput = document.getElementById('newStationName');
  if (stationNameInput) stationNameInput.placeholder = t('station_name_placeholder');
  
  const genreInput = document.getElementById('newStationGenre');
  if (genreInput) genreInput.placeholder = t('genre_placeholder');
  
  // 3. عنوان التطبيق
  document.title = t('app_title');
  const logoTitle = document.querySelector('.logo-area h1');
  if (logoTitle) logoTitle.textContent = t('app_title');
  
  // 4. تبويب إضافة محطة
  const addTitle = document.querySelector('#add-station-tab h3');
  if (addTitle) addTitle.innerHTML = `<i class="fas fa-plus-circle"></i> ${t('add_station_title')}`;
  
  // 5. حقول النموذج
  const labels = ['newStationName', 'newStationUrl', 'newStationCountry', 'newStationGenre', 'newStationIcon'];
  const labelTexts = ['station_name_label', 'station_url_label', 'country_label', 'genre_label', 'icon_url_label'];
  labels.forEach((id, idx) => {
    const label = document.querySelector(`label[for="${id}"]`);
    if (label) label.textContent = t(labelTexts[idx]);
  });
  const addBtn = document.getElementById('submitAddStation');
  if (addBtn) addBtn.innerHTML = `<i class="fas fa-save"></i> ${t('add_button')}`;
  const cancelBtn = document.getElementById('cancelAddStation');
  if (cancelBtn) cancelBtn.innerHTML = `<i class="fas fa-times"></i> ${t('cancel_button')}`;
  
  // 6. أزرار التبويبات
  const tabs = document.querySelectorAll('.tab-btn');
  const tabKeys = ['tab_stations', 'tab_favorites', 'tab_search', 'tab_add_station', 'tab_history'];
  tabs.forEach((tab, idx) => {
    if (idx < tabKeys.length) {
      const icon = tab.querySelector('i');
      tab.innerHTML = '';
      if (icon) tab.appendChild(icon);
      tab.appendChild(document.createTextNode(' ' + t(tabKeys[idx])));
    }
  });
  
  // 7. عنوان لوحة الدول
  const countriesTitle = document.querySelector('.countries-panel h3');
  if (countriesTitle) {
    countriesTitle.innerHTML = (currentLanguage === 'en' ? 'Countries & Major World Stations ' : 'الدول و أهم المحطات العالمية ') + '<span class="country-count"></span>';
  }
  
  // 8. ترجمة عناوين القوائم الرئيسية
  const mainMenuItems = document.querySelectorAll('.menu-item');
  const mainMenuKeys = ['menu_file', 'menu_playback', 'menu_audio', 'menu_view', 'menu_help'];
  mainMenuItems.forEach((item, idx) => {
    if (idx < mainMenuKeys.length) {
      const textNode = Array.from(item.childNodes).find(n => n.nodeType === Node.TEXT_NODE);
      if (textNode) textNode.textContent = t(mainMenuKeys[idx]);
    }
  });
  
  const menuMap = {
    menuOpenURL: 'menu_open_url',
    menuAddStation: 'menu_add_station',
    menuImportStations: 'menu_import',
    menuExportStations: 'menu_export',
    menuExit: 'menu_exit',
    menuResume: 'menu_resume',
    menuStop: 'menu_stop_now',
    menuShuffle: 'menu_shuffle',
    menuCompressor: 'menu_compressor',
    menuAlwaysOnTop: 'menu_always_on_top',
    menuCloseTab: 'menu_close_tab',
    menuKeyboardShortcuts: 'menu_shortcuts',
    menuDebug: 'menu_debug',
    menuFeedback: 'menu_feedback',
    menuAboutHelp: 'menu_about',
    menuLicense: 'menu_license',
    menuOpenSource: 'menu_open_source',
    menuReleaseNotes: 'menu_release_notes',
    menuHello: 'menu_hello',
    menuViewStations: 'tab_stations',
    menuHistory: 'tab_history'
  };
  for (const [id, key] of Object.entries(menuMap)) {
    const el = document.getElementById(id);
    if (el) {
      const icon = el.querySelector('i');
      const shortcut = el.querySelector('.menu-shortcut');
      el.innerHTML = '';
      if (icon) el.appendChild(icon);
      el.appendChild(document.createTextNode(' ' + t(key) + ' '));
      if (shortcut) el.appendChild(shortcut);
    }
  }
  
  // 10. ترجمة عناوين القوائم الفرعية
  const submenuItems = document.querySelectorAll('.dropdown-item.has-submenu');
  const submenuMap = {
    'إيقاف بعد مدة': 'menu_stop_after',
    'فصل ستيريو': 'menu_stereo',
    'جهاز إخراج': 'menu_output',
    'المظهر': 'menu_theme',
    'الإعدادات': 'menu_settings'
  };
  submenuItems.forEach(item => {
    const textNode = Array.from(item.childNodes).find(n => n.nodeType === Node.TEXT_NODE && n.textContent.trim());
    if (textNode && submenuMap[textNode.textContent.trim()]) {
      textNode.textContent = t(submenuMap[textNode.textContent.trim()]);
    }
  });
  
  // 11. ترجمة الخيارات الثانوية
  document.querySelectorAll('.submenu-item[data-minutes]').forEach(item => {
    const minutes = item.dataset.minutes;
    const textNode = Array.from(item.childNodes).find(n => n.nodeType === Node.TEXT_NODE);
    if (textNode) textNode.textContent = currentLanguage === 'en' ? `${minutes} min` : `${minutes} دقيقة`;
  });
  document.querySelectorAll('.submenu-item[data-stereo]').forEach(item => {
    const mode = item.dataset.stereo;
    let text = '';
    if (mode === 'left') text = currentLanguage === 'en' ? 'Left' : 'يسار';
    else if (mode === 'right') text = currentLanguage === 'en' ? 'Right' : 'يمين';
    else if (mode === 'center') text = currentLanguage === 'en' ? 'Center' : 'وسط';
    const textNode = Array.from(item.childNodes).find(n => n.nodeType === Node.TEXT_NODE);
    if (textNode && text) textNode.textContent = text;
  });
  document.querySelectorAll('#outputDeviceSubmenu .submenu-item').forEach(item => {
    const device = item.dataset.device;
    const textNode = Array.from(item.childNodes).find(n => n.nodeType === Node.TEXT_NODE);
    if (textNode) {
      if (device === 'default') textNode.textContent = currentLanguage === 'en' ? 'Default' : 'افتراضي';
      else if (device === 'select') textNode.textContent = currentLanguage === 'en' ? 'Select device...' : 'اختيار جهاز...';
    }
  });
  document.querySelectorAll('.submenu-item[data-theme]').forEach(item => {
    const theme = item.dataset.theme;
    let text = '';
    if (theme === 'default') text = currentLanguage === 'en' ? 'Default' : 'الافتراضي';
    else if (theme === 'dark') text = currentLanguage === 'en' ? 'Dark' : 'داكن';
    else if (theme === 'light') text = currentLanguage === 'en' ? 'Light' : 'فاتح';
    const textNode = Array.from(item.childNodes).find(n => n.nodeType === Node.TEXT_NODE);
    if (textNode && text) textNode.textContent = text;
  });
  
  // 12. ترجمة إعدادات القوائم الفرعية
  document.querySelectorAll('.submenu-item.has-submenu-settings').forEach(item => {
    const textNode = Array.from(item.childNodes).find(n => n.nodeType === Node.TEXT_NODE);
    if (textNode) {
      const original = textNode.textContent.trim();
      const keyMap = {
        'تشغيل تلقائى للمحطة الأخيرة': 'settings_auto_resume',
        'تأخير التشغيل التلقائي': 'settings_auto_resume_delay',
        'حجم الخط': 'settings_font_size',
        'اللغة': 'settings_language',
        'مسح السجل كل 7 أيام': 'settings_auto_clear_history',
        'مؤثرات الصوت البصرية': 'settings_visualizer',
        'أيقونة التسجيل': 'settings_record_icon'
      };
      if (keyMap[original]) textNode.textContent = t(keyMap[original]);
    }
  });
  
  // 13. ترجمة القيم داخل الإعدادات
  document.querySelectorAll('.submenu-vertical .submenu-value').forEach(item => {
    const value = item.dataset.value;
    const parentSetting = item.closest('.has-submenu-settings');
    if (parentSetting) {
      const settingKey = parentSetting.dataset.setting;
      let text = '';
      if (settingKey === 'autoResume') text = currentLanguage === 'en' ? (value === 'true' ? 'Enabled' : 'Disabled') : (value === 'true' ? 'مفعل' : 'معطل');
      else if (settingKey === 'autoResumeDelay') text = currentLanguage === 'en' ? `${value} sec` : `${value} ثانية`;
      else if (settingKey === 'fontSize') {
        if (value === 'large') text = currentLanguage === 'en' ? 'Large' : 'كبير';
        else if (value === 'medium') text = currentLanguage === 'en' ? 'Medium' : 'متوسط';
        else if (value === 'small') text = currentLanguage === 'en' ? 'Small' : 'صغير';
      } else if (settingKey === 'language') text = value === 'ar' ? 'العربية' : 'English';
      else if (settingKey === 'autoClearHistory') text = currentLanguage === 'en' ? (value === 'true' ? 'Enabled' : 'Disabled') : (value === 'true' ? 'مفعل' : 'معطل');
      else if (settingKey === 'visualizer') text = currentLanguage === 'en' ? (value === 'true' ? 'Enabled' : 'Disabled') : (value === 'true' ? 'مفعل' : 'معطل');
      else if (settingKey === 'recordIcon') text = currentLanguage === 'en' ? (value === 'true' ? 'Visible' : 'Hidden') : (value === 'true' ? 'ظاهرة' : 'مخفية');
      const textNode = Array.from(item.childNodes).find(n => n.nodeType === Node.TEXT_NODE);
      if (textNode && text) textNode.textContent = text;
    }
  });
  
  // 14. تحديث شريط التشغيل والمحطة الحالية
  const currentStationName = document.getElementById('currentStationName');
  if (currentStationName && (!window.currentStation || !window.currentStation.name)) {
    currentStationName.innerText = t('current_station_default');
  }
  if (typeof updateFavButtonCurrent === 'function') updateFavButtonCurrent();
  
  // 15. تحديث أزرار السجل
  const clearBtn = document.getElementById('clearAllHistoryBtn');
  if (clearBtn) clearBtn.innerHTML = `<i class="fas fa-trash-alt"></i> ${t('clear_history')}`;
  const exportBtn = document.getElementById('exportHistoryBtn');
  if (exportBtn) exportBtn.innerHTML = `<i class="fas fa-download"></i> ${t('export_history')}`;
  
  // 16. تحديث المحتوى الديناميكي
  if (window.currentTab === 'stations-tab' && typeof renderStations === 'function') renderStations();
  else if (window.currentTab === 'favorites-tab' && typeof renderFavoritesTab === 'function') renderFavoritesTab();
  else if (window.currentTab === 'history-tab' && typeof renderHistoryTab === 'function') renderHistoryTab();
  else if (window.currentTab === 'search-tab' && typeof performSearch === 'function') performSearch(window.searchKeyword || '');
  
  // 17. تحديث قائمة الدول
  if (typeof renderCountriesList === 'function') renderCountriesList();
  if (typeof updateHeaderForFilter === 'function' && currentFilterItem) updateHeaderForFilter(currentFilterItem);
  
  // 18. تحديث نص زر الوضع المصغر
  if (typeof window.updateCompactModeText === 'function') window.updateCompactModeText();
// تحديث اسم الدولة في شريط التشغيل حسب اللغة
if (typeof window.updateCurrentStationCountry === 'function') {
    window.updateCurrentStationCountry();
}
}
function applyLanguage(lang) {
    if (lang === currentLanguage) return;
    
    currentLanguage = lang;
    localStorage.setItem('setting_language', lang);
    
    // إعادة تحميل الصفحة لضمان تحديث جميع القوائم والنصوص
    window.location.reload();
}

// =====================================================
// ترجمة النصوص الثابتة الإضافية (تبويب البحث وإضافة المحطة)
// =====================================================

function translateExtraElements() {
    const searchResultsSpan = document.querySelector('.search-info span:first-child');
    if (searchResultsSpan && !searchResultsSpan.hasAttribute('data-i18n')) {
        searchResultsSpan.textContent = t('search_results_for');
    }
    
    const addStationTitle = document.querySelector('#add-station-tab h3');
    if (addStationTitle) {
        addStationTitle.innerHTML = `<i class="fas fa-plus-circle"></i> ${t('add_station_title')}`;
    }
    
    const stationNameLabel = document.querySelector('label[for="newStationName"]');
    if (stationNameLabel) stationNameLabel.textContent = t('station_name_label');
    
    const stationUrlLabel = document.querySelector('label[for="newStationUrl"]');
    if (stationUrlLabel) stationUrlLabel.textContent = t('station_url_label');
    
    const countryLabel = document.querySelector('label[for="newStationCountry"]');
    if (countryLabel) countryLabel.textContent = t('country_label');
    
    const genreLabel = document.querySelector('label[for="newStationGenre"]');
    if (genreLabel) genreLabel.textContent = t('genre_label');
    
    const iconLabel = document.querySelector('label[for="newStationIcon"]');
    if (iconLabel) iconLabel.textContent = t('icon_url_label');
    
    const submitBtn = document.getElementById('submitAddStation');
    if (submitBtn) submitBtn.innerHTML = `<i class="fas fa-save"></i> ${t('add_button')}`;
    
    const cancelBtn = document.getElementById('cancelAddStation');
    if (cancelBtn) cancelBtn.innerHTML = `<i class="fas fa-times"></i> ${t('cancel_button')}`;
}

const originalUpdateAllTexts = updateAllTexts;
window.updateAllTexts = function() {
    originalUpdateAllTexts();
    translateExtraElements();
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', translateExtraElements);
} else {
    translateExtraElements();
}
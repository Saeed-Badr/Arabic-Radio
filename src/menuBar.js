// ========== القوائم الرئيسية ==========
function bindStereoSubmenu() {
    document.querySelectorAll('.submenu-item[data-stereo]').forEach(item => {
        item.removeEventListener('click', stereoClickHandler);
        item.addEventListener('click', stereoClickHandler);
    });
}

function stereoClickHandler(e) {
    e.stopPropagation();
    const mode = this.dataset.stereo;
    if (mode === 'left') applyStereoMode('left');
    else if (mode === 'right') applyStereoMode('right');
    else if (mode === 'center') applyStereoMode('center');
    const dropdown = this.closest('.dropdown-menu');
    if (dropdown) dropdown.style.display = 'none';
}

function bindOutputSubmenu() {
    document.querySelectorAll('#outputDeviceSubmenu .submenu-item').forEach(item => {
        item.removeEventListener('click', outputClickHandler);
        item.addEventListener('click', outputClickHandler);
    });
}

function outputClickHandler(e) {
    e.stopPropagation();
    const option = this.dataset.device;
    if (option === 'default') {
        setAudioOutputDevice('');
    } else if (option === 'select') {
        selectAndSetAudioOutput();
    }
}

function bindThemeSubmenu() {
    const themeItems = document.querySelectorAll('.submenu-item[data-theme]');
    themeItems.forEach(item => {
        item.removeEventListener('click', themeClickHandler);
        item.addEventListener('click', themeClickHandler);
    });
}
function themeClickHandler(e) {
    e.stopPropagation();
    const theme = this.dataset.theme;
    if (theme === 'default') applyTheme('default');
    else if (theme === 'dark') applyTheme('dark');
    else if (theme === 'light') applyTheme('light');
    else if (theme === 'red') applyTheme('red');   // ✅ هذا هو السطر المضاف
    const dropdown = this.closest('.dropdown-menu');
    if (dropdown) dropdown.style.display = 'none';
}

function initMenuBar() {
        document.getElementById('menuOpenURL')?.addEventListener('click', async () => { 
        const url = await window.customPrompt(currentLanguage === 'ar' ? 'أدخل رابط البث المباشر (URL):' : 'Enter stream URL:'); 
        if (url && url.trim()) playStation(url.trim(), currentLanguage === 'ar' ? 'رابط مخصص' : 'Custom URL', currentLanguage === 'ar' ? 'رابط خارجي' : 'External Link', 'custom_' + Date.now(), false);
    });
    document.getElementById('menuCompressor')?.addEventListener('click', () => { toggleCompressor(); });
    document.getElementById('menuAddStation')?.addEventListener('click', () => { switchTab('add-station-tab'); });
    document.getElementById('menuImportStations')?.addEventListener('click', () => { 
        const input = document.createElement('input'); 
        input.type = 'file'; 
        input.accept = 'application/json'; 
        input.onchange = (e) => { 
            const file = e.target.files[0]; 
            if (!file) return; 
            const reader = new FileReader(); 
            reader.onload = (ev) => { 
                try { 
                    const imported = JSON.parse(ev.target.result); 
                    if (Array.isArray(imported)) { 
                        masterStations = [...masterStations, ...imported]; 
                        const unique = new Map(); 
                        masterStations.forEach(st => unique.set(st.id, st)); 
                        masterStations = Array.from(unique.values()); 
                        saveMasterStations(); 
                        renderStations(); 
                        if (typeof renderFavoritesTab === 'function') renderFavoritesTab(); 
                        setStatus(t('stations_imported', imported.length), false);
                    } else throw new Error(); 
                } catch (err) { 
                    setStatus(t('invalid_file'), true); 
                } 
            }; 
            reader.readAsText(file); 
        }; 
        input.click(); 
    });
    document.getElementById('menuExportStations')?.addEventListener('click', () => { exportStations(); });
    document.getElementById('menuExit')?.addEventListener('click', () => { if (confirm(t('confirm_exit'))) { if (window.electronAPI) window.electronAPI.closeApp(); else window.close(); } });
    document.getElementById('menuResume')?.addEventListener('click', () => { if (audioPlayer.paused && currentStation && currentStation.url) playStation(currentStation.url, currentStation.name, currentStation.country, currentStation.id, currentStation.isWebPage); else if (!audioPlayer.paused) audioPlayer.play(); });
    document.getElementById('menuPause')?.addEventListener('click', () => { if (!audioPlayer.paused) audioPlayer.pause(); });
    document.getElementById('menuStop')?.addEventListener('click', () => { stopPlayback(); });
    document.getElementById('menuShuffle')?.addEventListener('click', () => { if (!masterStations.length) return; const randomIndex = Math.floor(Math.random() * masterStations.length); const randomStation = masterStations[randomIndex]; const countryObj = allCountries.find(c => c.code === randomStation.countryCode); const cName = countryObj ? countryObj.nameAr : randomStation.countryCode; playStation(randomStation.streamUrl, randomStation.name, cName, randomStation.id, randomStation.isWebPage); });
    document.getElementById('menuAbout')?.addEventListener('click', () => { showAbout(); });
    document.getElementById('menuViewStations')?.addEventListener('click', () => { switchTab('stations-tab'); });
    document.getElementById('menuHistory')?.addEventListener('click', () => { switchTab('history-tab'); });
    document.getElementById('menuSettings')?.addEventListener('click', () => { openSettings(); });
    document.getElementById('menuAlwaysOnTop')?.addEventListener('click', () => { toggleAlwaysOnTop(); });
    document.getElementById('menuCloseTab')?.addEventListener('click', () => { closeCurrentTab(); });
    document.getElementById('menuDebug')?.addEventListener('click', showDebugInfo);
    document.getElementById('menuFeedback')?.addEventListener('click', sendFeedback);
    document.getElementById('menuLicense')?.addEventListener('click', showLicense);
    document.getElementById('menuOpenSource')?.addEventListener('click', openSourceLink);
    document.getElementById('menuReleaseNotes')?.addEventListener('click', showReleaseNotes);
    document.getElementById('menuKeyboardShortcuts')?.addEventListener('click', showKeyboardShortcutsModal);
    document.getElementById('menuHello')?.addEventListener('click', sayHello);
    document.getElementById('menuAboutHelp')?.addEventListener('click', showAbout);
document.getElementById('menuCheckForUpdates')?.addEventListener('click', () => {
    if (window.electronAPI && window.electronAPI.checkForUpdates) {
        window.electronAPI.checkForUpdates();
        setStatus(currentLanguage === 'ar' ? 'جاري البحث عن تحديثات...' : 'Checking for updates...', false);
    } else {
        setStatus(currentLanguage === 'ar' ? 'التحديثات غير مدعومة في هذا الإصدار' : 'Updates not supported in this version', true);
    }
});
// قراءة الحالة الحالية لـ "دائماً في المقدمة" عند بدء التشغيل
if (window.electronAPI && window.electronAPI.getAlwaysOnTop) {
    window.electronAPI.getAlwaysOnTop().then(isOnTop => {
        updateAlwaysOnTopMenuState(isOnTop);
    }).catch(() => {});
}
}

// ========== دوال المظهر ==========
function applyTheme(theme) {
    document.body.classList.remove('default-theme', 'dark-high-contrast', 'light-theme', 'red-theme');
    if (theme === 'default') {
        document.body.classList.add('default-theme');
    } else if (theme === 'dark') {
        document.body.classList.add('dark-high-contrast');
    } else if (theme === 'light') {
        document.body.classList.add('light-theme');
    } else if (theme === 'red') {
        document.body.classList.add('red-theme');
    }
    localStorage.setItem("arabicRadioTheme", theme);
    currentTheme = theme;
    let themeDisplay = theme === 'default' ? t('theme_default') : (theme === 'dark' ? t('theme_dark') : (theme === 'light' ? t('theme_light') : t('theme_red')));
    setStatus(t('theme_changed', themeDisplay), false);
    // تحديث العناصر البصرية الأخرى
    if (advancedSettings.visualizer !== undefined) {
        const canvasVis = document.getElementById('audioVisualizerCanvas');
        if (canvasVis) canvasVis.style.display = advancedSettings.visualizer ? 'block' : 'none';
    }
}

// ========== دوال القائمة مساعدة ==========
function showDebugInfo() {
    const info = {
        [currentLanguage === 'ar' ? "إصدار التطبيق" : "App Version"]: "1.0.0",
        [currentLanguage === 'ar' ? "آخر تحديث" : "Last Update"]: "2026-04-15",
        [currentLanguage === 'ar' ? "المتصفح" : "Browser"]: navigator.userAgent,
        [currentLanguage === 'ar' ? "حالة Web Audio" : "Web Audio State"]: audioCtx ? (audioCtx.state === 'running' ? (currentLanguage === 'ar' ? 'نشط' : 'Active') : audioCtx.state) : (currentLanguage === 'ar' ? 'غير مهيأ' : 'Not initialized'),
        [currentLanguage === 'ar' ? "عدد المحطات المحملة" : "Loaded Stations"]: masterStations.length,
        [currentLanguage === 'ar' ? "عدد المحطات المفضلة" : "Favorites"]: favorites.length,
        [currentLanguage === 'ar' ? "عدد محطات السجل" : "History Count"]: historyList.length,
        [currentLanguage === 'ar' ? "حالة الضاغط" : "Compressor"]: isCompressorActive ? (currentLanguage === 'ar' ? 'مفعل' : 'Enabled') : (currentLanguage === 'ar' ? 'غير مفعل' : 'Disabled'),
        [currentLanguage === 'ar' ? "حالة فصل الستيريو" : "Stereo Mode"]: isStereoModeActive ? (currentLanguage === 'ar' ? 'مفعل' : 'Enabled') : (currentLanguage === 'ar' ? 'غير مفعل' : 'Disabled'),
        [currentLanguage === 'ar' ? "مستوى الصوت الحالي" : "Volume"]: audioPlayer.volume,
        [currentLanguage === 'ar' ? "التايمر نشط؟" : "Timer Active"]: timerInterval ? (currentLanguage === 'ar' ? 'نعم' : 'Yes') : (currentLanguage === 'ar' ? 'لا' : 'No'),
        [currentLanguage === 'ar' ? "المحطة الحالية" : "Current Station"]: currentStation ? currentStation.name : (currentLanguage === 'ar' ? 'لا توجد محطة' : 'No station'),
    };
    let msg = (currentLanguage === 'ar' ? "🔧 معلومات تصحيح الأخطاء:\n\n" : "🔧 Debug Info:\n\n");
    for (const [key, value] of Object.entries(info)) {
        msg += `${key}: ${value}\n`;
    }
    alert(msg);
}

function sendFeedback() {
    const subject = encodeURIComponent(currentLanguage === 'ar' ? "ملاحظات على تطبيق Arabic Radio" : "Feedback on Arabic Radio");
    const body = encodeURIComponent(currentLanguage === 'ar' ? "أكتب ملاحظاتك هنا:\n\n" : "Write your feedback here:\n\n");
    window.location.href = `mailto:saeedbadr112@hotmail.com?subject=${subject}&body=${body}`;
    setStatus(t('opening_email'), false);
}

function showAbout() {
    alert(`🎵 ${t('app_title')}\n${t('version')}\n\n${t('about_text')}`);
}

function showLicense() {
    alert(`📄 ${currentLanguage === 'ar' ? 'رخصة التطبيق' : 'License'}\n\n${currentLanguage === 'ar' ? 'هذا البرنامج مجاني ومفتوح المصدر.\nيمكنك استخدامه وتعديله وتوزيعه بحرية.\n\nرخصة MIT:\nيُسمح لأي شخص باستخدام هذا البرنامج دون قيود، بما في ذلك نسخه وتعديله ودمجه مع برامج أخرى، بشرط الاحتفاظ بإشعار حقوق الملكية.\n\nالبرنامج يُقدم "كما هو" دون أي ضمان.\nلمزيد من التفاصيل، راجع https://opensource.org/licenses/MIT' : 'This software is free and open source.\nYou may use, modify, and distribute it freely.\n\nMIT License:\nPermission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files, to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, subject to the following conditions:\nThe above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.\nTHE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.\nFor more details, see https://opensource.org/licenses/MIT'}`);
}

function openSourceLink() {
    window.open('https://github.com/Saeed-Badr/Arabic-Radio', '_blank');
    setStatus(t('opening_source'), false);
}

function showReleaseNotes() {
    const notes = currentLanguage === 'ar' 
        ? "📌 ملاحظات الإصدار 1.0.0\n\n✅ إضافة التايمر لإيقاف البث بعد مدة\n✅ إضافة مؤثرات صوتية (ضاغط، فصل ستيريو، تغيير جهاز الإخراج)\n✅ إضافة تبويب السجل مع حفظ 100 محطة أخيرة\n✅ إضافة ثلاثة أوضاع للمظهر (افتراضي، داكن عالي التباين، فاتح)\n✅ تحسين القوائم الفرعية ودعمها في جميع التبويبات\n✅ إصلاح مشكلة اختفاء القوائم بعد تغيير المظهر\n✅ إضافة البحث عبر Radio Browser API\n✅ دعم استيراد/تصدير المحطات\n✅ واجهة متوافقة مع RTL\n✅ دعم اللغة الإنجليزية"
        : "📌 Release Notes 1.0.0\n\n✅ Added timer to stop playback after duration\n✅ Added audio effects (compressor, stereo separation, output device)\n✅ Added history tab with last 100 stations\n✅ Added three theme modes (Default, Dark High Contrast, Light)\n✅ Improved submenus support across all tabs\n✅ Fixed menu disappearance after theme change\n✅ Added search via Radio Browser API\n✅ Support import/export stations\n✅ RTL interface support\n✅ English language support";
    alert(notes);
}

function sayHello() {
    const hour = new Date().getHours();
    let greeting = "";
    if (hour < 12) greeting = t('greeting_morning');
    else if (hour < 18) greeting = t('greeting_evening');
    else greeting = t('greeting_night');
    alert(`👋 ${greeting}!\n${t('thank_you_message')}`);
}

function openSettings() {
    let currentStatus = autoResume ? (currentLanguage === 'ar' ? "مفعل" : "Enabled") : (currentLanguage === 'ar' ? "غير مفعل" : "Disabled");
    let userChoice = confirm(`${currentLanguage === 'ar' ? '⚙️ إعدادات التشغيل التلقائي\n\nالحالة الحالية: ' : '⚙️ Auto-resume Settings\n\nCurrent status: '}${currentStatus}\n\n${currentLanguage === 'ar' ? 'اضغط "موافق" لتغيير الإعداد، أو "إلغاء" للإلغاء.' : 'Press "OK" to change setting, or "Cancel" to cancel.'}`);
    if (userChoice) {
        autoResume = !autoResume;
        localStorage.setItem("arabicRadioAutoResume", autoResume);
        setStatus(t('auto_resume_toggled', autoResume ? 'enabled' : 'disabled'), false);
    }
}

function setAlwaysOnTop() {
    if (window.electronAPI && window.electronAPI.setAlwaysOnTop) {
        window.electronAPI.setAlwaysOnTop(true);
        setStatus(t('always_on_top_set'), false);
    } else {
        setStatus(t('always_on_top_electron_only'), true);
    }
}

function closeCurrentTab() {
    if (confirm(t('confirm_exit'))) {
        if (window.electronAPI) window.electronAPI.closeApp();
        else window.close();
    }
}
window.applyTheme = applyTheme;
window.setAlwaysOnTop = setAlwaysOnTop;
window.sayHello = sayHello;
window.showAbout = showAbout;
window.showLicense = showLicense;
window.openSourceLink = openSourceLink;
window.showReleaseNotes = showReleaseNotes;
window.showDebugInfo = showDebugInfo;
window.sendFeedback = sendFeedback;
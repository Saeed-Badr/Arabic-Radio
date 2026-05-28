// keyboardShortcuts.js - نسخة تعمل بغض النظر عن لغة لوحة المفاتيح
// تعتمد على e.code (الرمز الفيزيائي) بدلاً من e.key

function initKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
        const ctrl = e.ctrlKey;
        const shift = e.shiftKey;
        const alt = e.altKey;
        const code = e.code;
        let key = e.key.toLowerCase();

        if (key === 'control' || key === 'shift' || key === 'alt' || key === 'meta') return;

        const handledCodes = [
            'Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5',
            'Numpad1', 'Numpad2', 'Numpad3', 'Numpad4',
            'KeyP', 'Space', 'KeyS',
            'ArrowUp', 'ArrowDown', 'ArrowRight', 'ArrowLeft',
            'KeyE', 'KeyF', 'KeyJ', 'KeyO', 'KeyN', 'KeyI', 'KeyQ', 'KeyW',
            'KeyL', 'KeyC', 'KeyD', 'KeyT', 'KeyK', 'KeyA', 'KeyG',
            'KeyH', 'Digit0', 'Digit9', 'KeyY', 'KeyM', 'KeyZ', 'KeyR',
            'KeyU', 'KeyV', 'KeyX', 'KeyB', 'Slash', 'IntlBackslash',
            'F1', 'F2', 'F3', 'F10', 'F11', 'F12'
        ];

        const activeTag = document.activeElement?.tagName?.toLowerCase();
        const isInputFocused = (activeTag === 'input' || activeTag === 'textarea');

        const preventDefault = () => {
            e.preventDefault();
            e.stopPropagation();
        };

        let handled = false;
        if (ctrl && shift) {
            if (handledCodes.includes(code)) handled = true;
        } else if (ctrl && !shift && !alt) {
            if (handledCodes.includes(code)) handled = true;
        } else if (shift && !ctrl && !alt) {
            if (!isInputFocused && handledCodes.includes(code)) handled = true;
        }
        if (handled) preventDefault();

        // ========== 1. Ctrl + Shift ==========
        if (ctrl && shift) {
            switch (code) {
                case 'Digit1': startTimer(20); setStatus(t('timer_set',20),false); break;
                case 'Digit2': startTimer(40); setStatus(t('timer_set',40),false); break;
                case 'Digit3': startTimer(60); setStatus(t('timer_set',60),false); break;
                case 'Digit4': startTimer(80); setStatus(t('timer_set',80),false); break;
                case 'Numpad1': startTimer(20); setStatus(t('timer_set',20),false); break;
                case 'Numpad2': startTimer(40); setStatus(t('timer_set',40),false); break;
                case 'Numpad3': startTimer(60); setStatus(t('timer_set',60),false); break;
                case 'Numpad4': startTimer(80); setStatus(t('timer_set',80),false); break;
                case 'KeyZ': shuffleRandomStation(); break;
                case 'KeyT': toggleAlwaysOnTop(); break;
                case 'KeyU':
                    if (window.electronAPI && window.electronAPI.checkForUpdates) {
                        window.electronAPI.checkForUpdates();
                        setStatus(t('checking_for_updates'), false);
                    } else {
                        const isPackaged = window.electronAPI && window.electronAPI.isPackaged ? window.electronAPI.isPackaged : false;
                        if (!isPackaged) setStatus(t('updates_only_in_production'), true);
                        else setStatus(t('updates_not_supported'), true);
                    }
                    break;
                case 'KeyX': exportStations(); break;
                case 'KeyA': autoResume = true; localStorage.setItem('arabicRadioAutoResume','true'); setStatus(t('auto_resume_toggled','enabled'),false); updateSettingCheckmarks(); break;
                case 'KeyD': autoResume = false; localStorage.setItem('arabicRadioAutoResume','false'); setStatus(t('auto_resume_toggled','disabled'),false); updateSettingCheckmarks(); break;
                case 'Digit5': applyAdvancedSetting('autoResumeDelay',0.5); updateSettingCheckmarks(); break;
                case 'Digit6': applyAdvancedSetting('autoResumeDelay',1); updateSettingCheckmarks(); break;
                case 'Digit7': applyAdvancedSetting('autoResumeDelay',2); updateSettingCheckmarks(); break;
                case 'Digit8': applyAdvancedSetting('autoResumeDelay',3); updateSettingCheckmarks(); break;
                case 'KeyV': applyAdvancedSetting('visualizer',true); updateSettingCheckmarks(); break;
                case 'KeyB': applyAdvancedSetting('visualizer',false); updateSettingCheckmarks(); break;
                case 'KeyH': applyAdvancedSetting('autoClearHistory',true); updateSettingCheckmarks(); break;
                case 'KeyJ': applyAdvancedSetting('autoClearHistory',false); updateSettingCheckmarks(); break;
                case 'KeyU': applyAdvancedSetting('recordIcon',false); updateSettingCheckmarks(); break;
                case 'KeyR': applyAdvancedSetting('recordIcon',true); updateSettingCheckmarks(); setStatus(t('settings_record_icon')+' '+(currentLanguage==='ar'?'ظاهرة':'Visible'),false); break;
                case 'KeyY': showLicense(); break;
                case 'KeyI': showAbout(); break;
                case 'KeyM': openAdvancedSettingsModal(); break;
                case 'KeyK': showKeyboardShortcutsModal(); break;
                case 'KeyG': openSourceLink(); break;
                case 'KeyN': showReleaseNotes(); break;
                case 'KeyF': sendFeedback(); break;
                case 'Slash':
                case 'IntlBackslash':
                    showDebugInfo();
                    break;
                case 'F10': applyAdvancedSetting('fontSize','small'); updateSettingCheckmarks(); break;
                case 'F11': applyAdvancedSetting('fontSize','medium'); updateSettingCheckmarks(); break;
                case 'F12': applyAdvancedSetting('fontSize','large'); updateSettingCheckmarks(); break;
                case 'F1': applyTheme('default'); break;
                case 'F2': applyTheme('dark'); break;
                case 'F3': applyTheme('light'); break;
                case 'F4': applyTheme('red'); break;
                default: break;
            }
            return;
        }

        // ========== 2. Ctrl فقط ==========
        if (ctrl && !shift && !alt) {
            switch (code) {
                case 'Digit1': switchTab('stations-tab'); break;
                case 'Digit2': switchTab('favorites-tab'); break;
                case 'Digit3': switchTab('search-tab'); break;
                case 'Digit4': switchTab('add-station-tab'); break;
                case 'Digit5': switchTab('history-tab'); break;
                case 'Numpad1': switchTab('stations-tab'); break;
                case 'Numpad2': switchTab('favorites-tab'); break;
                case 'Numpad3': switchTab('search-tab'); break;
                case 'Numpad4': switchTab('add-station-tab'); break;
                case 'Numpad5': switchTab('history-tab'); break;
                case 'KeyP':
                case 'Space':
                    if (audioPlayer.paused) {
                        if (currentStation?.url) playStation(currentStation.url, currentStation.name, currentStation.country, currentStation.id, currentStation.isWebPage || false);
                        else setStatus(t('no_station_selected'), true);
                    } else {
                        audioPlayer.pause();
                        updatePlayPauseButton(false);
                        if (currentStation) updateStationPlayButtons(currentStation.id, false);
                    }
                    break;
                case 'KeyS':
                    // Ctrl+S -> تشغيل المحطة التالية
                    if (typeof playNextStation === 'function') playNextStation();
                    else setStatus(t('no_stations'), true);
                    break;
                case 'ArrowUp':
                case 'ArrowRight':
                    let vUp = Math.min(1, audioPlayer.volume + 0.05);
                    audioPlayer.volume = vUp;
                    const volSliderUp = document.getElementById("volumeSlider");
                    if (volSliderUp) volSliderUp.value = vUp;
                    localStorage.setItem('arabicRadioVolume', vUp);
                    setStatus(`🔊 ${Math.round(vUp*100)}%`, false);
                    break;
                case 'ArrowDown':
                case 'ArrowLeft':
                    let vDown = Math.max(0, audioPlayer.volume - 0.05);
                    audioPlayer.volume = vDown;
                    const volSliderDown = document.getElementById("volumeSlider");
                    if (volSliderDown) volSliderDown.value = vDown;
                    localStorage.setItem('arabicRadioVolume', vDown);
                    setStatus(`🔉 ${Math.round(vDown*100)}%`, false);
                    break;
                case 'KeyR': shuffleRandomStation(); break;
                case 'KeyF': document.getElementById('searchInput')?.focus(); setStatus('🔎 '+(currentLanguage==='ar'?'ابحث':'Search'),false); break;
                case 'KeyJ': toggleCompressor(); break;
                case 'KeyO':
                    window.customPrompt(currentLanguage === 'ar' ? 'أدخل رابط البث المباشر (URL):' : 'Enter stream URL:').then(url => {
                        if (url?.trim()) playStation(url.trim(), currentLanguage === 'ar' ? 'رابط مخصص' : 'Custom URL', currentLanguage === 'ar' ? 'رابط خارجي' : 'External Link', 'custom_' + Date.now(), false);
                    });
                    break;
                case 'KeyN': switchTab('add-station-tab'); break;
                case 'KeyI':
                    const input = document.createElement('input');
                    input.type='file'; input.accept='application/json';
                    input.onchange=(ev)=>{
                        const file=ev.target.files[0];
                        if(!file) return;
                        const reader=new FileReader();
                        reader.onload=(evLoad)=>{
                            try{
                                const imported=JSON.parse(evLoad.target.result);
                                if(Array.isArray(imported)){
                                    masterStations=[...masterStations,...imported];
                                    const unique=new Map();
                                    masterStations.forEach(st=>unique.set(st.id,st));
                                    masterStations=Array.from(unique.values());
                                    saveMasterStations(); renderStations(); if(typeof renderFavoritesTab==='function') renderFavoritesTab();
                                    setStatus(t('stations_imported',imported.length),false);
                                } else throw new Error();
                            } catch(err){ setStatus(t('invalid_file'),true); }
                        };
                        reader.readAsText(file);
                    };
                    input.click();
                    break;
                case 'KeyQ':
                case 'KeyW':
                    if(confirm(t('confirm_exit'))){
                        if(window.electronAPI) window.electronAPI.closeApp();
                        else window.close();
                    }
                    break;
                default: break;
            }
            return;
        }

        // ========== 3. Shift فقط (بدون Ctrl) – لا تعمل في حقول الإدخال ==========
        if (shift && !ctrl && !alt) {
            if (isInputFocused) return;
            switch (code) {
                case 'KeyA': applyAdvancedSetting('language','ar'); updateSettingCheckmarks(); break;
                case 'KeyB': applyAdvancedSetting('language','en'); updateSettingCheckmarks(); break;
                case 'KeyL': applyStereoMode('left'); break;
                case 'KeyE': applyStereoMode('right'); break;
                case 'KeyC': applyStereoMode('center'); break;
                case 'Digit0': setAudioOutputDevice(''); setStatus(t('output_device_default'),false); break;
                case 'Digit9': selectAndSetAudioOutput(); break;
                case 'KeyH': sayHello(); break;
                case 'KeyP':
                    if (audioPlayer.paused && currentStation?.url)
                        playStation(currentStation.url, currentStation.name, currentStation.country, currentStation.id, currentStation.isWebPage || false);
                    else if (!audioPlayer.paused) audioPlayer.play();
                    break;
                case 'KeyS':
                    // Shift+S -> تشغيل المحطة التالية
                    if (typeof playNextStation === 'function') playNextStation();
                    else setStatus(t('no_stations'), true);
                    break;
                case 'ArrowUp':
                    let vUp = Math.min(1, audioPlayer.volume + 0.05);
                    audioPlayer.volume = vUp;
                    const volUp = document.getElementById("volumeSlider");
                    if (volUp) volUp.value = vUp;
                    localStorage.setItem('arabicRadioVolume', vUp);
                    setStatus(`🔊 ${Math.round(vUp*100)}%`, false);
                    break;
                case 'ArrowDown':
                    let vDown = Math.max(0, audioPlayer.volume - 0.05);
                    audioPlayer.volume = vDown;
                    const volDown = document.getElementById("volumeSlider");
                    if (volDown) volDown.value = vDown;
                    localStorage.setItem('arabicRadioVolume', vDown);
                    setStatus(`🔉 ${Math.round(vDown*100)}%`, false);
                    break;
                case 'KeyR': shuffleRandomStation(); break;
                case 'KeyF': document.getElementById('searchInput')?.focus(); break;
                case 'KeyJ': toggleCompressor(); break;
                case 'KeyO':
                    window.customPrompt(currentLanguage === 'ar' ? 'أدخل رابط البث المباشر (URL):' : 'Enter stream URL:').then(url => {
                        if (url?.trim()) playStation(url.trim(), currentLanguage === 'ar' ? 'رابط مخصص' : 'Custom URL', currentLanguage === 'ar' ? 'رابط خارجي' : 'External Link', 'custom_' + Date.now(), false);
                    });
                    break;
                case 'KeyN': switchTab('add-station-tab'); break;
                case 'Digit1': switchTab('stations-tab'); break;
                case 'Digit2': switchTab('favorites-tab'); break;
                case 'Digit3': switchTab('search-tab'); break;
                case 'Digit4': switchTab('add-station-tab'); break;
                case 'Digit5': switchTab('history-tab'); break;
                default: break;
            }
            return;
        }

        function shuffleRandomStation() {
            if (masterStations.length) {
                const st = masterStations[Math.floor(Math.random() * masterStations.length)];
                const cObj = allCountries.find(c => c.code === st.countryCode);
                playStation(st.streamUrl, st.name, cObj?.nameAr || st.countryCode, st.id, st.isWebPage || false);
            } else setStatus(t('no_stations'), true);
        }
    });
}

// ========== نافذة عرض جميع الاختصارات ==========
function showKeyboardShortcutsModal() {
    let modal = document.getElementById('shortcutsModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'shortcutsModal';
        modal.className = 'shortcuts-modal';
        modal.innerHTML = `
            <div class="shortcuts-content">
                <h2>📖 ${currentLanguage === 'ar' ? 'اختصارات لوحة المفاتيح' : 'Keyboard Shortcuts'}</h2>
                <div class="shortcuts-grid">
                    <div class="shortcut-category">
                        <h3>🎛️ ${currentLanguage === 'ar' ? 'عام' : 'General'}</h3>
                        <div class="shortcut-item"><span>${currentLanguage === 'ar' ? 'تشغيل/إيقاف مؤقت' : 'Play/Pause'}</span><span class="shortcut-key">Ctrl+P / Space / Shift+P</span></div>
                        <div class="shortcut-item"><span>${currentLanguage === 'ar' ? 'المحطة التالية' : 'Next Station'}</span><span class="shortcut-key">Ctrl+S / Shift+S</span></div>
                        <div class="shortcut-item"><span>${currentLanguage === 'ar' ? 'رفع الصوت' : 'Volume Up'}</span><span class="shortcut-key">Ctrl+↑ / Ctrl+→ / Shift+↑</span></div>
                        <div class="shortcut-item"><span>${currentLanguage === 'ar' ? 'خفض الصوت' : 'Volume Down'}</span><span class="shortcut-key">Ctrl+↓ / Ctrl+← / Shift+↓</span></div>
                        <div class="shortcut-item"><span>${currentLanguage === 'ar' ? 'تشغيل عشوائي' : 'Shuffle'}</span><span class="shortcut-key">Ctrl+R / Shift+R</span></div>
                        <div class="shortcut-item"><span>${currentLanguage === 'ar' ? 'بحث' : 'Search'}</span><span class="shortcut-key">Ctrl+F / Shift+F</span></div>
                        <div class="shortcut-item"><span>${currentLanguage === 'ar' ? 'ضاغط الصوت' : 'Compressor'}</span><span class="shortcut-key">Ctrl+J / Shift+J</span></div>
                        <div class="shortcut-item"><span>${currentLanguage === 'ar' ? 'دائماً في المقدمة' : 'Always on Top'}</span><span class="shortcut-key">Ctrl+Shift+T</span></div>
                    </div>
                    <div class="shortcut-category">
                        <h3>🗂️ ${currentLanguage === 'ar' ? 'ملف' : 'File'}</h3>
                        <div class="shortcut-item"><span>${currentLanguage === 'ar' ? 'فتح رابط البث' : 'Open URL'}</span><span class="shortcut-key">Ctrl+O / Shift+O</span></div>
                        <div class="shortcut-item"><span>${currentLanguage === 'ar' ? 'إضافة محطة' : 'Add Station'}</span><span class="shortcut-key">Ctrl+N / Shift+N</span></div>
                        <div class="shortcut-item"><span>${currentLanguage === 'ar' ? 'استيراد المحطات' : 'Import Stations'}</span><span class="shortcut-key">Ctrl+I</span></div>
                        <div class="shortcut-item"><span>${currentLanguage === 'ar' ? 'تصدير المحطات' : 'Export Stations'}</span><span class="shortcut-key">Ctrl+Shift+X</span></div>
                        <div class="shortcut-item"><span>${currentLanguage === 'ar' ? 'خروج' : 'Exit'}</span><span class="shortcut-key">Ctrl+Q / Ctrl+W</span></div>
                    </div>
                    <div class="shortcut-category">
                        <h3>🔍 ${currentLanguage === 'ar' ? 'عرض' : 'View'}</h3>
                        <div class="shortcut-item"><span>${currentLanguage === 'ar' ? 'المحطات' : 'Stations'}</span><span class="shortcut-key">Ctrl+1 / Shift+1</span></div>
                        <div class="shortcut-item"><span>${currentLanguage === 'ar' ? 'المفضلة' : 'Favorites'}</span><span class="shortcut-key">Ctrl+2 / Shift+2</span></div>
                        <div class="shortcut-item"><span>${currentLanguage === 'ar' ? 'نتائج البحث' : 'Search Results'}</span><span class="shortcut-key">Ctrl+3 / Shift+3</span></div>
                        <div class="shortcut-item"><span>${currentLanguage === 'ar' ? 'إضافة محطة' : 'Add Station Tab'}</span><span class="shortcut-key">Ctrl+4 / Shift+4</span></div>
                        <div class="shortcut-item"><span>${currentLanguage === 'ar' ? 'السجل' : 'History'}</span><span class="shortcut-key">Ctrl+5 / Shift+5</span></div>
                    </div>
                    <div class="shortcut-category">
                        <h3>🎵 ${currentLanguage === 'ar' ? 'صوت متقدم' : 'Advanced Audio'}</h3>
                        <div class="shortcut-item"><span>${currentLanguage === 'ar' ? 'ستيريو يسار' : 'Stereo Left'}</span><span class="shortcut-key">Shift+L</span></div>
                        <div class="shortcut-item"><span>${currentLanguage === 'ar' ? 'ستيريو يمين' : 'Stereo Right'}</span><span class="shortcut-key">Shift+E</span></div>
                        <div class="shortcut-item"><span>${currentLanguage === 'ar' ? 'ستيريو وسط' : 'Stereo Center'}</span><span class="shortcut-key">Shift+C</span></div>
                        <div class="shortcut-item"><span>${currentLanguage === 'ar' ? 'جهاز إخراج افتراضي' : 'Default Output'}</span><span class="shortcut-key">Shift+0</span></div>
                        <div class="shortcut-item"><span>${currentLanguage === 'ar' ? 'اختيار جهاز إخراج' : 'Select Output'}</span><span class="shortcut-key">Shift+9</span></div>
                    </div>
                    <div class="shortcut-category">
                        <h3>⏱️ ${currentLanguage === 'ar' ? 'مؤقت الإيقاف' : 'Stop Timer'}</h3>
                        <div class="shortcut-item"><span>20 ${currentLanguage === 'ar' ? 'دقيقة' : 'min'}</span><span class="shortcut-key">Ctrl+Shift+1</span></div>
                        <div class="shortcut-item"><span>40 ${currentLanguage === 'ar' ? 'دقيقة' : 'min'}</span><span class="shortcut-key">Ctrl+Shift+2</span></div>
                        <div class="shortcut-item"><span>60 ${currentLanguage === 'ar' ? 'دقيقة' : 'min'}</span><span class="shortcut-key">Ctrl+Shift+3</span></div>
                        <div class="shortcut-item"><span>80 ${currentLanguage === 'ar' ? 'دقيقة' : 'min'}</span><span class="shortcut-key">Ctrl+Shift+4</span></div>
                    </div>
                    <div class="shortcut-category">
                        <h3>⚙️ ${currentLanguage === 'ar' ? 'الإعدادات' : 'Settings'}</h3>
                        <div class="shortcut-item"><span>${currentLanguage === 'ar' ? 'تفعيل التشغيل التلقائي' : 'Enable Auto-resume'}</span><span class="shortcut-key">Ctrl+Shift+A</span></div>
                        <div class="shortcut-item"><span>${currentLanguage === 'ar' ? 'تعطيل التشغيل التلقائي' : 'Disable Auto-resume'}</span><span class="shortcut-key">Ctrl+Shift+D</span></div>
                        <div class="shortcut-item"><span>${currentLanguage === 'ar' ? 'تأخير 0.5 ث' : 'Delay 0.5s'}</span><span class="shortcut-key">Ctrl+Shift+5</span></div>
                        <div class="shortcut-item"><span>${currentLanguage === 'ar' ? 'تأخير 1 ث' : 'Delay 1s'}</span><span class="shortcut-key">Ctrl+Shift+6</span></div>
                        <div class="shortcut-item"><span>${currentLanguage === 'ar' ? 'تأخير 2 ث' : 'Delay 2s'}</span><span class="shortcut-key">Ctrl+Shift+7</span></div>
                        <div class="shortcut-item"><span>${currentLanguage === 'ar' ? 'تأخير 3 ث' : 'Delay 3s'}</span><span class="shortcut-key">Ctrl+Shift+8</span></div>
                        <div class="shortcut-item"><span>${currentLanguage === 'ar' ? 'حجم الخط صغير' : 'Small Font'}</span><span class="shortcut-key">Ctrl+Shift+F10</span></div>
                        <div class="shortcut-item"><span>${currentLanguage === 'ar' ? 'حجم خط متوسط' : 'Medium Font'}</span><span class="shortcut-key">Ctrl+Shift+F11</span></div>
                        <div class="shortcut-item"><span>${currentLanguage === 'ar' ? 'حجم خط كبير' : 'Large Font'}</span><span class="shortcut-key">Ctrl+Shift+F12</span></div>
                        <div class="shortcut-item"><span>${currentLanguage === 'ar' ? 'اللغة العربية' : 'Arabic'}</span><span class="shortcut-key">Shift+A</span></div>
                        <div class="shortcut-item"><span>${currentLanguage === 'ar' ? 'اللغة الإنجليزية' : 'English'}</span><span class="shortcut-key">Shift+B</span></div>
                        <div class="shortcut-item"><span>${currentLanguage === 'ar' ? 'تفعيل مسح السجل' : 'Enable Auto-clear'}</span><span class="shortcut-key">Ctrl+Shift+H</span></div>
                        <div class="shortcut-item"><span>${currentLanguage === 'ar' ? 'تعطيل مسح السجل' : 'Disable Auto-clear'}</span><span class="shortcut-key">Ctrl+Shift+J</span></div>
                        <div class="shortcut-item"><span>${currentLanguage === 'ar' ? 'تفعيل المؤثرات' : 'Enable Visualizer'}</span><span class="shortcut-key">Ctrl+Shift+V</span></div>
                        <div class="shortcut-item"><span>${currentLanguage === 'ar' ? 'تعطيل المؤثرات' : 'Disable Visualizer'}</span><span class="shortcut-key">Ctrl+Shift+B</span></div>
                        <div class="shortcut-item"><span>${currentLanguage === 'ar' ? 'إخفاء أيقونة التسجيل' : 'Hide Record Icon'}</span><span class="shortcut-key">Ctrl+Shift+U</span></div>
                        <div class="shortcut-item"><span>${currentLanguage === 'ar' ? 'إظهار أيقونة التسجيل' : 'Show Record Icon'}</span><span class="shortcut-key">Ctrl+Shift+R</span></div>
                    </div>
                    <div class="shortcut-category">
                        <h3>🎨 ${currentLanguage === 'ar' ? 'المظاهر' : 'Themes'}</h3>
                        <div class="shortcut-item"><span>${currentLanguage === 'ar' ? 'الافتراضي' : 'Default'}</span><span class="shortcut-key">Ctrl+Shift+F1</span></div>
                        <div class="shortcut-item"><span>${currentLanguage === 'ar' ? 'داكن' : 'Dark'}</span><span class="shortcut-key">Ctrl+Shift+F2</span></div>
                        <div class="shortcut-item"><span>${currentLanguage === 'ar' ? 'فاتح' : 'Light'}</span><span class="shortcut-key">Ctrl+Shift+F3</span></div>
                    </div>
                    <div class="shortcut-category">
                        <h3>❔ ${currentLanguage === 'ar' ? 'مساعدة' : 'Help'}</h3>
                        <div class="shortcut-item"><span>${currentLanguage === 'ar' ? 'عرض الاختصارات' : 'Show Shortcuts'}</span><span class="shortcut-key">Ctrl+Shift+K</span></div>
                        <div class="shortcut-item"><span>${currentLanguage === 'ar' ? 'معلومات التصحيح' : 'Debug Info'}</span><span class="shortcut-key">Ctrl+Shift+?</span></div>
                        <div class="shortcut-item"><span>${currentLanguage === 'ar' ? 'البحث عن تحديثات' : 'Check for Updates'}</span><span class="shortcut-key">Ctrl+Shift+U</span></div>
                        <div class="shortcut-item"><span>${currentLanguage === 'ar' ? 'إرسال ملاحظات' : 'Send Feedback'}</span><span class="shortcut-key">Ctrl+Shift+F</span></div>
                        <div class="shortcut-item"><span>${currentLanguage === 'ar' ? 'مفتوح المصدر' : 'Open Source'}</span><span class="shortcut-key">Ctrl+Shift+G</span></div>
                        <div class="shortcut-item"><span>${currentLanguage === 'ar' ? 'ملاحظات الإصدار' : 'Release Notes'}</span><span class="shortcut-key">Ctrl+Shift+N</span></div>
                        <div class="shortcut-item"><span>${currentLanguage === 'ar' ? 'تحية' : 'Say Hello'}</span><span class="shortcut-key">Shift+H</span></div>
                        <div class="shortcut-item"><span>${currentLanguage === 'ar' ? 'الترخيص' : 'License'}</span><span class="shortcut-key">Ctrl+Shift+Y</span></div>
                        <div class="shortcut-item"><span>${currentLanguage === 'ar' ? 'الإعدادات المتقدمة' : 'Advanced Settings'}</span><span class="shortcut-key">Ctrl+Shift+M</span></div>
                        <div class="shortcut-item"><span>${currentLanguage === 'ar' ? 'حول' : 'About'}</span><span class="shortcut-key">Ctrl+Shift+I</span></div>
                    </div>
                </div>
                <button class="close-modal">${currentLanguage === 'ar' ? 'إغلاق' : 'Close'}</button>
            </div>
        `;
        document.body.appendChild(modal);
        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.classList.remove('active');
        });
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('active');
        });
    }
    modal.classList.add('active');
}

window.showKeyboardShortcutsModal = showKeyboardShortcutsModal;

function toggleAlwaysOnTop() {
    if (!window.electronAPI) {
        setStatus(currentLanguage === 'ar' ? '⚠️ هذه الميزة تعمل فقط في تطبيق سطح المكتب' : '⚠️ This feature only works in desktop app', true);
        return;
    }
    if (window.electronAPI.getAlwaysOnTop) {
        window.electronAPI.getAlwaysOnTop().then(isOnTop => {
            const newState = !isOnTop;
            window.electronAPI.setAlwaysOnTop(newState);
            updateAlwaysOnTopMenuState(newState);
            setStatus(currentLanguage === 'ar' ? 
                (newState ? '✅ تم تفعيل دائماً في المقدمة' : '✅ تم إلغاء دائماً في المقدمة') :
                (newState ? '✅ Always on Top enabled' : '✅ Always on Top disabled'), false);
        }).catch(err => {
            console.error('Error getting always on top state:', err);
            window.electronAPI.setAlwaysOnTop(true);
            updateAlwaysOnTopMenuState(true);
        });
    } else {
        window.electronAPI.setAlwaysOnTop(true);
        updateAlwaysOnTopMenuState(true);
        setStatus(t('always_on_top_set'), false);
    }
}

function updateAlwaysOnTopMenuState(isActive) {
    const menuItem = document.getElementById('menuAlwaysOnTop');
    if (!menuItem) return;
    let checkmark = menuItem.querySelector('.checkmark');
    if (isActive) {
        if (!checkmark) {
            checkmark = document.createElement('span');
            checkmark.className = 'checkmark';
            checkmark.textContent = ' ✓';
            checkmark.style.color = '#3b82f6';
            checkmark.style.fontWeight = 'bold';
            menuItem.appendChild(checkmark);
        }
    } else {
        if (checkmark) checkmark.remove();
    }
}

if (window.electronAPI && window.electronAPI.onShortcutTriggered) {
  window.electronAPI.onShortcutTriggered((shortcut, minutes) => {
    console.log('Shortcut from main:', shortcut, minutes);
    if (shortcut === 'ctrl+o') {
      window.customPrompt(currentLanguage === 'ar' ? 'أدخل رابط البث المباشر (URL):' : 'Enter stream URL:').then(url => {
        if (url?.trim()) playStation(url.trim(), currentLanguage === 'ar' ? 'رابط مخصص' : 'Custom URL', currentLanguage === 'ar' ? 'رابط خارجي' : 'External Link', 'custom_' + Date.now(), false);
      });
    } else if (shortcut.startsWith('ctrl+shift+numpad')) {
      if (minutes) startTimer(minutes);
      setStatus(t('timer_set', minutes), false);
    } else if (shortcut.startsWith('ctrl+numpad')) {
      const num = shortcut.slice(-1);
      switch (num) {
        case '1': switchTab('stations-tab'); break;
        case '2': switchTab('favorites-tab'); break;
        case '3': switchTab('search-tab'); break;
        case '4': switchTab('add-station-tab'); break;
        case '5': switchTab('history-tab'); break;
        default: break;
      }
    }
  });
}

function safeInitKeyboardShortcuts() {
    if (typeof startTimer !== 'undefined' && 
        typeof applyAdvancedSetting !== 'undefined' && 
        typeof updateSettingCheckmarks !== 'undefined' &&
        typeof applyTheme !== 'undefined' &&
        typeof playNextStation !== 'undefined') {
        initKeyboardShortcuts();
        console.log('✅ Keyboard shortcuts initialized successfully');
    } else {
        console.log('⏳ Waiting for dependencies...');
        setTimeout(safeInitKeyboardShortcuts, 100);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', safeInitKeyboardShortcuts);
} else {
    safeInitKeyboardShortcuts();
}
// ========== إعدادات متقدمة ==========
function applyAdvancedSetting(key, value) {
    switch(key) {
        case 'autoResumeDelay':
            advancedSettings.autoResumeDelay = value;
            localStorage.setItem('setting_autoResumeDelay', value);
            break;
        case 'fontSize':
            document.documentElement.style.fontSize = 
                value === 'large' ? '18px' : (value === 'small' ? '12px' : '14px');
            advancedSettings.fontSize = value;
            localStorage.setItem('setting_fontSize', value);
            setStatus(t('settings_font_size') + ' ' + (value === 'large' ? (currentLanguage === 'ar' ? 'كبير' : 'Large') : (value === 'small' ? (currentLanguage === 'ar' ? 'صغير' : 'Small') : (currentLanguage === 'ar' ? 'متوسط' : 'Medium'))), false);
            break;
        case 'language':
            advancedSettings.language = value;
            localStorage.setItem('setting_language', value);
            // إغلاق أي مودال مفتوح قبل تغيير اللغة وإعادة التحميل
            const modal = document.getElementById('advancedSettingsModal');
            if (modal) modal.classList.remove('active');
            applyLanguage(value); // هذه الدالة ستقوم بإعادة التحميل (skipReload = false)
            break;
        case 'autoClearHistory':
            advancedSettings.autoClearHistory = value;
            localStorage.setItem('setting_autoClearHistory', value);
            if (value) {
                const lastClear = localStorage.getItem('lastHistoryClear');
                const sevenDays = 7 * 24 * 60 * 60 * 1000;
                if (!lastClear || Date.now() - parseInt(lastClear) > sevenDays) {
                    if (historyList.length > 0) {
                        if (confirm(t('confirm_auto_clear'))) {
                            historyList = [];
                            localStorage.setItem("arabicRadioHistory", JSON.stringify(historyList));
                            if (typeof renderHistoryTab === 'function') renderHistoryTab();
                            localStorage.setItem('lastHistoryClear', Date.now());
                        }
                    }
                }
            }
            break;
        case 'visualizer':
            advancedSettings.visualizer = value;
            localStorage.setItem('setting_visualizer', value);
            const canvasVis = document.getElementById('audioVisualizerCanvas');
            if (canvasVis) canvasVis.style.display = value ? 'block' : 'none';
            break;
        case 'recordIcon':
            advancedSettings.recordIcon = value;
            localStorage.setItem('setting_recordIcon', value);
            const recordIconBtn = document.getElementById('recordIconBtn');
            if (recordIconBtn) recordIconBtn.style.display = value ? 'flex' : 'none';
            break;
    }
}

function saveAdvancedSetting(key, value) {
    applyAdvancedSetting(key, value);
}

function applyAllAdvancedSettings() {
    applyAdvancedSetting('autoResumeDelay', advancedSettings.autoResumeDelay);
    applyAdvancedSetting('fontSize', advancedSettings.fontSize);
    applyAdvancedSetting('language', advancedSettings.language);
    applyAdvancedSetting('autoClearHistory', advancedSettings.autoClearHistory);
    applyAdvancedSetting('visualizer', advancedSettings.visualizer);
    applyAdvancedSetting('recordIcon', advancedSettings.recordIcon);
}

function updateSettingCheckmarks() {
    document.querySelectorAll('.submenu-item.has-submenu-settings').forEach(item => {
        const settingKey = item.dataset.setting;
        let currentValue = null;
        if (settingKey === 'autoResume') currentValue = autoResume ? 'true' : 'false';
        else if (settingKey === 'autoResumeDelay') currentValue = String(advancedSettings.autoResumeDelay);
        else if (settingKey === 'fontSize') currentValue = advancedSettings.fontSize;
        else if (settingKey === 'language') currentValue = advancedSettings.language;
        else if (settingKey === 'autoClearHistory') currentValue = advancedSettings.autoClearHistory ? 'true' : 'false';
        else if (settingKey === 'visualizer') currentValue = advancedSettings.visualizer ? 'true' : 'false';
        else if (settingKey === 'recordIcon') currentValue = advancedSettings.recordIcon ? 'true' : 'false';
        else return;

        const submenu = item.querySelector('.submenu-vertical');
        if (!submenu) return;
        submenu.querySelectorAll('.submenu-value').forEach(opt => {
            const optValue = opt.dataset.value;
            if (String(currentValue) === optValue) {
                opt.classList.add('active-setting');
            } else {
                opt.classList.remove('active-setting');
            }
        });
    });
}

function bindSettingsMenuEvents() {
    document.querySelectorAll('.submenu-item.has-submenu-settings').forEach(item => {
        const submenu = item.querySelector('.submenu-vertical');
        if (!submenu) return;
        submenu.querySelectorAll('.submenu-value').forEach(opt => {
            opt.removeEventListener('click', settingsClickHandler);
            opt.addEventListener('click', settingsClickHandler);
        });
    });
}

function settingsClickHandler(e) {
    e.stopPropagation();
    const opt = e.currentTarget;
    const parentItem = opt.closest('.submenu-item.has-submenu-settings');
    if (!parentItem) return;
    const settingKey = parentItem.dataset.setting;
    let newValue = opt.dataset.value;
    
    if (settingKey === 'autoResume') {
        autoResume = (newValue === 'true');
        localStorage.setItem('arabicRadioAutoResume', autoResume);
        setStatus(t('auto_resume_toggled', autoResume ? 'enabled' : 'disabled'), false);
    } 
    else if (settingKey === 'autoResumeDelay') {
        applyAdvancedSetting('autoResumeDelay', parseFloat(newValue));
        setStatus(`${t('settings_auto_resume_delay')} ${newValue} ${currentLanguage === 'ar' ? 'ثانية' : 'sec'}`, false);
    }
    else if (settingKey === 'fontSize') {
        applyAdvancedSetting('fontSize', newValue);
        setStatus(t('settings_font_size'), false);
    }
        else if (settingKey === 'language') {
        const modal = document.getElementById('advancedSettingsModal');
        if (modal) modal.classList.remove('active');
        applyLanguage(newValue);
        return;
    }
    else if (settingKey === 'autoClearHistory') {
        applyAdvancedSetting('autoClearHistory', (newValue === 'true'));
        setStatus(t('settings_auto_clear_history') + ' ' + (newValue === 'true' ? (currentLanguage === 'ar' ? 'مفعل' : 'Enabled') : (currentLanguage === 'ar' ? 'معطل' : 'Disabled')), false);
    }
    else if (settingKey === 'visualizer') {
        applyAdvancedSetting('visualizer', (newValue === 'true'));
        setStatus(t('settings_visualizer') + ' ' + (newValue === 'true' ? (currentLanguage === 'ar' ? 'مفعل' : 'Enabled') : (currentLanguage === 'ar' ? 'معطل' : 'Disabled')), false);
    }
    else if (settingKey === 'recordIcon') {
        applyAdvancedSetting('recordIcon', (newValue === 'true'));
        setStatus(t('settings_record_icon') + ' ' + (newValue === 'true' ? (currentLanguage === 'ar' ? 'ظاهرة' : 'Visible') : (currentLanguage === 'ar' ? 'مخفية' : 'Hidden')), false);
    }
    
    const submenu = parentItem.querySelector('.submenu-vertical');
    submenu.querySelectorAll('.submenu-value').forEach(o => o.classList.remove('active-setting'));
    opt.classList.add('active-setting');
}

function openAdvancedSettingsModal() {
    let modal = document.getElementById('advancedSettingsModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'advancedSettingsModal';
        modal.className = 'shortcuts-modal';
        modal.innerHTML = `
            <div class="shortcuts-content" style="max-width: 500px;">
                <h2>⚙️ ${t('menu_settings')}</h2>
                <div style="margin-bottom: 15px;">
                    <label>${t('settings_auto_resume')}: </label>
                    <button id="settingsAutoResumeToggle" class="btn-primary" style="padding: 4px 12px;">${autoResume ? (currentLanguage === 'ar' ? 'مفعل' : 'Enabled') : (currentLanguage === 'ar' ? 'معطل' : 'Disabled')}</button>
                </div>
                <div style="margin-bottom: 15px;">
                    <label>${t('settings_auto_resume_delay')}: </label>
                    <select id="settingsAutoResumeDelay">
                        <option value="0.5" ${advancedSettings.autoResumeDelay === 0.5 ? 'selected' : ''}>0.5 ${currentLanguage === 'ar' ? 'ثانية' : 'sec'}</option>
                        <option value="1" ${advancedSettings.autoResumeDelay === 1 ? 'selected' : ''}>1 ${currentLanguage === 'ar' ? 'ثانية' : 'sec'}</option>
                        <option value="2" ${advancedSettings.autoResumeDelay === 2 ? 'selected' : ''}>2 ${currentLanguage === 'ar' ? 'ثانية' : 'sec'}</option>
                        <option value="3" ${advancedSettings.autoResumeDelay === 3 ? 'selected' : ''}>3 ${currentLanguage === 'ar' ? 'ثانية' : 'sec'}</option>
                    </select>
                </div>
                <div style="margin-bottom: 15px;">
                    <label>${t('settings_font_size')}: </label>
                    <select id="settingsFontSize">
                        <option value="small" ${advancedSettings.fontSize === 'small' ? 'selected' : ''}>${currentLanguage === 'ar' ? 'صغير' : 'Small'}</option>
                        <option value="medium" ${advancedSettings.fontSize === 'medium' ? 'selected' : ''}>${currentLanguage === 'ar' ? 'متوسط' : 'Medium'}</option>
                        <option value="large" ${advancedSettings.fontSize === 'large' ? 'selected' : ''}>${currentLanguage === 'ar' ? 'كبير' : 'Large'}</option>
                    </select>
                </div>
                <div style="margin-bottom: 15px;">
                    <label>${t('settings_language')}: </label>
                    <select id="settingsLanguage">
                        <option value="ar" ${advancedSettings.language === 'ar' ? 'selected' : ''}>العربية</option>
                        <option value="en" ${advancedSettings.language === 'en' ? 'selected' : ''}>English</option>
                    </select>
                </div>
                <div style="margin-bottom: 15px;">
                    <label>${t('settings_auto_clear_history')}: </label>
                    <button id="settingsAutoClearHistoryToggle" class="btn-primary" style="padding: 4px 12px;">${advancedSettings.autoClearHistory ? (currentLanguage === 'ar' ? 'مفعل' : 'Enabled') : (currentLanguage === 'ar' ? 'معطل' : 'Disabled')}</button>
                </div>
                <div style="margin-bottom: 15px;">
                    <label>${t('settings_visualizer')}: </label>
                    <button id="settingsVisualizerToggle" class="btn-primary" style="padding: 4px 12px;">${advancedSettings.visualizer ? (currentLanguage === 'ar' ? 'مفعل' : 'Enabled') : (currentLanguage === 'ar' ? 'معطل' : 'Disabled')}</button>
                </div>
                <div style="margin-bottom: 15px;">
                    <label>${t('settings_record_icon')}: </label>
                    <button id="settingsRecordIconToggle" class="btn-primary" style="padding: 4px 12px;">${advancedSettings.recordIcon ? (currentLanguage === 'ar' ? 'ظاهرة' : 'Visible') : (currentLanguage === 'ar' ? 'مخفية' : 'Hidden')}</button>
                </div>
                <button id="closeAdvancedSettings" class="close-modal">${currentLanguage === 'ar' ? 'إغلاق' : 'Close'}</button>
            </div>
        `;
        document.body.appendChild(modal);

        document.getElementById('settingsAutoResumeToggle').addEventListener('click', () => {
            autoResume = !autoResume;
            localStorage.setItem('arabicRadioAutoResume', autoResume);
            const btn = document.getElementById('settingsAutoResumeToggle');
            btn.innerText = autoResume ? (currentLanguage === 'ar' ? 'مفعل' : 'Enabled') : (currentLanguage === 'ar' ? 'معطل' : 'Disabled');
            setStatus(t('auto_resume_toggled', autoResume ? 'enabled' : 'disabled'), false);
        });
        document.getElementById('settingsAutoResumeDelay').addEventListener('change', (e) => {
            applyAdvancedSetting('autoResumeDelay', parseFloat(e.target.value));
        });
        document.getElementById('settingsFontSize').addEventListener('change', (e) => {
            applyAdvancedSetting('fontSize', e.target.value);
        });
                document.getElementById('settingsLanguage').addEventListener('change', (e) => {
            const newLang = e.target.value;
            const modalElem = document.getElementById('advancedSettingsModal');
            if (modalElem) modalElem.classList.remove('active');
            applyLanguage(newLang);
        });
        document.getElementById('settingsAutoClearHistoryToggle').addEventListener('click', () => {
            advancedSettings.autoClearHistory = !advancedSettings.autoClearHistory;
            localStorage.setItem('setting_autoClearHistory', advancedSettings.autoClearHistory);
            const btn = document.getElementById('settingsAutoClearHistoryToggle');
            btn.innerText = advancedSettings.autoClearHistory ? (currentLanguage === 'ar' ? 'مفعل' : 'Enabled') : (currentLanguage === 'ar' ? 'معطل' : 'Disabled');
            if (advancedSettings.autoClearHistory) {
                const lastClear = localStorage.getItem('lastHistoryClear');
                const sevenDays = 7 * 24 * 60 * 60 * 1000;
                if (!lastClear || Date.now() - parseInt(lastClear) > sevenDays) {
                    if (confirm(t('confirm_auto_clear'))) {
                        historyList = [];
                        localStorage.setItem("arabicRadioHistory", JSON.stringify(historyList));
                        if (typeof renderHistoryTab === 'function') renderHistoryTab();
                        localStorage.setItem('lastHistoryClear', Date.now());
                    }
                }
            }
        });
        document.getElementById('settingsVisualizerToggle').addEventListener('click', () => {
            applyAdvancedSetting('visualizer', !advancedSettings.visualizer);
            const btn = document.getElementById('settingsVisualizerToggle');
            btn.innerText = advancedSettings.visualizer ? (currentLanguage === 'ar' ? 'مفعل' : 'Enabled') : (currentLanguage === 'ar' ? 'معطل' : 'Disabled');
        });
        document.getElementById('settingsRecordIconToggle').addEventListener('click', () => {
            applyAdvancedSetting('recordIcon', !advancedSettings.recordIcon);
            const btn = document.getElementById('settingsRecordIconToggle');
            btn.innerText = advancedSettings.recordIcon ? (currentLanguage === 'ar' ? 'ظاهرة' : 'Visible') : (currentLanguage === 'ar' ? 'مخفية' : 'Hidden');
        });
        document.getElementById('closeAdvancedSettings').addEventListener('click', () => {
            modal.classList.remove('active');
        });
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('active');
        });
    }
    modal.classList.add('active');
}
window.applyAdvancedSetting = applyAdvancedSetting;
window.updateSettingCheckmarks = updateSettingCheckmarks;
window.openAdvancedSettingsModal = openAdvancedSettingsModal;
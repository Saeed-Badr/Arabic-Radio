// ========== قراءة اللغة من config.json (عبر IPC) ==========
(async function initLanguageFromConfig() {
    if (window.electronAPI && window.electronAPI.getConfigLanguage) {
        try {
            const lang = await window.electronAPI.getConfigLanguage();
            if (lang === 'ar' || lang === 'en') {
                localStorage.setItem('setting_language', lang);
                console.log('✅ تم تحميل اللغة من config.json:', lang);
            } else if (lang) {
                console.warn('⚠️ لغة غير صالحة في config.json، تجاهل');
            }
        } catch (err) {
            console.warn('⚠️ فشل قراءة config.json، سيتم استخدام اللغة المخزنة أو العربية', err);
        }
    } else {
        console.log('ℹ️ electronAPI غير متاح، سيتم استخدام اللغة من localStorage أو العربية');
    }
})();

// ========== باقي الكود (نفس الكود الذي يعمل لديك حالياً) ==========
document.addEventListener('DOMContentLoaded', async () => {
    // شاشة البداية
    const splash = document.getElementById('splashScreen');
    if (splash) {
        setTimeout(() => {
            splash.classList.add('hide');
            setTimeout(() => {
                if (splash && splash.parentNode) splash.remove();
            }, 1500);
        }, 3000);
    }
    
    // تحميل البيانات الأساسية
    await loadMasterStations();
    loadFailedIconsSet();
  
    if (!currentFilterItem) {
        currentFilterItem = allCountries[0];
    }
    
    // ========== تطبيق اللغة مع ضبط الاتجاه تلقائياً ==========
    const savedLanguage = localStorage.getItem('setting_language') || 'en';
    currentLanguage = savedLanguage;
    document.documentElement.lang = currentLanguage === 'ar' ? 'ar' : 'en';
    if (currentLanguage === 'ar') {
        document.documentElement.setAttribute('dir', 'rtl');
        document.body.style.direction = 'rtl';
        document.body.style.textAlign = 'right';
    } else {
        document.documentElement.setAttribute('dir', 'ltr');
        document.body.style.direction = 'ltr';
        document.body.style.textAlign = 'left';
    }
    
    // تحديث النصوص ديناميكياً
    updateAllTexts();
    
    // إعداد عنصر الحالة
    let statusEl = document.getElementById('playerStatus');
    if (!statusEl) {
        statusEl = document.createElement('div');
        statusEl.id = 'playerStatus';
        statusEl.className = 'player-status';
        const searchWrapper = document.querySelector('.search-wrapper');
        if (searchWrapper && searchWrapper.parentNode) searchWrapper.insertAdjacentElement('afterend', statusEl);
        else document.querySelector('.main-header').appendChild(statusEl);
    }
    
    // ربط الأزرار الأساسية
    const playPauseBtn = document.getElementById("playPauseBtn");
    if (playPauseBtn) {
        playPauseBtn.addEventListener("click", () => {
            if (!audioPlayer.paused && currentStation) {
                // في حالة التشغيل، نقوم بالإيقاف
                stopPlayback();
            } else {
                if (currentStation && currentStation.url) {
                    playStation(currentStation.url, currentStation.name, currentStation.country, currentStation.id, currentStation.isWebPage || false);
                } else {
                    setStatus(t('no_station_selected'), true);
                }
            }
        });
    }
    
    // تهيئة زر "المحطة التالية" (الذي كان stopBtn)
    if (typeof initNextStationButton === 'function') {
        initNextStationButton();
    }
    
    const volumeSlider = document.getElementById("volumeSlider");
    if (volumeSlider) {
        const savedVolume = parseFloat(localStorage.getItem('arabicRadioVolume'));
        audioPlayer.volume = !isNaN(savedVolume) ? savedVolume : 0.8;
        volumeSlider.value = audioPlayer.volume;
        volumeSlider.addEventListener("input", (e) => { const v = parseFloat(e.target.value); audioPlayer.volume = v; localStorage.setItem('arabicRadioVolume', v); });
    }
    
    const favCurrentBtn = document.getElementById("favCurrentBtn");
    if (favCurrentBtn) favCurrentBtn.addEventListener("click", () => { if (currentStation && currentStation.id) toggleFavorite(currentStation.id); updateFavButtonCurrent(); if(currentTab==='favorites-tab') renderFavoritesTab(); else renderStations(); });
    
    const searchInputEl = document.getElementById("searchInput");
    if (searchInputEl) {
        searchInputEl.addEventListener("input", (e) => { 
            const val = e.target.value; 
            searchKeyword = val; 
            const searchQueryLabel = document.getElementById("searchQueryLabel");
            if (searchQueryLabel) searchQueryLabel.innerText = searchKeyword || "---"; 
            if (searchDebounceTimer) clearTimeout(searchDebounceTimer); 
            searchDebounceTimer = setTimeout(() => { 
                performSearch(searchKeyword); 
                if (searchKeyword.trim() !== "") switchTab('search-tab'); 
                else if(currentTab === 'search-tab') switchTab('stations-tab'); 
            }, 300); 
        });
    }
    
    // أحداث التبويبات
    document.querySelectorAll('.tab-btn').forEach(btn => btn.addEventListener('click', () => { const target = btn.dataset.tab; if (target) switchTab(target); }));
    const favoritesNavBtn = document.getElementById("favoritesNavBtn");
    if (favoritesNavBtn) favoritesNavBtn.addEventListener("click", () => switchTab('favorites-tab'));
    const stationsNavBtn = document.getElementById("stationsNavBtn");
    if (stationsNavBtn) stationsNavBtn.addEventListener("click", () => switchTab('stations-tab'));
    
    // النقر على البطاقات
    const containers = ['stationsContainer', 'favoritesContainer', 'searchResultsContainer'];
    containers.forEach(containerId => {
        const container = document.getElementById(containerId);
        if (container) container.addEventListener('click', (e) => { const card = e.target.closest('.station-card'); if (!card) return; if (e.target.closest('.play-station-btn') || e.target.closest('.fav-star')) return; updateCurrentStationFromCard(card); });
    });
    
    // بدء العرض
    renderCountriesList();
    renderStations();
    restoreLastStationWithoutPlaying();
    initMenuBar();
    initHistoryEvents();
    applyTheme(currentTheme);
    applyAllAdvancedSettings();
    updateSettingCheckmarks();
    bindSettingsMenuEvents();
    bindRecordButton();

if (window.electronAPI) {
    window.electronAPI.onUpdateAvailable(() => {
        setStatus(currentLanguage === 'ar' ? '📢 يتوفر تحديث جديد! جاري التحميل...' : '📢 New update available! Downloading...', false);
    });
    
    window.electronAPI.onUpdateDownloaded(() => {
        const userConfirmed = confirm(currentLanguage === 'ar' 
            ? 'تم تحميل التحديث. هل تريد تثبيته الآن؟ (سيتم إعادة تشغيل التطبيق)'
            : 'Update downloaded. Restart now to install?');
        if (userConfirmed && window.electronAPI.quitAndInstall) {
            window.electronAPI.quitAndInstall();
        }
    });
    
    window.electronAPI.onUpdateNotAvailable(() => {
        setStatus(currentLanguage === 'ar' ? '✅ لا توجد تحديثات متاحة. أنت تستخدم أحدث إصدار.' : '✅ No updates available. You are using the latest version.', false);
    });
    
    window.electronAPI.onUpdateError(() => {
        setStatus(currentLanguage === 'ar' ? '❌ فشل البحث عن تحديثات. تأكد من اتصالك بالإنترنت.' : '❌ Failed to check for updates. Check your internet connection.', true);
    });
}

// ربط زر تغيير أيقونة المحطة (ثلاث النقاط)
const changeIconBtn = document.getElementById('changeIconBtn');
if (changeIconBtn) {
    changeIconBtn.addEventListener('click', () => {
        if (currentStation && currentStation.id) {
            if (typeof changeStationIcon === 'function') {
                changeStationIcon(currentStation.id);
            } else {
                console.warn('changeStationIcon function not defined');
            }
        } else {
            setStatus(t('no_station_selected'), true);
        }
    });
}
    
    setTimeout(() => {
        bindTimerSubmenu();
        bindStereoSubmenu();
        bindOutputSubmenu();
        bindThemeSubmenu();
    }, 500);
    
    // إصلاح تخطيط شريط التشغيل
    function fixPlayerBarOnceAndForAll() {
        if (document.body.classList.contains('compact-mode')) return;
        const isElectron = !!(window.electronAPI && window.electronAPI.closeApp);
        const bottomValue = isElectron ? '400px' : '380px';
        const styleId = 'player-bar-fix';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `
                .player-bar {
                    position: fixed !important;
                    bottom: ${bottomValue} !important;
                    left: 10px !important;
                    right: 10px !important;
                    z-index: 800 !important;
                }
            `;
            document.head.appendChild(style);
        }
        const player = document.querySelector('.player-bar');
        if (player) {
            player.style.setProperty('position', 'fixed', 'important');
            player.style.setProperty('bottom', bottomValue, 'important');
            player.style.setProperty('left', '10px', 'important');
            player.style.setProperty('right', '10px', 'important');
            player.style.setProperty('z-index', '1100', 'important');
        }
        console.log(`✅ fixPlayerBarOnceAndForAll: bottom = ${bottomValue} (Electron: ${isElectron})`);
    }

    fixPlayerBarOnceAndForAll();
    let fixInterval = setInterval(fixPlayerBarOnceAndForAll, 200);
    setTimeout(() => clearInterval(fixInterval), 3000);
    window.addEventListener('resize', () => {
        if (window.innerWidth > 900) fixPlayerBarOnceAndForAll();
    });
    
    function fixTabScrolling() {
        const contentPanel = document.querySelector('.content-panel');
        const tabsContainer = document.querySelector('.tabs-container');
        const tabContent = document.querySelector('.tab-content');
        if (contentPanel && tabsContainer && tabContent) {
            contentPanel.style.display = 'flex';
            contentPanel.style.flexDirection = 'column';
            contentPanel.style.overflow = 'hidden';
            tabsContainer.style.flexShrink = '0';
            tabContent.style.flexGrow = '1';
            tabContent.style.overflowY = 'auto';
        }
    }
    setTimeout(fixTabScrolling, 100);
    setTimeout(fixTabScrolling, 500);
    
    // مؤشر صوت مستقل إضافي
    (function initStandaloneVisualizer() {
        console.log("محاولة بدء مؤشر الصوت المستقل...");
        const canvas = document.getElementById('audioVisualizerCanvas');
        if (!canvas) {
            console.error("❌ canvas غير موجود");
            return;
        }
        const ctx = canvas.getContext('2d');
        let isActive = false;
        let animFrame = null;
        const barCount = 22;
        const stripHeight = 4;
        const stripGap = 1;
        const neonRed = '#ff3333';
        const neonBlue = '#33aaff';
        const glowSize = 5;

        function resize() {
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height;
            console.log("Canvas size:", canvas.width, canvas.height);
        }

        function draw() {
            if (!ctx || !canvas) return;
            const w = canvas.width, h = canvas.height;
            ctx.clearRect(0, 0, w, h);

            let data = null;
            if (isActive && window.analyserNode && window.audioCtx && window.audioCtx.state === 'running') {
                const freq = new Uint8Array(window.analyserNode.frequencyBinCount);
                window.analyserNode.getByteFrequencyData(freq);
                data = freq;
            }

            const barWidth = (w / barCount) * 0.8;
            const gap = (w / barCount) * 0.2;
            const chunkSize = Math.floor((data ? data.length : 0) / barCount);

            for (let i = 0; i < barCount; i++) {
                let value = 0;
                if (data && data.length) {
                    let sum = 0;
                    for (let j = 0; j < chunkSize; j++) {
                        const idx = i * chunkSize + j;
                        if (idx < data.length) sum += data[idx];
                    }
                    value = (sum / chunkSize) / 255;
                    value = Math.pow(value, 1);
                } else {
                    value = 0.05;
                }
                if (value < 0.05) value = 0.05;

                const barHeight = Math.max(10, value * h);
                const x = i * (barWidth + gap);
                let numStrips = Math.floor(barHeight / (stripHeight + stripGap));
                if (numStrips < 1) numStrips = 1;
                
                for (let s = 0; s < numStrips; s++) {
                    const ratio = s / numStrips;
                    const r = 51 + Math.floor(204 * ratio);
                    const g = 170 - Math.floor(170 * ratio);
                    const b = 255 - Math.floor(255 * ratio);
                    const color = `rgb(${r}, ${g}, ${b})`;
                    const yStrip = h - (s + 1) * (stripHeight + stripGap);
                    if (yStrip + stripHeight < 0) continue;
                    if (ratio > 0.8) {
                        ctx.shadowBlur = glowSize;
                        ctx.shadowColor = neonRed;
                    } else {
                        ctx.shadowBlur = 2;
                        ctx.shadowColor = neonBlue;
                    }
                    ctx.fillStyle = color;
                    ctx.fillRect(x, yStrip, barWidth, stripHeight);
                }
            }
            ctx.shadowBlur = 0;
            animFrame = requestAnimationFrame(draw);
        }

        window.audioPlayer.addEventListener('play', () => {
            console.log("🎵 تشغيل الصوت، تنشيط المؤشر");
            isActive = true;
            resize();
            if (window.audioCtx && window.audioCtx.state === 'suspended') {
                window.audioCtx.resume().then(() => console.log("AudioContext resumed"));
            }
        });
        window.audioPlayer.addEventListener('pause', () => {
            console.log("إيقاف مؤقت، إيقاف المؤشر");
            isActive = false;
        });
        window.audioPlayer.addEventListener('ended', () => {
            isActive = false;
        });

        window.addEventListener('resize', resize);
        resize();
        draw();
        console.log("✅ مؤشر الصوت المستقل جاهز (شرطات نيونية)");
    })();
});

// دالة استعادة آخر محطة بدون تشغيل تلقائي
function restoreLastStationWithoutPlaying() {
    const saved = localStorage.getItem('arabicRadioCurrentStation');
    if (saved) {
        try {
            const savedStation = JSON.parse(saved);
            const stillExists = masterStations.some(st => st.id === savedStation.id);
            if (stillExists && savedStation.url) {
                currentStation = savedStation;
                if (!currentStation.countryCode && currentStation.id) {
                    const stationObj = masterStations.find(s => s.id === currentStation.id);
                    if (stationObj && stationObj.countryCode) {
                        currentStation.countryCode = stationObj.countryCode;
                        localStorage.setItem('arabicRadioCurrentStation', JSON.stringify(currentStation));
                    }
                }
                const currentStationNameEl = document.getElementById("currentStationName");
                if (currentStationNameEl) currentStationNameEl.innerText = currentStation.name;
                
                // استخدام الدالة المركزية لتحديث اسم الدولة
                if (typeof updateCurrentStationCountry === 'function') {
                    updateCurrentStationCountry();
                } else {
                    // كود احتياطي في حال عدم وجود الدالة
                    const currentStationCountryEl = document.getElementById("currentStationCountry");
                    if (currentStationCountryEl) {
                        let countryDisplay = currentStation.country;
                        if (currentStation.countryCode) {
                            const countryObj = allCountries.find(c => c.code === currentStation.countryCode);
                            if (countryObj) {
                                countryDisplay = currentLanguage === 'en' ? countryObj.name : countryObj.nameAr;
                            }
                        }
                        currentStationCountryEl.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${countryDisplay}`;
                    }
                }
                
                updateFavButtonCurrent();
                if (currentStation.id) updateStationIcon(currentStation.id);
                const playPauseBtn = document.getElementById("playPauseBtn");
                if (playPauseBtn) playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
                updateStationPlayButtons(null, false);
                setStatus('', false);
                if (autoResume) {
                    setTimeout(() => {
                        playStation(currentStation.url, currentStation.name, currentStation.country, currentStation.id, currentStation.isWebPage || false);
                        setStatus(`${currentLanguage === 'ar' ? '🔄 تشغيل تلقائي' : '🔄 Auto-resume'}: ${currentStation.name}`, false);
                    }, advancedSettings.autoResumeDelay * 1000);
                }
                return;
            }
        } catch(e) {}
    }
    const defaultFilter = allCountries.find(c => c.code === 'JO') || allCountries[0];
    currentFilterItem = defaultFilter;
    renderCountriesList();
    updateHeaderForFilter(currentFilterItem);
    renderStations();
}
// ربط بعض الوظائف للنوافذ
window.renderStations = renderStations;
window.renderFavoritesTab = renderFavoritesTab;
window.performSearch = performSearch;
window.switchTab = switchTab;
window.playStation = playStation;
window.stopPlayback = stopPlayback;
window.toggleFavorite = toggleFavorite;
window.getStationsByFilter = getStationsByFilter;
window.updateStationIcon = updateStationIcon;
window.resetAddStationForm = resetAddStationForm;
window.renderHistoryTab = renderHistoryTab;
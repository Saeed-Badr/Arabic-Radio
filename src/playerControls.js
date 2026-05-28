// ========== التشغيل والإيقاف والتايمر والتسجيل ==========
const statusEl = document.getElementById('playerStatus') || (() => {
    const el = document.createElement('div');
    el.id = 'playerStatus';
    el.className = 'player-status';
    const searchWrapper = document.querySelector('.search-wrapper');
    if (searchWrapper && searchWrapper.parentNode) searchWrapper.insertAdjacentElement('afterend', el);
    else document.querySelector('.main-header').appendChild(el);
    return el;
})();

function setStatus(text, isError = false) {
    if (!statusEl) return;
    statusEl.textContent = text || '';
    statusEl.style.color = isError ? '#dc2626' : '#ffffff';
    if (text && !isError) setTimeout(() => { if (statusEl.textContent === text) statusEl.textContent = ''; }, 5000);
}
function updateStationPlayButtons(activeStationId, isPlaying) {
    // تحويل المعرف النشط إلى نص للمقارنة الآمنة
    const activeId = (activeStationId !== undefined && activeStationId !== null) ? String(activeStationId) : null;
    
    // تحديث أزرار التشغيل في جميع البطاقات (المحطات، المفضلة، البحث)
    document.querySelectorAll('.play-station-btn').forEach(btn => {
        let stationId = btn.dataset.id;
        if (!stationId) {
            const card = btn.closest('.station-card');
            if (card) stationId = card.dataset.id;
        }
        const btnId = stationId ? String(stationId) : null;
        
        if (activeId && btnId === activeId) {
            if (isPlaying) {
                btn.innerHTML = '<i class="fas fa-stop"></i> ' + t('stop');
                btn.classList.add('playing');
            } else {
                btn.innerHTML = '<i class="fas fa-play"></i> ' + t('play');
                btn.classList.remove('playing');
            }
        } else {
            btn.innerHTML = '<i class="fas fa-play"></i> ' + t('play');
            btn.classList.remove('playing');
        }
    });
    
    // تحديث أزرار التشغيل في تبويب السجل
    document.querySelectorAll('.play-history-btn').forEach(btn => {
        const stationId = btn.dataset.id;
        const btnId = stationId ? String(stationId) : null;
        if (activeId && btnId === activeId) {
            if (isPlaying) {
                btn.innerHTML = '<i class="fas fa-stop"></i>';
                btn.classList.add('playing');
            } else {
                btn.innerHTML = '<i class="fas fa-play"></i>';
                btn.classList.remove('playing');
            }
        } else {
            btn.innerHTML = '<i class="fas fa-play"></i>';
            btn.classList.remove('playing');
        }
    });
}

// ========== تحديث زر التشغيل/الإيقاف الرئيسي في شريط التشغيل ==========
function updatePlayPauseButton(isPlaying) {
    const playPauseBtn = document.getElementById("playPauseBtn");
    if (!playPauseBtn) return;
    if (isPlaying) {
        playPauseBtn.innerHTML = '<i class="fas fa-stop"></i>';
        playPauseBtn.title = currentLanguage === 'ar' ? 'إيقاف' : 'Stop';
    } else {
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        playPauseBtn.title = currentLanguage === 'ar' ? 'تشغيل' : 'Play';
    }
}

// تحديث اسم الدولة في شريط التشغيل حسب اللغة الحالية
function updateCurrentStationCountry() {
    const currentStationCountryEl = document.getElementById("currentStationCountry");
    if (!currentStationCountryEl || !currentStation) return;
    
    if (currentStation.countryCode) {
        const countryObj = allCountries.find(c => c.code === currentStation.countryCode);
        if (countryObj) {
            const countryDisplay = currentLanguage === 'en' ? countryObj.name : countryObj.nameAr;
            currentStationCountryEl.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${countryDisplay}`;
            // تحديث الحقل النصي في الكائن للحفاظ على التناسق
            currentStation.country = countryDisplay;
            localStorage.setItem('arabicRadioCurrentStation', JSON.stringify(currentStation));
            return;
        }
    }
    // إذا لم يكن هناك countryCode (محطات قديمة أو مضافة يدوياً بدون كود دولة)
    currentStationCountryEl.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${currentStation.country || ''}`;
}

// تصدير الدالة للنطاق العام
window.updateCurrentStationCountry = updateCurrentStationCountry;

// دالة قوية لتحديث جميع أزرار التشغيل في كل مكان
function forceUpdateAllPlayButtons() {
    if (!currentStation) return;
    const activeId = String(currentStation.id);
    const isPlaying = !audioPlayer.paused && currentStation.url;
    
    document.querySelectorAll('.play-station-btn, .play-history-btn, .search-play').forEach(btn => {
        let btnId = btn.dataset.id;
        if (!btnId) {
            const card = btn.closest('.station-card');
            if (card) btnId = card.dataset.id;
        }
        if (btnId && String(btnId) === activeId) {
            if (isPlaying) {
                btn.innerHTML = '<i class="fas fa-stop"></i> ' + (btn.classList.contains('play-history-btn') ? '' : t('stop'));
                btn.classList.add('playing');
            } else {
                btn.innerHTML = '<i class="fas fa-play"></i> ' + (btn.classList.contains('play-history-btn') ? '' : t('play'));
                btn.classList.remove('playing');
            }
        } else if (!btn.classList.contains('playing')) {
            // فقط أعد تعيين الأزرار التي ليست في حالة تشغيل
            btn.innerHTML = '<i class="fas fa-play"></i> ' + (btn.classList.contains('play-history-btn') ? '' : t('play'));
            btn.classList.remove('playing');
        }
    });
}

// ========== دالة التشغيل الرئيسية (مع تعديلات التايمر وزر التشغيل) ==========
async function playStation(url, name, countryName, stationId, isWebPage = false) {
    if (!url) { setStatus(t('playback_failed'), true); return; }
    // إزالة تأثير الوميض من جميع أزرار التشغيل عند بدء تشغيل أي محطة
    document.querySelectorAll('.play-station-btn').forEach(btn => btn.classList.remove('pulse-temp'));
    if (currentStation && currentStation.id === stationId && !audioPlayer.paused) { stopPlayback(); return; }
    if (typeof stopTimerAndClear === 'function') stopTimerAndClear();
    stopPlayback();
    if (typeof resetTimerUp === 'function') resetTimerUp();   // إعادة ضبط التايمر التصاعدي قبل التشغيل
    
    // استخراج countryCode من masterStations
    let finalCountryCode = null;
    if (stationId && masterStations) {
        const stationObj = masterStations.find(s => s.id === stationId);
        if (stationObj && stationObj.countryCode) {
            finalCountryCode = stationObj.countryCode;
        }
    }
    
    currentStation = { id: stationId, name, country: countryName, url, isWebPage: isWebPage, countryCode: finalCountryCode };
    localStorage.setItem('arabicRadioCurrentStation', JSON.stringify(currentStation));
    const currentStationNameEl = document.getElementById("currentStationName");
    if (currentStationNameEl) currentStationNameEl.innerText = name;
    
    // استخدام الدالة المركزية لتحديث اسم الدولة
    if (typeof updateCurrentStationCountry === 'function') {
        updateCurrentStationCountry();
    } else {
        const currentStationCountryEl = document.getElementById("currentStationCountry");
        if (currentStationCountryEl) currentStationCountryEl.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${countryName}`;
    }
    
    if (typeof updateFavButtonCurrent === 'function') updateFavButtonCurrent();
    setStatus(t('connecting'), false);
    updateStationIcon(stationId);
    if (typeof addToHistory === 'function') addToHistory(stationId, name, countryName, url);
    await initWebAudio();
    enableAudioContextOnUserInteraction();
    ensureAnalyserConnection();
    if (audioCtx && audioCtx.state === 'suspended') await audioCtx.resume();
    
    if (isWebPage) {
        const webview = document.getElementById('radioWebview');
        if (webview) {
            webview.style.display = 'block';
            webview.src = url;
            const onLoad = () => {
                setStatus(t('webview_working'), false);
                updatePlayPauseButton(true);        // تحديث زر التشغيل/الإيقاف
                updateStationPlayButtons(stationId, true);
                startTimerUp();                     // بدء التايمر التصاعدي
                webview.removeEventListener('did-finish-load', onLoad);
                webview.removeEventListener('did-fail-load', onError);
            };
            const onError = () => { setStatus(t('webview_error'), true); webview.style.display = 'none'; };
            webview.addEventListener('did-finish-load', onLoad);
            webview.addEventListener('did-fail-load', onError);
        } else { setStatus(t('webview_error'), true); }
        return;
    }
    
    if (url.includes('.m3u8')) {
        if (window.Hls && Hls.isSupported()) {
            const hls = new Hls();
            hls.loadSource(url);
            hls.attachMedia(audioPlayer);
            window.currentHls = hls;
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                audioPlayer.play().then(() => {
                    updatePlayPauseButton(true);    // تحديث زر التشغيل/الإيقاف
                    startTimerUp();                 // بدء التايمر التصاعدي
                    setTimeout(() => forceUpdateAllPlayButtons(), 200);
                }).catch(() => setStatus(t('playback_failed'), true));
            });
            hls.on(Hls.Events.ERROR, (event, data) => { if (data.fatal) setStatus(t('stream_error'), true); });
        } else if (audioPlayer.canPlayType('application/vnd.apple.mpegurl')) {
            audioPlayer.src = url;
            audioPlayer.play().catch(() => setStatus(t('playback_failed'), true));
        } else { setStatus(t('not_supported'), true); }
        return;
    }
    
    audioPlayer.src = url;
    audioPlayer.load();
    audioPlayer.play().then(() => {
        forceUpdateAllPlayButtons();
        updatePlayPauseButton(true);              // تحديث زر التشغيل/الإيقاف
        startTimerUp();                           // بدء التايمر التصاعدي
    }).catch(() => setStatus(t('playback_failed'), true));
    if (audioCtx && audioCtx.state === 'suspended') await audioCtx.resume();
}
// ========== دالة الإيقاف ==========
function stopPlayback() {
    const webview = document.getElementById('radioWebview');
    if (webview) { webview.style.display = 'none'; webview.src = ''; }
    if (window.currentHls) { window.currentHls.destroy(); window.currentHls = null; }
    audioPlayer.pause();
    audioPlayer.src = '';
    audioPlayer.load();
    updatePlayPauseButton(false);                 // تحديث زر التشغيل/الإيقاف إلى أيقونة play
    if (currentStation) forceUpdateAllPlayButtons();
    setStatus('', false);
    if (typeof stopTimerAndClear === 'function') stopTimerAndClear();
    if (typeof stopTimerUp === 'function') stopTimerUp();   // إيقاف التايمر التصاعدي
    if (currentStation) updateStationIcon(currentStation.id);
}

// ========== المحطة التالية (تشغيل عشوائي من المحطات المعروضة) ==========
function playNextStation() {
    console.log("playNextStation called");
    if (!masterStations || masterStations.length === 0) {
        setStatus(t('no_stations'), true);
        return;
    }
    
    let stationsList = [];
    if (currentFilterItem && typeof getStationsByFilter === 'function') {
        stationsList = getStationsByFilter(currentFilterItem);
    }
    if (!stationsList.length) {
        stationsList = masterStations;
    }
    if (stationsList.length === 0) {
        setStatus(t('no_stations'), true);
        return;
    }
    
    const randomIndex = Math.floor(Math.random() * stationsList.length);
    const station = stationsList[randomIndex];
    const countryObj = allCountries.find(c => c.code === station.countryCode);
    const countryName = countryObj ? (currentLanguage === 'en' ? countryObj.name : countryObj.nameAr) : (station.countryCode === "XX" ? (currentLanguage === 'en' ? "Worldwide" : "عالمي") : station.countryCode);
    
    console.log("Playing next station:", station.name);
    playStation(station.streamUrl, station.name, countryName, station.id, station.isWebPage || false);
}

// ========== تهيئة زر المحطة التالية (الذي كان stopBtn) ==========
function initNextStationButton() {
    let nextBtn = document.getElementById("stopBtn") || document.getElementById("nextStationBtn");
    if (!nextBtn) {
        console.error("❌ لم يتم العثور على زر المحطة التالية. تأكد من أن الزر له id='stopBtn' أو id='nextStationBtn'");
        return;
    }
    nextBtn.innerHTML = '<i class="fas fa-step-forward"></i>';
    nextBtn.title = currentLanguage === 'ar' ? 'المحطة التالية' : 'Next Station';
    nextBtn.removeEventListener('click', stopPlayback);
    nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        playNextStation();
    });
    console.log("✅ تم تهيئة زر المحطة التالية (المعرف:", nextBtn.id, ")");
}

// ========== دوال التايمر التنازلي ==========
function stopTimerAndClear() {
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
    if (stopTimer) { clearTimeout(stopTimer); stopTimer = null; }
    timerRemainingSeconds = 0;
    updateTimerDisplay();
}

function updateTimerDisplay() {
    const timerDisplay = document.getElementById('timerDisplay');
    if (!timerDisplay) return;
    if (timerRemainingSeconds > 0 && !audioPlayer.paused) {
        const minutes = Math.floor(timerRemainingSeconds / 60);
        const seconds = timerRemainingSeconds % 60;
        timerDisplay.textContent = t('timer_remaining', minutes, seconds.toString().padStart(2, '0'));
        timerDisplay.style.display = 'flex';
    } else {
        timerDisplay.textContent = '';
        timerDisplay.style.display = 'none';
    }
}

function startTimer(minutes) {
    stopTimerAndClear();
    timerRemainingSeconds = minutes * 60;
    updateTimerDisplay();
    timerInterval = setInterval(() => {
        if (audioPlayer.paused) { stopTimerAndClear(); return; }
        if (timerRemainingSeconds > 0) {
            timerRemainingSeconds--;
            updateTimerDisplay();
            if (timerRemainingSeconds === 0) {
                clearInterval(timerInterval);
                timerInterval = null;
                stopPlayback();
                setStatus(t('stopped_auto'), false);
                updateTimerDisplay();
            }
        }
    }, 1000);
}

// ========== دوال التايمر التصاعدي (التي تعمل بشكل صحيح في النسخة القديمة) ==========
function updateTimerUpDisplay() {
    const timerUpElement = document.getElementById('timerUp');
    if (!timerUpElement) return;
    const hours = Math.floor(timerUpSeconds / 3600);
    const minutes = Math.floor((timerUpSeconds % 3600) / 60);
    const seconds = timerUpSeconds % 60;
    timerUpElement.textContent = t('timer_up_format', hours.toString().padStart(2, '0'), minutes.toString().padStart(2, '0'), seconds.toString().padStart(2, '0'));
}

function startTimerUp() {
    if (timerUpInterval) clearInterval(timerUpInterval);
    timerUpInterval = setInterval(() => {
        if (!audioPlayer.paused && currentStation && currentStation.url) {
            timerUpSeconds++;
            updateTimerUpDisplay();
        }
    }, 1000);
}

function stopTimerUp() {
    if (timerUpInterval) {
        clearInterval(timerUpInterval);
        timerUpInterval = null;
    }
}

function resetTimerUp() {
    stopTimerUp();
    timerUpSeconds = 0;
    updateTimerUpDisplay();
}

function bindTimerSubmenu() {
    document.querySelectorAll('.submenu-item[data-minutes]').forEach(item => {
        item.removeEventListener('click', timerClickHandler);
        item.addEventListener('click', timerClickHandler);
    });
}

function timerClickHandler(e) {
    e.stopPropagation();
    const minutes = parseInt(this.dataset.minutes, 10);
    if (isNaN(minutes)) return;
    if (!audioPlayer.paused && currentStation) {
        startTimer(minutes);
        setStatus(t('timer_set', minutes), false);
    } else {
        setStatus(t('no_active_stream'), true);
    }
}

// ========== تسجيل البث المباشر ==========
async function initRecording() {
    if (!audioPlayer || !audioPlayer.src) {
        setStatus(t('no_active_stream'), true);
        return false;
    }
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
        const recordIconBtn = document.getElementById('recordIconBtn');
        if (recordIconBtn) recordIconBtn.classList.remove('recording');
        const recordTimer = document.getElementById('recordTimer');
        if (recordTimer) {
            recordTimer.classList.remove('timer-visible');
            recordTimer.textContent = '00:00:00';
        }
        if (recordTimerInterval) {
            clearInterval(recordTimerInterval);
            recordTimerInterval = null;
        }
        recordSeconds = 0;
        setStatus(t('recording_stopped'), false);
        return false;
    }
    try {
        if (audioPlayer.captureStream) {
            const stream = audioPlayer.captureStream();
            mediaRecorder = new MediaRecorder(stream);
            recordedChunks = [];
            mediaRecorder.ondataavailable = e => recordedChunks.push(e.data);
            mediaRecorder.onstop = () => {
                const blob = new Blob(recordedChunks, { type: 'audio/webm' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `recording_${Date.now()}.webm`;
                a.click();
                URL.revokeObjectURL(url);
                setStatus(t('recording_saved'), false);
            };
            mediaRecorder.start();
            const recordIconBtn = document.getElementById('recordIconBtn');
            if (recordIconBtn) recordIconBtn.classList.add('recording');
            const recordTimer = document.getElementById('recordTimer');
            if (recordTimer) {
                recordTimer.classList.add('timer-visible');
                recordTimer.textContent = '00:00:00';
            }
            recordSeconds = 0;
            if (recordTimerInterval) clearInterval(recordTimerInterval);
            recordTimerInterval = setInterval(() => {
                recordSeconds++;
                const hours = Math.floor(recordSeconds / 3600);
                const minutes = Math.floor((recordSeconds % 3600) / 60);
                const secs = recordSeconds % 60;
                const timerDisplay = document.getElementById('recordTimer');
                if (timerDisplay) {
                    timerDisplay.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
                }
            }, 1000);
            setStatus(t('recording'), false);
            return true;
        } else {
            setStatus(t('recording_not_supported'), true);
            return false;
        }
    } catch(e) {
        console.error(e);
        setStatus(t('recording_failed', e.message), true);
        return false;
    }
}

function bindRecordButton() {
    const recordIconBtn = document.getElementById('recordIconBtn');
    if (recordIconBtn) {
        recordIconBtn.addEventListener('click', (e) => {
            e.preventDefault();
            initRecording();
        });
    }
}

// تصدير الدوال للنطاق العام
window.startTimer = startTimer;
window.stopTimerAndClear = stopTimerAndClear;
window.playNextStation = playNextStation;
window.initNextStationButton = initNextStationButton;
window.updatePlayPauseButton = updatePlayPauseButton;
window.startTimerUp = startTimerUp;
window.stopTimerUp = stopTimerUp;
window.resetTimerUp = resetTimerUp;
window.updateCurrentStationCountry = updateCurrentStationCountry;
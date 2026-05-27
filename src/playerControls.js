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
    // تحديث أزرار التشغيل في جميع البطاقات
    document.querySelectorAll('.play-station-btn').forEach(btn => {
        const id = btn.dataset.id;
        if (id && id === activeStationId) {
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
    
    // تحديث أزرار السجل
    document.querySelectorAll('.play-history-btn').forEach(btn => {
        const id = btn.dataset.id;
        if (id && id === activeStationId) {
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

async function playStation(url, name, countryName, stationId, isWebPage = false) {
console.log('playStation called with url:', url);
    if (!url) { setStatus(t('playback_failed'), true); return; }
    if (currentStation && currentStation.id === stationId && !audioPlayer.paused) { stopPlayback(); return; }
    if (typeof stopTimerAndClear === 'function') stopTimerAndClear();
    stopPlayback();
    if (typeof resetTimerUp === 'function') resetTimerUp();
    
    // استخراج countryCode من masterStations
const stationObj = masterStations.find(s => s.id === stationId);
const countryCode = stationObj ? stationObj.countryCode : 'XX';
// داخل playStation، بعد تعيين currentStation وقبل if (isWebPage)
updateStationPlayButtons(stationId, true);
currentStation = { id: stationId, name, country: countryName, countryCode: countryCode, url, isWebPage: isWebPage };
    localStorage.setItem('arabicRadioCurrentStation', JSON.stringify(currentStation));
    const currentStationNameEl = document.getElementById("currentStationName");
    if (currentStationNameEl) currentStationNameEl.innerText = name;
    const currentStationCountryEl = document.getElementById("currentStationCountry");
    if (currentStationCountryEl) currentStationCountryEl.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${countryName}`;
    if (typeof updateFavButtonCurrent === 'function') updateFavButtonCurrent();
    setStatus(t('connecting'), false);
    updateStationPlayButtons(stationId, false);
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
    const playPauseBtn = document.getElementById("playPauseBtn");
    if(playPauseBtn) playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
    updateStationPlayButtons(stationId, true);
    startTimerUp();  // <-- أضف هذا السطر
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
    audioPlayer.play().then(() => startTimerUp()).catch(() => setStatus(t('playback_failed'), true));
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
    updateStationPlayButtons(stationId, true);
    startTimerUp();  // <-- أضف هذا السطر
}).catch(() => setStatus(t('playback_failed'), true));
    if (audioCtx && audioCtx.state === 'suspended') await audioCtx.resume();
}
function stopPlayback() {
    const webview = document.getElementById('radioWebview');
    if (webview) { webview.style.display = 'none'; webview.src = ''; }
    if (window.currentHls) { window.currentHls.destroy(); window.currentHls = null; }
    audioPlayer.pause();
    audioPlayer.src = '';
    audioPlayer.load();
    const playPauseBtn = document.getElementById("playPauseBtn");
    if (playPauseBtn) playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    if (currentStation) updateStationPlayButtons(currentStation.id, false);
    setStatus('', false);
    if (typeof stopTimerAndClear === 'function') stopTimerAndClear();
    if (typeof stopTimerUp === 'function') stopTimerUp(); 
    // ❌ تم إزالة السطر التالي أو تعديله:
    // updateStationIcon(null);
    // ✅取而代之:
    if (currentStation) updateStationIcon(currentStation.id);
}

// ========== دوال التايمر ==========
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
            recordTimer.style.display = 'none';
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
                recordTimer.style.display = 'inline-block';
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
window.startTimer = startTimer;
window.stopTimerAndClear = stopTimerAndClear;
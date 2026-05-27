// ========== Web Audio ==========
async function initWebAudio() {
    if (audioCtx) return true;

    try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        sourceNode = audioCtx.createMediaElementSource(audioPlayer);
        gainNode = audioCtx.createGain();
        compressorNode = audioCtx.createDynamicsCompressor();
        stereoPanner = audioCtx.createStereoPanner();
        analyserNode = audioCtx.createAnalyser();
        analyserNode.fftSize = 256;
        analyserNode.smoothingTimeConstant = 0.85;
        sourceNode.connect(compressorNode);
        compressorNode.connect(stereoPanner);
        stereoPanner.connect(gainNode);
        gainNode.connect(analyserNode);
        analyserNode.connect(audioCtx.destination);
        window.audioCtx = audioCtx;
        window.sourceNode = sourceNode;
        window.analyserNode = analyserNode;
        console.log("✅ تم تهيئة Web Audio وربط analyserNode عالميًا");
        return true;
    } catch (e) {
        console.error("❌ فشل تهيئة Web Audio:", e);
        return false;
    }
}

async function resumeAudioContext() {
    if (audioCtx && audioCtx.state === 'suspended') await audioCtx.resume();
}

function enableAudioContextOnUserInteraction() {
    if (audioCtx && audioCtx.state === 'suspended') {
        const resume = () => {
            audioCtx.resume().then(() => console.log("✅ AudioContext تم تفعيله بنقرة المستخدم"));
            document.removeEventListener('click', resume);
            document.removeEventListener('touchstart', resume);
        };
        document.addEventListener('click', resume);
        document.addEventListener('touchstart', resume);
    }
}

function ensureAnalyserConnection() {
    if (gainNode && analyserNode && audioCtx) {
        try {
            gainNode.disconnect(analyserNode);
            gainNode.connect(analyserNode);
            analyserNode.connect(audioCtx.destination);
            console.log("✅ analyserNode متصل بشكل صحيح");
        } catch(e) { console.warn("ensureAnalyserConnection error", e); }
    }
}

async function toggleCompressor() {
    if (!await initWebAudio()) { if (typeof setStatus === 'function') setStatus(t('not_supported'), true); return; }
    await resumeAudioContext();
    try {
        sourceNode.disconnect();
        if (!isCompressorActive) {
            sourceNode.connect(compressorNode);
            compressorNode.connect(gainNode);
            isCompressorActive = true;
            if (typeof setStatus === 'function') setStatus(t('compressor_on'), false);
        } else {
            sourceNode.connect(gainNode);
            isCompressorActive = false;
            if (typeof setStatus === 'function') setStatus(t('compressor_off'), false);
        }
        if (isStereoModeActive) {
            const currentPan = stereoPanner.pan.value;
            if (currentPan !== 0) {
                sourceNode.disconnect();
                if (isCompressorActive) {
                    sourceNode.connect(compressorNode);
                    compressorNode.connect(stereoPanner);
                } else {
                    sourceNode.connect(stereoPanner);
                }
                stereoPanner.connect(gainNode);
            }
        }
        ensureAnalyserConnection();
    } catch(e) { if (typeof setStatus === 'function') setStatus(t('compressor_error'), true); }
}

async function applyStereoMode(direction) {
    if (!await initWebAudio()) return;
    await resumeAudioContext();
    try {
        sourceNode.disconnect();
        if (direction === 'left') {
            stereoPanner.pan.value = -1;
            if (isCompressorActive) {
                sourceNode.connect(compressorNode);
                compressorNode.connect(stereoPanner);
            } else {
                sourceNode.connect(stereoPanner);
            }
            stereoPanner.connect(gainNode);
            isStereoModeActive = true;
            if (typeof setStatus === 'function') setStatus(t('stereo_left'), false);
        } else if (direction === 'right') {
            stereoPanner.pan.value = 1;
            if (isCompressorActive) {
                sourceNode.connect(compressorNode);
                compressorNode.connect(stereoPanner);
            } else {
                sourceNode.connect(stereoPanner);
            }
            stereoPanner.connect(gainNode);
            isStereoModeActive = true;
            if (typeof setStatus === 'function') setStatus(t('stereo_right'), false);
        } else {
            if (isCompressorActive) {
                sourceNode.connect(compressorNode);
                compressorNode.connect(gainNode);
            } else {
                sourceNode.connect(gainNode);
            }
            isStereoModeActive = false;
            if (typeof setStatus === 'function') setStatus(t('stereo_center'), false);
        }
        ensureAnalyserConnection();
    } catch(e) { if (typeof setStatus === 'function') setStatus(t('stereo_error'), true); }
}

// ========== جهاز الإخراج ==========
async function setAudioOutputDevice(deviceId) {
    if (!audioCtx) {
        if (!await initWebAudio()) {
            if (typeof setStatus === 'function') setStatus(t('output_device_not_supported'), true);
            return;
        }
    }
    if (typeof audioCtx.setSinkId !== 'function') {
        if (typeof setStatus === 'function') setStatus(t('output_device_not_supported'), true);
        return;
    }
    try {
        const sinkId = deviceId || '';
        await audioCtx.setSinkId(sinkId);
        if (typeof setStatus === 'function') setStatus(sinkId ? t('output_device_changed_to_selected') : t('output_device_default'), false);
    } catch(e) {
        console.error(e);
        if (typeof setStatus === 'function') setStatus(t('output_device_change_error', e.message), true);
    }
}

async function selectAndSetAudioOutput() {
    if (!navigator.mediaDevices || typeof navigator.mediaDevices.selectAudioOutput !== 'function') {
        if (typeof setStatus === 'function') setStatus(t('output_device_not_supported'), true);
        return;
    }
    try {
        const selectedDevice = await navigator.mediaDevices.selectAudioOutput();
        if (selectedDevice && selectedDevice.deviceId) {
            await setAudioOutputDevice(selectedDevice.deviceId);
            if (typeof setStatus === 'function') setStatus(t('output_device_changed', selectedDevice.label || t('output_device_selected')), false);
        } else {
            if (typeof setStatus === 'function') setStatus(t('output_device_not_selected'), true);
        }
    } catch (err) {
        if (err.name === 'AbortError') {
            if (typeof setStatus === 'function') setStatus(t('output_device_not_selected'), false);
        } else {
            console.error("خطأ في selectAudioOutput:", err);
            if (typeof setStatus === 'function') setStatus(t('output_device_select_error', err.message), true);
        }
    }
}

// ========== معرض الصوت (Visualizer) الحقيقي ==========
(function setupAudioVisualizer() {
    const canvas = document.getElementById('audioVisualizerCanvas');
    const wrapper = document.getElementById('audioVisualizerWrapper');
    if (!canvas || !wrapper) return;
    const ctx = canvas.getContext('2d');
    let animationId = null;
    let isActive = false;
    const barCount = 20;
    const stripHeight = 4;
    const stripGap = 1;
    const neonRed = '#ff3333';
    const neonBlue = '#33aaff';
    const glowSize = 5;

    function resizeCanvas() {
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
    }

    function drawBars() {
        if (!ctx || !canvas) return;
        const width = canvas.width;
        const height = canvas.height;
        ctx.clearRect(0, 0, width, height);

        let dataArray = null;
        if (isActive && analyserNode && audioCtx && audioCtx.state === 'running') {
            const freqArray = new Uint8Array(analyserNode.frequencyBinCount);
            analyserNode.getByteFrequencyData(freqArray);
            dataArray = freqArray;
        }

        const barWidth = (width / barCount) * 0.8;
        const gap = (width / barCount) * 0.2;

        for (let i = 0; i < barCount; i++) {
            let value = 0;
            if (dataArray && dataArray.length) {
                const start = Math.floor(i * dataArray.length / barCount);
                const end = Math.floor((i + 1) * dataArray.length / barCount);
                let sum = 0;
                for (let j = start; j < end; j++) sum += dataArray[j];
                const avg = (end > start) ? sum / (end - start) : 0;
                value = Math.pow(avg / 255, 1.2);
            } else {
                value = 0.05;
            }

            const barHeight = Math.max(10, value * height * 0.9);
            const x = i * (barWidth + gap);
            let numStrips = Math.floor(barHeight / (stripHeight + stripGap));
            if (numStrips < 1) numStrips = 1;
            
            for (let s = 0; s < numStrips; s++) {
                const ratio = s / numStrips;
                const r = 51 + Math.floor(204 * ratio);
                const g = 170 - Math.floor(170 * ratio);
                const b = 255 - Math.floor(255 * ratio);
                const color = `rgb(${r}, ${g}, ${b})`;
                const yStrip = height - (s + 1) * (stripHeight + stripGap);
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
        animationId = requestAnimationFrame(drawBars);
    }

    audioPlayer.addEventListener('play', () => {
        isActive = true;
        resizeCanvas();
        if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
    });
    audioPlayer.addEventListener('pause', () => { isActive = false; });
    audioPlayer.addEventListener('ended', () => { isActive = false; });
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    drawBars();
})();
window.applyStereoMode = applyStereoMode;
window.setAudioOutputDevice = setAudioOutputDevice;
window.selectAndSetAudioOutput = selectAndSetAudioOutput;
window.toggleCompressor = toggleCompressor;
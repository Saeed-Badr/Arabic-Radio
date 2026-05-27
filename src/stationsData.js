// في أعلى ملف stationsData.js (خارج أي دالة)
let lastKnownIconUrl = DEFAULT_ICON_PATH;
// متغير عام لتخزين مسار مجلد أيقونات المستخدم
let userIconsCachePath = '';

// تهيئة مسار مجلد أيقونات المستخدم (يُستدعى عند بدء التشغيل)
async function initUserIconsCache() {
    if (window.electronAPI && window.electronAPI.getUserDataPath) {
        try {
            const userData = await window.electronAPI.getUserDataPath();
            userIconsCachePath = `${userData}/icons_cache`;
            // إنشاء المجلد إذا لم يكن موجوداً
            if (window.electronAPI.mkdir) {
                await window.electronAPI.mkdir(userIconsCachePath);
            }
            console.log('✅ User icons cache path:', userIconsCachePath);
        } catch (err) {
            console.warn('⚠️ Failed to init user icons cache:', err);
        }
    } else {
        console.warn('⚠️ electronAPI not available for user icons');
    }
}
// ========== إدارة المحطات ==========
function saveMasterStations() {
    localStorage.setItem("arabicRadioMasterStations", JSON.stringify(masterStations));
    console.log(`💾 تم حفظ ${masterStations.length} محطة في localStorage`);
}

function loadFailedIconsSet() {
    const stored = localStorage.getItem(FAILED_ICONS_KEY);
    if (stored) {
        try {
            const arr = JSON.parse(stored);
            failedIconsSet = new Set(arr);
            console.log(`📋 تم تحميل ${failedIconsSet.size} محطة فاشلة من localStorage`);
        } catch(e) { console.error("فشل تحميل قائمة الفشل", e); }
    }
}

function saveFailedIconsSet() {
    const arr = Array.from(failedIconsSet);
    localStorage.setItem(FAILED_ICONS_KEY, JSON.stringify(arr));
    console.log(`💾 تم حفظ ${arr.length} محطة فاشلة في localStorage`);
}

function markStationAsFailed(stationId) {
    if (!failedIconsSet.has(stationId)) {
        failedIconsSet.add(stationId);
        saveFailedIconsSet();
        console.log(`🚫 تم إضافة المحطة ${stationId} إلى قائمة الفشل الدائمة`);
    }
}

async function loadMasterStations() {
    const stored = localStorage.getItem("arabicRadioMasterStations");
    if (stored) {
        try {
            masterStations = JSON.parse(stored);
            console.log(`✅ تم تحميل ${masterStations.length} محطة من localStorage`);
            return true;
        } catch(e) { console.error("فشل قراءة localStorage", e); }
    }
    if (window.fallbackStations && Array.isArray(window.fallbackStations) && window.fallbackStations.length > 0) {
        masterStations = window.fallbackStations;
        console.log(`✅ تم تحميل ${masterStations.length} محطة من stations_fallback.js`);
        saveMasterStations();
        return true;
    } else {
        console.error('❌ لا توجد محطات متاحة');
        masterStations = [];
        return false;
    }
}

function getStationsByFilter(filterItem) {
    if (filterItem.isGenre) {
        return masterStations.filter(st => st.genre && st.genre.toLowerCase() === filterItem.genreKey.toLowerCase());
    } else {
        return masterStations.filter(st => st.countryCode === filterItem.code);
    }
}

async function fetchIconForStation(station) {
    console.log("🔍 جلب أيقونة لـ:", station.name);
    if (station.icon && station.icon !== DEFAULT_ICON_PATH && station.icon.trim() !== "") {
        return station.icon;
    }
    try {
        const urlObj = new URL(station.streamUrl);
        const domain = urlObj.hostname;
        if (domain) {
            const domainIcon = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
            console.log(`🌐 تم استخراج نطاق ${domain} للمحطة ${station.name}`);
            return domainIcon;
        }
    } catch(e) {
        console.warn(`فشل استخراج النطاق من ${station.streamUrl}`);
    }
    const searchName = encodeURIComponent(station.name);
    const servers = ["de1", "nl1", "fr1", "all"];
    for (const server of servers) {
        try {
            const url = `https://${server}.api.radio-browser.info/json/stations/byname?name=${searchName}&hidebroken=true&limit=5`;
            const response = await fetch(url);
            if (!response.ok) continue;
            const stations = await response.json();
            let bestMatch = stations.find(s => s.url === station.streamUrl);
            if (!bestMatch && stations.length > 0) bestMatch = stations[0];
            if (bestMatch && bestMatch.favicon && bestMatch.favicon.trim()) {
                const favicon = bestMatch.favicon.trim();
                if (!favicon.includes('favicon.ico')) {
                    return favicon;
                }
            }
        } catch (e) {
            console.warn(`فشل الاتصال بـ ${server} لمحطة ${station.name}:`, e);
        }
    }
    return DEFAULT_ICON_PATH;
}

async function updateMissingIcons() {
    console.log("🚀 بدء تحديث الأيقونات... عدد المحطات:", masterStations.length);
    let updated = false;
    let skippedFailed = 0;
    for (let i = 0; i < masterStations.length; i++) {
        const st = masterStations[i];
        if (st.icon && (st.icon.includes('google.com/s2/favicons') || st.icon.includes('gstatic.com'))) {
            st.icon = "";
            updated = true;
            console.log(`🧹 تنظيف أيقونة Google S2 لـ: ${st.name}`);
        }
    }
    const stationsToUpdate = masterStations.filter(st => 
        !failedIconsSet.has(st.id) && 
        (!st.icon || st.icon === DEFAULT_ICON_PATH || st.icon.trim() === "")
    );
    console.log(`🔄 سيتم تحديث ${stationsToUpdate.length} محطة.`);
    if (stationsToUpdate.length === 0) {
        console.log("ℹ️ لا توجد أيقونات جديدة لتحديثها.");
        if (updated) {
            saveMasterStations();
            if (currentTab === 'stations-tab' && typeof renderStations === 'function') renderStations();
            if (currentTab === 'favorites-tab' && typeof renderFavoritesTab === 'function') renderFavoritesTab();
        }
        return;
    }
    for (const st of stationsToUpdate) {
        if (failedIconsSet.has(st.id)) continue;
        console.log(`🔄 جاري جلب أيقونة لـ: ${st.name}`);
        const newIcon = await fetchIconForStation(st);
        if (newIcon && newIcon !== DEFAULT_ICON_PATH && newIcon !== st.icon) {
            st.icon = newIcon;
            updated = true;
            console.log(`✅ تم تحديث أيقونة: ${st.name} -> ${newIcon.substring(0, 60)}...`);
            if (currentStation && currentStation.id === st.id && typeof updateStationIcon === 'function') {
                updateStationIcon(st.id);
            }
        } else {
            markStationAsFailed(st.id);
            console.log(`⚠️ فشل جلب أيقونة ${st.name}، تمت إضافتها إلى القائمة السوداء.`);
        }
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    if (updated) {
        saveMasterStations();
        if (currentTab === 'stations-tab' && typeof renderStations === 'function') renderStations();
        if (currentTab === 'favorites-tab' && typeof renderFavoritesTab === 'function') renderFavoritesTab();
        console.log("💾 تم حفظ الأيقونات المحدثة في localStorage.");
    }
}

function updateStationIcon(stationId) {
    const stationIconImg = document.getElementById("stationIcon");
    if (!stationIconImg) return;

    // حالة null: استخدام آخر أيقونة معروفة
    if (stationId === null || stationId === undefined) {
        if (lastKnownIconUrl && lastKnownIconUrl !== DEFAULT_ICON_PATH) {
            stationIconImg.src = lastKnownIconUrl;
        } else {
            stationIconImg.src = DEFAULT_ICON_PATH;
        }
        return;
    }

    const station = masterStations.find(s => s.id === stationId);
    if (!station) {
        stationIconImg.src = DEFAULT_ICON_PATH;
        return;
    }

    let basePath = (typeof assetsBasePath !== 'undefined') ? assetsBasePath : './assets';
    if (!basePath.endsWith('/')) basePath += '/';
    const iconsCachePath = basePath + 'icons_cache/';
    
    // 1. الأولوية القصوى: customIcon (صورة مرفوعة من المستخدم)
    let finalIconUrl = DEFAULT_ICON_PATH;
    if (station.customIcon && station.customIcon.startsWith('data:image')) {
        finalIconUrl = station.customIcon;
    } else {
        // 2. ثانياً: صورة من مجلد icons_cache (إن وجدت)
        finalIconUrl = iconsCachePath + stationId + '.jpg';
    }

    if (stationIconImg.src !== finalIconUrl) {
        stationIconImg.src = finalIconUrl;
        stationIconImg.onerror = () => {
            // في حال فشل تحميل customIcon أو الصورة المحلية
            let fallbackUrl = DEFAULT_ICON_PATH;
            // إذا كنا نحاول تحميل الصورة المحلية وفشلت، ننتقل إلى station.icon (الرابط الأصلي)
            if (finalIconUrl !== station.customIcon && station.icon && typeof station.icon === 'string') {
                const icon = station.icon.trim();
                if (icon && !icon.includes('favicon.ico') && !icon.includes('google.com/s2/favicons')) {
                    fallbackUrl = icon;
                }
            }
            if (stationIconImg.src !== fallbackUrl) {
                stationIconImg.src = fallbackUrl;
                // معالج خطأ إضافي للوصول إلى الصورة الافتراضية إذا فشل كل شيء
                stationIconImg.onerror = () => {
                    if (stationIconImg.src !== DEFAULT_ICON_PATH) {
                        stationIconImg.src = DEFAULT_ICON_PATH;
                        stationIconImg.onerror = null;
                    }
                };
            } else {
                stationIconImg.onerror = null;
            }
        };
    }

    // تحديث آخر أيقونة معروفة بعد نجاح التحميل
    setTimeout(() => {
        if (stationIconImg.complete && stationIconImg.naturalHeight !== 0) {
            lastKnownIconUrl = stationIconImg.src;
        }
    }, 500);
}
// ========== إدارة تبويب إضافة محطة ==========
function populateCountrySelect() {
    const select = document.getElementById('newStationCountry');
    if (!select) return;
    const realCountries = allCountries.filter(c => !c.isGenre);
    realCountries.forEach(country => {
        const option = document.createElement('option');
        option.value = country.code;
        option.textContent = country.nameAr;
        select.appendChild(option);
    });
}

function resetAddStationForm() {
    const nameInput = document.getElementById('newStationName');
    const urlInput = document.getElementById('newStationUrl');
    const countrySelect = document.getElementById('newStationCountry');
    const genreInput = document.getElementById('newStationGenre');
    const iconInput = document.getElementById('newStationIcon');
    if (nameInput) nameInput.value = '';
    if (urlInput) urlInput.value = '';
    if (countrySelect) countrySelect.value = 'XX';
    if (genreInput) genreInput.value = '';
    if (iconInput) iconInput.value = '';
}

function addNewStationFromForm() {
    const name = document.getElementById('newStationName').value.trim();
    const url = document.getElementById('newStationUrl').value.trim();
    const countryCode = document.getElementById('newStationCountry').value;
    const genre = document.getElementById('newStationGenre').value.trim() || 'عامة';
    const icon = document.getElementById('newStationIcon').value.trim();
    if (!name) { alert(t('station_name_label') + ' ' + (currentLanguage === 'ar' ? 'مطلوب' : 'required')); return; }
    if (!url) { alert(t('station_url_label') + ' ' + (currentLanguage === 'ar' ? 'مطلوب' : 'required')); return; }
    const newStation = { id: 'custom_' + Date.now(), name, countryCode, streamUrl: url, genre, icon: icon, isWebPage: false };
    masterStations.push(newStation);
    saveMasterStations();
    resetAddStationForm();
    if (currentTab === 'stations-tab' && typeof renderStations === 'function') renderStations();
    if (currentTab === 'favorites-tab' && typeof renderFavoritesTab === 'function') renderFavoritesTab();
    alert(t('station_added', name));
    if (typeof switchTab === 'function') switchTab('stations-tab');
}

// ========== حذف المحطة ==========
function deleteStation(stationId) {
    masterStations = masterStations.filter(s => s.id !== stationId);
    saveMasterStations();
    if (favorites.includes(stationId)) {
        favorites = favorites.filter(id => id !== stationId);
        if (typeof saveFavorites === 'function') saveFavorites();
    }
    if (historyList.some(entry => entry.id === stationId)) {
        historyList = historyList.filter(entry => entry.id !== stationId);
        localStorage.setItem("arabicRadioHistory", JSON.stringify(historyList));
        if (typeof renderHistoryTab === 'function') renderHistoryTab();
    }
    if (currentTab === 'stations-tab' && typeof renderStations === 'function') renderStations();
    if (currentTab === 'favorites-tab' && typeof renderFavoritesTab === 'function') renderFavoritesTab();
    if (currentStation && currentStation.id === stationId) {
        if (typeof stopPlayback === 'function') stopPlayback();
        currentStation = null;
        const currentStationNameEl = document.getElementById("currentStationName");
        if (currentStationNameEl) currentStationNameEl.innerText = t('current_station_default');
        const currentStationCountryEl = document.getElementById("currentStationCountry");
        if (currentStationCountryEl) currentStationCountryEl.innerHTML = "";
        updateStationIcon(null);
    }
    if (typeof setStatus === 'function') setStatus(t('station_deleted'), false);
}

function deleteStationHandler(e) {
    e.stopPropagation();
    const stationId = this.dataset.id;
    const station = masterStations.find(s => s.id === stationId);
    if (!station) return;
    if (confirm(t('confirm_delete_station', station.name))) {
        deleteStation(stationId);
    }
}

function attachDeleteEvents() {
    document.querySelectorAll('.delete-station-btn').forEach(btn => {
        btn.removeEventListener('click', deleteStationHandler);
        btn.addEventListener('click', deleteStationHandler);
    });
}

// ========== تصدير المحطات ==========
function exportStations() {
    const dataStr = JSON.stringify(masterStations, null, 2);
    const blob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'stations_backup.json';
    a.click();
    URL.revokeObjectURL(url);
    if (typeof setStatus === 'function') setStatus(t('history_exported'), false);
}
// ========== تغيير أيقونة المحطة يدوياً ==========
function changeStationIcon(stationId) {
    console.log("changeStationIcon called with stationId:", stationId);
    const station = masterStations.find(s => s.id === stationId);
    if (!station) {
        setStatus(t('station_not_found'), true);
        return;
    }
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg, image/png, image/gif, image/webp';
    
    input.onchange = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        
        if (file.size > 2 * 1024 * 1024) {
            setStatus(t('icon_file_too_large'), true);
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const imageDataUrl = e.target.result;
            station.customIcon = imageDataUrl;
            saveMasterStations();
            // تحديث الأيقونة إذا كانت هذه المحطة هي الحالية
            if (currentStation && currentStation.id === stationId) {
                updateStationIcon(stationId);
            }
            setStatus(t('icon_changed_success'), false);
            // إعادة عرض المحطات لتحديث أيقونة البطاقة (اختياري)
            if (typeof renderStations === 'function') renderStations();
        };
        reader.onerror = () => {
            setStatus(t('icon_change_failed'), true);
        };
        reader.readAsDataURL(file);
    };
    
    input.click();
}
window.exportStations = exportStations;
// ========== إصلاح رابط المحطة التالف ==========
// ========== إصلاح رابط المحطة التالف ==========
async function findNewStreamUrlForStation(stationName) {
    try {
        const servers = ["de1", "nl1", "fr1"];
        const randomServer = servers[Math.floor(Math.random() * servers.length)];
        const url = `https://${randomServer}.api.radio-browser.info/json/stations/byname?name=${encodeURIComponent(stationName)}&hidebroken=true&limit=5`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const stations = await response.json();
        
        if (stations && stations.length > 0) {
            let bestMatch = stations.find(s => s.name.toLowerCase() === stationName.toLowerCase());
            if (!bestMatch) bestMatch = stations[0];
            let newUrl = bestMatch.urlResolved || bestMatch.url;
            if (newUrl && newUrl.startsWith('http')) {
                return newUrl;
            }
        }
        return null;
    } catch (error) {
        console.error("❌ فشل البحث عن رابط جديد:", error);
        return null;
    }
}

async function repairStationStream(stationId) {
    const station = masterStations.find(s => s.id === stationId);
    if (!station) {
        if (typeof setStatus === 'function') setStatus(t('station_not_found'), true);
        return null;
    }
    
    if (typeof setStatus === 'function') setStatus(currentLanguage === 'ar' ? '🔍 جاري البحث عن رابط جديد...' : '🔍 Searching for new stream URL...', false);
    
    const newUrl = await findNewStreamUrlForStation(station.name);
    if (newUrl && newUrl !== station.streamUrl) {
        station.streamUrl = newUrl;
        if (typeof saveMasterStations === 'function') saveMasterStations();
        if (typeof setStatus === 'function') setStatus(currentLanguage === 'ar' ? '✅ تم تحديث رابط المحطة بنجاح' : '✅ Station URL updated successfully', false);
        
        if (currentStation && currentStation.id === stationId) {
            currentStation.url = newUrl;
            localStorage.setItem('arabicRadioCurrentStation', JSON.stringify(currentStation));
            if (!audioPlayer.paused && typeof playStation === 'function') {
                playStation(newUrl, station.name, currentStation.country, station.id, station.isWebPage || false);
            }
        }
        if (typeof renderStations === 'function') renderStations();
        if (typeof renderFavoritesTab === 'function') renderFavoritesTab();
        return newUrl;
    } else if (newUrl === station.streamUrl) {
        if (typeof setStatus === 'function') setStatus(currentLanguage === 'ar' ? 'ℹ️ الرابط الحالي لا يزال يعمل' : 'ℹ️ Current URL is still working', false);
        return null;
    } else {
        if (typeof setStatus === 'function') setStatus(currentLanguage === 'ar' ? '❌ لم يتم العثور على رابط بديل يعمل' : '❌ No working alternative URL found', true);
        return null;
    }
}

// تصدير الدالة للاستخدام العام
window.repairStationStream = repairStationStream;

async function repairStationStream(stationId) {
    const station = masterStations.find(s => s.id === stationId);
    if (!station) {
        setStatus(t('station_not_found'), true);
        return null;
    }
    
    setStatus(currentLanguage === 'ar' ? '🔧 جاري البحث عن رابط جديد...' : '🔧 Searching for new stream URL...', false);
    
    const newUrl = await findNewStreamUrlForStation(station.name);
    if (newUrl && newUrl !== station.streamUrl) {
        // تحديث الرابط في المحطة
        station.streamUrl = newUrl;
        saveMasterStations();
        setStatus(currentLanguage === 'ar' ? '✅ تم تحديث رابط المحطة بنجاح' : '✅ Station URL updated successfully', false);
        
        // إذا كانت هذه المحطة هي الحالية، نقوم بتحديث currentStation أيضاً
        if (currentStation && currentStation.id === stationId) {
            currentStation.url = newUrl;
            localStorage.setItem('arabicRadioCurrentStation', JSON.stringify(currentStation));
            // إذا كانت المحطة قيد التشغيل حالياً، نعيد تشغيلها بالرابط الجديد
            if (!audioPlayer.paused) {
                playStation(newUrl, station.name, currentStation.country, station.id, station.isWebPage || false);
            }
        }
        return newUrl;
    } else if (newUrl === station.streamUrl) {
        setStatus(currentLanguage === 'ar' ? 'ℹ️ الرابط الحالي لا يزال يعمل' : 'ℹ️ Current URL is still working', false);
        return null;
    } else {
        setStatus(currentLanguage === 'ar' ? '❌ لم يتم العثور على رابط بديل يعمل' : '❌ No working alternative URL found', true);
        return null;
    }
}

// تصدير الدالة للاستخدام في الملفات الأخرى
window.repairStationStream = repairStationStream;
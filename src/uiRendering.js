// ========== عرض الواجهة ==========
let assetsBasePath = './assets';
let pulseApplied = false;   // لمنع إعادة النبض
let countriesFilterText = '';   // ← أضف هذا السطر

// تهيئة المسار الأساسي للأصول (يتم استدعاؤها عند تحميل الصفحة)
(async function initAssetsPath() {
  if (window.electronAPI && window.electronAPI.getAssetsDir) {
    assetsBasePath = await window.electronAPI.getAssetsDir();
    console.log('✅ Assets path set to:', assetsBasePath);
  }
  // إعادة عرض قائمة الدول بعد تعيين المسار الصحيح
  if (typeof renderCountriesList === 'function') {
    renderCountriesList();
  }
 setTimeout(() => applyTemporaryPulse(), 1000);
// ربط حدث البحث في قائمة الدول
const countriesSearchInput = document.getElementById('countriesSearchInput');
if (countriesSearchInput) {
    countriesSearchInput.addEventListener('input', filterCountriesList);
}
})();

function applyTemporaryPulse() {
    if (pulseApplied) return;
    const playButtons = document.querySelectorAll('.play-station-btn');
    playButtons.forEach(btn => btn.classList.add('pulse-temp'));
    setTimeout(() => {
        playButtons.forEach(btn => btn.classList.remove('pulse-temp'));
    }, 10000);
    pulseApplied = true;
}

function renderStations() {
    const container = document.getElementById("stationsContainer");
    const stations = getStationsByFilter(currentFilterItem);
    const title = currentLanguage === 'en' ? currentFilterItem.name : currentFilterItem.nameAr;
    if (!stations.length) {
        let emptyMsg = currentFilterItem.isGenre ? t('no_stations_genre') : t('no_stations_country');
        container.innerHTML = `<div class="empty-message">${emptyMsg}</div>`;
        return;
    }
    container.innerHTML = stations.map(station => `
        <div class="station-card" data-id="${station.id}">
            <div class="station-info">
                <div class="station-name"><i class="fas fa-microphone-alt"></i> ${escapeHtml(station.name)}</div>
                <div class="station-country">${title} • ${translateGenre(station.genre)}</div>
            </div>
            <button class="play-station-btn play-this" data-id="${station.id}" data-url="${station.streamUrl}" data-name="${escapeHtml(station.name)}" data-country="${title}" data-iswebpage="${station.isWebPage || false}" title="${t('play')}"><i class="fas fa-play"></i> ${t('play')}</button>
<button class="fav-star ${isFavorite(station.id) ? 'active-fav' : ''}" data-id="${station.id}" title="${t('save_to_favorites')}">${isFavorite(station.id) ? '<i class="fas fa-heart"></i>' : '<i class="far fa-heart"></i>'}</button>
<button class="repair-station-btn" data-id="${station.id}" title="${currentLanguage === 'ar' ? 'إصلاح الرابط' : 'Repair URL'}"><i class="fas fa-wrench"></i></button>
<button class="delete-station-btn" data-id="${station.id}" title="${t('delete_station')}"><i class="fas fa-trash-alt"></i></button>
        </div>
    `).join('');
    attachStationEvents();
    attachDeleteEvents();
    attachRepairEvents(); // سيتم إضافتها
    updateStationPlayButtons(currentStation ? currentStation.id : null, currentStation && !audioPlayer.paused);
}

function attachStationEvents() {
    document.querySelectorAll('.play-this').forEach(btn => btn.addEventListener('click', (e) => { e.stopPropagation(); playStation(btn.dataset.url, btn.dataset.name, btn.dataset.country, btn.dataset.id, btn.dataset.iswebpage === 'true'); }));
    document.querySelectorAll('.fav-star').forEach(star => star.addEventListener('click', (e) => { e.stopPropagation(); toggleFavorite(star.dataset.id); renderStations(); if(currentTab === 'favorites-tab' && typeof renderFavoritesTab === 'function') renderFavoritesTab(); }));
}

function attachRepairEvents() {
    document.querySelectorAll('.repair-station-btn').forEach(btn => {
        btn.removeEventListener('click', repairClickHandler);
        btn.addEventListener('click', repairClickHandler);
    });
}

async function repairClickHandler(e) {
    e.stopPropagation();
    const stationId = this.dataset.id;
    if (window.repairStationStream) {
        await window.repairStationStream(stationId);
    } else {
        console.error('repairStationStream function not found');
        if (typeof setStatus === 'function') setStatus('⚠️ وظيفة الإصلاح غير متوفرة', true);
    }
}

function filterCountriesList() {
    const input = document.getElementById('countriesSearchInput');
    if (input) {
        countriesFilterText = input.value.trim().toLowerCase();
        renderCountriesList();   // إعادة رسم القائمة بعد التصفية
    }
}
function renderCountriesList() {
    if (!currentFilterItem) {
        currentFilterItem = allCountries[0];
    }
    const container = document.getElementById("countriesList");
    if (!container) return;

    // تصفية العناصر بناءً على نص البحث
    let filteredCountries = allCountries;
    if (countriesFilterText) {
        filteredCountries = allCountries.filter(item => {
            const nameEn = item.name.toLowerCase();
            const nameAr = item.nameAr.toLowerCase();
            return nameEn.includes(countriesFilterText) || nameAr.includes(countriesFilterText);
        });
    }

    container.innerHTML = filteredCountries.map(item => {
        let iconHtml = '';
        if (item.isGenre) {
            const iconPath = `${assetsBasePath}/Category_icons/${item.code}.png`;
            iconHtml = `<img src="${iconPath}" alt="${item.code}" class="country-flag-icon genre-icon" onerror="this.style.display='none'">`;
        } else {
            const flagPath = `${assetsBasePath}/Icons_of_all_countries/${item.code}.png`;
            iconHtml = `<img src="${flagPath}" alt="${item.code}" class="country-flag-icon" onerror="this.style.display='none'">`;
        }
        
        let displayName = currentLanguage === 'en' ? item.name : item.nameAr;
        if (currentLanguage === 'en' && displayName) {
            displayName = displayName.replace(/^[A-Z]{2}\s/, '').trim();
        }
        
        return `
            <div class="country-item ${currentFilterItem.code === item.code ? 'active-country' : ''}" 
                data-code="${item.code}" 
                data-isgenre="${item.isGenre || false}"
                data-genrekey="${item.genreKey || ''}"
                role="button" tabindex="0">
                ${iconHtml}
                <span>${displayName}</span>
            </div>
        `;
    }).join('');

    // إعادة ربط الأحداث
    document.querySelectorAll('.country-item').forEach(el => {
        el.addEventListener('click', () => {
            const code = el.dataset.code;
            const selected = allCountries.find(c => c.code === code);
            if (selected) {
                currentFilterItem = selected;
                countriesFilterText = '';       // إعادة تعيين البحث عند التحديد
                const searchInput = document.getElementById('countriesSearchInput');
                if (searchInput) searchInput.value = '';
                renderCountriesList();
                updateHeaderForFilter(selected);
                renderStations();
                if (currentTab !== 'stations-tab') switchTab('stations-tab');
                const mainSearchInput = document.getElementById("searchInput");
                if (mainSearchInput) mainSearchInput.value = '';
            }
        });
    });
    
    const countryCountSpan = document.querySelector(".country-count");
    if (countryCountSpan) countryCountSpan.innerText = `(${filteredCountries.length})`;
}

function updateHeaderForFilter(filterItem) {
    const nameSpan = document.getElementById("selectedCountryName");
    const flagImg = document.getElementById("selectedCountryFlag");
    const fallbackIcon = document.getElementById("selectedCountryIconFallback");
    if (!nameSpan || !flagImg || !fallbackIcon) return;
    
    let displayName = currentLanguage === 'en' ? filterItem.name : filterItem.nameAr;
    if (currentLanguage === 'en' && displayName) {
        displayName = displayName.replace(/^[A-Z]{2}\s/, '').trim();
    }
    nameSpan.innerText = displayName;
    
    if (filterItem.isGenre) {
        const iconPath = `${assetsBasePath}/Category_icons/${filterItem.code}.png`;
        flagImg.src = iconPath;
        flagImg.className = "country-flag-icon genre-icon";
        flagImg.style.display = 'inline-block';
        fallbackIcon.style.display = 'none';
        flagImg.onerror = () => {
            flagImg.style.display = 'none';
            fallbackIcon.style.display = 'inline-block';
            fallbackIcon.className = 'fas fa-tag';
        };
    } else {
        const flagPath = `${assetsBasePath}/Icons_of_all_countries/${filterItem.code}.png`;
        flagImg.src = flagPath;
        flagImg.className = "country-flag-icon";
        flagImg.style.display = 'inline-block';
        fallbackIcon.style.display = 'none';
        flagImg.onerror = () => {
            flagImg.style.display = 'none';
            fallbackIcon.style.display = 'inline-block';
            fallbackIcon.className = 'fas fa-flag';
        };
    }
}

function switchTab(tabId) {
    currentTab = tabId;
    document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active-pane'));
    const activePane = document.getElementById(tabId);
    if (activePane) activePane.classList.add('active-pane');
    
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active-tab'));
    const activeBtn = document.querySelector(`[data-tab="${tabId}"]`);
    if (activeBtn) activeBtn.classList.add('active-tab');
    
    // إعادة تعيين موضع التمرير إلى الأعلى للتبويب النشط
    if (activePane) {
        activePane.scrollTop = 0;
    }
    
    if (tabId === 'favorites-tab' && typeof renderFavoritesTab === 'function') renderFavoritesTab();
    else if (tabId === 'stations-tab') renderStations();
    else if (tabId === 'history-tab' && typeof renderHistoryTab === 'function') renderHistoryTab();
    else if (tabId === 'search-tab') performSearch(searchKeyword);
    else if (tabId === 'add-station-tab') {
        resetAddStationForm();
    }
}

function updateCurrentStationFromCard(cardElement) {
    const stationId = cardElement.dataset.id;
    if (!stationId) return false;
    const station = masterStations.find(s => s.id === stationId);
    if (!station) return false;
    const countryObj = allCountries.find(c => c.code === station.countryCode);
    const countryName = countryObj ? countryObj.nameAr : station.countryCode;
    currentStation = { id: station.id, name: station.name, country: countryName, url: station.streamUrl, isWebPage: station.isWebPage || false };
    localStorage.setItem('arabicRadioCurrentStation', JSON.stringify(currentStation));
    const currentStationNameEl = document.getElementById("currentStationName");
    if (currentStationNameEl) currentStationNameEl.innerText = currentStation.name;
    const currentStationCountryEl = document.getElementById("currentStationCountry");
    if (currentStationCountryEl) currentStationCountryEl.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${currentStation.country}`;
    updateFavButtonCurrent();
    updateStationIcon(currentStation.id);
    setStatus(`تم اختيار ${station.name}`, false);
    return true;
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}
function translateGenre(genre) {
    if (!genre) return t('genre_variety');
    const genreMap = {
        // الأنواع الأساسية والمضافة حديثًا (بدون مسافات بادئة)
        'هاوس': 'House',
        'مستشفى': 'Hospital',
        'ترانس': 'Trans',
        'كانتري': 'Country',
        'أفريقية': 'African',
        'إيطالية': 'Italian',
        'ألمانية': 'German',
        'هولندية': 'Dutch',
        'روسية': 'Russian',
        'بلقانية': 'Balkan',
        'أفروبيت': 'Afrobeat',
        'كارنفال': 'Carnival',
        'محيطية': 'Peripheral',
        'روسية / عامة': 'Russian / General',
        'بيت / إلكتروني': 'Home / Electronic',
        'ترفيه': 'Entertainment',
        'رومانسية': 'Romantic',
        'مرور': 'Traffic',
        'موسيقى إلكترونية': 'Electronic Music',
        'تقليدي': 'Traditional',
        'كي-بوب': 'K-Pop',
        'تراب': 'Trap',
        'بوب فولكلور': 'Pop Folklore',
        'إنجليزية': 'English',
        'صينية': 'Chinese',
        'سول/جاز': 'Soul/Jazz',
        'موسيقى حضرية': 'Urban Music',
        'سول/فانك': 'Soul/Funk',
        'هاردستايل': 'Hardstyle',
        'راب': 'Rap',
        'روك/بوب': 'Rock/Pop',
        'روك/إندي': 'Rock/Indie',
        'سالسا/كومبيا': 'Salsa/Cumbia',
        'كومبيا': 'Cumbia',
        'كومبيا/سالسا': 'Cumbia/Salsa',
        'بوليرو/بالاد': 'Bolero/Ballad',
        'رقص/بوب': 'Dance/Pop',
        'بوب-فولك': 'Pop-Folk',
        'موسيقى بلغارية': 'Bulgarian Music',
        'كلاسيكيات بلغارية': 'Bulgarian Classics',
        'شبابية/ثقافة': 'Youth/Culture',
        'موسيقى/ثقافة': 'Music/Culture',
        'كلاسيكية/ثقافة': 'Classical/Culture',
        'كلاسيكية/موسيقى تصويرية': 'Classical/Soundtrack',
        'بوب/موسيقى': 'Pop/Music',
        'فلامنكو': 'Flamenco',
        'إيسيزولو': 'IsiZulu',
        'سكا/روكستدي': 'Ska/Rocksteady',
        'ريغي/هادئ': 'Reggae/Calm',
        'موسيقى شبابية': 'Youth Music',
        'بوب روسي': 'Russian Pop',
        'بوب/رقص': 'Pop/Dance',
        'روك روسي': 'Russian Rock',
        'هاي لايف': 'Hi-Life',
        'أخبار/ثقافة': 'News/Culture',
        'أخبار/اقتصاد': 'News/Economy',
        'شانسون': 'Chanson',
        'بوب/شانسون': 'Pop/Chanson',
        'غير محدد': 'Undefined',
        'موسيقى/حوار': 'Music/Dialogue',
        'بديل/ثقافة': 'Alternative/Culture',
        'أوربان/ريغيتون': 'Urban/Reggaeton',
        'أفريكانس/حوار': 'Afrikaans/Dialogue',
        'موسيقى/رياضة': 'Music/Sports',
        'شبابية/أوربان': 'Youth/Urban',
        'معاصرة': 'Contemporary',
        'بوب/روك': 'Pop/Rock',
        'متنوعة': 'Various',
        'ريغي/موسيقى': 'Reggae/Music',
        'ريغي/دانسهول': 'Reggae/Dancehall',
        'لوك ثونغ': 'Luk Thung',
        'روك/بديل': 'Rock/Alternative',
        'بونغو فلافا': 'Bongo Flava',
        'أخبار/رياضة': 'News/Sports',
        'جامعية/ثقافة': 'University/Culture',
        'عامة/محلية': 'General/Local',
        'محلية/توباغو': 'Local/Tobago',
        'لونج/هادئة': 'Long/Quiet',
        'صحة': 'Health',
        'أوربان/موسيقى': 'Urban/Music',
        'سوكا/ريغي': 'Soca/Reggae',
        'موسيقى/ترفيه': 'Music/Entertainment',
        'حوار/أخبار': 'Talk/News',
        'أخبار/ترفيه': 'News/Entertainment',
        'أصوات طبيعية': 'Natural Sounds',
        'أخبار / موسيقى': 'News / Music',
        'أخبار/موسيقى': 'News/Music',
        'أخبار / ثقافة': 'News / Culture',
        'أخبار/عامة': 'News/General',
        'أخبار 24/7': '24/7 News',
        'موسيقى/أخبار': 'Music/News',
        'روك/ميتال': 'Rock/Metal',
        'أخبار/حوار': 'News/Talk',
        'ديسكو/بوب': 'Disco/Pop',
        'ديسكو بولو': 'Disco Polo',
        'هادئ/لونج': 'Quiet/Long',
        'رقص/شبابي': 'Dance/Youth',
        'رقص/إلكتروني': 'Dance/Electronic',
        'وطني': 'Patriotic',
        'بوب ألماني': 'German Pop',
        'راب ألماني': 'German Rap',
        'روك أوكراني': 'Ukrainian Rock',
        'بروغريسيف': 'Progressive',
        'أندرجراوند': 'Underground',
        'ألعاب': 'Games',
        'إندي': 'Indie',
        'موسيقى شبابية': 'Youth Music',
        'موسيقى إستونية': 'Estonian Music',
        'درام آند بيس': 'Drum and Bass',
        'دانغدوت': 'Dangdut',
        'موسيقى عالمية': 'World Music',
        'ميتال': 'Metal',
        'جروبيرا': 'Grupera',
        'توب 40': 'Top 40',
        'حدث': 'Event',
        // الأنواع الأساسية السابقة
        'موسيقى': 'Music',
        'أخبار': 'News',
        'عامة': 'General',
        'رياضة': 'Sports',
        'ديني': 'Religious',
        'جامعة': 'University',
        'مؤسسي': 'Corporate',
        'متنوع': 'Variety',
        'كلاسيكي': 'Classical',
        'بوب': 'Pop',
        'روك': 'Rock',
        'جاز': 'Jazz',
        'محادثة': 'Talk',
        'ثقافة': 'Culture',
        'تعليمي': 'Educational',
        'إسلامي': 'Islamic',
        'قرآن': 'Quran',
        'منوعات': 'Variety',
        // الأنواع المتعلقة بالتصنيفات
        'بلوز': 'Blues',
        'هيب هوب': 'Hip Hop',
        'سالسا': 'Salsa',
        'تانغو': 'Tango',
        'ديسكو': 'Disco',
        'تكنو': 'Techno',
        'ريغي': 'Reggae',
        'فانك': 'Funk',
        'سول': 'Soul',
        'لاتيني': 'Latin',
        'عربية': 'Arabic',
        'الإسلامية': 'Islamic',
        'الكلاسيكية': 'Classical',
        'الفلامنكو': 'Flamenco',
        'الأوبرا': 'Opera',
        'أر أند بى': 'R&B',
        'الراب': 'Rap',
        'رقص': 'Dance',
        'محلية': 'Local',
        'أفريكانس': 'Afrikaans',
        'موسيقى استوائية': 'Tropical Music',
        'حوار': 'Dialogue',
        'موسيقى هادئة': 'Relaxing Music',
        'آر أند بي': 'R&B',
        'فارسية': 'Persian',
        'مغاربية': 'Maghrebi',
        'مجتمعية': 'Community',
        'مجتمعى': 'Community',
        'جامعى': 'University',
        'قرآن كريم': 'Holy Quran',
        'هندية': 'Indian',
        'حديث': 'Modern',
        'جامعي': 'University',
        'أطفال': 'Children',
        'ريفي': 'Rural',
        'كوميديا': 'Comedy',
        'فوكالويد': 'Vocaloid',
        'موسيقى إيطالية': 'Italian Music',
        'فوررو': 'Forró',
        'لاتينية': 'Latin',
        'أخبار وثقافة': 'News and Culture',
        'أنمي': 'Anime',
        'بوب ياباني': 'Japanese Pop',
        'روك ياباني': 'Japanese Rock',
        'بوب نمساوي': 'Austrian Pop',
        'أفلام': 'Movies',
        'شلاغر': 'Schlager',
        'لونج': 'Lounge',
        'ثقافية': 'Cultural',
        'ثقافي': 'Cultural',
        'إخبارية': 'News',
        'موسيقى تراثية': 'Traditional Music',
        'جامعية': 'University',
        'موسيقى قديمة': 'Oldies',
        'سيارات': 'Cars',
        'شباب': 'Youth',
        'تركية': 'Turkish',
        'روك كلاسيكي': 'Classic Rock',
        'استرخاء': 'Relaxation',
        'شبابية': 'Youthful',
        'بديل': 'Alternative',
        'كريسماس': 'Christmas',
        'دينية': 'Religious',
        'أفضل الأغاني': 'Best Songs',
        'موسيقى العالم': 'World Music',
        'الكلاسيكيات': 'Classics',
        'كلاسيكيات': 'Classics',
        'كلاسيكية': 'Classical',
        'كلاسيك': 'Classical',
        'روحاني': 'Spiritual',
        'طرب': 'Tarab',
        'فرنكوفونية': 'Francophone',
        'مسيحية': 'Christian',
        'أندلسي': 'Andalusian',
        'الكوميديا': 'Comedy',
        'الوثائقي': 'Documentary',
        'الدراما': 'Drama',
        'الطعام': 'Food',
        'الصحة': 'Health',
        'أوربان': 'Urban',
        'الأطفال': 'Kids',
        'السفر': 'Travel',
        'أوبرا': 'Opera',
        'فادو': 'Fado',
        'برتغالية': 'Portuguese',
        'برازيلية': 'Brazilian',
        'كلاسيك روك': 'Classic Rock',
        'الأخبار': 'News',
        'الرياضة': 'Sports',
        'كرة السلة': 'Basketball',
        'كرة القدم': 'Football',
        // إضافات شائعة
        'بودكاست': 'Podcast',
        'هيب هوب/أوربان': 'Hip Hop/Urban',
        'لوك ثونغ/فلكلور': 'Lok Thong/Folklore',
        'موسيقى تقليدية': 'Traditional Music',   // تم إزالة المسافة البادئة
        'رومانسي': 'Romantic',
        'هادئ': 'Relaxing',
        'إلكتروني': 'Electronic',
        'تراثي': 'Folk',
        'فلكلور': 'Folklore',
        'شبابي': 'Youth',
// إضافات جديدة - أدخلها قبل الإغلاق النهائي للـ genreMap
'أخبار / ثقافة': 'News / Culture',
'أخبار / حوار': 'News / Dialogue',
'أخبار / عامة': 'News / General',
'أخبار / موسيقى': 'News / Music',
'أخبار إخبارية': 'News Report',
'أخبار ترفيه': 'Entertainment News',
'أخبار دولية': 'International News',
'أخبار رياضة': 'Sports News',
'أخبار عالمية': 'World News',
'أكاديمية': 'Academic',
'أمازيغية': 'Amazigh',
'أناشيد': 'Nasheeds',
'أوكرانية': 'Ukrainian',
'بالاد': 'Ballad',
'بيئة': 'Environment',
'تاريخية': 'Historical',
'تراثية': 'Heritage',
'تسجيلات إذاعية': 'Radio Recordings',
'تمثيلية': 'Drama',
'تمكين المرأة / موسيقى': 'Women\'s Empowerment / Music',
'توعوية': 'Awareness',
'جريئة': 'Bold',
'جوائز': 'Awards',
'دينية (إسلامية)': 'Religious (Islamic)',
'دينية (مسيحية)': 'Religious (Christian)',
'دينيّة': 'Religious',
'روك إنجليزي': 'English Rock',
'سريالية': 'Surrealism',
'سموث جاز': 'Smooth Jazz',
'شعبية': 'Popular',
'شعبية / فلكلورية': 'Popular / Folklore',
'طعام / طبخ': 'Food / Cooking',
'عامة - متنوعة': 'General - Various',
'عبرية': 'Hebrew',
'عربي': 'Arabic',
'علمية': 'Scientific',
'فلكلوري': 'Folklore',
'فيديوهات': 'Videos',
'قرآني': 'Quranic',
'كلاسيكية إيطالية': 'Italian Classical',
'كلاسيكية عربية': 'Arabic Classical',
'كوميدية': 'Comedy',
'كينيا': 'Kenya',
'محلية (أمازيغية)': 'Local (Amazigh)',
'محلية (إنجليزية)': 'Local (English)',
'محلية (عربية)': 'Local (Arabic)',
'محلية (فرنسية)': 'Local (French)',
'محلية (كردية)': 'Local (Kurdish)',
'مختلط': 'Mixed',
'مستقلة (إندي)': 'Independent (Indie)',
'مشاهدات': 'Views',
'مصرية': 'Egyptian',
'مقابلات': 'Interviews',
'مناظرات': 'Debates',
'موسيقى إيندي': 'Indie Music',
'موسيقى البلوز': 'Blues Music',
'موسيقى العصر الجديد': 'New Age Music',
'موسيقى الكترونية': 'Electronic Music',
'موسيقى الليل': 'Night Music',
'موسيقى أمازيغية': 'Berber Music',
'موسيقى أندلسية': 'Andalusian Music',
'موسيقى أوكرانية': 'Ukrainian Music',
'موسيقى إسبانية': 'Spanish Music',
'موسيقى إفريقية': 'African Music',
'موسيقى إلكترونية راقصة': 'Electronic Dance Music',
'موسيقى الأطفال': 'Children\'s Music',
'موسيقى الأنديز': 'Andean Music',
'موسيقى البحر الكاريبي': 'Caribbean Music',
'موسيقى البوب': 'Pop Music',
'موسيقى البوب العربية': 'Arabic Pop Music',
'موسيقى البوب الكلاسيكية': 'Classical Pop Music',
'موسيقى التركية': 'Turkish Music',
'موسيقى الجاز': 'Jazz Music',
'موسيقى الجيل الجديد': 'New Generation Music',
'موسيقى الحجرة': 'Chamber Music',
'موسيقى الروك': 'Rock Music',
'موسيقى الزمن الجميل': 'Golden Age Music',
'موسيقى السالسا': 'Salsa Music',
'موسيقى السول': 'Soul Music',
'موسيقى الشرق الأوسط': 'Middle Eastern Music',
'موسيقى العالم الجديد': 'New World Music',
'موسيقى العربية': 'Arabic Music',
'موسيقى الكانتري': 'Country Music',
'موسيقى اللاتينية': 'Latin Music',
'موسيقى الليل الهادئة': 'Chill Night Music',
'موسيقى المسيحية': 'Christian Music',
'موسيقى المصاعد': 'Elevator Music',
'موسيقى الملكية': 'Royal Music',
'موسيقى الميتال': 'Metal Music',
'موسيقى النادي': 'Club Music',
'موسيقى الهند': 'Indian Music',
'موسيقى اليابان': 'Japanese Music',
'موسيقى بوب': 'Pop Music',
'موسيقى بوب عربية': 'Arabic Pop Music',
'موسيقى تركية': 'Turkish Music',
'موسيقى تراثية': 'Traditional Music',
'موسيقى ترفيهية': 'Entertainment Music',
'موسيقى جنوب أفريقيا': 'South African Music',
'موسيقى حزينة': 'Sad Music',
'موسيقى حماسية': 'Upbeat Music',
'موسيقى خليجية': 'Gulf Music',
'موسيقى دينية': 'Religious Music',
'موسيقى رقص إلكترونية': 'Electronic Dance Music',
'موسيقى رومانسية': 'Romantic Music',
'موسيقى سريعة': 'Fast Music',
'موسيقى سودانية': 'Sudanese Music',
'موسيقى شعبية': 'Folk Music',
'موسيقى صامتة': 'Silent Music',
'موسيقى عربية': 'Arabic Music',
'موسيقى عربية كلاسيكية': 'Classical Arabic Music',
'موسيقى عصرية': 'Contemporary Music',
'موسيقى غربية': 'Western Music',
'موسيقى فرنسية': 'French Music',
'موسيقى فلكلورية': 'Folk Music',
'موسيقى قبطية': 'Coptic Music',
'موسيقى كلاسيكية': 'Classical Music',
'موسيقى كمبودية': 'Cambodian Music',
'موسيقى كندية': 'Canadian Music',
'موسيقى كورية': 'Korean Music',
'موسيقى لاتينية': 'Latin Music',
'موسيقى لبنانية': 'Lebanese Music',
'موسيقى ليتورجية': 'Liturgical Music',
'موسيقى متعددة الثقافات': 'Multicultural Music',
'موسيقى مصرية': 'Egyptian Music',
'موسيقى مغربية': 'Moroccan Music',
'موسيقى هادئة / كلاسيكية': 'Calm / Classical Music',
'موسيقى هادئة/لونج': 'Relaxing / Lounge Music',
'موسيقى هولندية': 'Dutch Music',
'موسيقى يابانية': 'Japanese Music',
'نادي': 'Club',
'نهارية': 'Daytime',
'هندوسية': 'Hindu',
'وإذاعة': 'And Radio',
'وقت العمل': 'Working Time',
'يابانية': 'Japanese',
'إسلامية': 'Islamic',
'اسباني': 'Spanish',
'بوب إنجليزي': 'English Pop',
'بوب سويدي': 'Swedish Pop',
'بوب عربي': 'Arabic Pop',
'بوب فرنسي': 'French Pop',
        'صحي': 'Wellness' 
    };
    if (currentLanguage === 'en') {
        let translated = genreMap[genre];
        if (!translated) {
            // محاولة إزالة "الـ" من بداية الكلمة
            let withoutAl = genre.replace(/^(ال)/, '');
            translated = genreMap[withoutAl];
        }
        return translated || genre;
    }
    return genre;
}
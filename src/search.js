// ========== دوال البحث ==========
async function performSearch(keyword) {
    const container = document.getElementById("searchResultsContainer");
    if (!keyword.trim()) {
        container.innerHTML = `<div class="empty-message">${t('search_empty')}</div>`;
        return;
    }
    const lowerKeyword = keyword.toLowerCase();
    const localResults = masterStations.filter(st => { 
        const countryName = allCountries.find(c=>c.code===st.countryCode)?.nameAr || ''; 
        return st.name.toLowerCase().includes(lowerKeyword) || countryName.toLowerCase().includes(lowerKeyword) || (st.genre || '').toLowerCase().includes(lowerKeyword); 
    });
    setStatus(t('searching_online'), false);
    const apiResults = await searchRadioBrowser(keyword);
    let allResults = [...localResults, ...apiResults];
    const uniqueResults = [];
    const seenNames = new Set();
    for (const station of allResults) { 
        if (!seenNames.has(station.name.toLowerCase())) { 
            seenNames.add(station.name.toLowerCase()); 
            uniqueResults.push(station); 
        } 
    }
    renderSearchResults(uniqueResults);
}

function renderSearchResults(results) {
    const container = document.getElementById("searchResultsContainer");
    if (!results.length) { container.innerHTML = `<div class="empty-message">${t('no_search_results')}</div>`; return; }
    container.innerHTML = results.map(st => {
        const countryObj = allCountries.find(c=>c.code===st.countryCode);
        const cName = countryObj ? (currentLanguage === 'en' ? countryObj.name : countryObj.nameAr) : (st.countryCode === "XX" ? (currentLanguage === 'en' ? "Worldwide" : "عالمي") : st.countryCode);
        const isApiStation = st.isFromAPI || false;
        return `<div class="station-card" data-id="${st.id}">
            <div class="station-info">
                <div class="station-name">${isApiStation ? '🌐 ' : ''}${escapeHtml(st.name)}${isApiStation ? '<small style="color:#6a1b9a;"> (من Radio Browser)</small>' : ''}</div>
                <div class="station-country">${cName} • ${translateGenre(st.genre)}</div>
            </div>
            <div class="station-actions">
                <button class="play-station-btn search-play" data-url="${st.streamUrl}" data-name="${escapeHtml(st.name)}" data-country="${cName}" data-id="${st.id}" data-iswebpage="${st.isWebPage || false}" data-isapi="${isApiStation}" title="${t('play')}"><i class="fas fa-play"></i> ${t('play')}</button>
                <button class="fav-star ${isFavorite(st.id) ? 'active-fav' : ''}" data-id="${st.id}">${isFavorite(st.id) ? '<i class="fas fa-heart"></i>' : '<i class="far fa-heart"></i>'}</button>
                <button class="repair-station-btn" data-id="${st.id}" title="${currentLanguage === 'ar' ? 'إصلاح الرابط' : 'Repair URL'}"><i class="fas fa-wrench"></i></button>
                <button class="delete-station-btn" data-id="${st.id}" title="${t('delete_station')}"><i class="fas fa-trash-alt"></i></button>
            </div>
        </div>`;
    }).join('');
    
    // ربط أحداث التشغيل
    document.querySelectorAll('.search-play').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isApiStation = btn.dataset.isapi === 'true';
            const stationId = btn.dataset.id;
            const stationName = btn.dataset.name;
            const stationUrl = btn.dataset.url;
            const stationCountry = btn.dataset.country;
            if (isApiStation && !masterStations.some(s => s.id === stationId)) {
                masterStations.push({
                    id: stationId,
                    name: stationName,
                    countryCode: stationCountry === 'عالمي' ? 'XX' : (allCountries.find(c => c.nameAr === stationCountry)?.code || 'XX'),
                    streamUrl: stationUrl,
                    genre: "من Radio Browser",
                    icon: "",
                    isFromAPI: true
                });
                saveMasterStations();
            }
            playStation(stationUrl, stationName, stationCountry, stationId, btn.dataset.iswebpage === 'true');
        });
    });
    
    // ربط أحداث المفضلة
    document.querySelectorAll('#searchResultsContainer .fav-star').forEach(star => {
        star.addEventListener('click', (e) => {
            e.stopPropagation();
            const stationId = star.dataset.id;
            const stationCard = star.closest('.station-card');
            const playBtn = stationCard.querySelector('.search-play');
            const isApiStation = playBtn?.dataset.isapi === 'true';
            if (isApiStation && playBtn) {
                const stationName = playBtn.dataset.name;
                const stationUrl = playBtn.dataset.url;
                const stationCountry = playBtn.dataset.country;
                if (!masterStations.some(s => s.id === stationId)) {
                    masterStations.push({
                        id: stationId,
                        name: stationName,
                        countryCode: stationCountry === 'عالمي' ? 'XX' : (allCountries.find(c => c.nameAr === stationCountry)?.code || 'XX'),
                        streamUrl: stationUrl,
                        genre: "من Radio Browser",
                        icon: "",
                        isFromAPI: true
                    });
                    saveMasterStations();
                }
            }
            toggleFavorite(stationId);
            performSearch(searchKeyword);
        });
    });
    
    // ربط أحداث الإصلاح
    document.querySelectorAll('#searchResultsContainer .repair-station-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const stationId = btn.dataset.id;
            const newUrl = await window.repairStationStream(stationId);
            if (newUrl) performSearch(searchKeyword);
        });
    });
    
    // ربط أحداث الحذف
    document.querySelectorAll('#searchResultsContainer .delete-station-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const stationId = btn.dataset.id;
            if (confirm(t('confirm_delete_station', ''))) deleteStation(stationId);
            performSearch(searchKeyword);
        });
    });
    
    updateStationPlayButtons(currentStation ? currentStation.id : null, currentStation && !audioPlayer.paused);
}

async function searchRadioBrowser(query) {
    if (!query || query.trim() === "") return [];
    try {
        const servers = ["de1", "nl1", "fr1"];
        const randomServer = servers[Math.floor(Math.random() * servers.length)];
        const url = `https://${randomServer}.api.radio-browser.info/json/stations/search?name=${encodeURIComponent(query)}&limit=50&hidebroken=true`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const stations = await response.json();
        return stations.map(station => {
            let iconUrl = station.favicon || "";
            if (!iconUrl) {
                try {
                    const domain = new URL(station.url).hostname;
                    iconUrl = `https://www.google.com/s2/favicons?domain=${domain}`;
                } catch(e) {}
            }
            return {
                id: `api_${station.stationuuid}`,
                name: station.name,
                countryCode: station.countrycode ? station.countrycode.toUpperCase() : "XX",
                streamUrl: station.url,
                genre: station.tags ? station.tags.split(',')[0] : "متنوع",
                icon: iconUrl,
                isFromAPI: true
            };
        });
    } catch (error) {
        console.error("❌ فشل البحث في Radio Browser API:", error);
        return [];
    }
}
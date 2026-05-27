// ========== المفضلة ==========
function saveFavorites() { localStorage.setItem("arabicRadioFavs", JSON.stringify(favorites)); if (typeof renderFavoritesTab === 'function') renderFavoritesTab(); if (typeof renderStations === 'function') renderStations(); if (typeof updateFavButtonCurrent === 'function') updateFavButtonCurrent(); }
function isFavorite(stationId) { return favorites.includes(stationId); }
function addFavorite(stationId) { if (!isFavorite(stationId)) favorites.push(stationId); saveFavorites(); setStatus(t('added_to_favorites'), false); }
function removeFavorite(stationId) { favorites = favorites.filter(id => id !== stationId); saveFavorites(); setStatus(t('removed_from_favorites'), false); }
function toggleFavorite(stationId) { isFavorite(stationId) ? removeFavorite(stationId) : addFavorite(stationId); if (typeof updateFavButtonCurrent === 'function') updateFavButtonCurrent(); }

function updateFavButtonCurrent() {
    const favBtn = document.getElementById("favCurrentBtn");
    if (!favBtn) return;
    if (currentStation && currentStation.id) {
        const isFav = isFavorite(currentStation.id);
        favBtn.innerHTML = isFav ? `<i class="fas fa-heart"></i> ${t('saved_to_favorites')}` : `<i class="fas fa-heart"></i> ${t('save_to_favorites')}`;
        favBtn.style.color = "#ffffff";
    } else {
        favBtn.innerHTML = `<i class="far fa-heart"></i> ${t('save_to_favorites')}`;
        favBtn.style.color = '#ffffff';
    }
}
function renderFavoritesTab() {
    const container = document.getElementById("favoritesContainer");
    const favStations = masterStations.filter(st => favorites.includes(st.id));
    if (!favStations.length) { container.innerHTML = `<div class="empty-message">${t('no_favorites')}</div>`; return; }
    container.innerHTML = favStations.map(st => {
        const countryObj = allCountries.find(c => c.code === st.countryCode);
        const cName = countryObj ? (currentLanguage === 'en' ? countryObj.name : countryObj.nameAr) : st.countryCode;
        return `<div class="station-card" data-id="${st.id}">
            <div class="station-info">
                <div class="station-name">${escapeHtml(st.name)}</div>
                <div class="station-country">${cName} • ${translateGenre(st.genre)}</div>
            </div>
            <div class="station-actions">
                <button class="play-station-btn play-fav" data-url="${st.streamUrl}" data-name="${escapeHtml(st.name)}" data-country="${cName}" data-id="${st.id}" data-iswebpage="${st.isWebPage || false}" title="${t('play')}"><i class="fas fa-play"></i> ${t('play')}</button>
                <button class="fav-star active-fav" data-id="${st.id}" title="${t('remove_from_favorites')}"><i class="fas fa-heart"></i></button>
                <button class="repair-station-btn" data-id="${st.id}" title="${currentLanguage === 'ar' ? 'إصلاح الرابط' : 'Repair URL'}"><i class="fas fa-wrench"></i></button>
                <button class="delete-station-btn" data-id="${st.id}" title="${t('delete_station')}"><i class="fas fa-trash-alt"></i></button>
            </div>
        </div>`;
    }).join('');
    document.querySelectorAll('.play-fav').forEach(btn => btn.addEventListener('click', () => { playStation(btn.dataset.url, btn.dataset.name, btn.dataset.country, btn.dataset.id, btn.dataset.iswebpage === 'true'); }));
    document.querySelectorAll('#favoritesContainer .fav-star').forEach(star => star.addEventListener('click', () => { toggleFavorite(star.dataset.id); renderFavoritesTab(); if (typeof renderStations === 'function') renderStations(); }));
    document.querySelectorAll('#favoritesContainer .repair-station-btn').forEach(btn => btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const stationId = btn.dataset.id;
        const newUrl = await window.repairStationStream(stationId);
        if (newUrl) renderFavoritesTab();
    }));
    document.querySelectorAll('#favoritesContainer .delete-station-btn').forEach(btn => btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const stationId = btn.dataset.id;
        if (confirm(t('confirm_delete_station', ''))) deleteStation(stationId);
    }));
    updateStationPlayButtons(currentStation ? currentStation.id : null, currentStation && !audioPlayer.paused);
}
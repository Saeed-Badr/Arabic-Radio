// ========== الوضع المصغر (Compact Mode) – إخفاء الزر أثناء المصغر ==========
let compactModeMenuItem = null;      // عنصر القائمة (li) الذي يحتوي على الزر
let compactModeToggleBtn = null;     // الزر نفسه داخل القائمة
let originalWindowSize = { width: 950, height: 700 };   // الحجم الأصلي
let wasFullScreen = false;           // لتذكر حالة ملء الشاشة قبل الدخول

function updateCompactModeButtonText() {
    if (!compactModeToggleBtn) return;
    const text = currentLanguage === 'ar' ? 'وضع مصغر' : 'Compact Mode';
    compactModeToggleBtn.innerHTML = `<i class="fas fa-compress-alt"></i> ${text}`;
}
async function setCompactMode(enable) {
    const menuBar = document.querySelector('.menu-bar');
    const mainHeader = document.querySelector('.main-header');
    const countriesPanel = document.querySelector('.countries-panel');
    const contentPanel = document.querySelector('.content-panel');
    
    if (enable) {
        // حفظ الحجم الحالي وحالة ملء الشاشة
        if (window.electronAPI?.getCurrentWindowSize) {
            const size = await window.electronAPI.getCurrentWindowSize();
            originalWindowSize = { width: size.width, height: size.height };
        } else {
            originalWindowSize = { width: window.innerWidth, height: window.innerHeight };
        }
        
        if (window.electronAPI?.isFullScreen) {
            wasFullScreen = await window.electronAPI.isFullScreen();
        } else if (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement) {
            wasFullScreen = true;
        } else {
            wasFullScreen = false;
        }

        // الخروج من ملء الشاشة إذا كانت مفعلة
        if (wasFullScreen) {
            if (window.electronAPI?.setFullScreen) {
                await window.electronAPI.setFullScreen(false);
                // انتظار أطول للتأكد من الخروج من ملء الشاشة
                await new Promise(resolve => setTimeout(resolve, 300));
            } else if (document.exitFullscreen) {
                await document.exitFullscreen();
                await new Promise(resolve => setTimeout(resolve, 300));
            }
        }

        // إضافة class compact-mode
        document.body.classList.add('compact-mode');
        
        // إخفاء العناصر يدوياً
        if (menuBar) menuBar.style.display = 'none';
        if (mainHeader) mainHeader.style.display = 'none';
        if (countriesPanel) countriesPanel.style.display = 'none';
        if (contentPanel) contentPanel.style.display = 'none';
        if (compactModeMenuItem) compactModeMenuItem.style.display = 'none';
        
        // تغيير حجم النافذة
        if (window.electronAPI?.setWindowSize) {
            console.log('Attempting to set window size to 900x190');
            await window.electronAPI.setWindowSize(900, 190);
            // التحقق من الحجم بعد التغيير
            if (window.electronAPI?.getCurrentWindowSize) {
                const newSize = await window.electronAPI.getCurrentWindowSize();
                console.log('New window size after setWindowSize:', newSize);
            }
        } else {
            window.resizeTo(900, 190);
        }
        addFloatingRestoreButton();
    } else {
        // إلغاء الوضع المصغر
        document.body.classList.remove('compact-mode');
        
        // إظهار العناصر
        if (menuBar) menuBar.style.display = '';
        if (mainHeader) mainHeader.style.display = '';
        if (countriesPanel) countriesPanel.style.display = '';
        if (contentPanel) contentPanel.style.display = '';
        if (compactModeMenuItem) compactModeMenuItem.style.display = '';
        
        // استعادة الحجم الأصلي
        if (window.electronAPI?.setWindowSize) {
            console.log('Restoring window size to', originalWindowSize);
            await window.electronAPI.setWindowSize(originalWindowSize.width, originalWindowSize.height);
        } else {
            window.resizeTo(originalWindowSize.width, originalWindowSize.height);
        }
        
        // استعادة وضع ملء الشاشة إذا كان مفعلاً سابقاً
        if (wasFullScreen) {
            if (window.electronAPI?.setFullScreen) {
                await window.electronAPI.setFullScreen(true);
            } else if (document.documentElement.requestFullscreen) {
                await document.documentElement.requestFullscreen();
            }
            wasFullScreen = false;
        }
        removeFloatingRestoreButton();
    }
}
function addFloatingRestoreButton() {
    if (document.getElementById('compactFloatingBtn')) return;
    if (!document.body) return;
    try {
        const floatBtn = document.createElement('button');
        floatBtn.id = 'compactFloatingBtn';
        floatBtn.innerHTML = '🔼';
        floatBtn.style.cssText = `
            position: fixed;
            bottom: 2px;
            right: 2px;
            width: 16px;
            height: 16px;
            border-radius: 10%;
            background: #6B1A1A;
            color: white;
            border: none;
            font-size: 18px;
            font-weight: bold;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 100000;
            box-shadow: 0 0 8px 2px #ef4444;
            transition: 0.2s;
            animation: pulseGlow 1.2s infinite ease-in-out;
        `;
        floatBtn.onclick = () => { setCompactMode(false); };
        document.body.appendChild(floatBtn);

        if (!document.querySelector('#pulseGlowStyle')) {
            const style = document.createElement('style');
            style.id = 'pulseGlowStyle';
            style.textContent = `
                @keyframes pulseGlow {
                    0% { box-shadow: 0 0 4px 2px #ef4444; opacity: 0.9; }
                    50% { box-shadow: 0 0 18px 8px #ef4444; opacity: 1; }
                    100% { box-shadow: 0 0 4px 2px #ef4444; opacity: 0.9; }
                }
            `;
            document.head.appendChild(style);
        }
    } catch (err) {
        console.error('Failed to add restore button:', err);
    }
}

function removeFloatingRestoreButton() {
    const btn = document.getElementById('compactFloatingBtn');
    if (btn) btn.remove();
}

function initCompactModeToggle() {
    const menuBar = document.querySelector('.menu-bar');
    if (!menuBar) return;
    if (document.getElementById('compactModeToggleItem')) return;

    // إنشاء عنصر القائمة (menu-item)
    const menuItem = document.createElement('div');
    menuItem.className = 'menu-item';
    menuItem.id = 'compactModeToggleItem';
    const toggleBtn = document.createElement('div');
    toggleBtn.className = 'dropdown-item';
    toggleBtn.id = 'compactModeToggleMenu';
    toggleBtn.style.cursor = 'pointer';
    
    // حفظ المراجع
    compactModeMenuItem = menuItem;
    compactModeToggleBtn = toggleBtn;
    updateCompactModeButtonText();

    toggleBtn.onclick = (e) => {
        e.stopPropagation();
        // فقط إذا لم يكن الوضع المصغر مفعلاً، نقوم بتفعيله
        if (!document.body.classList.contains('compact-mode')) {
            setCompactMode(true);
        }
        // لا نسمح للزر بإلغاء الوضع المصغر (لأن الخروج يتم عبر الزر المربع)
    };

    menuItem.appendChild(toggleBtn);
    menuBar.appendChild(menuItem);
}

// تصدير دالة التحديث لاستدعائها من applyLanguage
window.updateCompactModeText = updateCompactModeButtonText;

// التأكد من إخفاء الزر إذا كان الوضع المصغر مفعلاً مسبقاً (مثلاً بعد إعادة تحميل الصفحة)
function syncCompactModeButtonVisibility() {
    if (compactModeMenuItem && document.body.classList.contains('compact-mode')) {
        compactModeMenuItem.style.display = 'none';
    } else if (compactModeMenuItem) {
        compactModeMenuItem.style.display = '';
    }
}

// استدعاء المزامنة بعد إنشاء العنصر (لحالة إعادة التحميل أثناء المصغر)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initCompactModeToggle();
        syncCompactModeButtonVisibility();
    });
} else {
    initCompactModeToggle();
    syncCompactModeButtonVisibility();
}
// ========== الثوابت والمتغيرات العامة ==========
const DEFAULT_ICON_PATH = "./assets/666.png";
const FAILED_ICONS_KEY = "arabicRadioFailedIcons";
let failedIconsSet = new Set();
let historyList = JSON.parse(localStorage.getItem("arabicRadioHistory")) || [];
let historyFilterKeyword = "";
let currentTheme = localStorage.getItem("arabicRadioTheme") || "default";
let autoResume = localStorage.getItem("arabicRadioAutoResume") === "true";
let stopTimer = null;
let timerRemainingSeconds = 0;
let timerInterval = null;
let timerUpInterval = null;
let timerUpSeconds = 0;
let mediaRecorder = null;
let recordedChunks = [];
let recordTimerInterval = null;
let recordSeconds = 0;

let advancedSettings = {
    autoResumeDelay: parseFloat(localStorage.getItem('setting_autoResumeDelay') || '0.5'),
    fontSize: localStorage.getItem('setting_fontSize') || 'medium',
    language: localStorage.getItem('setting_language') || 'en',
    autoClearHistory: localStorage.getItem('setting_autoClearHistory') === 'true',
    visualizer: localStorage.getItem('setting_visualizer') !== 'false',
    recordIcon: localStorage.getItem('setting_recordIcon') !== 'false'
};

let audioPlayer = new Audio();
audioPlayer.crossOrigin = "anonymous";
window.audioPlayer = audioPlayer;

let audioCtx = null;
let sourceNode = null;
let gainNode = null;
let compressorNode = null;
let stereoPanner = null;
let analyserNode = null;
let isCompressorActive = false;
let isStereoModeActive = false;

let masterStations = [];
window.masterStations = masterStations;
let currentStation = null;
let favorites = JSON.parse(localStorage.getItem("arabicRadioFavs")) || [];
let currentTab = "stations-tab";
let searchKeyword = "";
let searchDebounceTimer = null;
let currentFilterItem = null;

// ========== قائمة الدول والتصنيفات (تعريف واحد فقط) ==========
const allCountriesList = [
    { code: "JO", name: " Jordan", nameAr: "الأردن", isArab: true },
    { code: "AE", name: " United Arab Emirates", nameAr: "الإمارات", isArab: true },
    { code: "BH", name: " Bahrain", nameAr: "البحرين", isArab: true },
    { code: "DZ", name: " Algeria", nameAr: "الجزائر", isArab: true },
    { code: "SD", name: " Sudan", nameAr: "السودان", isArab: true },
    { code: "SA", name: " Saudi Arabia", nameAr: "السعودية", isArab: true },
    { code: "SO", name: " Somalia", nameAr: "الصومال", isArab: true },
    { code: "IQ", name: " Iraq", nameAr: "العراق", isArab: true },
    { code: "KW", name: " Kuwait", nameAr: "الكويت", isArab: true },
    { code: "MA", name: " Morocco", nameAr: "المغرب", isArab: true },
    { code: "YE", name: " Yemen", nameAr: "اليمن", isArab: true },
    { code: "TN", name: " Tunisia", nameAr: "تونس", isArab: true },
    { code: "KM", name: " Comoros", nameAr: "جزر القمر", isArab: true },
    { code: "DJ", name: " Djibouti", nameAr: "جيبوتي", isArab: true },
    { code: "SY", name: " Syria", nameAr: "سوريا", isArab: true },
    { code: "OM", name: " Oman", nameAr: "عُمان", isArab: true },
    { code: "PS", name: " Palestine", nameAr: "فلسطين", isArab: true },
    { code: "QA", name: " Qatar", nameAr: "قطر", isArab: true },
    { code: "LB", name: " Lebanon", nameAr: "لبنان", isArab: true },
    { code: "LY", name: " Libya", nameAr: "ليبيا", isArab: true },
    { code: "MR", name: " Mauritania", nameAr: "موريتانيا", isArab: true },
    { code: "EG", name: " Egypt", nameAr: "مصر", isArab: true },
    { code: "JP", name: " Japan", nameAr: "اليابان", isArab: false },
    { code: "US", name: " United States", nameAr: "الولايات المتحدة", isArab: false },
    { code: "PH", name: " Philippines", nameAr: "الفلبين", isArab: false },
    { code: "NE", name: " Niger", nameAr: "النيجر", isArab: false },
    { code: "BA", name: " Bosnia and Herzegovina", nameAr: "البوسنة والهرسك", isArab: false },
    { code: "BS", name: " Bahamas", nameAr: "الباهاماس", isArab: false },
    { code: "CZ", name: " Czech Republic", nameAr: "التشيك", isArab: false },
    { code: "HU", name: " Hungary", nameAr: "المجر", isArab: false },
    { code: "GR", name: " Greece", nameAr: "اليونان", isArab: false },
    { code: "CV", name: " Cape Verde", nameAr: "الرأس الأخضر", isArab: false },
    { code: "AT", name: " Austria", nameAr: "النمسا", isArab: false },
    { code: "IN", name: " India", nameAr: "الهند", isArab: false },
    { code: "ME", name: " Montenegro", nameAr: "الجبل الأسود", isArab: false },
    { code: "SV", name: " El Salvador", nameAr: "السلفادور", isArab: false },
    { code: "AR", name: " Argentina", nameAr: "الأرجنتين", isArab: false },
    { code: "UY", name: " Uruguay", nameAr: "الأوروغواي", isArab: false },
    { code: "VA", name: " Vatican City", nameAr: "الفاتيكان", isArab: false },
    { code: "GA", name: " Gabon", nameAr: "الغابون", isArab: false },
    { code: "EC", name: " Ecuador", nameAr: "الإكوادور", isArab: false },
    { code: "DK", name: " Denmark", nameAr: "الدنمارك", isArab: false },
    { code: "CM", name: " Cameroon", nameAr: "الكاميرون", isArab: false },
    { code: "CN", name: " China", nameAr: "الصين", isArab: false },
    { code: "SE", name: " Sweden", nameAr: "السويد", isArab: false },
    { code: "NO", name: " Norway", nameAr: "النرويج", isArab: false },
    { code: "SN", name: " Senegal", nameAr: "السنغال", isArab: false },
    { code: "PT", name: " Portugal", nameAr: "البرتغال", isArab: false },
    { code: "BR", name: " Brazil", nameAr: "البرازيل", isArab: false },
    { code: "GB", name: " United Kingdom", nameAr: "المملكة المتحدة", isArab: false },
    { code: "MX", name: " Mexico", nameAr: "المكسيك", isArab: false },
    { code: "DE", name: " Germany", nameAr: "ألمانيا", isArab: false },
    { code: "IS", name: " Iceland", nameAr: "أيسلندا", isArab: false },
    { code: "UA", name: " Ukraine", nameAr: "أوكرانيا", isArab: false },
    { code: "AO", name: " Angola", nameAr: "أنغولا", isArab: false },
    { code: "UG", name: " Uganda", nameAr: "أوغندا", isArab: false },
    { code: "AL", name: " Albania", nameAr: "ألبانيا", isArab: false },
    { code: "AZ", name: " Azerbaijan", nameAr: "أذربيجان", isArab: false },
    { code: "AD", name: " Andorra", nameAr: "أندورا", isArab: false },
    { code: "AU", name: " Australia", nameAr: "أستراليا", isArab: false },
    { code: "AG", name: " Antigua and Barbuda", nameAr: "أنتيغوا وباربودا", isArab: false },
    { code: "AM", name: " Armenia", nameAr: "أرمينيا", isArab: false },
    { code: "UZ", name: " Uzbekistan", nameAr: "أوزبكستان", isArab: false },
    { code: "AF", name: " Afghanistan", nameAr: "أفغانستان", isArab: false },
    { code: "ID", name: " Indonesia", nameAr: "إندونيسيا", isArab: false },
    { code: "EE", name: " Estonia", nameAr: "إستونيا", isArab: false },
    { code: "ES", name: " Spain", nameAr: "إسبانيا", isArab: false },
    { code: "IE", name: " Ireland", nameAr: "إيرلندا", isArab: false },
    { code: "ER", name: " Eritrea", nameAr: "إريتريا", isArab: false },
    { code: "IR", name: " Iran", nameAr: "إيران", isArab: false },
    { code: "IL", name: " Israel", nameAr: "إسرائيل", isArab: false },
    { code: "ET", name: " Ethiopia", nameAr: "إثيوبيا", isArab: false },
    { code: "IT", name: " Italy", nameAr: "إيطاليا", isArab: false },
    { code: "PW", name: " Palau", nameAr: "بالاو", isArab: false },
    { code: "PG", name: " Papua New Guinea", nameAr: "بابوا غينيا الجديدة", isArab: false },
    { code: "BW", name: " Botswana", nameAr: "بوتسوانا", isArab: false },
    { code: "BJ", name: " Benin", nameAr: "بنين", isArab: false },
    { code: "BI", name: " Burundi", nameAr: "بوروندي", isArab: false },
    { code: "PK", name: " Pakistan", nameAr: "باكستان", isArab: false },
    { code: "BT", name: " Bhutan", nameAr: "بوتان", isArab: false },
    { code: "BB", name: " Barbados", nameAr: "باربادوس", isArab: false },
    { code: "BZ", name: " Belize", nameAr: "بليز", isArab: false },
    { code: "BN", name: " Brunei", nameAr: "بروناي", isArab: false },
    { code: "PE", name: " Peru", nameAr: "بيرو", isArab: false },
    { code: "BO", name: " Bolivia", nameAr: "بوليفيا", isArab: false },
    { code: "PY", name: " Paraguay", nameAr: "باراغواي", isArab: false },
    { code: "BE", name: " Belgium", nameAr: "بلجيكا", isArab: false },
    { code: "BG", name: " Bulgaria", nameAr: "بلغاريا", isArab: false },
    { code: "BD", name: " Bangladesh", nameAr: "بنغلاديش", isArab: false },
    { code: "PL", name: " Poland", nameAr: "بولندا", isArab: false },
    { code: "BF", name: " Burkina Faso", nameAr: "بوركينا فاسو", isArab: false },
    { code: "PA", name: " Panama", nameAr: "بنما", isArab: false },
    { code: "TH", name: " Thailand", nameAr: "تايلاند", isArab: false },
    { code: "TZ", name: " Tanzania", nameAr: "تنزانيا", isArab: false },
    { code: "CL", name: " Chile", nameAr: "تشيلي", isArab: false },
    { code: "TR", name: " Turkey", nameAr: "تركيا", isArab: false },
    { code: "TL", name: " Timor-Leste", nameAr: "تيمور الشرقية", isArab: false },
    { code: "TT", name: " Trinidad and Tobago", nameAr: "ترينيداد وتوباغو", isArab: false },
    { code: "TW", name: " Taiwan", nameAr: "تايوان", isArab: false },
    { code: "TG", name: " Togo", nameAr: "توغو", isArab: false },
    { code: "TM", name: " Turkmenistan", nameAr: "تركمانستان", isArab: false },
    { code: "TV", name: " Tuvalu", nameAr: "توفالو", isArab: false },
    { code: "TO", name: " Tonga", nameAr: "تونغا", isArab: false },
    { code: "TD", name: " Chad", nameAr: "تشاد", isArab: false },
    { code: "CD", name: " DR Congo", nameAr: "الكونغو الديمقراطية", isArab: false },
    { code: "MV", name: " Maldives", nameAr: "جزر المالديف", isArab: false },
    { code: "CG", name: " Republic of Congo", nameAr: "الكونغو", isArab: false },
    { code: "ZA", name: " South Africa", nameAr: "جنوب أفريقيا", isArab: false },
    { code: "KI", name: " Kiribati", nameAr: "كيريباتي", isArab: false },
    { code: "CF", name: " Central African Republic", nameAr: "جمهورية أفريقيا الوسطى", isArab: false },
    { code: "DO", name: " Dominican Republic", nameAr: "جمهورية الدومينيكان", isArab: false },
    { code: "SS", name: " South Sudan", nameAr: "جنوب السودان", isArab: false },
    { code: "MH", name: " Marshall Islands", nameAr: "جزر مارشال", isArab: false },
    { code: "GE", name: " Georgia", nameAr: "جورجيا", isArab: false },
    { code: "JM", name: " Jamaica", nameAr: "جامايكا", isArab: false },
    { code: "SB", name: " Solomon Islands", nameAr: "جزر سليمان", isArab: false },
    { code: "DM", name: " Dominica", nameAr: "دومينيكا", isArab: false },
    { code: "RO", name: " Romania", nameAr: "رومانيا", isArab: false },
    { code: "RW", name: " Rwanda", nameAr: "رواندا", isArab: false },
    { code: "RU", name: " Russia", nameAr: "روسيا", isArab: false },
    { code: "BY", name: " Belarus", nameAr: "بيلاروسيا", isArab: false },
    { code: "ZW", name: " Zimbabwe", nameAr: "زيمبابوي", isArab: false },
    { code: "ZM", name: " Zambia", nameAr: "زامبيا", isArab: false },
    { code: "LK", name: " Sri Lanka", nameAr: "سريلانكا", isArab: false },
    { code: "SZ", name: " Eswatini", nameAr: "إسواتيني", isArab: false },
    { code: "SC", name: " Seychelles", nameAr: "سيشل", isArab: false },
    { code: "SG", name: " Singapore", nameAr: "سنغافورة", isArab: false },
    { code: "KN", name: " Saint Kitts and Nevis", nameAr: "سانت كيتس ونيفيس", isArab: false },
    { code: "SK", name: " Slovakia", nameAr: "سلوفاكيا", isArab: false },
    { code: "WS", name: " Samoa", nameAr: "ساموا", isArab: false },
    { code: "SM", name: " San Marino", nameAr: "سان مارينو", isArab: false },
    { code: "ST", name: " São Tomé and Príncipe", nameAr: "ساو تومي وبرينسيب", isArab: false },
    { code: "SI", name: " Slovenia", nameAr: "سلوفينيا", isArab: false },
    { code: "CH", name: " Switzerland", nameAr: "سويسرا", isArab: false },
    { code: "SR", name: " Suriname", nameAr: "سورينام", isArab: false },
    { code: "VC", name: " Saint Vincent and the Grenadines", nameAr: "سانت فينسنت والغرينادين", isArab: false },
    { code: "LC", name: " Saint Lucia", nameAr: "سانت لوسيا", isArab: false },
    { code: "SL", name: " Sierra Leone", nameAr: "سيراليون", isArab: false },
    { code: "CI", name: " Ivory Coast", nameAr: "ساحل العاج", isArab: false },
    { code: "RS", name: " Serbia", nameAr: "صربيا", isArab: false },
    { code: "TJ", name: " Tajikistan", nameAr: "طاجيكستان", isArab: false },
    { code: "GT", name: " Guatemala", nameAr: "غواتيمالا", isArab: false },
    { code: "GY", name: " Guyana", nameAr: "غيانا", isArab: false },
    { code: "GQ", name: " Equatorial Guinea", nameAr: "غينيا الاستوائية", isArab: false },
    { code: "GD", name: " Grenada", nameAr: "غرينادا", isArab: false },
    { code: "GM", name: " Gambia", nameAr: "غامبيا", isArab: false },
    { code: "GW", name: " Guinea-Bissau", nameAr: "غينيا بيساو", isArab: false },
    { code: "GH", name: " Ghana", nameAr: "غانا", isArab: false },
    { code: "GN", name: " Guinea", nameAr: "غينيا", isArab: false },
    { code: "VU", name: " Vanuatu", nameAr: "فانواتو", isArab: false },
    { code: "FJ", name: " Fiji", nameAr: "فيجي", isArab: false },
    { code: "FI", name: " Finland", nameAr: "فنلندا", isArab: false },
    { code: "VN", name: " Vietnam", nameAr: "فيتنام", isArab: false },
    { code: "FR", name: " France", nameAr: "فرنسا", isArab: false },
    { code: "VE", name: " Venezuela", nameAr: "فنزويلا", isArab: false },
    { code: "CY", name: " Cyprus", nameAr: "قبرص", isArab: false },
    { code: "KG", name: " Kyrgyzstan", nameAr: "قيرغيزستان", isArab: false },
    { code: "KE", name: " Kenya", nameAr: "كينيا", isArab: false },
    { code: "XK", name: " Kosovo", nameAr: "كوسوفو", isArab: false },
    { code: "CR", name: " Costa Rica", nameAr: "كوستاريكا", isArab: false },
    { code: "HR", name: " Croatia", nameAr: "كرواتيا", isArab: false },
    { code: "KH", name: " Cambodia", nameAr: "كمبوديا", isArab: false },
    { code: "CA", name: " Canada", nameAr: "كندا", isArab: false },
    { code: "CU", name: " Cuba", nameAr: "كوبا", isArab: false },
    { code: "KZ", name: " Kazakhstan", nameAr: "كازاخستان", isArab: false },
    { code: "KR", name: " South Korea", nameAr: "كوريا الجنوبية", isArab: false },
    { code: "KP", name: " North Korea", nameAr: "كوريا الشمالية", isArab: false },
    { code: "CO", name: " Colombia", nameAr: "كولومبيا", isArab: false },
    { code: "LU", name: " Luxembourg", nameAr: "لوكسمبورغ", isArab: false },
    { code: "LS", name: " Lesotho", nameAr: "ليسوتو", isArab: false },
    { code: "LA", name: " Laos", nameAr: "لاوس", isArab: false },
    { code: "LV", name: " Latvia", nameAr: "لاتفيا", isArab: false },
    { code: "LT", name: " Lithuania", nameAr: "ليتوانيا", isArab: false },
    { code: "LR", name: " Liberia", nameAr: "ليبيريا", isArab: false },
    { code: "LI", name: " Liechtenstein", nameAr: "ليختنشتاين", isArab: false },
    { code: "ML", name: " Mali", nameAr: "مالي", isArab: false },
    { code: "MZ", name: " Mozambique", nameAr: "موزمبيق", isArab: false },
    { code: "MM", name: " Myanmar", nameAr: "ميانمار", isArab: false },
    { code: "MK", name: " North Macedonia", nameAr: "مقدونيا الشمالية", isArab: false },
    { code: "MD", name: " Moldova", nameAr: "مولدافيا", isArab: false },
    { code: "MW", name: " Malawi", nameAr: "مالاوي", isArab: false },
    { code: "MU", name: " Mauritius", nameAr: "موريشيوس", isArab: false },
    { code: "MT", name: " Malta", nameAr: "مالطا", isArab: false },
    { code: "MC", name: " Monaco", nameAr: "موناكو", isArab: false },
    { code: "MO", name: " Macau", nameAr: "ماكاو", isArab: false },
    { code: "MG", name: " Madagascar", nameAr: "مدغشقر", isArab: false },
    { code: "MY", name: " Malaysia", nameAr: "ماليزيا", isArab: false },
    { code: "MN", name: " Mongolia", nameAr: "منغوليا", isArab: false },
    { code: "NZ", name: " New Zealand", nameAr: "نيوزيلندا", isArab: false },
    { code: "NG", name: " Nigeria", nameAr: "نيجيريا", isArab: false },
    { code: "NI", name: " Nicaragua", nameAr: "نيكاراغوا", isArab: false },
    { code: "NR", name: " Nauru", nameAr: "ناورو", isArab: false },
    { code: "NP", name: " Nepal", nameAr: "نيبال", isArab: false },
    { code: "NA", name: " Namibia", nameAr: "ناميبيا", isArab: false },
    { code: "HK", name: " Hong Kong", nameAr: "هونغ كونغ", isArab: false },
    { code: "HT", name: " Haiti", nameAr: "هايتي", isArab: false },
    { code: "NL", name: " Netherlands", nameAr: "هولندا", isArab: false },
    { code: "HN", name: " Honduras", nameAr: "هندوراس", isArab: false },
    { code: "FM", name: " Micronesia", nameAr: "ولايات ميكرونيسيا المتحدة", isArab: false },
    { code: "XX", name: " Worldwide", nameAr: "عالمي", isArab: false },
];

const genresAsCountries = [
    { code: "GENRE_ISLAMIC", name: " Islamic", nameAr: "الإسلامية", isGenre: true, genreKey: "الإسلامية" },
    { code: "GENRE_ARABIC", name: " Arabic", nameAr: "العربية", isGenre: true, genreKey: "العربية" },
    { code: "GENRE_TURKISH", name: " Turkish", nameAr: "التركية", isGenre: true, genreKey: "التركية" },
    { code: "GENRE_BEST_SONGS", name: " Best Songs", nameAr: "أفضل الأغاني", isGenre: true, genreKey: "أفضل الأغاني" },
    { code: "GENRE_BLUES", name: " Blues", nameAr: "البلوز", isGenre: true, genreKey: "البلوز" },
    { code: "GENRE_CLASSICAL", name: " Classical", nameAr: "الكلاسيكية", isGenre: true, genreKey: "الكلاسيكية" },
    { code: "GENRE_DISCO", name: " Disco", nameAr: "الديسكو", isGenre: true, genreKey: "الديسكو" },
    { code: "GENRE_FLAMENCO", name: " Flamenco", nameAr: "الفلامنكو", isGenre: true, genreKey: "الفلامنكو" },
    { code: "GENRE_HIPHOP", name: " Hip Hop", nameAr: "الهيب هوب", isGenre: true, genreKey: "الهيب هوب" },
    { code: "GENRE_JAZZ", name: " Jazz", nameAr: "الجاز", isGenre: true, genreKey: "الجاز" },
    { code: "GENRE_OPERA", name: " Opera", nameAr: "الأوبرا", isGenre: true, genreKey: "الأوبرا" },
    { code: "GENRE_POP", name: " Pop", nameAr: "البوب", isGenre: true, genreKey: "البوب" },
    { code: "GENRE_RNB", name: " R&B", nameAr: "آر أند بي", isGenre: true, genreKey: "آر أند بي" },
    { code: "GENRE_RAP", name: " Rap", nameAr: "الراب", isGenre: true, genreKey: "الراب" },
    { code: "GENRE_ROCK", name: " Rock", nameAr: "الروك", isGenre: true, genreKey: "الروك" },
    { code: "GENRE_SALSA", name: " Salsa", nameAr: "السالسا", isGenre: true, genreKey: "السالسا" },
    { code: "GENRE_TANGO", name: " Tango", nameAr: "التانغو", isGenre: true, genreKey: "التانغو" },
    { code: "GENRE_WORLD", name: " World Music", nameAr: "موسيقى العالم", isGenre: true, genreKey: "موسيقى العالم" },
    { code: "GENRE_MUSIC", name: " Music", nameAr: "الموسيقى", isGenre: true, genreKey: "الموسيقى" },
    { code: "GENRE_CLASSICS", name: " Classics", nameAr: "الكلاسيكيات", isGenre: true, genreKey: "الكلاسيكيات" },
    { code: "GENRE_VARIETY", name: " Variety", nameAr: "متنوع", isGenre: true, genreKey: "متنوع" },
    { code: "GENRE_COMEDY", name: " Comedy", nameAr: "الكوميديا", isGenre: true, genreKey: "الكوميديا" },
    { code: "GENRE_DOCUMENTARY", name: " Documentary", nameAr: "الوثائقي", isGenre: true, genreKey: "الوثائقي" },
    { code: "GENRE_DRAMA", name: " Drama", nameAr: "الدراما", isGenre: true, genreKey: "الدراما" },
    { code: "GENRE_FOOD", name: " Food", nameAr: "الطعام", isGenre: true, genreKey: "الطعام" },
    { code: "GENRE_HEALTH", name: " Health", nameAr: "الصحة", isGenre: true, genreKey: "الصحة" },
    { code: "GENRE_KIDS", name: " Kids", nameAr: "الأطفال", isGenre: true, genreKey: "الأطفال" },
    { code: "GENRE_TRAVEL", name: " Travel", nameAr: "السفر", isGenre: true, genreKey: "السفر" },
    { code: "GENRE_NEWS", name: " News", nameAr: "الأخبار", isGenre: true, genreKey: "الأخبار" },
    { code: "GENRE_SPORTS", name: " Sports", nameAr: "الرياضة", isGenre: true, genreKey: "الرياضة" },
    { code: "GENRE_BASKETBALL", name: " Basketball", nameAr: "كرة السلة", isGenre: true, genreKey: "كرة السلة" },
    { code: "GENRE_FOOTBALL", name: " Football", nameAr: "كرة القدم", isGenre: true, genreKey: "كرة القدم" },
];

const allCountries = [...allCountriesList, ...genresAsCountries];

// دالة مخصصة لاستبدال window.prompt في Electron
window.customPrompt = function(message, defaultValue = '') {
    return new Promise((resolve) => {
        // إنشاء النافذة المنبثقة
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        overlay.style.zIndex = '999999';
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        
        const dialog = document.createElement('div');
        dialog.style.backgroundColor = '#0a2a44';
        dialog.style.borderRadius = '12px';
        dialog.style.padding = '25px';
        dialog.style.minWidth = '350px';
        dialog.style.boxShadow = '0 8px 25px rgba(0,0,0,0.5)';
        dialog.style.border = '1px solid #2563eb';
        dialog.style.textAlign = 'center';
        
        dialog.innerHTML = `
            <div style="color: #e0f2fe; margin-bottom: 20px; font-size: 16px;">${message}</div>
            <input type="text" id="customPromptInput" value="${defaultValue.replace(/"/g, '&quot;')}" style="width: 100%; padding: 10px; margin-bottom: 20px; border-radius: 6px; border: 1px solid #2563eb; background: #071526; color: white; font-size: 14px; box-sizing: border-box;">
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button id="customPromptOk" style="background: #2563eb; border: none; color: white; padding: 8px 20px; border-radius: 6px; cursor: pointer; font-weight: bold;">${currentLanguage === 'ar' ? 'موافق' : 'OK'}</button>
                <button id="customPromptCancel" style="background: #4b5563; border: none; color: white; padding: 8px 20px; border-radius: 6px; cursor: pointer; font-weight: bold;">${currentLanguage === 'ar' ? 'إلغاء' : 'Cancel'}</button>
            </div>
        `;
        
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);
        
        const input = dialog.querySelector('#customPromptInput');
        const okBtn = dialog.querySelector('#customPromptOk');
        const cancelBtn = dialog.querySelector('#customPromptCancel');
        
        input.focus();
        
        const close = (result) => {
            overlay.remove();
            resolve(result);
        };
        
        okBtn.addEventListener('click', () => close(input.value));
        cancelBtn.addEventListener('click', () => close(null));
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') close(input.value);
        });
    });
};

// تعيين القيمة الافتراضية للمرشح الحالي
currentFilterItem = allCountries[0];

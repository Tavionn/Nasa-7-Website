// Your NASA API key. DEMO_KEY works for testing but has strict limits,
// so replace it with your own free key from https://api.nasa.gov
const API_KEY = 'DEMO_KEY';
const API_URL = 'https://api.nasa.gov/planetary/apod';

// NASA's science website also publishes every APOD. We use it if the API is having problems.
const NASA_SCIENCE_URL = 'https://science.nasa.gov/wp-json/wp/v2/image-article';

// How many entries to ask the science website for. Each one takes it about 0.2 seconds.
const MAX_SCIENCE_ENTRIES = 45;

// Sample APOD entries saved with this app. We use them only if both NASA sources are down.
const BACKUP_URL = 'data/backup-entries.json';

// Give up on the API quickly, because the science website can answer instead
const API_TIMEOUT_MS = 8000;

// Give up on other requests if there's no answer after 20 seconds
const REQUEST_TIMEOUT_MS = 20000;

// ----- Languages -----

// The languages the page can show. Arabic and Hebrew are read right-to-left ("rtl").
const LANGUAGES = {
  en: { dir: 'ltr', locale: 'en-US' },
  es: { dir: 'ltr', locale: 'es-ES' },
  ar: { dir: 'rtl', locale: 'ar-u-nu-latn' },
  he: { dir: 'rtl', locale: 'he-IL' }
};

// Every piece of interface text, in every language
const TEXT = {
  en: {
    title: 'NASA Space Explorer',
    language: 'Language',
    tag: 'Astronomy Picture of the Day',
    heading: 'Space Explorer',
    heroText: 'Pick any dates since 1995 and see what NASA shared from across the cosmos.',
    startDate: 'Start date',
    endDate: 'End date',
    getImages: 'Get Space Images',
    placeholder: 'Select a date range and click "Get Space Images" to explore the cosmos!',
    loading: 'Loading space photos…',
    loadingSub: 'Retrieving pictures from NASA',
    startAfterEnd: 'The start date needs to be before the end date.',
    noEntries: 'NASA has no entries for those dates. Please try a different range.',
    offline: 'We couldn\'t reach NASA. Please check your connection and try again in a few minutes.',
    longRange: 'That\'s a long date range, so these are the newest {count} entries.',
    samples: 'NASA\'s image services aren\'t responding right now, so these are sample entries and may not match your dates.',
    englishNote: '',
    image: 'Image',
    video: '▶ Video',
    interactive: '↗ Interactive',
    credit: 'Credit:',
    fullImage: 'View full resolution image',
    watchYouTube: '▶ Watch on YouTube',
    watchVideo: '▶ Watch the video',
    apodPage: 'View this entry on NASA\'s APOD site',
    close: 'Close',
    pause: '❚❚ Pause',
    play: '▶ Play',
    pauseLabel: 'Pause rotating facts',
    playLabel: 'Play rotating facts',
    didYouKnow: 'Did You Know?',
    milestone: 'NASA Milestone',
    numbers: 'By the Numbers',
    lookUp: 'Look Up Tonight'
  },
  es: {
    title: 'Explorador espacial de la NASA',
    language: 'Idioma',
    tag: 'Imagen astronómica del día',
    heading: 'Explorador espacial',
    heroText: 'Elige cualquier fecha desde 1995 y descubre lo que la NASA compartió desde todo el cosmos.',
    startDate: 'Fecha de inicio',
    endDate: 'Fecha de fin',
    getImages: 'Ver imágenes del espacio',
    placeholder: 'Elige un rango de fechas y haz clic en «Ver imágenes del espacio» para explorar el cosmos.',
    loading: 'Cargando fotos del espacio…',
    loadingSub: 'Obteniendo imágenes de la NASA',
    startAfterEnd: 'La fecha de inicio debe ser anterior a la fecha de fin.',
    noEntries: 'La NASA no tiene entradas para esas fechas. Prueba con otro rango.',
    offline: 'No pudimos conectar con la NASA. Revisa tu conexión y vuelve a intentarlo en unos minutos.',
    longRange: 'Es un rango de fechas largo, así que estas son las {count} entradas más recientes.',
    samples: 'Los servicios de imágenes de la NASA no responden ahora mismo, así que estas son entradas de muestra y quizá no coincidan con tus fechas.',
    englishNote: 'Los títulos y las descripciones vienen de la NASA en inglés.',
    image: 'Imagen',
    video: '▶ Vídeo',
    interactive: '↗ Interactivo',
    credit: 'Créditos:',
    fullImage: 'Ver la imagen en resolución completa',
    watchYouTube: '▶ Ver en YouTube',
    watchVideo: '▶ Ver el vídeo',
    apodPage: 'Ver esta entrada en el sitio APOD de la NASA',
    close: 'Cerrar',
    pause: '❚❚ Pausa',
    play: '▶ Reproducir',
    pauseLabel: 'Pausar los datos que van cambiando',
    playLabel: 'Reanudar los datos que van cambiando',
    didYouKnow: '¿Sabías que?',
    milestone: 'Hito de la NASA',
    numbers: 'En cifras',
    lookUp: 'Mira al cielo esta noche'
  },
  ar: {
    title: 'مستكشف الفضاء من ناسا',
    language: 'اللغة',
    tag: 'الصورة الفلكية لليوم',
    heading: 'مستكشف الفضاء',
    heroText: 'اختر أي تواريخ منذ عام 1995 وشاهد ما شاركته ناسا من أرجاء الكون.',
    startDate: 'تاريخ البداية',
    endDate: 'تاريخ النهاية',
    getImages: 'اعرض صور الفضاء',
    placeholder: 'اختر نطاقًا من التواريخ واضغط «اعرض صور الفضاء» لاستكشاف الكون!',
    loading: 'جارٍ تحميل صور الفضاء…',
    loadingSub: 'جارٍ جلب الصور من ناسا',
    startAfterEnd: 'يجب أن يكون تاريخ البداية قبل تاريخ النهاية.',
    noEntries: 'لا توجد لدى ناسا مواد لهذه التواريخ. يُرجى تجربة نطاق آخر.',
    offline: 'تعذّر الوصول إلى ناسا. يُرجى التحقق من اتصالك والمحاولة مرة أخرى بعد بضع دقائق.',
    longRange: 'هذا نطاق تواريخ طويل، لذا هذه أحدث {count} مادة.',
    samples: 'خدمات الصور لدى ناسا لا تستجيب الآن، لذا هذه مواد نموذجية وقد لا تطابق تواريخك.',
    englishNote: 'العناوين والأوصاف مقدَّمة من ناسا باللغة الإنجليزية.',
    image: 'صورة',
    video: '▶ فيديو',
    interactive: '↗ تفاعلي',
    credit: 'المصدر:',
    fullImage: 'عرض الصورة بالدقة الكاملة',
    watchYouTube: '▶ شاهد على YouTube',
    watchVideo: '▶ شاهد الفيديو',
    apodPage: 'اعرض هذه المادة على موقع APOD التابع لناسا',
    close: 'إغلاق',
    pause: '❚❚ إيقاف مؤقت',
    play: '▶ تشغيل',
    pauseLabel: 'إيقاف تبديل المعلومات مؤقتًا',
    playLabel: 'تشغيل تبديل المعلومات',
    didYouKnow: 'هل تعلم؟',
    milestone: 'إنجاز لناسا',
    numbers: 'بالأرقام',
    lookUp: 'انظر إلى السماء الليلة'
  },
  he: {
    title: 'חוקר החלל של נאס״א',
    language: 'שפה',
    tag: 'התמונה האסטרונומית היומית',
    heading: 'חוקר החלל',
    heroText: 'בחרו כל תאריך מאז 1995 וראו מה נאס״א שיתפה מכל רחבי היקום.',
    startDate: 'תאריך התחלה',
    endDate: 'תאריך סיום',
    getImages: 'הצג תמונות חלל',
    placeholder: 'בחרו טווח תאריכים ולחצו על „הצג תמונות חלל” כדי לחקור את היקום!',
    loading: 'טוענים תמונות חלל…',
    loadingSub: 'מביאים תמונות מנאס״א',
    startAfterEnd: 'תאריך ההתחלה צריך להיות לפני תאריך הסיום.',
    noEntries: 'אין לנאס״א פריטים בתאריכים האלה. נסו טווח אחר.',
    offline: 'לא הצלחנו להתחבר לנאס״א. בדקו את החיבור ונסו שוב בעוד כמה דקות.',
    longRange: 'זה טווח תאריכים ארוך, ולכן אלה {count} הפריטים החדשים ביותר.',
    samples: 'שירותי התמונות של נאס״א לא מגיבים כרגע, ולכן אלה פריטים לדוגמה שאולי לא תואמים לתאריכים שבחרתם.',
    englishNote: 'הכותרות והתיאורים מגיעים מנאס״א באנגלית.',
    image: 'תמונה',
    video: '▶ וידאו',
    interactive: '↗ אינטראקטיבי',
    credit: 'קרדיט:',
    fullImage: 'הצגת התמונה ברזולוציה מלאה',
    watchYouTube: '▶ צפייה ב־YouTube',
    watchVideo: '▶ צפייה בסרטון',
    apodPage: 'הצגת הפריט באתר APOD של נאס״א',
    close: 'סגירה',
    pause: '❚❚ השהיה',
    play: '▶ הפעלה',
    pauseLabel: 'השהיית העובדות המתחלפות',
    playLabel: 'הפעלת העובדות המתחלפות',
    didYouKnow: 'הידעת?',
    milestone: 'אבן דרך של נאס״א',
    numbers: 'במספרים',
    lookUp: 'הביטו לשמיים הלילה'
  }
};

// Start in the language the person picked before, or else the one their browser uses
function getStartingLanguage() {
  if (getGoogleTranslateLanguage()) {
    return 'en';
  }
  try {
    const saved = localStorage.getItem('language');
    if (LANGUAGES[saved]) {
      return saved;
    }
  } catch (error) {
    // Saved settings aren't available, so just use the browser's language
  }
  const browserLanguage = (navigator.language || 'en').slice(0, 2);
  return LANGUAGES[browserLanguage] ? browserLanguage : 'en';
}

// Which language Google Translate is translating into, if it's turned on.
// Google remembers this in a cookie that looks like "googtrans=/en/ja".
function getGoogleTranslateLanguage() {
  const match = document.cookie.match(/googtrans=\/[^/;]+\/([^;]+)/);
  return match && match[1] !== 'en' ? match[1] : null;
}

// True while Google Translate or the browser's own translator has translated the page
let isMachineTranslated = false;

let currentLanguage = getStartingLanguage();

// Get a piece of interface text in the current language
function t(key) {
  return TEXT[currentLanguage][key];
}

// Everything the fact box can show. Each item has a category, and for every language
// its text and the part of the text to highlight.
const spaceFacts = [
  {
    category: 'didYouKnow',
    en: ['A day on Venus is longer than its year: it takes about 243 Earth days to spin once, but only 225 to orbit the Sun.', 'longer than its year:'],
    es: ['Un día en Venus dura más que su año: tarda unos 243 días terrestres en girar una vez, pero solo 225 en dar la vuelta al Sol.', 'dura más que su año:'],
    ar: ['اليوم على كوكب الزهرة أطول من سنته: يستغرق نحو 243 يومًا أرضيًا ليدور حول نفسه مرة واحدة، لكن 225 يومًا فقط ليدور حول الشمس.', 'أطول من سنته:'],
    he: ['יום על נוגה ארוך יותר מהשנה שלו: לוקח לו כ־243 ימי כדור הארץ להסתובב פעם אחת סביב עצמו, אבל רק 225 להקיף את השמש.', 'ארוך יותר מהשנה שלו:']
  },
  {
    category: 'didYouKnow',
    en: ['Sunlight takes about 8 minutes and 20 seconds to reach Earth.', '8 minutes and 20 seconds'],
    es: ['La luz del Sol tarda unos 8 minutos y 20 segundos en llegar a la Tierra.', '8 minutos y 20 segundos'],
    ar: ['يستغرق ضوء الشمس نحو 8 دقائق و20 ثانية ليصل إلى الأرض.', '8 دقائق و20 ثانية'],
    he: ['לאור השמש לוקח כ־8 דקות ו־20 שניות להגיע לכדור הארץ.', '8 דקות ו־20 שניות']
  },
  {
    category: 'didYouKnow',
    en: ['Olympus Mons on Mars is the tallest volcano in the solar system, about 2.5 times the height of Mount Everest.', 'tallest volcano in the solar system,'],
    es: ['El Olympus Mons de Marte es el volcán más alto del sistema solar, unas 2,5 veces la altura del monte Everest.', 'el volcán más alto del sistema solar,'],
    ar: ['جبل أوليمبوس على المريخ هو أعلى بركان في المجموعة الشمسية، ويبلغ ارتفاعه نحو 2.5 ضعف ارتفاع جبل إيفرست.', 'أعلى بركان في المجموعة الشمسية،'],
    he: ['הר אולימפוס במאדים הוא הר הגעש הגבוה ביותר במערכת השמש, בערך פי 2.5 מגובה הר האוורסט.', 'הר הגעש הגבוה ביותר במערכת השמש,']
  },
  {
    category: 'didYouKnow',
    en: ['Saturn is less dense than water. Its average density is only about 70% of water\'s.', 'less dense than water.'],
    es: ['Saturno es menos denso que el agua. Su densidad media es solo un 70 % de la del agua.', 'menos denso que el agua.'],
    ar: ['زحل أقل كثافة من الماء. متوسط كثافته نحو 70% فقط من كثافة الماء.', 'أقل كثافة من الماء.'],
    he: ['שבתאי פחות צפוף ממים. הצפיפות הממוצעת שלו היא רק כ־70% מזו של מים.', 'פחות צפוף ממים.']
  },
  {
    category: 'didYouKnow',
    en: ['A teaspoon of neutron star material would weigh billions of tons.', 'billions of tons.'],
    es: ['Una cucharadita de materia de una estrella de neutrones pesaría miles de millones de toneladas.', 'miles de millones de toneladas.'],
    ar: ['ملعقة صغيرة من مادة النجم النيوتروني قد تزن مليارات الأطنان.', 'مليارات الأطنان.'],
    he: ['כפית של חומר מכוכב נייטרונים הייתה שוקלת מיליארדי טונות.', 'מיליארדי טונות.']
  },
  {
    category: 'didYouKnow',
    en: ['Astronauts on the International Space Station can see about 16 sunrises every day, because they orbit Earth every 90 minutes.', '16 sunrises every day,'],
    es: ['Los astronautas de la Estación Espacial Internacional pueden ver unos 16 amaneceres cada día, porque dan la vuelta a la Tierra cada 90 minutos.', '16 amaneceres cada día,'],
    ar: ['يمكن لرواد الفضاء على متن محطة الفضاء الدولية رؤية نحو 16 شروقًا للشمس كل يوم، لأنهم يدورون حول الأرض كل 90 دقيقة.', '16 شروقًا للشمس كل يوم،'],
    he: ['אסטרונאוטים בתחנת החלל הבין־לאומית יכולים לראות כ־16 זריחות בכל יום, כי הם מקיפים את כדור הארץ כל 90 דקות.', '16 זריחות בכל יום,']
  },
  {
    category: 'didYouKnow',
    en: ['Voyager 1, launched in 1977, is the most distant human-made object and is now in interstellar space.', 'most distant human-made object'],
    es: ['La Voyager 1, lanzada en 1977, es el objeto creado por el ser humano más lejano y ya está en el espacio interestelar.', 'el objeto creado por el ser humano más lejano'],
    ar: ['فوياجر 1، التي أُطلقت عام 1977، هي أبعد جسم صنعه الإنسان، وهي الآن في الفضاء بين النجوم.', 'أبعد جسم صنعه الإنسان،'],
    he: ['וויאג׳ר 1, ששוגרה ב־1977, היא העצם הרחוק ביותר שנבנה בידי אדם, וכעת היא נמצאת בחלל הבין־כוכבי.', 'העצם הרחוק ביותר שנבנה בידי אדם,']
  },
  {
    category: 'didYouKnow',
    en: ['The light you see from the Andromeda Galaxy left it about 2.5 million years ago.', '2.5 million years ago.'],
    es: ['La luz que ves de la galaxia de Andrómeda salió de ella hace unos 2,5 millones de años.', 'hace unos 2,5 millones de años.'],
    ar: ['الضوء الذي تراه من مجرة أندروميدا غادرها قبل نحو 2.5 مليون سنة.', 'قبل نحو 2.5 مليون سنة.'],
    he: ['האור שאתם רואים מגלקסיית אנדרומדה יצא ממנה לפני כ־2.5 מיליון שנה.', 'לפני כ־2.5 מיליון שנה.']
  },
  {
    category: 'didYouKnow',
    en: ['The footprints left on the Moon could last for millions of years, because there is no wind or water to erase them.', 'millions of years,'],
    es: ['Las huellas que quedaron en la Luna podrían durar millones de años, porque no hay viento ni agua que las borre.', 'millones de años,'],
    ar: ['قد تبقى آثار الأقدام على سطح القمر ملايين السنين، لأنه لا توجد رياح أو مياه تمحوها.', 'ملايين السنين،'],
    he: ['עקבות הרגליים שנשארו על הירח עשויים להחזיק מיליוני שנים, כי אין שם רוח או מים שימחקו אותם.', 'מיליוני שנים,']
  },
  {
    category: 'didYouKnow',
    en: ['Jupiter\'s Great Red Spot is a giant storm wider than the entire Earth.', 'wider than the entire Earth.'],
    es: ['La Gran Mancha Roja de Júpiter es una tormenta gigante más ancha que toda la Tierra.', 'más ancha que toda la Tierra.'],
    ar: ['البقعة الحمراء العظيمة على كوكب المشتري عاصفة عملاقة أعرض من الأرض بأكملها.', 'أعرض من الأرض بأكملها.'],
    he: ['הכתם האדום הגדול של צדק הוא סופה ענקית שרחבה יותר מכדור הארץ כולו.', 'רחבה יותר מכדור הארץ כולו.']
  },
  {
    category: 'didYouKnow',
    en: ['NASA has shared an Astronomy Picture of the Day since June 16, 1995.', 'June 16, 1995.'],
    es: ['La NASA comparte una Imagen Astronómica del Día desde el 16 de junio de 1995.', '16 de junio de 1995.'],
    ar: ['تنشر ناسا صورة فلكية لليوم منذ 16 يونيو 1995.', '16 يونيو 1995.'],
    he: ['נאס״א משתפת תמונה אסטרונומית יומית מאז 16 ביוני 1995.', '16 ביוני 1995.']
  },
  {
    category: 'milestone',
    en: ['1958: NASA officially opened for business on October 1.', '1958:'],
    es: ['1958: la NASA abrió oficialmente sus puertas el 1 de octubre.', '1958:'],
    ar: ['1958: بدأت ناسا عملها رسميًا في 1 أكتوبر.', '1958:'],
    he: ['1958: נאס״א החלה לפעול רשמית ב־1 באוקטובר.', '1958:']
  },
  {
    category: 'milestone',
    en: ['1969: Apollo 11 landed the first humans on the Moon on July 20.', '1969:'],
    es: ['1969: el Apolo 11 llevó a los primeros seres humanos a la Luna el 20 de julio.', '1969:'],
    ar: ['1969: هبطت أبولو 11 بأول البشر على سطح القمر في 20 يوليو.', '1969:'],
    he: ['1969: אפולו 11 הנחיתה את בני האדם הראשונים על הירח ב־20 ביולי.', '1969:']
  },
  {
    category: 'milestone',
    en: ['1990: The Hubble Space Telescope launched on April 24.', '1990:'],
    es: ['1990: el telescopio espacial Hubble se lanzó el 24 de abril.', '1990:'],
    ar: ['1990: أُطلق تلسكوب هابل الفضائي في 24 أبريل.', '1990:'],
    he: ['1990: טלסקופ החלל האבל שוגר ב־24 באפריל.', '1990:']
  },
  {
    category: 'milestone',
    en: ['2021: NASA\'s Ingenuity helicopter made the first powered flight on another planet, on Mars.', '2021:'],
    es: ['2021: el helicóptero Ingenuity de la NASA hizo el primer vuelo propulsado en otro planeta, en Marte.', '2021:'],
    ar: ['2021: قامت مروحية إنجينيويتي التابعة لناسا بأول طيران بمحرك على كوكب آخر، على المريخ.', '2021:'],
    he: ['2021: המסוק אינג׳נואיטי של נאס״א ביצע את הטיסה הממונעת הראשונה בכוכב לכת אחר, על מאדים.', '2021:']
  },
  {
    category: 'milestone',
    en: ['2021: The James Webb Space Telescope launched on December 25.', '2021:'],
    es: ['2021: el telescopio espacial James Webb se lanzó el 25 de diciembre.', '2021:'],
    ar: ['2021: أُطلق تلسكوب جيمس ويب الفضائي في 25 ديسمبر.', '2021:'],
    he: ['2021: טלסקופ החלל ג׳יימס ווב שוגר ב־25 בדצמבר.', '2021:']
  },
  {
    category: 'milestone',
    en: ['2022: Artemis I flew an uncrewed Orion spacecraft around the Moon and back.', '2022:'],
    es: ['2022: Artemis I llevó una nave Orion sin tripulación alrededor de la Luna y de vuelta.', '2022:'],
    ar: ['2022: أرسلت مهمة أرتميس 1 مركبة أوريون دون طاقم حول القمر ثم أعادتها.', '2022:'],
    he: ['2022: ארטמיס 1 שלחה חללית אוריון בלי צוות סביב הירח ובחזרה.', '2022:']
  },
  {
    category: 'numbers',
    en: ['13.8 billion years: the approximate age of the universe.', '13.8 billion years:'],
    es: ['13.800 millones de años: la edad aproximada del universo.', '13.800 millones de años:'],
    ar: ['13.8 مليار سنة: العمر التقريبي للكون.', '13.8 مليار سنة:'],
    he: ['13.8 מיליארד שנה: הגיל המשוער של היקום.', '13.8 מיליארד שנה:']
  },
  {
    category: 'numbers',
    en: ['4.6 billion years: the approximate age of our Sun.', '4.6 billion years:'],
    es: ['4.600 millones de años: la edad aproximada de nuestro Sol.', '4.600 millones de años:'],
    ar: ['4.6 مليار سنة: العمر التقريبي لشمسنا.', '4.6 مليار سنة:'],
    he: ['4.6 מיליארד שנה: הגיל המשוער של השמש שלנו.', '4.6 מיליארד שנה:']
  },
  {
    category: 'numbers',
    en: ['238,855 miles: the average distance from Earth to the Moon.', '238,855 miles:'],
    es: ['384.400 km: la distancia media de la Tierra a la Luna.', '384.400 km:'],
    ar: ['384,400 كم: متوسط المسافة بين الأرض والقمر.', '384,400 كم:'],
    he: ['384,400 ק״מ: המרחק הממוצע מכדור הארץ לירח.', '384,400 ק״מ:']
  },
  {
    category: 'numbers',
    en: ['93 million miles: the average distance from Earth to the Sun.', '93 million miles:'],
    es: ['150 millones de km: la distancia media de la Tierra al Sol.', '150 millones de km:'],
    ar: ['150 مليون كم: متوسط المسافة بين الأرض والشمس.', '150 مليون كم:'],
    he: ['150 מיליון ק״מ: המרחק הממוצע מכדור הארץ לשמש.', '150 מיליון ק״מ:']
  },
  {
    category: 'numbers',
    en: ['17,500 mph: about how fast the International Space Station travels.', '17,500 mph:'],
    es: ['28.000 km/h: la velocidad aproximada de la Estación Espacial Internacional.', '28.000 km/h:'],
    ar: ['28,000 كم/س: السرعة التقريبية لمحطة الفضاء الدولية.', '28,000 كم/س:'],
    he: ['28,000 קמ״ש: בערך המהירות של תחנת החלל הבין־לאומית.', '28,000 קמ״ש:']
  },
  {
    category: 'lookUp',
    en: ['Five planets can be seen without a telescope: Mercury, Venus, Mars, Jupiter, and Saturn.', 'Five planets'],
    es: ['Se pueden ver cinco planetas sin telescopio: Mercurio, Venus, Marte, Júpiter y Saturno.', 'cinco planetas'],
    ar: ['يمكن رؤية خمسة كواكب دون تلسكوب: عطارد والزهرة والمريخ والمشتري وزحل.', 'خمسة كواكب'],
    he: ['אפשר לראות חמישה כוכבי לכת בלי טלסקופ: כוכב חמה, נוגה, מאדים, צדק ושבתאי.', 'חמישה כוכבי לכת']
  },
  {
    category: 'lookUp',
    en: ['The International Space Station looks like a bright, fast-moving dot. NASA\'s Spot the Station site shows when it passes over you.', 'bright, fast-moving dot.'],
    es: ['La Estación Espacial Internacional parece un punto brillante que se mueve rápido. El sitio Spot the Station de la NASA indica cuándo pasa sobre ti.', 'un punto brillante que se mueve rápido.'],
    ar: ['تبدو محطة الفضاء الدولية كنقطة لامعة سريعة الحركة. يوضح موقع Spot the Station التابع لناسا متى تمر فوقك.', 'كنقطة لامعة سريعة الحركة.'],
    he: ['תחנת החלל הבין־לאומית נראית כמו נקודה בהירה שנעה מהר. האתר Spot the Station של נאס״א מראה מתי היא עוברת מעליכם.', 'נקודה בהירה שנעה מהר.']
  },
  {
    category: 'lookUp',
    en: ['From a dark spot away from city lights, you can see the Milky Way with just your eyes.', 'the Milky Way'],
    es: ['Desde un lugar oscuro, lejos de las luces de la ciudad, puedes ver la Vía Láctea a simple vista.', 'la Vía Láctea'],
    ar: ['من مكان مظلم بعيد عن أضواء المدينة، يمكنك رؤية مجرة درب التبانة بعينيك فقط.', 'مجرة درب التبانة'],
    he: ['ממקום חשוך, הרחק מאורות העיר, אפשר לראות את שביל החלב בעיניים בלבד.', 'שביל החלב']
  },
  {
    category: 'lookUp',
    en: ['The Andromeda Galaxy is the farthest thing most people can see without a telescope.', 'farthest thing'],
    es: ['La galaxia de Andrómeda es lo más lejano que la mayoría de la gente puede ver sin telescopio.', 'lo más lejano'],
    ar: ['مجرة أندروميدا هي أبعد شيء يستطيع معظم الناس رؤيته دون تلسكوب.', 'أبعد شيء'],
    he: ['גלקסיית אנדרומדה היא הדבר הרחוק ביותר שרוב האנשים יכולים לראות בלי טלסקופ.', 'הדבר הרחוק ביותר']
  }
];

// How long each item stays on screen, and how long its fade takes (match style.css)
const FACT_DISPLAY_MS = 7000;
const FACT_FADE_MS = 400;

// Find the elements we need on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
const dateForm = document.getElementById('dateForm');
const getImagesButton = document.getElementById('getImagesButton');
const gallery = document.getElementById('gallery');
const spaceFact = document.getElementById('spaceFact');
const factHeading = document.getElementById('factHeading');
const factText = document.getElementById('factText');
const factPause = document.getElementById('factPause');
const modal = document.getElementById('modal');
const modalClose = document.getElementById('modalClose');
const modalMedia = document.getElementById('modalMedia');
const modalDate = document.getElementById('modalDate');
const modalTitle = document.getElementById('modalTitle');
const modalCredit = document.getElementById('modalCredit');
const modalExplanation = document.getElementById('modalExplanation');
const modalLink = document.getElementById('modalLink');

// Holds the entries currently in the gallery, so a click can find its entry
let currentEntries = [];

// The Big Bang only plays the first time images are loaded
let hasBigBangPlayed = false;

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);

// Mix up a list so the items come in a random order
function shuffle(list) {
  const mixed = [...list];
  for (let i = mixed.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [mixed[i], mixed[j]] = [mixed[j], mixed[i]];
  }
  return mixed;
}

// Put the items in a random order, with a "Did You Know?" fact first
const factOrder = shuffle(spaceFacts);
const firstFact = factOrder.findIndex((fact) => fact.category === 'didYouKnow');
[factOrder[0], factOrder[firstFact]] = [factOrder[firstFact], factOrder[0]];

let factIndex = 0;
let isFactPaused = false;
let isFactHovered = false;

// Wrap each word in its own span, so the words can rise into place one after another
function wrapWords(text, className, firstWordNumber) {
  return text.split(' ').filter((word) => word).map((word, index) => {
    const delay = (firstWordNumber + index) * 28;
    return `<span class="fact-word ${className}" style="animation-delay: ${delay}ms">${word}</span>`;
  }).join(' ');
}

// Put an item in the fact box, with its key phrase highlighted
function showFact(fact) {
  factHeading.textContent = t(fact.category);
  spaceFact.dataset.category = fact.category;

  const [text, highlight] = fact[currentLanguage];

  // Translators work sentence by sentence, so splitting the fact into words would give
  // a word-by-word mess. While the page is being translated, show the fact as plain text.
  if (isMachineTranslated) {
    factText.textContent = text;
    return;
  }

  const highlightStart = text.indexOf(highlight);
  const before = text.slice(0, highlightStart);
  const after = text.slice(highlightStart + highlight.length);
  const beforeCount = before.split(' ').filter((word) => word).length;
  const highlightCount = highlight.split(' ').length;

  factText.innerHTML = [
    wrapWords(before, '', 0),
    wrapWords(highlight, 'fact-highlight', beforeCount),
    wrapWords(after, '', beforeCount + highlightCount)
  ].filter((part) => part).join(' ');
}

// Make the fact box tall enough for the longest fact in this language at this screen size,
// so the page below doesn't jump up and down as the facts change.
// Each fact is tried as plain text with a bold highlight. That takes up the same room as the
// animated version, but is much quicker for the browser to measure.
function reserveFactHeight() {
  spaceFact.style.minHeight = '';
  let tallest = 0;
  spaceFacts.forEach((fact) => {
    const [text, highlight] = fact[currentLanguage];
    const highlightStart = text.indexOf(highlight);
    factHeading.textContent = t(fact.category);
    factText.innerHTML = isMachineTranslated
      ? escapeHtml(text)
      : `${escapeHtml(text.slice(0, highlightStart))}<b>${escapeHtml(highlight)}</b>${escapeHtml(text.slice(highlightStart + highlight.length))}`;
    tallest = Math.max(tallest, spaceFact.offsetHeight);
  });
  spaceFact.style.minHeight = `${tallest}px`;
  showFact(factOrder[factIndex]);
}

// Measuring takes a moment, so do it when the browser isn't busy showing the page,
// and only once even if several things ask for it at the same time
let isFactMeasureWaiting = false;

function reserveFactHeightSoon() {
  if (isFactMeasureWaiting) {
    return;
  }
  isFactMeasureWaiting = true;
  const measure = () => {
    isFactMeasureWaiting = false;
    reserveFactHeight();
  };
  if (window.requestIdleCallback) {
    requestIdleCallback(measure, { timeout: 2000 });
  } else {
    setTimeout(measure, 500);
  }
}

// Fade out the current item, swap in the next one, and fade back in
function showNextFact() {
  if (isFactPaused || isFactHovered) {
    return;
  }
  spaceFact.classList.add('fading');
  setTimeout(() => {
    factIndex = (factIndex + 1) % factOrder.length;
    showFact(factOrder[factIndex]);
    spaceFact.classList.remove('fading');
  }, FACT_FADE_MS);
}

// Update the pause button to match the current state
function setFactPaused(paused) {
  isFactPaused = paused;
  spaceFact.classList.toggle('paused', paused);
  factPause.textContent = paused ? t('play') : t('pause');
  factPause.setAttribute('aria-label', paused ? t('playLabel') : t('pauseLabel'));
}

showFact(factOrder[0]);

// Start paused for people who've asked their device to reduce motion
setFactPaused(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
setInterval(showNextFact, FACT_DISPLAY_MS);

factPause.addEventListener('click', () => {
  setFactPaused(!isFactPaused);
});

// Hold the current item while someone is reading it with the mouse over it.
// We only check for a real mouse, because a tap on a phone can count as hovering
// and would stop the rotation until the person tapped somewhere else.
spaceFact.addEventListener('pointerenter', (event) => {
  isFactHovered = event.pointerType === 'mouse';
});
spaceFact.addEventListener('pointerleave', () => {
  isFactHovered = false;
});

// Make text from the API safe to put inside a template literal of HTML
function escapeHtml(text) {
  const element = document.createElement('div');
  element.textContent = text;
  return element.innerHTML.replaceAll('"', '&quot;');
}

// What the gallery is showing right now, so it can be redrawn when the language changes
let galleryState = { type: 'start' };

// Show a message (an error, or no results) in place of the gallery
function showMessage(icon, messageKey) {
  galleryState = { type: 'message', icon, messageKey };
  gallery.innerHTML = `
    <div class="placeholder" role="status">
      <div class="placeholder-icon">${icon}</div>
      <p>${t(messageKey)}</p>
    </div>
  `;
}

// Show the loading animation in place of the gallery: planets circling a glowing sun
function showLoading() {
  galleryState = { type: 'loading' };
  gallery.innerHTML = `
    <div class="placeholder" role="status">
      <div class="loader" aria-hidden="true">
        <span class="loader-orbit orbit-outer"></span>
        <span class="loader-orbit orbit-middle"></span>
        <span class="loader-orbit orbit-inner"></span>
        <span class="loader-sun"></span>
      </div>
      <p class="loader-text">${t('loading')}</p>
      <p class="loader-subtext">${t('loadingSub')}</p>
    </div>
  `;
}

// Turn "2026-11-02" into "November 2, 2026"
function formatDate(dateString) {
  // Adding T00:00:00 keeps the date from shifting because of time zones
  const date = new Date(`${dateString}T00:00:00`);
  return date.toLocaleDateString(LANGUAGES[currentLanguage].locale, { year: 'numeric', month: 'long', day: 'numeric' });
}

// Get the date one day before a YYYY-MM-DD date
function getPreviousDay(dateString) {
  const date = new Date(`${dateString}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().split('T')[0];
}

// Build the link to an entry's page on NASA's APOD site, like .../ap261102.html
function getApodPageUrl(dateString) {
  const shortDate = dateString.slice(2).replaceAll('-', '');
  return `https://apod.nasa.gov/apod/ap${shortDate}.html`;
}

// Some older entries have links starting with // instead of https://
function fixUrl(url) {
  return url && url.startsWith('//') ? `https:${url}` : url;
}

// Find the video ID in a YouTube link (returns null if it's not a YouTube link)
function getYouTubeId(url) {
  const match = url && url.match(/(?:youtube(?:-nocookie)?\.com\/(?:embed\/|watch\?v=)|youtu\.be\/)([\w-]+)/);
  return match ? match[1] : null;
}

// Choose the picture to show on a gallery card
function getThumbnailUrl(entry) {
  if (entry.media_type === 'image') {
    return fixUrl(entry.url);
  }
  if (entry.thumbnail_url) {
    return fixUrl(entry.thumbnail_url);
  }
  const youTubeId = getYouTubeId(entry.url);
  return youTubeId ? `https://img.youtube.com/vi/${youTubeId}/hqdefault.jpg` : null;
}

// Ask NASA for the entries between two dates
async function fetchEntries(startDate, endDate) {
  const url = `${API_URL}?api_key=${API_KEY}&start_date=${startDate}&end_date=${endDate}&thumbs=true`;
  const response = await fetch(url, { signal: AbortSignal.timeout(API_TIMEOUT_MS) });

  // Today's date can be ahead of NASA's: it's based on UTC, and the newest photo may
  // not be posted yet. NASA rejects that end date, so try again one day earlier.
  if ((response.status === 400 || response.status === 404) && endDate === today && startDate < endDate) {
    return fetchEntries(startDate, getPreviousDay(endDate));
  }

  if (!response.ok) {
    throw new Error(`NASA API error ${response.status}`, { cause: response.status });
  }

  return response.json();
}

// Turn one article from NASA's science website into the same shape the API uses
function articleToEntry(article) {
  // Each article is a page of HTML, so we read the parts we need out of it
  const page = new DOMParser().parseFromString(article.content.rendered, 'text/html');
  const heading = page.querySelector('h1');
  const paragraphs = [...page.querySelectorAll('p')];
  const explanation = paragraphs.find((paragraph) => paragraph.textContent.trim().startsWith('Explanation'));
  const pageText = page.body.textContent.replace(/\s+/g, ' ');
  const credit = pageText.match(/Date:? .*?Credit:? (.*?) Authors/);

  const entry = {
    date: article.date.slice(0, 10),
    title: heading ? heading.textContent.trim() : article.slug,
    explanation: explanation ? explanation.textContent.trim().replace(/^Explanation:?\s*/, '') : '',
    // The credit can start with extra words like "Image Credit & Copyright:"
    copyright: credit ? credit[1].replace(/^(Image|Video)?\s*(Credit)?\s*(&|and)?\s*(Copyright)?:?\s*/i, '').replace(/ ,/g, ',') : '',
    media_type: 'other'
  };

  const iframe = page.querySelector('iframe');
  const video = page.querySelector('video, video source');
  const image = page.querySelector('img');

  // NASA's smaller copy of the picture, unless it's just their generic stand-in image
  const featured = article._embedded && article._embedded['wp:featuredmedia'] && article._embedded['wp:featuredmedia'][0];
  const largeCopy = featured && featured.media_details && featured.media_details.sizes && featured.media_details.sizes.large;
  const largeUrl = largeCopy && !largeCopy.source_url.includes('news-thumbnail') ? largeCopy.source_url : null;

  if (iframe) {
    entry.media_type = 'video';
    entry.url = iframe.getAttribute('src');
  } else if (video) {
    entry.media_type = 'video';
    entry.url = video.getAttribute('src');
  } else if (largeUrl || image) {
    entry.media_type = 'image';
    entry.url = largeUrl || image.getAttribute('src');
    entry.hdurl = entry.url.split('/jcr:content')[0].split('?')[0];
  }

  return entry;
}

// Get the entries between two dates from NASA's science website
async function fetchNasaScienceEntries(startDate, endDate) {
  const url = `${NASA_SCIENCE_URL}?search=apod&after=${getPreviousDay(startDate)}T23:59:59&before=${endDate}T23:59:59&per_page=${MAX_SCIENCE_ENTRIES}&_embed=wp:featuredmedia`;
  const response = await fetch(url, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
  if (!response.ok) {
    throw new Error(`NASA Science error ${response.status}`);
  }

  // The search can also find articles that only mention APOD, so keep just the real ones
  const articles = await response.json();
  return {
    entries: articles.filter((article) => article.slug.startsWith('apod-')).map(articleToEntry),
    // It sends the newest ones first, so a long range can be cut short
    isCutShort: Number(response.headers.get('X-WP-TotalPages')) > 1
  };
}

// Sometimes NASA's API answers with its website logo in place of every photo
function isPlaceholderData(entries) {
  return entries.every((entry) => entry.url && entry.url.includes('nasa-logo'));
}

// Get the sample entries from the backup file
async function fetchBackupEntries() {
  const response = await fetch(BACKUP_URL, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
  if (!response.ok) {
    throw new Error(`Backup data error ${response.status}`);
  }
  return response.json();
}

// Try NASA's API first, then NASA's science website, and the sample entries as a last resort.
// Gives back the entries, and the name of a note to show above them if there's something to explain.
async function getEntries(startDate, endDate) {
  try {
    const entries = await fetchEntries(startDate, endDate);
    if (!isPlaceholderData(entries)) {
      return { entries, noticeKey: '' };
    }
  } catch (error) {
    console.error(error);
  }

  try {
    const { entries, isCutShort } = await fetchNasaScienceEntries(startDate, endDate);
    return { entries, noticeKey: isCutShort ? 'longRange' : '' };
  } catch (error) {
    console.error(error);
  }

  const entries = await fetchBackupEntries();
  return {
    entries,
    noticeKey: 'samples'
  };
}

// Shorten NASA's explanation for the feature card, stopping at the end of a word
function getSummary(text) {
  if (text.length <= 150) {
    return text;
  }
  return `${text.slice(0, 150).replace(/\s+\S*$/, '')}…`;
}

// Build the HTML for one gallery card. The first card is the big feature card.
function createCard(entry, index) {
  const thumbnailUrl = getThumbnailUrl(entry);
  const isFeature = index === 0;
  const isVideo = entry.media_type === 'video';

  let labelText = t('interactive');
  if (entry.media_type === 'image') {
    labelText = t('image');
  } else if (isVideo) {
    labelText = t('video');
  }

  return `
    <button type="button" class="gallery-item ${isFeature ? 'feature' : ''}" data-index="${index}">
      <span class="media-frame">
        ${thumbnailUrl
          ? `<img src="${escapeHtml(thumbnailUrl)}" alt="${escapeHtml(entry.title)}" loading="lazy" />`
          : '<span class="no-thumbnail" aria-hidden="true">🔭</span>'}
      </span>
      <span class="card-label ${isVideo ? 'video' : ''}">${labelText}</span>
      <span class="card-text">
        <span class="item-title" lang="en" dir="ltr">${escapeHtml(entry.title)}</span>
        ${isFeature && entry.explanation ? `<span class="card-summary" lang="en" dir="ltr">${escapeHtml(getSummary(entry.explanation))}</span>` : ''}
        <span class="date">${formatDate(entry.date)}</span>
      </span>
    </button>
  `;
}

// Replace whatever is in the gallery with cards for these entries
function renderGallery(entries, noticeKey) {
  galleryState = { type: 'cards', entries, noticeKey };

  // Show the newest entries first
  currentEntries = [...entries].sort((a, b) => b.date.localeCompare(a.date));

  // Any note goes above the cards. In other languages, also say that NASA's text is in English.
  const notes = [];
  if (noticeKey) {
    notes.push(t(noticeKey).replace('{count}', MAX_SCIENCE_ENTRIES));
  }
  if (t('englishNote')) {
    notes.push(t('englishNote'));
  }
  const noticeHtml = notes.length ? `<p class="backup-notice" role="status">${notes.join(' ')}</p>` : '';
  gallery.innerHTML = noticeHtml + currentEntries.map(createCard).join('');

  // If a picture fails to load, show the telescope icon instead of a broken image
  gallery.querySelectorAll('img').forEach((image) => {
    image.addEventListener('error', () => {
      image.outerHTML = '<span class="no-thumbnail" aria-hidden="true">🔭</span>';
    });
  });
}

// Get the entries and show them in the gallery
async function loadGallery() {
  const startDate = startInput.value;
  const endDate = endInput.value;

  if (startDate > endDate) {
    showMessage('📅', 'startAfterEnd');
    return;
  }

  // Show the loading message, and stop extra clicks while we wait
  showLoading();
  getImagesButton.disabled = true;

  // The first time, start the Big Bang while the photos load in the background.
  // Skip it for people who've asked their device to reduce motion.
  const isBigBang = !hasBigBangPlayed && !prefersReducedMotion;
  hasBigBangPlayed = true;
  const bigBangReady = isBigBang ? playBigBang() : Promise.resolve();

  try {
    const { entries, noticeKey } = await getEntries(startDate, endDate);

    // Wait for the explosion, so the photos appear out of it
    await bigBangReady;

    if (entries.length === 0) {
      showMessage('🌌', 'noEntries');
    } else {
      renderGallery(entries, noticeKey);
      if (isBigBang) {
        launchCardsFromCenter();
      }
    }
  } catch (error) {
    console.error(error);
    showMessage('🛰️', 'offline');
  } finally {
    getImagesButton.disabled = false;
  }
}

// Build the modal's main content: an image, an embedded video, or a telescope icon
function createModalMedia(entry) {
  const url = fixUrl(entry.url);

  if (entry.media_type === 'image') {
    return `<img src="${escapeHtml(url)}" alt="${escapeHtml(entry.title)}" />`;
  }

  // YouTube and Vimeo links from the API are ready to embed
  if (entry.media_type === 'video' && url && /youtube|youtu\.be|vimeo/.test(url)) {
    return `
      <iframe
        src="${escapeHtml(url)}"
        title="${escapeHtml(entry.title)}"
        allow="fullscreen; picture-in-picture"
        referrerpolicy="strict-origin-when-cross-origin"
      ></iframe>
    `;
  }

  // Video files that NASA hosts itself
  if (entry.media_type === 'video' && url && /\.(mp4|webm)$/i.test(url)) {
    return `<video src="${escapeHtml(url)}" controls></video>`;
  }

  return '<span class="no-thumbnail" aria-hidden="true">🔭</span>';
}

// Build the link under the explanation, so people can always reach the original
function createModalLink(entry) {
  const url = fixUrl(entry.url);
  const youTubeId = getYouTubeId(url);

  if (entry.media_type === 'image') {
    const fullSizeUrl = fixUrl(entry.hdurl) || url;
    return `<a href="${escapeHtml(fullSizeUrl)}" target="_blank" rel="noopener">${t('fullImage')} <span class="link-arrow" aria-hidden="true">→</span></a>`;
  }
  if (youTubeId) {
    return `<a href="https://www.youtube.com/watch?v=${youTubeId}" target="_blank" rel="noopener">${t('watchYouTube')} <span class="link-arrow" aria-hidden="true">→</span></a>`;
  }
  if (entry.media_type === 'video' && url) {
    return `<a href="${escapeHtml(url)}" target="_blank" rel="noopener">${t('watchVideo')} <span class="link-arrow" aria-hidden="true">→</span></a>`;
  }
  return `<a href="${getApodPageUrl(entry.date)}" target="_blank" rel="noopener">${t('apodPage')} <span class="link-arrow" aria-hidden="true">→</span></a>`;
}

// Fill the modal with one entry and open it
function openModal(entry) {
  modalMedia.innerHTML = createModalMedia(entry);
  modalDate.textContent = formatDate(entry.date);
  modalTitle.textContent = entry.title;
  modalCredit.textContent = entry.copyright ? `${t('credit')} ${entry.copyright.trim()}` : '';
  modalExplanation.textContent = entry.explanation;
  modalLink.innerHTML = createModalLink(entry);
  modal.showModal();
  modal.scrollTop = 0;
}

// Load the gallery when the form is submitted
dateForm.addEventListener('submit', (event) => {
  event.preventDefault();
  loadGallery();
});

// Open the modal when a card is clicked. We listen on the gallery itself
// because the cards are replaced every time new dates are loaded.
gallery.addEventListener('click', (event) => {
  const card = event.target.closest('.gallery-item');
  if (card) {
    openModal(currentEntries[Number(card.dataset.index)]);
  }
});

// Close the modal with the X button
modalClose.addEventListener('click', () => {
  modal.close();
});

// Close the modal by clicking the dark area around it
modal.addEventListener('click', (event) => {
  if (event.target === modal) {
    modal.close();
  }
});

// Clear the modal when it closes, so a video stops playing
modal.addEventListener('close', () => {
  // Skip this if another card was opened in the meantime
  if (!modal.open) {
    modalMedia.innerHTML = '';
  }
});

// ----- Animated space background -----

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// --- The scenes ---
// This is a small program (a "shader") that runs on the graphics card and works out
// the color of every pixel. It layers random noise to make wispy, flowing shapes, and
// draws five scenes: Earth, an alien world, a nebula, a black hole, and a spiral galaxy.
// uSceneA is the scene we're leaving and uSceneB is the next one. uBlend says how far
// the jump between them has got: 0 is still at A, and 1 has arrived at B.
//
// Each scene gives back a color and an "alpha". Glowing gas has alpha 0, so the stars
// behind it shine through. Solid things like planets have alpha 1, so they hide the stars.
const NEBULA_SHADER = `
  #ifdef GL_FRAGMENT_PRECISION_HIGH
  precision highp float;
  #else
  precision mediump float;
  #endif

  uniform vec2 uResolution;
  uniform float uTime;
  uniform float uBlend;
  uniform int uSceneA;
  uniform int uSceneB;

  // A random number for each point on a grid
  float random(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  // Smooth random values between the grid points
  float noise(vec2 p) {
    vec2 cell = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(random(cell), random(cell + vec2(1.0, 0.0)), f.x),
      mix(random(cell + vec2(0.0, 1.0)), random(cell + vec2(1.0, 1.0)), f.x),
      f.y
    );
  }

  const mat2 TURN = mat2(0.8, 0.6, -0.6, 0.8);

  // Soft clouds: noise stacked at finer and finer sizes
  float clouds(vec2 p) {
    float value = 0.0;
    float strength = 0.5;
    for (int i = 0; i < 4; i++) {
      value += strength * noise(p);
      p = TURN * p * 2.02;
      strength *= 0.5;
    }
    return value;
  }

  // Thin threads: the same idea, but keeping only the ridges of the noise
  float threads(vec2 p) {
    float value = 0.0;
    float strength = 0.5;
    for (int i = 0; i < 4; i++) {
      value += strength * (1.0 - abs(2.0 * noise(p) - 1.0));
      p = TURN * p * 2.1;
      strength *= 0.5;
    }
    return value;
  }

  // Scene 1: cyan threads along a wavy band, crimson clouds under it, dark red haze above
  vec3 nebulaScene(vec2 screen, vec2 p, float t) {
    // Bend the space with clouds so the shapes look like flowing gas
    vec2 q = vec2(clouds(p * 1.2 + vec2(0.0, t)), clouds(p * 1.2 + vec2(5.2, 1.3 - t)));
    vec2 r = vec2(
      clouds(p * 1.8 + 3.0 * q + vec2(1.7 + t * 0.7, 9.2)),
      clouds(p * 1.8 + 3.0 * q + vec2(8.3, 2.8 - t * 0.5))
    );

    // How far each pixel is above (+) or below (-) the wavy band across the screen
    float bandCenter = 0.62 - 0.20 * screen.x + 0.05 * sin(screen.x * 4.0 + t * 2.0) + (q.x - 0.5) * 0.16;
    float d = screen.y - bandCenter;

    // The bright cyan ribbon: fine threads over a soft glow, strongest along the band
    float thin = pow(threads(p * 4.0 + r * 3.5), 6.0);
    float hair = pow(threads(p * 11.0 + r * 5.0 + q * 3.0), 5.0);
    float ribbon = exp(-d * d / 0.005);
    float cyan = ribbon * (0.16 + thin * 2.6 + hair * 1.5);

    // The crimson curtain: tangled threads hanging below the band
    float below = (1.0 - smoothstep(-0.04, 0.02, d)) * smoothstep(-0.62, -0.06, d);
    float fine = pow(threads(p * 7.0 + q * 5.0), 4.0);
    float patches = smoothstep(0.28, 0.62, clouds(p * 2.5 + r * 2.5));
    float crimson = below * patches * (0.14 + fine * 2.6 + hair * 1.0);

    // Above the band: dark red haze with a few faint, stray threads
    float above = smoothstep(0.0, 0.08, d);
    float haze = above * (1.0 - smoothstep(0.1, 0.7, d)) * q.y;
    float strays = above * pow(threads(p * 2.5 + r * 4.0 + 7.0), 9.0);

    vec3 color = vec3(0.012, 0.01, 0.028);
    color += vec3(0.26, 0.015, 0.06) * haze;
    color += vec3(0.75, 0.10, 0.32) * strays * 2.0;
    color += vec3(0.10, 0.45, 0.75) * strays * thin * 2.0;
    color += vec3(0.95, 0.06, 0.24) * crimson;
    color += vec3(0.08, 0.72, 0.95) * cyan;
    color += vec3(0.7, 0.95, 1.0) * cyan * cyan * 0.22;

    // Where the ribbon meets the curtain, the colors mix into a pink glow
    color += vec3(0.85, 0.30, 0.55) * ribbon * below * (thin + fine) * 0.8;

    return color;
  }

  // Scene 2: a tilted spiral galaxy with a golden center and blue arms
  vec3 galaxyScene(vec2 screen, vec2 p, float aspect, float t) {
    vec2 v = (screen - vec2(0.5, 0.52)) * vec2(aspect, 1.0);

    // Shrink it on narrow screens so it still fits
    v /= clamp(aspect, 0.6, 1.0);

    // Tilt it by turning it, then squashing it
    v = mat2(0.88, 0.47, -0.47, 0.88) * v;
    v.y *= 1.8;

    float radius = length(v) + 0.001;

    // Twist the space more toward the center, and keep slowly turning it, to make the spiral
    float twist = 2.8 * log(radius) - t * 1.5;
    float c = cos(twist);
    float s = sin(twist);
    vec2 twisted = mat2(c, s, -s, c) * v;

    // Two spiral arms, roughened by clouds so they aren't too perfect
    float gas = clouds(twisted * 6.0 + 4.0);
    float angle = atan(v.y, v.x) + twist;
    float arms = pow(0.5 + 0.5 * cos(2.0 * angle + (gas - 0.5) * 3.0), 2.2);
    float disk = exp(-radius * 3.0);
    float glow = arms * disk * (0.5 + gas * 2.4);

    // Dark dust lanes and pink star-forming clouds along the arms
    float dust = pow(threads(twisted * 7.0 + 2.0), 4.0);
    float knots = pow(threads(twisted * 12.0 + 9.0), 9.0);

    vec3 color = vec3(0.012, 0.012, 0.038);
    color += vec3(0.07, 0.04, 0.16) * clouds(p * 1.2 + vec2(t, 3.0));
    color += vec3(0.22, 0.45, 1.0) * glow * (1.0 - dust * 0.75);
    color += vec3(0.75, 0.82, 1.0) * glow * glow * 0.35;
    color += vec3(1.0, 0.18, 0.45) * knots * arms * disk * 5.0;

    // The bright center
    color += vec3(1.0, 0.62, 0.32) * exp(-radius * 8.0) * 0.8;
    color += vec3(1.0, 0.88, 0.68) * exp(-radius * radius * 90.0) * 1.3;

    return color;
  }

  // Put a solid or see-through layer on top of what's already been drawn
  vec4 layerOver(vec4 under, vec3 color, float amount) {
    return vec4(color * amount + under.rgb * (1.0 - amount), amount + under.a * (1.0 - amount));
  }

  // Earth from orbit: a huge curved planet with sunrise breaking over its edge
  vec4 earthScene(vec2 screen, float aspect, float t) {
    vec2 v = (screen - vec2(0.6, -0.95)) * vec2(aspect, 1.0);
    float size = 1.4;
    float dist = length(v);
    vec2 sunDirection = normalize(vec2(0.3, 0.95));
    vec3 sunlight = normalize(vec3(sunDirection, 0.18));
    float limb = dot(normalize(v), sunDirection);

    vec4 scene = vec4(vec3(0.004, 0.008, 0.025), 0.0);

    // The thin blue atmosphere glowing beyond the planet's edge
    float outside = max(dist - size, 0.0);
    scene.rgb += vec3(0.16, 0.45, 1.0) * exp(-outside * 20.0) * (0.12 + pow(max(limb, 0.0), 3.0) * 1.1);

    if (dist < size + 0.004) {
      vec3 normal = vec3(v / size, sqrt(max(1.0 - dot(v, v) / (size * size), 0.0)));
      vec2 surface = normal.xy / (1.0 + normal.z) * 2.5 + vec2(t * 0.5, 0.0);

      float land = smoothstep(0.46, 0.52, clouds(surface * 2.2 + 3.0));
      vec3 ground = mix(vec3(0.015, 0.09, 0.28), mix(vec3(0.09, 0.22, 0.07), vec3(0.33, 0.26, 0.13), clouds(surface * 6.0)), land);
      float cover = smoothstep(0.42, 0.72, clouds(surface * 3.5 + vec2(t * 0.8, 5.0) + 0.5 * clouds(surface * 2.0)));

      float light = clamp(dot(normal, sunlight) * 1.15 + 0.03, 0.0, 1.0);
      vec3 planet = mix(ground, vec3(0.9), cover * 0.85) * light;

      // City lights on the night side
      float night = 1.0 - smoothstep(0.0, 0.25, light);
      planet += vec3(1.0, 0.68, 0.32) * night * land * (1.0 - cover) * pow(noise(surface * 55.0), 7.0) * 1.8;

      // The atmosphere near the edge of the planet
      planet += vec3(0.2, 0.5, 1.0) * pow(1.0 - normal.z, 2.5) * (light + 0.03) * 1.2;

      scene = layerOver(scene, planet, 1.0 - smoothstep(size - 0.003, size + 0.003, dist));
    }

    // Sunrise: an orange line along the edge, and the sun's glare where it comes up
    scene.rgb += vec3(1.0, 0.55, 0.25) * exp(-abs(dist - size) * 90.0) * pow(max(limb, 0.0), 7.0);
    float fromSun = length(v - sunDirection * size);
    scene.rgb += vec3(1.0, 0.82, 0.58) * exp(-fromSun * 8.0) * 0.75;
    scene.rgb += vec3(1.0, 0.97, 0.9) * exp(-fromSun * fromSun * 700.0) * 2.0;

    return scene;
  }

  // An alien world: black mountains, a violet sky, and a huge dark planet in eclipse
  vec4 alienScene(vec2 screen, float aspect, float t) {
    float x = screen.x * aspect;
    vec2 v = (screen - vec2(0.5, 0.68 + 0.015 * sin(t * 3.0))) * vec2(aspect, 1.0);
    float size = 0.25 * clamp(aspect, 0.6, 1.0);
    float dist = length(v);

    float farPeaks = 0.23 + 0.17 * threads(vec2(x * 2.2 + 11.0, 3.0));
    float nearPeaks = 0.06 + 0.2 * threads(vec2(x * 1.4 + 2.0, 8.0));
    float height = screen.y - farPeaks;

    // The glowing sky, brightest and pinkest along the horizon
    vec4 scene = vec4(vec3(0.02, 0.012, 0.05), 0.0);
    scene.rgb += vec3(0.32, 0.14, 0.72) * exp(-max(height, 0.0) * 3.5) * 0.75;
    scene.rgb += vec3(1.0, 0.42, 0.72) * exp(-max(height, 0.0) * 13.0) * 0.8;

    // The planet: a violet glow behind it, a dark solid disc with faint bands, and a bright ring
    float lit = 0.25 + 0.75 * max(dot(normalize(v), normalize(vec2(0.45, -0.8))), 0.0);
    scene.rgb += vec3(0.5, 0.3, 1.0) * exp(-max(dist - size, 0.0) * 13.0) * lit * 0.45;
    vec3 disc = vec3(0.03, 0.02, 0.07) + vec3(0.05, 0.03, 0.1) * clouds(vec2(v.x * 3.0 + t, v.y * 18.0));
    scene = layerOver(scene, disc, 1.0 - smoothstep(size - 0.002, size + 0.002, dist));
    scene.rgb += vec3(0.85, 0.8, 1.0) * exp(-abs(dist - size) * 110.0) * lit * 1.6;

    // Drifting mist in front of the far mountains
    scene = layerOver(scene, vec3(0.09, 0.05, 0.2), 1.0 - smoothstep(-0.012, 0.012, height));
    float mist = clouds(vec2(x * 2.0 + t * 2.0, screen.y * 7.0));
    scene.rgb += vec3(0.75, 0.35, 0.8) * mist * exp(-abs(screen.y - nearPeaks - 0.07) * 13.0) * 0.32;

    // The near mountains, nearly black
    scene = layerOver(scene, vec3(0.012, 0.008, 0.028), 1.0 - smoothstep(-0.01, 0.01, screen.y - nearPeaks));

    return scene;
  }

  // A black hole: a dark center ringed by a blazing, swirling disk of gas
  vec4 blackHoleScene(vec2 screen, vec2 p, float aspect, float t) {
    vec2 v = (screen - vec2(0.5, 0.52)) * vec2(aspect, 1.0);
    v /= clamp(aspect, 0.6, 1.0);
    float size = 0.15;
    float dist = length(v);

    // The disk is tilted, so it's a flattened circle seen at an angle
    vec2 flat2 = mat2(0.95, 0.31, -0.31, 0.95) * v;
    vec2 tilted = vec2(flat2.x, flat2.y * 3.4);
    float diskRadius = length(tilted) + 0.001;

    // Gas near the center orbits faster, which pulls the threads into long streaks
    float twist = 2.2 * log(diskRadius) - t * 22.0 / (diskRadius * 6.0 + 1.0);
    float c = cos(twist);
    float s = sin(twist);
    vec2 swirled = mat2(c, s, -s, c) * tilted;
    float streaks = 0.25 + pow(threads(swirled * 7.0), 3.0) * 2.2;

    float band = smoothstep(size * 1.05, size * 1.5, diskRadius) * exp(-(diskRadius - size) * 2.7);
    float heat = exp(-(diskRadius - size) * 6.5);
    vec3 fire = mix(vec3(0.75, 0.13, 0.03), vec3(1.0, 0.82, 0.48), heat);

    // Gas rushing toward us looks brighter, so one side of the disk blazes
    float rushing = 1.0 - 0.62 * tilted.x / diskRadius;
    vec3 disk = fire * band * streaks * rushing * 1.7;

    vec4 scene = vec4(vec3(0.016, 0.006, 0.012), 0.0);
    scene.rgb += vec3(0.25, 0.05, 0.03) * clouds(p * 1.4 + vec2(t, 1.0));

    // Gravity bends light from the far side of the disk up and around the dark center
    float arc = exp(-abs(dist - size * 1.38) * 30.0) * smoothstep(-0.06, 0.1, flat2.y);
    scene.rgb += vec3(1.0, 0.62, 0.28) * arc * (0.5 + streaks * 0.3);

    // The dark center, then the near part of the disk passing in front of it
    float shadow = 1.0 - smoothstep(size - 0.003, size + 0.003, dist);
    scene.rgb += disk * max(1.0 - shadow, (1.0 - smoothstep(-0.012, 0.012, flat2.y)));
    vec3 shadowColor = disk * (1.0 - smoothstep(-0.012, 0.012, flat2.y));
    scene = layerOver(scene, shadowColor, shadow);

    // A razor-thin ring of light right at the edge
    scene.rgb += vec3(1.0, 0.86, 0.66) * exp(-abs(dist - size) * 150.0) * 1.1;

    return scene;
  }

  // Work out one scene. A bigger zoom means the camera is closer.
  vec4 drawScene(int scene, vec2 screen, float zoom) {
    screen = 0.5 + (screen - 0.5) / zoom;
    float aspect = uResolution.x / uResolution.y;
    vec2 p = screen * vec2(aspect, 1.0) * 1.6;
    float t = uTime * 0.025;

    if (scene == 0) {
      return earthScene(screen, aspect, t);
    }
    if (scene == 1) {
      return alienScene(screen, aspect, t);
    }
    if (scene == 2) {
      return vec4(nebulaScene(screen, p, t), 0.0);
    }
    if (scene == 3) {
      return blackHoleScene(screen, p, aspect, t);
    }
    return vec4(galaxyScene(screen, p, aspect, t), 0.0);
  }

  void main() {
    vec2 screen = gl_FragCoord.xy / uResolution;
    vec4 color;

    if (uBlend <= 0.0) {
      color = drawScene(uSceneA, screen, 1.0);
    } else {
      // The camera flies into the old scene while the new one rushes up from far away
      float leaving = 1.0 + uBlend * uBlend * 2.2;
      float arriving = 0.45 + 0.55 * (1.0 - (1.0 - uBlend) * (1.0 - uBlend));

      // The new scene opens up from the center, with ragged cloud-shaped edges
      float aspect = uResolution.x / uResolution.y;
      vec2 centered = (screen - 0.5) * vec2(aspect, 1.0);
      float field = length(centered) * 0.55 + clouds(centered * 3.0 + vec2(uTime * 0.05, 2.0)) * 0.6;
      float edge = uBlend * 1.6 - 0.3;
      float mixAmount = 1.0 - smoothstep(edge - 0.2, edge + 0.2, field);

      color = mix(drawScene(uSceneA, screen, leaving), drawScene(uSceneB, screen, arriving), mixAmount);

      // A soft glow along the edges, and a blue flash from the center at the peak of the jump
      float jump = 4.0 * uBlend * (1.0 - uBlend);
      color.rgb += vec3(0.35, 0.45, 0.85) * mixAmount * (1.0 - mixAmount) * 0.3;
      color.rgb += vec3(0.5, 0.65, 1.0) * jump * jump * exp(-length(centered) * 3.2) * 0.4;
    }

    gl_FragColor = color;
  }
`;

// The graphics card also needs this tiny program, which just covers the screen with a rectangle
const COVER_SCREEN_SHADER = `
  attribute vec2 position;
  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const NEBULA_FRAME_MS = 33; // Redraw the slow-moving nebula about 30 times a second
const SCENE_HOLD_MS = 16000; // How long the journey stays at each stop
const SCENE_CHANGE_MS = 7000; // How long each warp jump takes

// The stops on the journey, in order, heading farther and farther from home.
// The numbers match the scene numbers in the shader's drawScene function.
const JOURNEY = ['Earth', 'An alien world', 'A glowing nebula', 'A black hole', 'A spiral galaxy'];

const SLOW_FRAME_MS = 50;
const SLOW_FRAME_LIMIT = 40;

const nebulaCanvas = document.getElementById('nebulaCanvas');
let nebula = null;

// Draw the nebula at lower resolution than the screen, since this is the demanding part
let nebulaScale = 0.85;
let lastNebulaTime = -NEBULA_FRAME_MS;
let slowFrames = 0;

// Check whether the browser is drawing graphics without a real graphics card. That's
// very slow for our scenes and would freeze the page, so we skip them there.
function isSoftwareGraphics(gl) {
  const info = gl.getExtension('WEBGL_debug_renderer_info');
  const renderer = info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
  return /swiftshader|llvmpipe|softpipe|software|basic render/i.test(renderer);
}

// Start setting up the graphics card. Building the scene program takes the graphics card
// a while, so we ask it to work in the background and check back each frame (see
// checkNebula) instead of making the whole page wait. On browsers that can't do this,
// the plain .nebula background stays showing instead.
let nebulaInProgress = null;

function setupNebula() {
  const gl = nebulaCanvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false });
  if (!gl || isSoftwareGraphics(gl)) {
    nebulaCanvas.hidden = true;
    return;
  }

  // This extension lets the graphics card build the program without blocking the page
  const backgroundBuild = gl.getExtension('KHR_parallel_shader_compile');

  const program = gl.createProgram();
  [[gl.VERTEX_SHADER, COVER_SCREEN_SHADER], [gl.FRAGMENT_SHADER, NEBULA_SHADER]].forEach(([type, source]) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    gl.attachShader(program, shader);
  });
  gl.linkProgram(program);

  nebulaInProgress = { gl, program, backgroundBuild };
}

// See whether the scene program is ready yet. Once it is, finish setting it up.
function checkNebula() {
  const { gl, program, backgroundBuild } = nebulaInProgress;
  if (backgroundBuild && !gl.getProgramParameter(program, backgroundBuild.COMPLETION_STATUS_KHR)) {
    return;
  }
  nebulaInProgress = null;

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program));
    nebulaCanvas.hidden = true;
    return;
  }
  gl.useProgram(program);

  // Two triangles that together cover the whole canvas
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  nebula = {
    gl,
    resolution: gl.getUniformLocation(program, 'uResolution'),
    time: gl.getUniformLocation(program, 'uTime'),
    blend: gl.getUniformLocation(program, 'uBlend'),
    sceneA: gl.getUniformLocation(program, 'uSceneA'),
    sceneB: gl.getUniformLocation(program, 'uSceneB')
  };
  sizeNebula();

  // Fade the scenes in, then hide the plain background once they've covered it
  nebulaCanvas.classList.add('ready');
  setTimeout(() => {
    document.querySelector('.nebula').hidden = true;
  }, 1300);
}

// --- Drawing the scenes on a separate thread ---
// Setting up the graphics card and drawing the scenes takes real work. Where the browser
// allows it, a Web Worker (a separate thread) does that work, so the page itself never
// has to wait for it. The page just tells the worker where the journey is, every frame.

// This function is the worker's code. It runs on its own thread, so it can't see anything
// else in this file. It gets everything it needs through messages instead.
function sceneWorkerCode() {
  let gl = null;
  let locations = null;

  function start(message) {
    gl = message.canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false });
    if (!gl) {
      self.postMessage({ type: 'failed' });
      return;
    }

    // Without a real graphics card, the scenes are far too slow, so don't use them
    const info = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
    if (/swiftshader|llvmpipe|softpipe|software|basic render/i.test(renderer)) {
      self.postMessage({ type: 'failed' });
      return;
    }

    // Ask the graphics card to build the program in the background. Building it in one go
    // would tie up the graphics card, which the page also needs for drawing everything else.
    const backgroundBuild = gl.getExtension('KHR_parallel_shader_compile');

    const program = gl.createProgram();
    [[gl.VERTEX_SHADER, message.vertexShader], [gl.FRAGMENT_SHADER, message.fragmentShader]].forEach(([type, source]) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      gl.attachShader(program, shader);
    });
    gl.linkProgram(program);

    // Check back every tenth of a second until the program is built
    function finishWhenBuilt() {
      if (backgroundBuild && !gl.getProgramParameter(program, backgroundBuild.COMPLETION_STATUS_KHR)) {
        setTimeout(finishWhenBuilt, 100);
        return;
      }
      finish(program, message);
    }
    finishWhenBuilt();
  }

  function finish(program, message) {
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      self.postMessage({ type: 'failed' });
      return;
    }
    gl.useProgram(program);

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    locations = {
      resolution: gl.getUniformLocation(program, 'uResolution'),
      time: gl.getUniformLocation(program, 'uTime'),
      blend: gl.getUniformLocation(program, 'uBlend'),
      sceneA: gl.getUniformLocation(program, 'uSceneA'),
      sceneB: gl.getUniformLocation(program, 'uSceneB')
    };
    resize(message);
    self.postMessage({ type: 'ready' });
  }

  function resize(message) {
    gl.canvas.width = message.width;
    gl.canvas.height = message.height;
    gl.viewport(0, 0, message.width, message.height);
    gl.uniform2f(locations.resolution, message.width, message.height);
  }

  function draw(message) {
    gl.uniform1f(locations.time, message.time);
    gl.uniform1f(locations.blend, message.blend);
    gl.uniform1i(locations.sceneA, message.sceneA);
    gl.uniform1i(locations.sceneB, message.sceneB);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  self.onmessage = (event) => {
    const message = event.data;
    if (message.type === 'start') {
      start(message);
    } else if (locations && message.type === 'size') {
      resize(message);
    } else if (locations && message.type === 'draw') {
      draw(message);
    }
  };
}

let sceneWorker = null;
let isSceneWorkerReady = false;

// Hand the nebula canvas over to a worker. Returns false if this browser can't do that.
function startSceneWorker() {
  if (!('transferControlToOffscreen' in nebulaCanvas) || !window.Worker) {
    return false;
  }

  // Turn the worker's code into a file the browser can run on another thread
  const code = new Blob([`(${sceneWorkerCode.toString()})();`], { type: 'text/javascript' });
  sceneWorker = new Worker(URL.createObjectURL(code));

  sceneWorker.onmessage = (event) => {
    if (event.data.type === 'ready') {
      isSceneWorkerReady = true;
      nebulaCanvas.classList.add('ready');
      setTimeout(() => {
        document.querySelector('.nebula').hidden = true;
      }, 1300);
      if (prefersReducedMotion) {
        drawStillBackground();
      }
    } else if (event.data.type === 'failed') {
      // Keep the plain background instead
      nebulaCanvas.hidden = true;
    }
  };

  const canvas = nebulaCanvas.transferControlToOffscreen();
  sceneWorker.postMessage({
    type: 'start',
    canvas,
    vertexShader: COVER_SCREEN_SHADER,
    fragmentShader: NEBULA_SHADER,
    width: Math.round(window.innerWidth * nebulaScale),
    height: Math.round(window.innerHeight * nebulaScale)
  }, [canvas]);
  return true;
}

// Match the nebula canvas to the window size
function sizeNebula() {
  if (sceneWorker) {
    sceneWorker.postMessage({
      type: 'size',
      width: Math.round(window.innerWidth * nebulaScale),
      height: Math.round(window.innerHeight * nebulaScale)
    });
    return;
  }
  if (nebula) {
    nebulaCanvas.width = Math.round(window.innerWidth * nebulaScale);
    nebulaCanvas.height = Math.round(window.innerHeight * nebulaScale);
    nebula.gl.viewport(0, 0, nebulaCanvas.width, nebulaCanvas.height);
    nebula.gl.uniform2f(nebula.resolution, nebulaCanvas.width, nebulaCanvas.height);
  }
}

// Work out where the journey is at this moment.
// The timeline repeats: stay at a stop, jump to the next one, stay there, and so on.
function getJourney(time) {
  const legTime = SCENE_HOLD_MS + SCENE_CHANGE_MS;
  const leg = Math.floor(time / legTime);
  const progress = Math.max((time % legTime - SCENE_HOLD_MS) / SCENE_CHANGE_MS, 0);

  return {
    from: leg % JOURNEY.length,
    to: (leg + 1) % JOURNEY.length,
    // Ease in and out so the jump starts and ends gently
    blend: progress * progress * (3 - 2 * progress),
    // How fast we're moving: 0 when stopped, and 1 halfway through a jump
    warp: Math.sin(progress * Math.PI)
  };
}

function drawNebula(time) {
  if (sceneWorker) {
    if (isSceneWorkerReady) {
      const journey = getJourney(time);
      sceneWorker.postMessage({ type: 'draw', time: time / 1000, blend: journey.blend, sceneA: journey.from, sceneB: journey.to });
    }
    return;
  }
  if (nebula) {
    const journey = getJourney(time);
    nebula.gl.uniform1f(nebula.time, time / 1000);
    nebula.gl.uniform1f(nebula.blend, journey.blend);
    nebula.gl.uniform1i(nebula.sceneA, journey.from);
    nebula.gl.uniform1i(nebula.sceneB, journey.to);
    nebula.gl.drawArrays(nebula.gl.TRIANGLES, 0, 6);
  }
}

// --- The stars ---

const starCanvas = document.getElementById('starfield');
const starContext = starCanvas.getContext('2d');

// Three layers of stars. Bigger stars look closer, so they move faster.
const STAR_LAYERS = [
  { share: 0.72, size: 0.6, speed: 1.5 },
  { share: 0.23, size: 1, speed: 3.5 },
  { share: 0.05, size: 1.6, speed: 6 }
];
const STAR_COLORS = ['255, 255, 255', '255, 255, 255', '170, 200, 255', '255, 214, 170', '255, 170, 190'];
const FLARE_COLORS = ['255, 225, 170', '120, 175, 255', '120, 175, 255', '255, 190, 130'];

let stars = [];
let starGroups = [];
let flareStars = [];
let starWidth = 0;
let starHeight = 0;
let shootingStar = null;
let nextShootingStarTime = 3000;
let lastFrameTime = 0;

// Pick a random number between two values
function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

// Pick a random item from a list
function randomItem(list) {
  return list[Math.floor(Math.random() * list.length)];
}

// Size the canvas to the window and scatter the stars across it
function setupStars() {
  starWidth = window.innerWidth;
  starHeight = window.innerHeight;

  // Sharper stars on high-resolution screens
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  starCanvas.width = starWidth * pixelRatio;
  starCanvas.height = starHeight * pixelRatio;
  starCanvas.style.width = `${starWidth}px`;
  starCanvas.style.height = `${starHeight}px`;
  starContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

  // Bigger windows get more stars, up to a limit
  const starCount = Math.min(1100, Math.round((starWidth * starHeight) / 1100));
  stars = [];

  // Stars of the same layer and color are sorted into a few groups that twinkle together.
  // Drawing a whole group at once is much faster than drawing every star by itself.
  starGroups = [];
  STAR_LAYERS.forEach((layer) => {
    STAR_COLORS.forEach((color) => {
      for (let i = 0; i < 4; i++) {
        starGroups.push({
          size: layer.size,
          color,
          twinkleSpeed: randomBetween(0.0005, 0.002),
          twinkleOffset: Math.random() * Math.PI * 2,
          stars: []
        });
      }
    });

    const layerGroups = starGroups.slice(-STAR_COLORS.length * 4);
    for (let i = 0; i < starCount * layer.share; i++) {
      const star = {
        x: Math.random() * starWidth,
        y: Math.random() * starHeight,
        size: layer.size * randomBetween(0.8, 1.3),
        speed: layer.speed
      };
      stars.push(star);
      randomItem(layerGroups).stars.push(star);
    }
  });

  // A few big, bright stars with glowing crosses of light
  const flareCount = Math.max(3, Math.min(9, Math.round(starWidth / 180)));
  flareStars = [];
  for (let i = 0; i < flareCount; i++) {
    flareStars.push({
      x: Math.random() * starWidth,
      y: Math.random() * starHeight,
      // The first one is the big star of the scene
      size: i === 0 ? 46 : randomBetween(12, 24),
      color: randomItem(FLARE_COLORS),
      speed: 1,
      twinkleSpeed: randomBetween(0.0006, 0.0014),
      twinkleOffset: Math.random() * Math.PI * 2
    });
  }
}

// Draw every small star, gently changing its brightness over time so it twinkles.
// During a warp jump, each star stretches into a streak pointing away from the center.
function drawStars(time, warp) {
  const centerX = starWidth / 2;
  const centerY = starHeight / 2;

  starGroups.forEach((group) => {
    const brightness = 0.7 + 0.3 * Math.sin(time * group.twinkleSpeed + group.twinkleOffset);

    // Add every star in the group to one shape, then draw that shape once
    starContext.beginPath();
    group.stars.forEach((star) => {
      if (warp > 0.02) {
        starContext.moveTo(star.x, star.y);
        starContext.lineTo(star.x + (star.x - centerX) * warp * 0.16, star.y + (star.y - centerY) * warp * 0.16);
      } else {
        starContext.moveTo(star.x + star.size, star.y);
        starContext.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      }
    });

    if (warp > 0.02) {
      starContext.strokeStyle = `rgba(${group.color}, ${brightness})`;
      starContext.lineWidth = group.size;
      starContext.stroke();
    } else {
      starContext.fillStyle = `rgba(${group.color}, ${brightness})`;
      starContext.fill();
    }
  });
}

// Draw one thin beam of light from a flare star, fading out toward its tip
function drawFlareBeam(star, endX, endY, brightness) {
  const beam = starContext.createLinearGradient(star.x, star.y, endX, endY);
  beam.addColorStop(0, `rgba(${star.color}, ${brightness})`);
  beam.addColorStop(1, `rgba(${star.color}, 0)`);
  starContext.strokeStyle = beam;
  starContext.beginPath();
  starContext.moveTo(star.x, star.y);
  starContext.lineTo(endX, endY);
  starContext.stroke();
}

// Draw the big stars: a soft glow, a bright center, and a slowly pulsing cross of light
function drawFlareStars(time, warp) {
  starContext.lineWidth = 1;
  flareStars.forEach((star) => {
    // Fade the big stars away during a warp jump
    const pulse = (0.8 + 0.2 * Math.sin(time * star.twinkleSpeed + star.twinkleOffset)) * (1 - warp);
    const length = star.size * 1.6 * pulse;

    const glow = starContext.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.size * 0.7);
    glow.addColorStop(0, `rgba(255, 255, 255, ${pulse})`);
    glow.addColorStop(0.12, `rgba(255, 255, 255, ${0.9 * pulse})`);
    glow.addColorStop(0.3, `rgba(${star.color}, ${0.5 * pulse})`);
    glow.addColorStop(1, `rgba(${star.color}, 0)`);
    starContext.fillStyle = glow;
    starContext.beginPath();
    starContext.arc(star.x, star.y, star.size * 0.7, 0, Math.PI * 2);
    starContext.fill();

    drawFlareBeam(star, star.x + length, star.y - length * 0.25, pulse);
    drawFlareBeam(star, star.x - length, star.y + length * 0.25, pulse);
    drawFlareBeam(star, star.x + length * 0.25, star.y + length, pulse);
    drawFlareBeam(star, star.x - length * 0.25, star.y - length, pulse);
  });
}

// Move the stars slowly down the screen, wrapping back to the top at the bottom.
// During a warp jump, they also rush outward from the center, as if we're flying past them.
function moveStars(list, seconds, warp) {
  const centerX = starWidth / 2;
  const centerY = starHeight / 2;

  list.forEach((star) => {
    star.y += star.speed * seconds;
    star.x += (star.x - centerX) * warp * 1.3 * seconds;
    star.y += (star.y - centerY) * warp * 1.3 * seconds;

    if (star.y > starHeight || star.y < 0 || star.x > starWidth || star.x < 0) {
      if (warp > 0.02) {
        // Bring new stars in from around the center while we're flying
        star.x = centerX + randomBetween(-0.3, 0.3) * starWidth;
        star.y = centerY + randomBetween(-0.3, 0.3) * starHeight;
      } else {
        star.y = 0;
        star.x = Math.random() * starWidth;
      }
    }
  });
}

// Start a shooting star near the top of the screen, heading down and to one side
function launchShootingStar() {
  const direction = Math.random() < 0.5 ? 1 : -1;
  const speed = randomBetween(600, 900);
  shootingStar = {
    x: randomBetween(starWidth * 0.1, starWidth * 0.9),
    y: randomBetween(0, starHeight * 0.4),
    speedX: direction * speed * 0.85,
    speedY: speed * 0.5,
    age: 0,
    lifetime: randomBetween(0.6, 1.1)
  };
}

// Move and draw the shooting star, with a tail that fades out behind it
function drawShootingStar(seconds) {
  shootingStar.x += shootingStar.speedX * seconds;
  shootingStar.y += shootingStar.speedY * seconds;
  shootingStar.age += seconds;

  if (shootingStar.age >= shootingStar.lifetime) {
    shootingStar = null;
    return;
  }

  const fade = 1 - shootingStar.age / shootingStar.lifetime;
  const tailX = shootingStar.x - shootingStar.speedX * 0.18;
  const tailY = shootingStar.y - shootingStar.speedY * 0.18;
  const tail = starContext.createLinearGradient(shootingStar.x, shootingStar.y, tailX, tailY);
  tail.addColorStop(0, `rgba(255, 255, 255, ${fade})`);
  tail.addColorStop(1, 'rgba(255, 255, 255, 0)');

  starContext.strokeStyle = tail;
  starContext.lineWidth = 2;
  starContext.beginPath();
  starContext.moveTo(shootingStar.x, shootingStar.y);
  starContext.lineTo(tailX, tailY);
  starContext.stroke();
}

// --- Running the animation ---

// If this device is struggling, draw the nebula at a lower resolution to keep things smooth
function checkSpeed(frameTime) {
  if (frameTime > SLOW_FRAME_MS && frameTime < 1000) {
    slowFrames++;
  }
  if (slowFrames > SLOW_FRAME_LIMIT && nebulaScale > 0.4) {
    nebulaScale = 0.4;
    sizeNebula();
  }
}

// Draw one frame of the animation, then ask the browser for the next one
function animateBackground(time) {
  if (nebulaInProgress) {
    checkNebula();
  }
  checkSpeed(time - lastFrameTime);

  // Limit the time step so nothing jumps after switching back from another tab
  const seconds = Math.min((time - lastFrameTime) / 1000, 0.1);
  lastFrameTime = time;

  if (time - lastNebulaTime >= NEBULA_FRAME_MS) {
    drawNebula(time);
    lastNebulaTime = time;
  }

  const journey = getJourney(time);

  starContext.clearRect(0, 0, starWidth, starHeight);
  moveStars(stars, seconds, journey.warp);
  moveStars(flareStars, seconds, journey.warp);
  drawStars(time, journey.warp);
  drawFlareStars(time, journey.warp);

  if (!shootingStar && time > nextShootingStarTime) {
    launchShootingStar();
    nextShootingStarTime = time + randomBetween(5000, 14000);
  }
  if (shootingStar) {
    drawShootingStar(seconds);
  }

  requestAnimationFrame(animateBackground);
}

// Draw a single still picture, for people who've asked their device to reduce motion
function drawStillBackground() {
  drawNebula(0);
  drawStars(0, 0);
  drawFlareStars(0, 0);
}

// Start the background after the page has loaded, so it doesn't slow down the first look
// at the page. The plain background shows until then, and the animation fades in over it.
let isBackgroundStarted = false;

function startBackground() {
  if (!startSceneWorker()) {
    setupNebula();
  }
  setupStars();
  isBackgroundStarted = true;
  starCanvas.classList.add('ready');

  if (prefersReducedMotion) {
    drawStillWhenReady();
  } else {
    requestAnimationFrame(animateBackground);
  }
}

// For people who've asked their device to reduce motion: wait for the scenes, then draw one still picture
function drawStillWhenReady() {
  if (nebulaInProgress) {
    checkNebula();
    requestAnimationFrame(drawStillWhenReady);
    return;
  }
  drawStillBackground();
}

if (document.readyState === 'complete') {
  setTimeout(startBackground, 300);
} else {
  window.addEventListener('load', () => {
    setTimeout(startBackground, 300);
  });
}

// Redo the background if the window gets wider or taller. Phones change height a little
// while scrolling, as the address bar hides, and that shouldn't reshuffle the stars.
window.addEventListener('resize', () => {
  if (isBackgroundStarted && (window.innerWidth !== starWidth || window.innerHeight > starHeight)) {
    sizeNebula();
    setupStars();
    if (prefersReducedMotion) {
      drawStillBackground();
    }
  }
});

// ----- The Big Bang -----

const bigBangCanvas = document.getElementById('bigBangCanvas');
const bigBangContext = bigBangCanvas.getContext('2d');

// The timeline, in milliseconds from when it starts
const BANG_TIME = 1100; // Everything collapses to a point until now, then it explodes
const CARDS_TIME = 1900; // The photos start flying out of the blast
const UNIVERSE_SHOWN_TIME = 3000; // By now the darkness has cleared to show the universe
const BIG_BANG_END_TIME = 4100;

// The debris colors: white-hot, gold, and the crimson and cyan of the nebula
const DEBRIS_COLORS = ['255, 255, 255', '255, 214, 140', '255, 140, 60', '255, 60, 110', '90, 200, 255', '150, 130, 255'];

let debris = [];
let bangWidth = 0;
let bangHeight = 0;

// Size the canvas and create the debris, each piece with its own direction and speed
function setupBigBang() {
  bangWidth = window.innerWidth;
  bangHeight = window.innerHeight;
  bigBangCanvas.width = bangWidth;
  bigBangCanvas.height = bangHeight;

  const farthest = Math.hypot(bangWidth, bangHeight) / 2;
  const pieceCount = Math.min(1400, Math.round((bangWidth * bangHeight) / 700));
  debris = [];
  for (let i = 0; i < pieceCount; i++) {
    debris.push({
      angle: Math.random() * Math.PI * 2,
      // Most pieces are slow, and a few are very fast
      speed: farthest * (0.03 + 2.4 * Math.pow(Math.random(), 2.2)),
      startDistance: farthest * randomBetween(0.5, 1.3),
      size: randomBetween(0.6, 2.2),
      color: randomItem(DEBRIS_COLORS)
    });
  }
}

// Part 1: everything rushes inward while the screen goes dark and a tiny point glows brighter
function drawCollapse(time) {
  const progress = time / BANG_TIME;
  const centerX = bangWidth / 2;
  const centerY = bangHeight / 2;

  bigBangContext.fillStyle = `rgba(0, 0, 0, ${Math.min(progress * 1.6, 1)})`;
  bigBangContext.fillRect(0, 0, bangWidth, bangHeight);

  // Slow at first and fastest right at the end
  const pull = progress * progress * progress;
  bigBangContext.globalCompositeOperation = 'lighter';
  debris.forEach((piece) => {
    const distance = piece.startDistance * (1 - pull);
    const tail = distance + piece.startDistance * pull * 0.12 + 2;
    bigBangContext.strokeStyle = `rgba(${piece.color}, ${0.25 + progress * 0.6})`;
    bigBangContext.lineWidth = piece.size * 0.7;
    bigBangContext.beginPath();
    bigBangContext.moveTo(centerX + Math.cos(piece.angle) * distance, centerY + Math.sin(piece.angle) * distance);
    bigBangContext.lineTo(centerX + Math.cos(piece.angle) * tail, centerY + Math.sin(piece.angle) * tail);
    bigBangContext.stroke();
  });

  // The point of light, shaking faster as it gets ready to burst
  const radius = 4 + 34 * pull + Math.sin(time * 0.05) * 3 * progress;
  const point = bigBangContext.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
  point.addColorStop(0, 'rgba(255, 255, 255, 1)');
  point.addColorStop(0.3, 'rgba(255, 225, 170, 0.9)');
  point.addColorStop(1, 'rgba(255, 150, 80, 0)');
  bigBangContext.fillStyle = point;
  bigBangContext.beginPath();
  bigBangContext.arc(centerX, centerY, radius, 0, Math.PI * 2);
  bigBangContext.fill();
}

// Draw one soft, glowing ring of the shockwave, fading as it spreads
function drawShockwave(sinceBang, delay, color) {
  const age = sinceBang - delay;
  if (age < 0) {
    return;
  }
  const farthest = Math.hypot(bangWidth, bangHeight) / 2;
  const strength = Math.exp(-age / 600);
  const radius = farthest * 1.6 * (1 - strength);
  const thickness = 18 + farthest * 0.16 * (1 - strength);
  const inner = Math.max(radius - thickness, 0);
  const outer = radius + thickness;

  const ring = bigBangContext.createRadialGradient(bangWidth / 2, bangHeight / 2, inner, bangWidth / 2, bangHeight / 2, outer);
  ring.addColorStop(0, `rgba(${color}, 0)`);
  ring.addColorStop(0.72, `rgba(${color}, ${strength * 0.75})`);
  ring.addColorStop(0.8, `rgba(255, 255, 255, ${strength})`);
  ring.addColorStop(1, `rgba(${color}, 0)`);
  bigBangContext.fillStyle = ring;
  bigBangContext.fillRect(0, 0, bangWidth, bangHeight);
}

// Part 2: the explosion, with debris flying out as the darkness clears to reveal the universe
function drawExplosion(time) {
  const sinceBang = time - BANG_TIME;
  const seconds = sinceBang / 1000;
  const centerX = bangWidth / 2;
  const centerY = bangHeight / 2;
  const farthest = Math.hypot(bangWidth, bangHeight) / 2;

  const darkness = 1 - Math.min(Math.max((time - BANG_TIME - 200) / (UNIVERSE_SHOWN_TIME - BANG_TIME - 200), 0), 1);
  bigBangContext.fillStyle = `rgba(0, 0, 0, ${darkness})`;
  bigBangContext.fillRect(0, 0, bangWidth, bangHeight);

  bigBangContext.globalCompositeOperation = 'lighter';

  // The fireball grows and fades
  const fireballStrength = Math.exp(-sinceBang / 750);
  const fireballRadius = farthest * (0.15 + 0.95 * (1 - Math.exp(-sinceBang / 400)));
  const fireball = bigBangContext.createRadialGradient(centerX, centerY, 0, centerX, centerY, fireballRadius);
  fireball.addColorStop(0, `rgba(255, 255, 255, ${fireballStrength})`);
  fireball.addColorStop(0.2, `rgba(255, 205, 130, ${fireballStrength})`);
  fireball.addColorStop(0.5, `rgba(255, 80, 60, ${fireballStrength * 0.6})`);
  fireball.addColorStop(0.75, `rgba(120, 50, 200, ${fireballStrength * 0.3})`);
  fireball.addColorStop(1, 'rgba(90, 40, 200, 0)');
  bigBangContext.fillStyle = fireball;
  bigBangContext.fillRect(0, 0, bangWidth, bangHeight);

  drawShockwave(sinceBang, 0, '255, 220, 170');
  drawShockwave(sinceBang, 180, '110, 190, 255');

  // Debris shoots out fast, slows down, and fades, leaving streaks behind it
  const pieceFade = Math.max(1 - sinceBang / (BIG_BANG_END_TIME - BANG_TIME), 0);
  const slowing = 1 - Math.exp(-seconds * 2.2);
  const streak = Math.exp(-seconds * 2.2) * 0.14;
  debris.forEach((piece) => {
    const distance = piece.speed * slowing;
    const tail = Math.max(distance - piece.speed * streak, 0);
    bigBangContext.strokeStyle = `rgba(${piece.color}, ${pieceFade})`;
    bigBangContext.lineWidth = piece.size;
    bigBangContext.beginPath();
    bigBangContext.moveTo(centerX + Math.cos(piece.angle) * distance, centerY + Math.sin(piece.angle) * distance);
    bigBangContext.lineTo(centerX + Math.cos(piece.angle) * (tail - 1), centerY + Math.sin(piece.angle) * (tail - 1));
    bigBangContext.stroke();
  });

  // The blinding flash of the bang itself, over the top of everything
  const flash = Math.exp(-sinceBang / 80);
  bigBangContext.globalCompositeOperation = 'source-over';
  bigBangContext.fillStyle = `rgba(255, 244, 222, ${flash})`;
  bigBangContext.fillRect(0, 0, bangWidth, bangHeight);
}

// Draw the Big Bang as it looks at a certain moment
function drawBigBang(time) {
  bigBangContext.globalCompositeOperation = 'source-over';
  bigBangContext.clearRect(0, 0, bangWidth, bangHeight);
  if (time < BANG_TIME) {
    drawCollapse(time);
  } else {
    drawExplosion(time);
  }
}

// Play the Big Bang. The promise it returns finishes when it's time for the photos to appear,
// while the rest of the explosion carries on behind them.
function playBigBang() {
  setupBigBang();
  bigBangCanvas.hidden = false;
  const startTime = performance.now();

  function nextFrame(now) {
    const time = now - startTime;
    if (time >= BIG_BANG_END_TIME) {
      bigBangCanvas.hidden = true;
      return;
    }
    drawBigBang(Math.max(time, 0));
    requestAnimationFrame(nextFrame);
  }
  requestAnimationFrame(nextFrame);

  return new Promise((resolve) => {
    setTimeout(resolve, CARDS_TIME);
  });
}

// Send each new card flying from the center of the window into its place
function launchCardsFromCenter() {
  gallery.querySelectorAll('.gallery-item').forEach((card, index) => {
    const box = card.getBoundingClientRect();
    card.style.setProperty('--from-x', `${window.innerWidth / 2 - (box.left + box.width / 2)}px`);
    card.style.setProperty('--from-y', `${window.innerHeight / 2 - (box.top + box.height / 2)}px`);
    card.style.setProperty('--birth-delay', `${index * 110}ms`);
    card.classList.add('born');

    // Clean up afterward, so the card behaves normally from then on
    card.addEventListener('animationend', () => {
      card.classList.remove('born');
    }, { once: true });
  });
}

// ----- Switching languages -----

const languageSelect = document.getElementById('languageSelect');

// Show the whole page in a language, flipping it to right-to-left for Arabic and Hebrew
function applyLanguage(language) {
  currentLanguage = language;
  document.documentElement.lang = language;
  document.documentElement.dir = LANGUAGES[language].dir;
  languageSelect.value = language;

  // Text written into the page itself is marked with data-i18n="name of the text"
  document.querySelectorAll('[data-i18n]').forEach((element) => {
    element.textContent = t(element.dataset.i18n);
  });
  modalClose.setAttribute('aria-label', t('close'));

  // Redraw the parts that script.js writes. A new language can need a new font, so
  // measure the fact box again once any fonts it needs have finished loading.
  showFact(factOrder[factIndex]);
  reserveFactHeightSoon();
  document.fonts.ready.then(reserveFactHeightSoon);
  setFactPaused(isFactPaused);
  if (galleryState.type === 'cards') {
    renderGallery(galleryState.entries, galleryState.noticeKey);
  } else if (galleryState.type === 'message') {
    showMessage(galleryState.icon, galleryState.messageKey);
  } else if (galleryState.type === 'loading') {
    showLoading();
  }

  // Remember the choice for next time
  try {
    localStorage.setItem('language', language);
  } catch (error) {
    // Saved settings aren't available, so the choice just won't be remembered
  }
}

// ----- More languages, through Google Translate -----

const translatePanel = document.getElementById('translatePanel');
let isGoogleTranslateLoaded = false;

// Load Google's translator the first time someone asks for it, so it never slows down the page otherwise
function loadGoogleTranslate() {
  translatePanel.hidden = false;
  if (isGoogleTranslateLoaded) {
    return;
  }
  isGoogleTranslateLoaded = true;

  // Google calls this function once its code has loaded
  window.startGoogleTranslate = () => {
    new google.translate.TranslateElement({ pageLanguage: 'en', autoDisplay: false }, 'googleTranslate');
  };
  const script = document.createElement('script');
  script.src = 'https://translate.google.com/translate_a/element.js?cb=startGoogleTranslate';
  document.head.appendChild(script);
}

// Turn Google Translate off: forget its cookie, then reload the page in the chosen language
function stopGoogleTranslate(language) {
  try {
    localStorage.setItem('language', language);
  } catch (error) {
    // Saved settings aren't available, so the page will reload in English
  }
  const expired = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
  document.cookie = expired;
  document.cookie = `${expired}; domain=${location.hostname}`;
  document.cookie = `${expired}; domain=.${location.hostname}`;
  location.reload();
}

// Google Translate and browsers' own translators mark the page with a class saying which way
// the new language reads. Follow it, so right-to-left languages like Persian or Urdu flip too.
function followTranslation() {
  const classes = document.documentElement.classList;
  const wasTranslated = isMachineTranslated;
  isMachineTranslated = classes.contains('translated-rtl') || classes.contains('translated-ltr');

  let direction = LANGUAGES[currentLanguage].dir;
  if (classes.contains('translated-rtl')) {
    direction = 'rtl';
  } else if (classes.contains('translated-ltr')) {
    direction = 'ltr';
  }
  if (document.documentElement.dir !== direction) {
    document.documentElement.dir = direction;
  }

  // Switch the fact box between plain text and the word-by-word animation
  if (isMachineTranslated !== wasTranslated) {
    showFact(factOrder[factIndex]);
  }
}

new MutationObserver(followTranslation).observe(document.documentElement, {
  attributes: true,
  attributeFilter: ['class']
});

languageSelect.addEventListener('change', () => {
  const choice = languageSelect.value;

  if (choice === 'more') {
    // Google translates from English, so show the English page first
    if (currentLanguage !== 'en') {
      applyLanguage('en');
    }
    languageSelect.value = 'more';
    loadGoogleTranslate();
  } else if (getGoogleTranslateLanguage() || isGoogleTranslateLoaded) {
    stopGoogleTranslate(choice);
  } else {
    applyLanguage(choice);
  }
});

applyLanguage(currentLanguage);

// If Google Translate was on last time, bring it back once the page has loaded
if (getGoogleTranslateLanguage()) {
  languageSelect.value = 'more';
  window.addEventListener('load', loadGoogleTranslate);
}

// Measure the fact box again whenever the window width changes
let lastFactWidth = window.innerWidth;
window.addEventListener('resize', () => {
  if (window.innerWidth !== lastFactWidth) {
    lastFactWidth = window.innerWidth;
    reserveFactHeight();
  }
});

/** Language display name → locale code (matches Settings language values). */
export const LANGUAGE_TO_LOCALE = {
  English: 'en',
  Spanish: 'es',
  French: 'fr',
  German: 'de',
  Urdu: 'ur',
};

export const DEFAULT_LANGUAGE = 'English';
export const RTL_LOCALES = new Set(['ur']);

const en = {
  nav: {
    home: 'Home',
    explore: 'Explore',
    categories: 'Categories',
    about: 'About',
    notifications: 'Notifications',
    profile: 'Profile',
    settings: 'Settings',
    search: 'Search',
  },
  sidebar: {
    quickLinks: 'Quick Links',
    yourTopics: 'Your topics',
    trending: 'Trending',
    bookmarks: 'Bookmarks',
    recent: 'Recent',
    pics: 'Pics',
    categories: 'Categories',
    about: 'About',
    help: 'Help',
    privacy: 'Privacy',
    terms: 'Terms',
    signInTopics: 'Sign in to see the topics you follow.',
    loadingTopics: 'Loading your topics…',
    noKeywords: 'No keywords yet.',
    browseCategories: 'Browse categories',
  },
  feed: {
    newsfeed: 'Newsfeed',
    forYou: 'For you',
    following: 'Following',
    trending: 'Trending',
    bookmarks: 'Bookmarks',
    noBookmarks: 'No bookmarked articles yet.',
    noArticles: 'No articles to show.',
    personalizeHint: 'Follow topics in Settings to personalize your feed.',
    chooseInterests: 'Choose your interests',
    chooseInterestsDesc: 'Select news categories to see a personalized For You feed.',
    pickCategories: 'Pick categories',
    noMatchYet: 'No articles match your interests yet. Try adding more categories or keywords, then refresh.',
    couldNotLoad: 'Could not load the feed',
    retry: 'Retry',
  },
  pages: {
    categoriesTitle: 'Categories',
    categoriesSubtitle: 'Browse articles by category',
    exploreTitle: 'Explore Articles',
    exploreSubtitle: 'Discover articles from all categories',
    showMore: 'Show more',
    showFewer: 'Show fewer categories',
    articles: 'articles',
    noCategories: 'No categories found',
  },
  settings: {
    title: 'Settings',
    subtitle: 'Manage your account settings and preferences',
    saving: 'Saving changes...',
    saved: 'Settings saved successfully',
    account: 'Account',
    profile: 'Profile',
    profileDesc: 'Edit your profile information',
    editProfile: 'Edit Profile',
    editProfileDesc: 'Update your name, bio, and other details',
    feedChannels: 'Feed & channels',
    feedChannelsDesc: 'Topics you follow in your personalized feed',
    followingChannels: 'Following news channels',
    followingChannelsDesc: 'Choose categories and keywords',
    notifications: 'Notification preferences',
    notificationsDesc: 'Push, email, and keyword alerts',
    pushNotifications: 'Push Notifications',
    pushNotificationsDesc: 'Real-time alerts in the app while you browse',
    emailNotifications: 'Email Notifications',
    emailNotificationsDesc: 'Welcome-back and account alerts (not keyword matches)',
    keywordAlerts: 'Keyword Alerts',
    keywordAlertsDesc: 'Get notified when articles match your keywords',
    quietHours: 'Quiet Hours',
    quietHoursDesc: 'Mute notifications during specific hours',
    privacy: 'Privacy & Security',
    privacyDesc: 'Manage your privacy settings',
    dataStorage: 'Data & Storage',
    dataStorageDesc: 'View and manage your data',
    content: 'Content',
    manageCategories: 'Manage Categories',
    manageCategoriesDesc: 'Customize your news categories',
    preferences: 'Preferences',
    lightMode: 'Light Mode',
    darkMode: 'Dark Mode',
    themeDesc: 'Switch between light and dark theme',
    language: 'Language',
    languageDesc: 'Choose your preferred language',
    timezone: 'Timezone',
    timezoneDesc: 'Set your timezone',
    aboutSection: 'About',
    sendFeedback: 'Send feedback',
    sendFeedbackDesc: 'Tell us about bugs, ideas, or app issues',
    aboutTrak: 'About TRAK',
    aboutTrakDesc: 'Learn more about the app',
    logOut: 'Log Out',
    logOutDesc: 'Sign out of your account',
    logOutConfirmTitle: 'Log out?',
    logOutConfirmMessage: 'Are you sure you want to log out?',
    logOutConfirm: 'Log out',
    to: 'to',
  },
  auth: {
    welcome: 'Welcome to TRAK',
    tagline: 'Your trusted source for verified news',
    getStarted: 'Get Started',
    signIn: 'Sign in',
    signUp: 'Sign up',
    email: 'Email',
    password: 'Password',
    login: 'Log in',
    forgotPassword: 'Forgot password?',
    noAccount: "Don't have an account?",
    haveAccount: 'Already have an account?',
  },
  common: {
    loading: 'Loading...',
    save: 'Save',
    cancel: 'Cancel',
    back: 'Back',
    clearFilters: 'Clear Filters & Show All',
  },
  about: {
    articlesIndexed: 'Articles indexed',
    trustedSources: 'Trusted sources',
    categories: 'News categories',
    missionTitle: 'Our mission',
    missionBody: 'TRAK helps you follow the news that matters with credibility signals, smart categories, and feeds tuned to your interests — on web and mobile.',
    lastUpdated: 'Catalog last updated',
    trustTitle: 'Credibility-first',
    trustBody: 'Every story is scored for source trust and labeled so you can decide quickly what to read and what to verify.',
    techTitle: 'Built with',
  },
  article: {
    back: 'Back',
    loading: 'Loading article…',
    share: 'Share',
    bookmark: 'Bookmark',
    listen: 'Listen',
  },
  profile: {
    title: 'Profile',
    bookmarks: 'Bookmarks',
    liked: 'Liked',
    disliked: 'Disliked',
  },
};

const es = {
  nav: { home: 'Inicio', explore: 'Explorar', categories: 'Categorías', about: 'Acerca de', notifications: 'Notificaciones', profile: 'Perfil', settings: 'Ajustes', search: 'Buscar' },
  sidebar: { quickLinks: 'Enlaces rápidos', yourTopics: 'Tus temas', trending: 'Tendencias', bookmarks: 'Guardados', recent: 'Recientes', pics: 'Fotos', categories: 'Categorías', about: 'Acerca de', help: 'Ayuda', privacy: 'Privacidad', terms: 'Términos', signInTopics: 'Inicia sesión para ver los temas que sigues.', loadingTopics: 'Cargando tus temas…', noKeywords: 'Aún no hay palabras clave.', browseCategories: 'Explorar categorías' },
  feed: { newsfeed: 'Noticias', forYou: 'Para ti', following: 'Siguiendo', trending: 'Tendencias', bookmarks: 'Guardados', noBookmarks: 'Aún no hay artículos guardados.', noArticles: 'No hay artículos para mostrar.', personalizeHint: 'Sigue temas en Ajustes para personalizar tu feed.', chooseInterests: 'Elige tus intereses', chooseInterestsDesc: 'Selecciona categorías para ver un feed personalizado.', pickCategories: 'Elegir categorías', noMatchYet: 'Aún no hay artículos que coincidan con tus intereses.', couldNotLoad: 'No se pudo cargar el feed', retry: 'Reintentar' },
  pages: { categoriesTitle: 'Categorías', categoriesSubtitle: 'Explora artículos por categoría', exploreTitle: 'Explorar artículos', exploreSubtitle: 'Descubre artículos de todas las categorías', showMore: 'Ver más', showFewer: 'Ver menos categorías', articles: 'artículos', noCategories: 'No se encontraron categorías' },
  settings: { title: 'Ajustes', subtitle: 'Administra la configuración y preferencias de tu cuenta', saving: 'Guardando cambios...', saved: 'Ajustes guardados correctamente', account: 'Cuenta', profile: 'Perfil', profileDesc: 'Edita la información de tu perfil', editProfile: 'Editar perfil', editProfileDesc: 'Actualiza tu nombre, biografía y otros datos', feedChannels: 'Feed y canales', feedChannelsDesc: 'Temas que sigues en tu feed personalizado', followingChannels: 'Canales de noticias seguidos', followingChannelsDesc: 'Elige categorías y palabras clave', notifications: 'Preferencias de notificaciones', notificationsDesc: 'Alertas push, correo y palabras clave', pushNotifications: 'Notificaciones push', pushNotificationsDesc: 'Recibe notificaciones en tu navegador', emailNotifications: 'Notificaciones por correo', emailNotificationsDesc: 'Recibe avisos por correo electrónico', keywordAlerts: 'Alertas de palabras clave', keywordAlertsDesc: 'Avisos cuando los artículos coincidan con tus palabras clave', quietHours: 'Horas silenciosas', quietHoursDesc: 'Silencia notificaciones en horarios específicos', privacy: 'Privacidad y seguridad', privacyDesc: 'Administra tu configuración de privacidad', dataStorage: 'Datos y almacenamiento', dataStorageDesc: 'Ver y administrar tus datos', content: 'Contenido', manageCategories: 'Administrar categorías', manageCategoriesDesc: 'Personaliza tus categorías de noticias', preferences: 'Preferencias', lightMode: 'Modo claro', darkMode: 'Modo oscuro', themeDesc: 'Cambiar entre tema claro y oscuro', language: 'Idioma', languageDesc: 'Elige tu idioma preferido', timezone: 'Zona horaria', timezoneDesc: 'Configura tu zona horaria', aboutSection: 'Acerca de', sendFeedback: 'Enviar comentarios', sendFeedbackDesc: 'Cuéntanos sobre errores, ideas o problemas', aboutTrak: 'Acerca de TRAK', aboutTrakDesc: 'Más información sobre la app', logOut: 'Cerrar sesión', logOutDesc: 'Salir de tu cuenta', logOutConfirmTitle: '¿Cerrar sesión?', logOutConfirmMessage: '¿Seguro que quieres cerrar sesión?', logOutConfirm: 'Cerrar sesión', to: 'a' },
  auth: { welcome: 'Bienvenido a TRAK', tagline: 'Tu fuente confiable de noticias verificadas', getStarted: 'Comenzar', signIn: 'Iniciar sesión', signUp: 'Registrarse', email: 'Correo', password: 'Contraseña', login: 'Iniciar sesión', forgotPassword: '¿Olvidaste tu contraseña?', noAccount: '¿No tienes cuenta?', haveAccount: '¿Ya tienes cuenta?' },
  common: { loading: 'Cargando...', save: 'Guardar', cancel: 'Cancelar', back: 'Atrás', clearFilters: 'Borrar filtros y mostrar todo' },
};

const fr = {
  nav: { home: 'Accueil', explore: 'Explorer', categories: 'Catégories', about: 'À propos', notifications: 'Notifications', profile: 'Profil', settings: 'Paramètres', search: 'Rechercher' },
  sidebar: { quickLinks: 'Liens rapides', yourTopics: 'Vos sujets', trending: 'Tendances', bookmarks: 'Favoris', recent: 'Récents', pics: 'Photos', categories: 'Catégories', about: 'À propos', help: 'Aide', privacy: 'Confidentialité', terms: 'Conditions', signInTopics: 'Connectez-vous pour voir les sujets suivis.', loadingTopics: 'Chargement de vos sujets…', noKeywords: 'Pas encore de mots-clés.', browseCategories: 'Parcourir les catégories' },
  feed: { newsfeed: 'Fil d\'actualité', forYou: 'Pour vous', following: 'Abonnements', trending: 'Tendances', bookmarks: 'Favoris', noBookmarks: 'Aucun article en favori.', noArticles: 'Aucun article à afficher.', personalizeHint: 'Suivez des sujets dans Paramètres pour personnaliser votre fil.', chooseInterests: 'Choisissez vos centres d\'intérêt', chooseInterestsDesc: 'Sélectionnez des catégories pour un fil personnalisé.', pickCategories: 'Choisir des catégories', noMatchYet: 'Aucun article ne correspond encore à vos intérêts.', couldNotLoad: 'Impossible de charger le fil', retry: 'Réessayer' },
  pages: { categoriesTitle: 'Catégories', categoriesSubtitle: 'Parcourir les articles par catégorie', exploreTitle: 'Explorer les articles', exploreSubtitle: 'Découvrez des articles de toutes les catégories', showMore: 'Voir plus', showFewer: 'Voir moins de catégories', articles: 'articles', noCategories: 'Aucune catégorie trouvée' },
  settings: { title: 'Paramètres', subtitle: 'Gérez les paramètres et préférences de votre compte', saving: 'Enregistrement...', saved: 'Paramètres enregistrés', account: 'Compte', profile: 'Profil', profileDesc: 'Modifier les informations du profil', editProfile: 'Modifier le profil', editProfileDesc: 'Mettre à jour nom, bio et autres détails', feedChannels: 'Fil et chaînes', feedChannelsDesc: 'Sujets suivis dans votre fil personnalisé', followingChannels: 'Chaînes d\'actualités suivies', followingChannelsDesc: 'Choisir catégories et mots-clés', notifications: 'Préférences de notification', notificationsDesc: 'Alertes push, e-mail et mots-clés', pushNotifications: 'Notifications push', pushNotificationsDesc: 'Recevoir des notifications dans le navigateur', emailNotifications: 'Notifications par e-mail', emailNotificationsDesc: 'Recevoir des alertes par e-mail', keywordAlerts: 'Alertes mots-clés', keywordAlertsDesc: 'Alertes quand des articles correspondent à vos mots-clés', quietHours: 'Heures silencieuses', quietHoursDesc: 'Couper les notifications à certaines heures', privacy: 'Confidentialité et sécurité', privacyDesc: 'Gérer vos paramètres de confidentialité', dataStorage: 'Données et stockage', dataStorageDesc: 'Voir et gérer vos données', content: 'Contenu', manageCategories: 'Gérer les catégories', manageCategoriesDesc: 'Personnaliser vos catégories d\'actualités', preferences: 'Préférences', lightMode: 'Mode clair', darkMode: 'Mode sombre', themeDesc: 'Basculer entre thème clair et sombre', language: 'Langue', languageDesc: 'Choisissez votre langue préférée', timezone: 'Fuseau horaire', timezoneDesc: 'Définir votre fuseau horaire', aboutSection: 'À propos', sendFeedback: 'Envoyer un avis', sendFeedbackDesc: 'Signaler des bugs, idées ou problèmes', aboutTrak: 'À propos de TRAK', aboutTrakDesc: 'En savoir plus sur l\'application', logOut: 'Déconnexion', logOutDesc: 'Se déconnecter du compte', logOutConfirmTitle: 'Se déconnecter ?', logOutConfirmMessage: 'Voulez-vous vraiment vous déconnecter ?', logOutConfirm: 'Déconnexion', to: 'à' },
  auth: { welcome: 'Bienvenue sur TRAK', tagline: 'Votre source fiable d\'actualités vérifiées', getStarted: 'Commencer', signIn: 'Se connecter', signUp: 'S\'inscrire', email: 'E-mail', password: 'Mot de passe', login: 'Connexion', forgotPassword: 'Mot de passe oublié ?', noAccount: 'Pas de compte ?', haveAccount: 'Déjà un compte ?' },
  common: { loading: 'Chargement...', save: 'Enregistrer', cancel: 'Annuler', back: 'Retour', clearFilters: 'Effacer les filtres et tout afficher' },
};

const de = {
  nav: { home: 'Start', explore: 'Entdecken', categories: 'Kategorien', about: 'Über uns', notifications: 'Benachrichtigungen', profile: 'Profil', settings: 'Einstellungen', search: 'Suche' },
  sidebar: { quickLinks: 'Schnellzugriff', yourTopics: 'Deine Themen', trending: 'Trends', bookmarks: 'Lesezeichen', recent: 'Zuletzt', pics: 'Bilder', categories: 'Kategorien', about: 'Über uns', help: 'Hilfe', privacy: 'Datenschutz', terms: 'AGB', signInTopics: 'Melde dich an, um deine Themen zu sehen.', loadingTopics: 'Themen werden geladen…', noKeywords: 'Noch keine Stichwörter.', browseCategories: 'Kategorien durchsuchen' },
  feed: { newsfeed: 'Nachrichten', forYou: 'Für dich', following: 'Abonniert', trending: 'Trends', bookmarks: 'Lesezeichen', noBookmarks: 'Noch keine Lesezeichen.', noArticles: 'Keine Artikel anzuzeigen.', personalizeHint: 'Folge Themen in Einstellungen, um deinen Feed anzupassen.', chooseInterests: 'Wähle deine Interessen', chooseInterestsDesc: 'Wähle Kategorien für einen personalisierten Feed.', pickCategories: 'Kategorien wählen', noMatchYet: 'Noch keine passenden Artikel für deine Interessen.', couldNotLoad: 'Feed konnte nicht geladen werden', retry: 'Erneut versuchen' },
  pages: { categoriesTitle: 'Kategorien', categoriesSubtitle: 'Artikel nach Kategorie durchsuchen', exploreTitle: 'Artikel entdecken', exploreSubtitle: 'Artikel aus allen Kategorien entdecken', showMore: 'Mehr anzeigen', showFewer: 'Weniger Kategorien', articles: 'Artikel', noCategories: 'Keine Kategorien gefunden' },
  settings: { title: 'Einstellungen', subtitle: 'Kontoeinstellungen und Präferenzen verwalten', saving: 'Änderungen werden gespeichert...', saved: 'Einstellungen gespeichert', account: 'Konto', profile: 'Profil', profileDesc: 'Profilinformationen bearbeiten', editProfile: 'Profil bearbeiten', editProfileDesc: 'Name, Bio und weitere Details aktualisieren', feedChannels: 'Feed & Kanäle', feedChannelsDesc: 'Themen in deinem personalisierten Feed', followingChannels: 'Gefolgte Nachrichtenkanäle', followingChannelsDesc: 'Kategorien und Stichwörter wählen', notifications: 'Benachrichtigungseinstellungen', notificationsDesc: 'Push-, E-Mail- und Stichwort-Alerts', pushNotifications: 'Push-Benachrichtigungen', pushNotificationsDesc: 'Benachrichtigungen im Browser erhalten', emailNotifications: 'E-Mail-Benachrichtigungen', emailNotificationsDesc: 'Benachrichtigungen per E-Mail', keywordAlerts: 'Stichwort-Alerts', keywordAlertsDesc: 'Benachrichtigung bei passenden Artikeln', quietHours: 'Ruhezeiten', quietHoursDesc: 'Benachrichtigungen zu bestimmten Zeiten stummschalten', privacy: 'Datenschutz & Sicherheit', privacyDesc: 'Datenschutzeinstellungen verwalten', dataStorage: 'Daten & Speicher', dataStorageDesc: 'Daten anzeigen und verwalten', content: 'Inhalt', manageCategories: 'Kategorien verwalten', manageCategoriesDesc: 'Nachrichtenkategorien anpassen', preferences: 'Präferenzen', lightMode: 'Hellmodus', darkMode: 'Dunkelmodus', themeDesc: 'Zwischen hellem und dunklem Theme wechseln', language: 'Sprache', languageDesc: 'Bevorzugte Sprache wählen', timezone: 'Zeitzone', timezoneDesc: 'Zeitzone festlegen', aboutSection: 'Über', sendFeedback: 'Feedback senden', sendFeedbackDesc: 'Fehler, Ideen oder Probleme melden', aboutTrak: 'Über TRAK', aboutTrakDesc: 'Mehr über die App erfahren', logOut: 'Abmelden', logOutDesc: 'Vom Konto abmelden', logOutConfirmTitle: 'Abmelden?', logOutConfirmMessage: 'Möchtest du dich wirklich abmelden?', logOutConfirm: 'Abmelden', to: 'bis' },
  auth: { welcome: 'Willkommen bei TRAK', tagline: 'Deine vertrauenswürdige Quelle für verifizierte Nachrichten', getStarted: 'Loslegen', signIn: 'Anmelden', signUp: 'Registrieren', email: 'E-Mail', password: 'Passwort', login: 'Anmelden', forgotPassword: 'Passwort vergessen?', noAccount: 'Noch kein Konto?', haveAccount: 'Bereits ein Konto?' },
  common: { loading: 'Laden...', save: 'Speichern', cancel: 'Abbrechen', back: 'Zurück', clearFilters: 'Filter löschen & alles anzeigen' },
};

const ur = {
  nav: { home: 'ہوم', explore: 'دریافت', categories: 'زمرے', about: 'تعارف', notifications: 'اطلاعات', profile: 'پروفائل', settings: 'ترتیبات', search: 'تلاش' },
  sidebar: { quickLinks: 'فوری لنکس', yourTopics: 'آپ کے موضوعات', trending: 'رجحان', bookmarks: 'محفوظ', recent: 'حالیہ', pics: 'تصاویر', categories: 'زمرے', about: 'تعارف', help: 'مدد', privacy: 'رازداری', terms: 'شرائط', signInTopics: 'اپنے موضوعات دیکھنے کے لیے سائن ان کریں۔', loadingTopics: 'موضوعات لوڈ ہو رہے ہیں…', noKeywords: 'ابھی کوئی کلیدی الفاظ نہیں۔', browseCategories: 'زمرے دیکھیں' },
  feed: { newsfeed: 'نیوز فیڈ', forYou: 'آپ کے لیے', following: 'فالونگ', trending: 'رجحان', bookmarks: 'محفوظ', noBookmarks: 'ابھی کوئی محفوظ مضمون نہیں۔', noArticles: 'دکھانے کے لیے کوئی مضمون نہیں۔', personalizeHint: 'اپنی فیڈ ذاتی بنانے کے لیے ترتیبات میں موضوعات فالو کریں۔', chooseInterests: 'اپنی دلچسپیاں منتخب کریں', chooseInterestsDesc: 'ذاتی فیڈ کے لیے نیوز زمرے منتخب کریں۔', pickCategories: 'زمرے منتخب کریں', noMatchYet: 'ابھی آپ کی دلچسپیوں سے کوئی مضمون نہیں ملا۔', couldNotLoad: 'فیڈ لوڈ نہیں ہو سکی', retry: 'دوبارہ کوشش کریں' },
  pages: { categoriesTitle: 'زمرے', categoriesSubtitle: 'زمرے کے لحاظ سے مضامین دیکھیں', exploreTitle: 'مضامین دریافت کریں', exploreSubtitle: 'تمام زمرے سے مضامین دریافت کریں', showMore: 'مزید دکھائیں', showFewer: 'کم زمرے دکھائیں', articles: 'مضامین', noCategories: 'کوئی زمرہ نہیں ملا' },
  settings: { title: 'ترتیبات', subtitle: 'اکاؤنٹ کی ترتیبات اور ترجیحات منظم کریں', saving: 'تبدیلیاں محفوظ ہو رہی ہیں...', saved: 'ترتیبات کامیابی سے محفوظ ہو گئیں', account: 'اکاؤنٹ', profile: 'پروفائل', profileDesc: 'اپنی پروفائل کی معلومات میں ترمیم کریں', editProfile: 'پروفائل میں ترمیم', editProfileDesc: 'نام، بائیو اور دیگر تفصیلات اپ ڈیٹ کریں', feedChannels: 'فیڈ اور چینلز', feedChannelsDesc: 'آپ کی ذاتی فیڈ میں فالو کیے گئے موضوعات', followingChannels: 'فالو کیے گئے نیوز چینلز', followingChannelsDesc: 'زمرے اور کلیدی الفاظ منتخب کریں', notifications: 'اطلاعات کی ترجیحات', notificationsDesc: 'پش، ای میل اور کلیدی الفاظ کی الرٹس', pushNotifications: 'پش اطلاعات', pushNotificationsDesc: 'براؤزر میں اطلاعات وصول کریں', emailNotifications: 'ای میل اطلاعات', emailNotificationsDesc: 'ای میل کے ذریعے اطلاعات', keywordAlerts: 'کلیدی الفاظ کی الرٹس', keywordAlertsDesc: 'جب مضامین آپ کے الفاظ سے ملیں تو اطلاع', quietHours: 'خاموش اوقات', quietHoursDesc: 'مخصوص اوقات میں اطلاعات بند کریں', privacy: 'رازداری اور سیکیورٹی', privacyDesc: 'رازداری کی ترتیبات منظم کریں', dataStorage: 'ڈیٹا اور اسٹوریج', dataStorageDesc: 'اپنا ڈیٹا دیکھیں اور منظم کریں', content: 'مواد', manageCategories: 'زمرے منظم کریں', manageCategoriesDesc: 'نیوز زمرے حسبِ منشا بنائیں', preferences: 'ترجیحات', lightMode: 'لائٹ موڈ', darkMode: 'ڈارک موڈ', themeDesc: 'لائٹ اور ڈارک تھیم کے درمیان سوئچ کریں', language: 'زبان', languageDesc: 'اپنی پسندیدہ زبان منتخب کریں', timezone: 'ٹائم زون', timezoneDesc: 'اپنا ٹائم زون سیٹ کریں', aboutSection: 'تعارف', sendFeedback: 'رائے بھیجیں', sendFeedbackDesc: 'بگز، خیالات یا مسائل بتائیں', aboutTrak: 'TRAK کے بارے میں', aboutTrakDesc: 'ایپ کے بارے میں مزید جانیں', logOut: 'لاگ آؤٹ', logOutDesc: 'اپنے اکاؤنٹ سے سائن آؤٹ کریں', logOutConfirmTitle: 'لاگ آؤٹ؟', logOutConfirmMessage: 'کیا آپ واقعی لاگ آؤٹ کرنا چاہتے ہیں؟', logOutConfirm: 'لاگ آؤٹ', to: 'تا' },
  auth: { welcome: 'TRAK میں خوش آمدید', tagline: 'تصدیق شدہ خبروں کا قابلِ اعتماد ذریعہ', getStarted: 'شروع کریں', signIn: 'سائن ان', signUp: 'سائن اپ', email: 'ای میل', password: 'پاس ورڈ', login: 'لاگ ان', forgotPassword: 'پاس ورڈ بھول گئے؟', noAccount: 'اکاؤنٹ نہیں ہے؟', haveAccount: 'پہلے سے اکاؤنٹ ہے؟' },
  common: { loading: 'لوڈ ہو رہا ہے...', save: 'محفوظ کریں', cancel: 'منسوخ', back: 'واپس', clearFilters: 'فلٹرز صاف کریں اور سب دکھائیں' },
};

export const translations = { en, es, fr, de, ur };

function resolve(obj, path) {
  return path.split('.').reduce((acc, key) => (acc && acc[key] != null ? acc[key] : undefined), obj);
}

export function translate(locale, key, fallback) {
  const primary = resolve(translations[locale], key);
  if (primary != null) return primary;
  const english = resolve(translations.en, key);
  if (english != null) return english;
  return fallback ?? key;
}

export function readStoredLanguage() {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;
  try {
    const raw = window.localStorage.getItem('userSettings');
    if (!raw) return DEFAULT_LANGUAGE;
    const lang = JSON.parse(raw)?.language;
    return LANGUAGE_TO_LOCALE[lang] ? lang : DEFAULT_LANGUAGE;
  } catch {
    return DEFAULT_LANGUAGE;
  }
}

export function persistLanguage(languageName) {
  if (typeof window === 'undefined') return;
  try {
    const raw = window.localStorage.getItem('userSettings');
    const prev = raw ? JSON.parse(raw) : {};
    window.localStorage.setItem('userSettings', JSON.stringify({ ...prev, language: languageName }));
  } catch {
    // ignore
  }
}

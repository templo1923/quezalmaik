// sw.js - El Filtro Maik Sport (Estilo Adblock)
const BLACKLIST = [
    'acscdn.com',
    'popads.net',
    'onclickads.net',
    'adsterra.com',
    'doubleclick.net',
    'adnxs.com',
    'mads.com',
    'proads.cc',
    'agacelele.com', // Nuevo: Muy común en Win Sports
    'safelinks.top', // Nuevo: Acortadores basura
    'clismedia.com'  // Nuevo: Publicidad invisible
];

self.addEventListener('fetch', (event) => {
    const url = event.request.url;

    // REGLA DE ORO: Si es el video (m3u8 o .ts), DÉJALO PASAR
    if (url.includes('.m3u8') || url.includes('.ts') || url.includes('fubohd.com')) {
        return; 
    }

    // Si la petición va para un dominio de anuncios, la MATAMOS
    const isAds = BLACKLIST.some(domain => url.includes(domain));
    
    if (isAds) {
        console.log('🚫 Maik Shield bloqueó anuncio:', url);
        event.respondWith(new Response('', { status: 403, statusText: 'Blocked' }));
    }
});

$(document).ready(function() {
    // DETECTOR DE ENTORNO: Si es tu PC usa el público, si es Vercel usa EL TUYO (Más rápido)
    const esLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    
    const PROXY = esLocal 
        ? "https://api.allorigins.win/get?url=" 
        : "/api/proxy?url=";

    const TARGET = encodeURIComponent("https://www.rojadirectatv3.pl/agenda.php");
    const AGENDA_URL = PROXY + TARGET;
    
    const agendaLista = $('#agenda-lista');

    // MOTOR 1: CARGAR LA AGENDA (Rápido y simple)
    async function cargarAgenda() {
        try {
            const res = await fetch(PROXY + TARGET);
            const data = await res.json();
            const doc = new DOMParser().parseFromString(data.contents, 'text/html');
            const partidos = doc.querySelectorAll('.menu > li');

            if (partidos.length === 0) return;
            agendaLista.empty();

            partidos.forEach(partido => {
                const link = partido.querySelector('a');
                if (!link) return;

                const titulo = link.textContent.split('\n')[0].trim();
                const hora = link.querySelector('.t')?.textContent.trim() || "--:--";

                let canalesHtml = '<div class="canales" style="display:none;">';
                const linksCanales = partido.querySelectorAll('ul li a');

                linksCanales.forEach(c => {
                    const nombre = c.textContent.trim();
                    // Guardamos la URL de RojaDirecta en un atributo 'data-capo'
                    canalesHtml += `<a href="#" data-capo="${c.href}" class="canal-link">➤ ${nombre}</a>`;
                });
                canalesHtml += '</div>';

                const html = `
                    <div class="evento-contenedor">
                        <div class="evento" style="cursor:pointer; padding:12px; border-bottom:1px solid #333;">
                            <span style="color:#ff4d4d; font-weight:bold;">${hora}</span> - <span style="color:white;">${titulo}</span>
                        </div>
                        ${canalesHtml}
                    </div>`;
                agendaLista.append(html);
            });
        } catch (e) { console.error("Error agenda"); }
    }

    // MOTOR 2: EL EXTRACTOR (Se activa al dar CLIC)
    agendaLista.on('click', '.canal-link', async function(e) {
        e.preventDefault();
        const btn = $(this);
        const urlOriginal = btn.attr('data-capo'); // La web de RojaDirecta con anuncios
        
        btn.text('⌛ Limpiando señal...');

        try {
            // Entramos un segundo a la web de ellos para "robar" el link de CapoPlay
            const res = await fetch(PROXY + encodeURIComponent(urlOriginal));
            const data = await res.json();
            const doc = new DOMParser().parseFromString(data.contents, 'text/html');
            
            // Buscamos el iframe que realmente tiene el video (CapoPlay o CapoPlayer)
            const iframe = doc.querySelector('iframe[src*="capoplay"], iframe[src*="capoplayer"]');
            
            if (iframe && iframe.src) {
                // EXITO: Tenemos el link limpio de CapoPlay
                const linkLimpio = iframe.src;
                window.open(`embed/eventos.html?r=${btoa(linkLimpio)}`, '_blank');
            } else {
                // FALLBACK: Si no encontramos el link limpio, abrimos el original para no fallar
                window.open(`embed/eventos.html?r=${btoa(urlOriginal)}`, '_blank');
            }
        } catch (err) {
            window.open(`embed/eventos.html?r=${btoa(urlOriginal)}`, '_blank');
        } finally {
            btn.text('➤ ' + btn.text().replace('⌛ Limpiando señal...', '').trim());
        }
    });

    agendaLista.on('click', '.evento', function() {
        $(this).siblings('.canales').slideToggle('fast');
    });

    cargarAgenda();
});

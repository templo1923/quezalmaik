$(document).ready(function() {
    const esLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    
    // Usamos tu proxy de Vercel que es el que no te da error 408
    const PROXY = esLocal 
        ? "https://api.allorigins.win/get?url=" 
        : "/api/proxy?url=";

    const TARGET = encodeURIComponent("https://www.rojadirectatv3.pl/agenda.php");
    const agendaLista = $('#agenda-lista');

    // MOTOR 1: CARGAR LA AGENDA
    async function cargarAgenda() {
        try {
            const res = await fetch(PROXY + TARGET);
            const data = await res.json();
            // AllOrigins mete todo en data.contents
            const html = esLocal ? data.contents : data.contents; 
            const doc = new DOMParser().parseFromString(data.contents, 'text/html');
            const partidos = doc.querySelectorAll('.menu > li');

            if (partidos.length === 0) {
                agendaLista.html('<p style="color:white; text-align:center;">No hay eventos disponibles ahora.</p>');
                return;
            }
            
            agendaLista.empty();

            partidos.forEach(partido => {
                const link = partido.querySelector('a');
                if (!link) return;

                const titulo = link.textContent.split('\n')[0].trim();
                const hora = link.querySelector('.t')?.textContent.trim() || "--:--";

                let canalesHtml = '<div class="canales" style="display:none; background: #1b263b; padding: 5px;">';
                const linksCanales = partido.querySelectorAll('ul li a');

                linksCanales.forEach(c => {
                    const nombre = c.textContent.trim();
                    // Importante: No dejar que los links sean relativos
                    let href = c.href;
                    if (href.startsWith('window.location')) {
                        // Limpieza por si RojaDirecta intenta bloquear el href
                        href = c.getAttribute('onclick').match(/'(.*?)'/)[1];
                    }
                    canalesHtml += `<a href="#" data-capo="${href}" class="canal-link" style="display:block; color:#60a5fa; padding:8px; text-decoration:none; border-bottom:1px solid #2a3a4d;">➤ ${nombre}</a>`;
                });
                canalesHtml += '</div>';

                const htmlRow = `
                    <div class="evento-contenedor" style="border-bottom: 1px solid #333;">
                        <div class="evento" style="cursor:pointer; padding:15px; display:flex; justify-content:space-between; align-items:center;">
                            <span style="color:white;">${titulo}</span>
                            <span style="color:#ff4d4d; font-weight:bold; background:#2a2a2a; padding:2px 8px; border-radius:5px;">${hora}</span>
                        </div>
                        ${canalesHtml}
                    </div>`;
                agendaLista.append(htmlRow);
            });
        } catch (e) { 
            console.error("Error cargando la agenda:", e);
            agendaLista.html('<p style="color:white; text-align:center;">Error al conectar con la señal. Reintenta.</p>');
        }
    }

    // MOTOR 2: EL EXTRACTOR (Limpiador de señales)
    agendaLista.on('click', '.canal-link', async function(e) {
        e.preventDefault();
        const btn = $(this);
        const urlOriginal = btn.attr('data-capo');
        
        const originalText = btn.text();
        btn.text('⌛ Limpiando señal...');

        try {
            // Entramos a la web de RojaDirecta a buscar el iframe
            const res = await fetch(PROXY + encodeURIComponent(urlOriginal));
            const data = await res.json();
            const doc = new DOMParser().parseFromString(data.contents, 'text/html');
            
            // Buscamos el iframe que apunta a CapoPlay o similares
            const iframe = doc.querySelector('iframe[src*="capo"], iframe[src*="player"], iframe[src*="stream"]');
            
            if (iframe && iframe.src) {
                // Si encontramos el link de CapoPlay, lo mandamos encriptado a tu eventos.html
                window.open(`embed/eventos.html?r=${btoa(iframe.src)}`, '_blank');
            } else {
                // Si no hay iframe (caso raro), mandamos la URL original
                window.open(`embed/eventos.html?r=${btoa(urlOriginal)}`, '_blank');
            }
        } catch (err) {
            console.error("Fallo extracción:", err);
            window.open(`embed/eventos.html?r=${btoa(urlOriginal)}`, '_blank');
        } finally {
            btn.text(originalText);
        }
    });

    // Acordeón para mostrar canales
    agendaLista.on('click', '.evento', function() {
        $(this).siblings('.canales').slideToggle('fast');
    });

    cargarAgenda();
});

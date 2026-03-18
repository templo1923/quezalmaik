$(document).ready(function() {
    const PROXY_URL = "https://api.allorigins.win/get?url=";
    const TARGET_URL = encodeURIComponent("https://www.rojadirectatv3.pl/agenda.php");
    const AGENDA_URL = PROXY_URL + TARGET_URL;
    
    const agendaLista = $('#agenda-lista');

    async function cargarAgenda() {
        try {
            const respuesta = await fetch(AGENDA_URL);
            const data = await respuesta.json();
            const doc = new DOMParser().parseFromString(data.contents, 'text/html');
            const partidosRaw = doc.querySelectorAll('.menu > li');

            if (partidosRaw.length === 0) {
                agendaLista.html('<p style="text-align:center; color:white; margin-top:20px;">No hay eventos disponibles.</p>');
                return;
            }

            agendaLista.empty();

            partidosRaw.forEach(partido => {
                const linkPrincipal = partido.querySelector('a');
                if (!linkPrincipal) return;

                const titulo = linkPrincipal.textContent.split('\n')[0].trim();
                const horaLocal = linkPrincipal.querySelector('.t')?.textContent.trim() || "--:--";

                let canalesHtml = '<div class="canales" style="display:none; background: rgba(0,0,0,0.3);">';
                const subitems = partido.querySelectorAll('ul li a');
                
                subitems.forEach(canal => {
                    const nombreCanal = canal.textContent.trim();
                    let hrefOriginal = canal.href;

                    // Corrección de rutas relativas
                    if (hrefOriginal.includes('applewebdata') || !hrefOriginal.startsWith('http')) {
                        const slug = hrefOriginal.split('/').pop();
                        hrefOriginal = `https://www.rojadirectatv3.pl/${slug}`;
                    }

                    canalesHtml += `<a href="#" data-url="${hrefOriginal}" class="canal-link" style="display:block; padding:12px; color:#60a5fa; text-decoration:none; border-bottom:1px solid #222;">➤ ${nombreCanal}</a>`;
                });
                
                canalesHtml += '</div>';
                
                const eventoHtml = `
                    <div class="evento-contenedor" style="margin-bottom:8px; border-radius:10px; overflow:hidden; border: 1px solid #333;">
                        <div class="evento" style="padding:15px; background:#1b263b; cursor:pointer; display:flex; justify-content:space-between; align-items:center;">
                            <span style="color:#f87171; font-weight:bold; font-size:14px;">${horaLocal}</span>
                            <span style="color:white; flex:1; margin-left:15px; font-weight:500;">${titulo}</span>
                            <i class="fas fa-chevron-down" style="color:#60a5fa; font-size:12px;"></i>
                        </div>
                        ${canalesHtml}
                    </div>`;
                agendaLista.append(eventoHtml);
            });
        } catch (error) { 
            console.error("Error cargando agenda:", error);
            agendaLista.html('<p style="text-align:center; color:white;">Error de conexión con la agenda.</p>');
        }
    }

    // LÓGICA DEL DETECTIVE: Extrae el iframe real al hacer clic
    agendaLista.on('click', '.canal-link', async function(e) {
        e.preventDefault();
        const btn = $(this);
        const urlCascara = btn.attr('data-url');
        const textoOriginal = btn.text();
        
        btn.html('<i class="fas fa-spinner fa-spin"></i> Buscando señal limpia...');

        try {
            // Entramos a la página del canal (Pirlo, RojaDirecta, etc.)
            const response = await fetch(PROXY_URL + encodeURIComponent(urlCascara));
            const data = await response.json();
            const pageDoc = new DOMParser().parseFromString(data.contents, 'text/html');
            
            // Buscamos el iframe que apunta a capoplay o capoplayer
            const iframe = pageDoc.querySelector('iframe[src*="capoplay.net"], iframe[src*="capoplayer.net"]');
            
            if (iframe && iframe.src) {
                // Abrimos tu reproductor con el link REAL del video
                window.open(`embed/eventos.html?r=${btoa(iframe.src)}`, '_blank');
            } else {
                // Si no encontramos el iframe, mandamos la original como respaldo
                window.open(`embed/eventos.html?r=${btoa(urlCascara)}`, '_blank');
            }
        } catch (err) {
            console.error("Error de extracción:", err);
            window.open(`embed/eventos.html?r=${btoa(urlCascara)}`, '_blank');
        } finally {
            btn.text(textoOriginal);
        }
    });

    // Abrir/Cerrar canales
    agendaLista.on('click', '.evento', function() {
        $(this).siblings('.canales').slideToggle('fast');
        $(this).find('i').toggleClass('fa-chevron-down fa-chevron-up');
    });

    cargarAgenda();
});

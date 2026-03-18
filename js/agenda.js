$(document).ready(function() {
    // Usamos AllOrigins para saltar el bloqueo de CORS en Vercel
    const PROXY_URL = "https://api.allorigins.win/get?url=";
    const TARGET_URL = encodeURIComponent("https://www.rojadirectatv3.pl/agenda.php");
    const AGENDA_URL = PROXY_URL + TARGET_URL;
    
    const agendaLista = $('#agenda-lista');
    const tituloAgenda = $('#agenda-titulo');

    async function cargarAgenda() {
        try {
            const respuesta = await fetch(AGENDA_URL);
            const data = await respuesta.json();
            const doc = new DOMParser().parseFromString(data.contents, 'text/html');
            const partidosRaw = doc.querySelectorAll('.menu > li');

            agendaLista.empty();
            tituloAgenda.text('AGENDA - ' + new Date().getDate() + ' DE ' + new Date().toLocaleString('es-ES', { month: 'long' }).toUpperCase());

            partidosRaw.forEach(partido => {
                const linkPrincipal = partido.querySelector('a');
                if (!linkPrincipal) return;

                const titulo = linkPrincipal.textContent.split('\n')[0].trim();
                const horaLocal = linkPrincipal.querySelector('.t')?.textContent.trim() || "--:--";

                let canalesHtml = '<div class="canales">';
                const subitems = partido.querySelectorAll('ul li a');
                
                subitems.forEach(canal => {
                    const nombreCanal = canal.textContent.trim();
                    const hrefOriginal = canal.href;
                    let streamID = "";

                    // 1. Intentamos extraer el ID del canal directamente de la URL de Rojadirecta
                    if (hrefOriginal.includes('capoplay.net/')) {
                        // Extrae el nombre del archivo antes del .php (ej: winsportsplus)
                        streamID = hrefOriginal.split('capoplay.net/')[1].split('.php')[0];
                    } 
                    else if (hrefOriginal.includes('?r=')) {
                        // Si viene codificado, lo decodificamos para buscar el ID
                        try {
                            const r = new URLSearchParams(hrefOriginal.split('?')[1]).get("r");
                            const decoded = atob(r);
                            if (decoded.includes('live=')) {
                                streamID = new URLSearchParams(decoded.split('?')[1]).get("live");
                            }
                        } catch(e) { console.error("Error decodificando r:", e); }
                    }

                    let urlFinal;
                    if (streamID) {
                        // 2. Construimos el link DIRECTO al reproductor de Capo (capo2.php)
                        const urlCapoDirecto = `https://capo7play.com/capo2.php?player=desktop&live=${streamID}`;
                        urlFinal = `embed/eventos.html?r=${btoa(urlCapoDirecto)}`;
                    } else {
                        // Link de respaldo usando el parámetro original
                        const rParam = hrefOriginal.includes('?r=') ? 
                            new URLSearchParams(hrefOriginal.split('?')[1]).get("r") : 
                            btoa(hrefOriginal);
                        urlFinal = `embed/eventos.html?r=${rParam}`;
                    }

                    canalesHtml += `<a href="${urlFinal}" class="canal-link">➤ ${nombreCanal}</a>`;
                });
                
                canalesHtml += '</div>';
                
                const eventoHtml = `
                    <div class="evento-contenedor">
                        <div class="evento">
                            <div class="hora">${horaLocal}</div>
                            <img src="https://i.imgur.com/Vdef5Rz.png" class="evento-icono">
                            <div class="info-evento">${titulo}</div>
                            <div class="flecha">›</div>
                        </div>
                        ${canalesHtml}
                    </div>`;
                agendaLista.append(eventoHtml);
            });
        } catch (error) {
            console.error("Error cargando agenda:", error);
        }
    }

    // INTERCEPTOR DE CLIC: Forzamos la apertura en tu reproductor
    agendaLista.on('click', '.canal-link', function(e) {
        e.preventDefault();
        const urlDestino = $(this).attr('href');
        // Abrimos en una ventana nueva para mantener el contexto limpio
        window.open(urlDestino, '_blank');
    });

    agendaLista.on('click', '.evento', function() {
        $(this).siblings('.canales').slideToggle('fast');
    });

    cargarAgenda();
});

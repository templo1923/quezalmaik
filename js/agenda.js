$(document).ready(function() {
    const PROXY_URL = "https://api.allorigins.win/get?url=";
    const TARGET_URL = encodeURIComponent("https://www.rojadirectatv3.pl/agenda.php");
    const AGENDA_URL = PROXY_URL + TARGET_URL;
    
    const agendaLista = $('#agenda-lista');
    const tituloAgenda = $('#agenda-titulo');

    async function cargarAgenda() {
        try {
            const respuesta = await fetch(AGENDA_URL);
            const data = await respuesta.json();
            const parser = new DOMParser();
            const doc = parser.parseFromString(data.contents, 'text/html');
            
            // Selector original que sí te cargaba los partidos
            const partidosRaw = doc.querySelectorAll('.menu > li');

            if (partidosRaw.length === 0) {
                console.log("No se encontraron partidos en el HTML");
                return;
            }

            agendaLista.empty();
            const hoy = new Date();
            tituloAgenda.text('AGENDA - ' + hoy.getDate() + ' DE ' + hoy.toLocaleString('es-ES', { month: 'long' }).toUpperCase());

            partidosRaw.forEach(partido => {
                const linkPrincipal = partido.querySelector('a');
                if (!linkPrincipal) return;

                const titulo = linkPrincipal.textContent.split('\n')[0].trim();
                const horaLocal = linkPrincipal.querySelector('.t')?.textContent.trim() || "--:--";

                let canalesHtml = '<div class="canales" style="display:none;">';
                const subitems = partido.querySelectorAll('ul li a');

                if (subitems.length > 0) {
                    subitems.forEach(canal => {
                        const nombreCanal = canal.textContent.trim();
                        const hrefOriginal = canal.href;
                        let streamParam = "";

                        // Lógica de extracción del parámetro 'r' o codificación btoa
                        if (hrefOriginal.includes('?r=')) {
                            const urlObj = new URL(hrefOriginal);
                            streamParam = urlObj.searchParams.get("r");
                        } else {
                            // Si no tiene 'r', mandamos la URL original codificada
                            streamParam = btoa(hrefOriginal);
                        }

                        // Apuntamos a tu reproductor (usa vivo.html o eventos.html según prefieras)
                        const urlFinal = `embed/eventos.html?r=${streamParam}`;
                        canalesHtml += `<a href="${urlFinal}" class="canal-link">➤ ${nombreCanal}</a>`;
                    });
                } else {
                    canalesHtml += `<span class="sin-canales">Próximamente...</span>`;
                }

                canalesHtml += '</div>';

                const eventoHtml = `
                    <div class="evento-contenedor">
                        <div class="evento">
                            <div class="hora">${horaLocal}</div>
                            <img src="https://i.imgur.com/Vdef5Rz.png" class="evento-icono" alt="">
                            <div class="info-evento">${titulo}</div>
                            <div class="flecha">›</div>
                        </div>
                        ${canalesHtml}
                    </div>`;
                
                agendaLista.append(eventoHtml);
            });

        } catch (error) {
            console.error("Error:", error);
            agendaLista.html('<p class="error">Error de sincronización.</p>');
        }
    }

    // Acordeón para mostrar canales
    agendaLista.on('click', '.evento', function() {
        const subMenu = $(this).siblings('.canales');
        $('.canales').not(subMenu).slideUp('fast');
        subMenu.slideToggle('fast');
    });

    // Evento para abrir el canal en tu reproductor
    agendaLista.on('click', '.canal-link', function(e) {
        e.preventDefault();
        const destino = $(this).attr('href');
        window.location.href = destino; 
    });

    cargarAgenda();
    setInterval(cargarAgenda, 60000); // Actualiza cada minuto
});

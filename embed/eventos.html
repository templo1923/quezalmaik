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

                    // Extracción agresiva del ID (ej: winsportsplus)
                    if (hrefOriginal.includes('capoplay.net/')) {
                        streamID = hrefOriginal.split('capoplay.net/')[1].replace('.php', '');
                    } else if (hrefOriginal.includes('canal-')) {
                        streamID = hrefOriginal.split('canal-')[1].replace('.php', '');
                    }

                    let urlFinal;
                    if (streamID) {
                        // Construimos la URL del reproductor real de Capo
                        const urlCapoDirecto = `https://capo7play.com/capo2.php?player=desktop&live=${streamID}`;
                        urlFinal = `embed/eventos.html?r=${btoa(urlCapoDirecto)}`;
                    } else {
                        urlFinal = `embed/eventos.html?r=${btoa(hrefOriginal)}`;
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
            console.error("Error:", error);
        }
    }

    agendaLista.on('click', '.canal-link', function(e) {
        e.preventDefault();
        window.open($(this).attr('href'), '_blank');
    });

    agendaLista.on('click', '.evento', function() {
        $(this).siblings('.canales').slideToggle('fast');
    });

    cargarAgenda();
});

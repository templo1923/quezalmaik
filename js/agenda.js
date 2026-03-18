$(document).ready(function() {
    // Proxy para saltar el bloqueo de CORS en Vercel
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
                
                // Actualiza esta parte dentro de tu eventos.forEach en js/agenda.js
subitems.forEach(canal => {
    const nombreCanal = canal.textContent.trim();
    const hrefOriginal = canal.href;
    let streamID = "";

    // Lógica para extraer el ID (ej: winsportsplus) de los diferentes dominios
    if (hrefOriginal.includes('capoplay.net/')) {
        streamID = hrefOriginal.split('capoplay.net/')[1].replace('.php', '');
    } else if (hrefOriginal.includes('canal-')) {
        // Para links tipo canal-20.php
        streamID = hrefOriginal.split('/').pop().replace('.php', '');
    } else if (hrefOriginal.includes('winsports')) {
        streamID = "winsportsplus"; // Forzado para ese canal específico
    }

    let urlFinal;
    if (streamID) {
        // Construimos el link DIRECTO al servidor de video (capo2.php)
        // Esto elimina todo el layout de RojaDirecta/EliteGol
        const urlLimpia = `https://capo7play.com/capo2.php?player=desktop&live=${streamID}`;
        urlFinal = `embed/eventos.html?r=${btoa(urlLimpia)}`;
    } else {
        // Respaldo si no detectamos el patrón
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
            console.error("Error cargando la agenda:", error);
        }
    }

    // Interceptor para abrir en tu reproductor eventos.html
    agendaLista.on('click', '.canal-link', function(e) {
        e.preventDefault();
        window.open($(this).attr('href'), '_blank');
    });

    agendaLista.on('click', '.evento', function() {
        $(this).siblings('.canales').slideToggle('fast');
    });

    cargarAgenda();
});

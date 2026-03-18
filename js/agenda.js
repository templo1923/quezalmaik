$(document).ready(function() {

    // Cambiamos la URL a la de Rojadirecta usando un Proxy de CORS para que funcione en Vercel
    const PROXY_URL = "https://api.allorigins.win/get?url=";
    const TARGET_URL = encodeURIComponent("https://www.rojadirectatv3.pl/agenda.php");
    const AGENDA_URL = PROXY_URL + TARGET_URL;
    
    const agendaLista = $('#agenda-lista');
    const tituloAgenda = $('#agenda-titulo');

    // Mantenemos tu función de hora actualizándola para el formato de la nueva web
    function convertirHora(horaTexto) {
        if(!horaTexto) return "--:--";
        // La web suele dar la hora en formato HH:mm directamente
        return horaTexto;
    }

    async function cargarAgenda() {
        try {
            const respuesta = await fetch(AGENDA_URL);
            const data = await respuesta.json();
            const htmlContent = data.contents; // El HTML puro de la web externa

            // Convertimos el texto a HTML manipulable
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlContent, 'text/html');
            
            // Buscamos los partidos (en Rojadirecta están en la clase .menu > li)
            const partidosRaw = doc.querySelectorAll('.menu > li');

            agendaLista.empty();

            const hoy = new Date();
            tituloAgenda.text('AGENDA - ' + hoy.getDate() + ' DE ' + hoy.toLocaleString('es-ES', { month: 'long' }).toUpperCase() + ' DE ' + hoy.getFullYear());

            partidosRaw.forEach(partido => {
                const linkPrincipal = partido.querySelector('a');
                if (!linkPrincipal) return;

                // Extraemos el título del partido (limpiando espacios)
                const titulo = linkPrincipal.textContent.split('\n')[0].trim();
                const horaLocal = linkPrincipal.querySelector('.t')?.textContent.trim() || "--:--";

                // Icono por defecto de Maik Sport
                let urlIcono = "https://i.imgur.com/Vdef5Rz.png"; 

                let canalesHtml = '<div class="canales">';
                
                // Buscamos los enlaces de canales dentro del submenú <ul>
                const subitems = partido.querySelectorAll('ul li a');
                
                if (subitems.length > 0) {
                    subitems.forEach(canal => {
                        const nombreCanal = canal.textContent.trim();
                        const hrefOriginal = canal.href;

                        // Lógica para extraer el parámetro 'r' (URL real) si existe
                        let urlDestino = hrefOriginal;
                        if (hrefOriginal.includes('?r=')) {
                            const params = new URLSearchParams(hrefOriginal.split('?')[1]);
                            const r = params.get("r");
                            // Enviamos directamente a tu reproductor de TV En Vivo limpio
                            urlDestino = `Tvenvivo.html?stream=${r}`;
                        }

                        canalesHtml += `<a href="${urlDestino}" class="canal-link">➤ ${nombreCanal}</a>`;
                    });
                } else {
                    canalesHtml += `<span class="sin-canales">Próximamente...</span>`;
                }
                canalesHtml += '</div>';
                
                const eventoHtml = `
                    <div class="evento-contenedor">
                        <div class="evento">
                            <div class="hora">${horaLocal}</div>
                            <img src="${urlIcono}" class="evento-icono" alt="">
                            <div class="info-evento">${titulo}</div>
                            <div class="flecha">›</div>
                        </div>
                        ${canalesHtml}
                    </div>
                `;
                agendaLista.append(eventoHtml);
            });

        } catch (error) {
            console.error("Error al cargar la agenda robusta:", error);
            agendaLista.html('<p class="error">No se pudo sincronizar la agenda.</p>');
        }
    }

    // Mantenemos tu lógica de acordeón para mostrar los canales
    agendaLista.on('click', '.evento', function() {
        const subMenu = $(this).siblings('.canales');
        $('.canales').not(subMenu).slideUp('fast');
        subMenu.slideToggle('fast');
    });

    cargarAgenda();
    // Actualización automática cada minuto
    setInterval(cargarAgenda, 60000);
});

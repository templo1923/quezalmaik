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
            const htmlContent = data.contents; 

            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlContent, 'text/html');
            
            // Los partidos en la fuente robusta están en la clase .menu > li
            const partidosRaw = doc.querySelectorAll('.menu > li');

            agendaLista.empty();

            const hoy = new Date();
            tituloAgenda.text('AGENDA - ' + hoy.getDate() + ' DE ' + hoy.toLocaleString('es-ES', { month: 'long' }).toUpperCase());

            partidosRaw.forEach(partido => {
                const linkPrincipal = partido.querySelector('a');
                if (!linkPrincipal) return;

                const titulo = linkPrincipal.textContent.split('\n')[0].trim();
                const horaLocal = linkPrincipal.querySelector('.t')?.textContent.trim() || "--:--";

                let urlIcono = "https://i.imgur.com/Vdef5Rz.png"; 

                let canalesHtml = '<div class="canales">';
                const subitems = partido.querySelectorAll('ul li a');
                
                if (subitems.length > 0) {
                    subitems.forEach(canal => {
                        const nombreCanal = canal.textContent.trim();
                        const hrefOriginal = canal.href;

                        let urlFinal = hrefOriginal;
                        
                        // Extraemos el parámetro 'r' que contiene la URL real del stream
                        if (hrefOriginal.includes('?r=')) {
                            const params = new URLSearchParams(hrefOriginal.split('?')[1]);
                            const r = params.get("r");
                            
                            // IMPORTANTE: Redirigimos a TU archivo vivo.html
                            // Esto evita que se abra la web de ellos con anuncios
                            urlFinal = `vivo.html?stream=${r}`;
                        }

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
            console.error("Error al sincronizar agenda:", error);
            agendaLista.html('<p class="error">No se pudo cargar la agenda.</p>');
        }
    }

    // Tu lógica de acordeón para mostrar los canales al hacer clic
    agendaLista.on('click', '.evento', function() {
        const subMenu = $(this).siblings('.canales');
        $('.canales').not(subMenu).slideUp('fast');
        subMenu.slideToggle('fast');
    });

    cargarAgenda();
    setInterval(cargarAgenda, 60000); // Actualiza cada minuto
});

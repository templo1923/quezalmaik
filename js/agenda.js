$(document).ready(function() {
    // Usamos el proxy básico que tenías al principio
    const AGENDA_URL = "https://api.allorigins.win/get?url=" + encodeURIComponent("https://www.rojadirectatv3.pl/agenda.php");
    
    const agendaLista = $('#agenda-lista');

    async function cargarAgenda() {
        try {
            const respuesta = await fetch(AGENDA_URL);
            const data = await respuesta.json();
            const doc = new DOMParser().parseFromString(data.contents, 'text/html');
            const partidosRaw = doc.querySelectorAll('.menu > li');

            agendaLista.empty();

            partidosRaw.forEach(partido => {
                const linkPrincipal = partido.querySelector('a');
                if (!linkPrincipal) return;

                const titulo = linkPrincipal.textContent.split('\n')[0].trim();
                const horaLocal = linkPrincipal.querySelector('.t')?.textContent.trim() || "--:--";

                let canalesHtml = '<div class="canales" style="display:none;">';
                const subitems = partido.querySelectorAll('ul li a');
                
                subitems.forEach(canal => {
                    const nombreCanal = canal.textContent.trim();
                    const hrefOriginal = canal.href;
                    
                    // Mandamos el link de RojaDirecta directo a tu reproductor
                    // Sin inventar IDs ni carpetas API
                    const urlFinal = `embed/eventos.html?r=${btoa(hrefOriginal)}`;
                    canalesHtml += `<a href="${urlFinal}" class="canal-link" target="_blank">➤ ${nombreCanal}</a>`;
                });
                
                canalesHtml += '</div>';
                const eventoHtml = `
                    <div class="evento-contenedor">
                        <div class="evento" style="cursor:pointer; padding:10px; border-bottom:1px solid #333;">
                            <span style="color:red;">${horaLocal}</span> - <span style="color:white;">${titulo}</span>
                        </div>
                        ${canalesHtml}
                    </div>`;
                agendaLista.append(eventoHtml);
            });
        } catch (error) { 
            console.error("Error cargando agenda");
            agendaLista.html("<p style='color:white;'>Error al cargar. Reintenta.</p>");
        }
    }

    // Abrir canales al tocar el partido
    agendaLista.on('click', '.evento', function() {
        $(this).siblings('.canales').slideToggle('fast');
    });

    cargarAgenda();
});

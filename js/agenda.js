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
                    // Guardamos la URL original
                    canalesHtml += `<a href="#" data-url="${hrefOriginal}" class="canal-link">➤ ${nombreCanal}</a>`;
                });
                
                canalesHtml += '</div>';
                const eventoHtml = `
                    <div class="evento-contenedor">
                        <div class="evento">
                            <span class="hora">${horaLocal}</span>
                            <span class="info-evento">${titulo}</span>
                        </div>
                        ${canalesHtml}
                    </div>`;
                agendaLista.append(eventoHtml);
            });
        } catch (error) { console.error("Error en agenda"); }
    }

    // EL DETECTIVE QUE NO FALLA
    agendaLista.on('click', '.canal-link', async function(e) {
        e.preventDefault();
        const btn = $(this);
        const urlCascara = btn.attr('data-url');
        
        btn.text('⌛ Abriendo...');

        try {
            const response = await fetch(PROXY_URL + encodeURIComponent(urlCascara));
            const data = await response.json();
            const pageDoc = new DOMParser().parseFromString(data.contents, 'text/html');
            
            // Buscamos el iframe real
            const iframe = pageDoc.querySelector('iframe[src*="capoplay"], iframe[src*="capoplayer"]');
            
            if (iframe) {
                // MANDAMOS EL LINK REAL
                window.open(`embed/eventos.html?r=${btoa(iframe.src)}`, '_blank');
            } else {
                // SI NO HAY IFRAME, ABRIMOS LA PÁGINA ORIGINAL (Como antes)
                window.open(`embed/eventos.html?r=${btoa(urlCascara)}`, '_blank');
            }
        } catch (err) {
            window.open(`embed/eventos.html?r=${btoa(urlCascara)}`, '_blank');
        } finally {
            btn.text('➤ Canal listo');
        }
    });

    agendaLista.on('click', '.evento', function() {
        $(this).siblings('.canales').slideToggle('fast');
    });

    cargarAgenda();
});

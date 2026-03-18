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

                let canalesHtml = '<div class="canales">';
                const subitems = partido.querySelectorAll('ul li a');
                
                subitems.forEach(canal => {
                    const nombreCanal = canal.textContent.trim();
                    const hrefOriginal = canal.href;

                    // Guardamos la URL de la "cáscara" en un atributo data
                    canalesHtml += `<a href="#" data-url="${hrefOriginal}" class="canal-link">➤ ${nombreCanal}</a>`;
                });
                
                canalesHtml += '</div>';
                const eventoHtml = `
                    <div class="evento-contenedor">
                        <div class="evento">
                            <div class="hora">${horaLocal}</div>
                            <div class="info-evento">${titulo}</div>
                        </div>
                        ${canalesHtml}
                    </div>`;
                agendaLista.append(eventoHtml);
            });
        } catch (error) { console.error("Error agenda"); }
    }

    // EL DETECTIVE: Al hacer clic, buscamos el iframe real
    agendaLista.on('click', '.canal-link', async function(e) {
        e.preventDefault();
        const btn = $(this);
        const urlCascara = btn.attr('data-url');
        
        btn.text('⌛ Cargando...');

        try {
            // Entramos a la página de RojaDirecta/Pirlo/Elitegol en segundo plano
            const response = await fetch(PROXY_URL + encodeURIComponent(urlCascara));
            const data = await response.json();
            const pageDoc = new DOMParser().parseFromString(data.contents, 'text/html');
            
            // BUSCAMOS EL IFRAME DE CAPOPLAY
            const iframe = pageDoc.querySelector('iframe[src*="capoplay.net"]');
            
            if (iframe) {
                const urlRealCapo = iframe.src;
                // Ahora sí, mandamos la URL real a tu reproductor
                window.open(`embed/eventos.html?r=${btoa(urlRealCapo)}`, '_blank');
            } else {
                // Si no hay iframe de capo, mandamos la original como respaldo
                window.open(`embed/eventos.html?r=${btoa(urlCascara)}`, '_blank');
            }
        } catch (err) {
            console.error("Error al extraer");
        } finally {
            btn.text('➤ ' + btn.text().replace('⌛ Cargando...', '').trim());
        }
    });

    agendaLista.on('click', '.evento', function() {
        $(this).siblings('.canales').slideToggle('fast');
    });

    cargarAgenda();
});

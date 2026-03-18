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
            
            // Selector específico para la estructura de RojaDirecta
            const partidosRaw = doc.querySelectorAll('.menu > li');

            if (partidosRaw.length === 0) {
                agendaLista.html('<p style="text-align:center; color:white;">No hay eventos disponibles por ahora.</p>');
                return;
            }

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
                    let hrefOriginal = canal.href;

                    // Corregir links relativos si el scraping los trae mal
                    if (hrefOriginal.startsWith('applewebdata')) {
                        const slug = hrefOriginal.split('/').pop();
                        hrefOriginal = `https://www.rojadirectatv3.pl/${slug}`;
                    }

                    canalesHtml += `<a href="#" data-url="${hrefOriginal}" class="canal-link" style="display:block; padding:10px; color:#60a5fa; text-decoration:none; border-bottom:1px solid #333;">➤ ${nombreCanal}</a>`;
                });
                
                canalesHtml += '</div>';
                
                const eventoHtml = `
                    <div class="evento-contenedor" style="margin-bottom:10px; background:rgba(255,255,255,0.05); border-radius:8px;">
                        <div class="evento" style="padding:15px; cursor:pointer; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #444;">
                            <span class="hora" style="color:#ef4444; font-weight:bold;">${horaLocal}</span>
                            <span class="info-evento" style="color:white; flex:1; margin-left:15px;">${titulo}</span>
                            <i class="fas fa-chevron-down" style="color:#60a5fa;"></i>
                        </div>
                        ${canalesHtml}
                    </div>`;
                agendaLista.append(eventoHtml);
            });
        } catch (error) { 
            console.error("Error cargando agenda:", error);
            agendaLista.html('<p style="text-align:center; color:white;">Error al conectar con la agenda.</p>');
        }
    }

    // EL DETECTIVE: Al hacer clic en un canal
    agendaLista.on('click', '.canal-link', async function(e) {
        e.preventDefault();
        const btn = $(this);
        const urlCascara = btn.attr('data-url');
        const originalText = btn.text();
        
        btn.text('⌛ Buscando señal limpia...');

        try {
            // Entramos a la página del canal en segundo plano
            const response = await fetch(PROXY_URL + encodeURIComponent(urlCascara));
            const data = await response.json();
            const pageDoc = new DOMParser().parseFromString(data.contents, 'text/html');
            
            // BUSCAMOS EL IFRAME DE CAPOPLAY O CAPOPLAYER
            const iframe = pageDoc.querySelector('iframe[src*="capoplay.net"], iframe[src*="capoplayer.net"]');
            
            if (iframe) {
                const urlRealCapo = iframe.src;
                // Mandamos la URL del iframe directamente a tu reproductor
                window.open(`embed/eventos.html?r=${btoa(urlRealCapo)}`, '_blank');
            } else {
                // Si no hay iframe de capo, mandamos la original (la cáscara) como respaldo
                window.open(`embed/eventos.html?r=${btoa(urlCascara)}`, '_blank');
            }
        } catch (err) {
            console.error("Error al extraer el iframe:", err);
            // Si falla el detective, intentamos abrir la cáscara
            window.open(`embed/eventos.html?r=${btoa(urlCascara)}`, '_blank');
        } finally {
            btn.text(originalText);
        }
    });

    // Toggle de canales
    agendaLista.on('click', '.evento', function() {
        $(this).siblings('.canales').slideToggle('fast');
        $(this).find('i').toggleClass('fa-chevron-down fa-chevron-up');
    });

    // Ejecutar carga inicial
    cargarAgenda();
});

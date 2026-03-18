$(document).ready(function() {
    // Lista de proxies para evitar el error 500
    const PROXIES = [
        "https://api.allorigins.win/get?url=",
        "https://api.codetabs.com/v1/proxy/?quest=",
        "https://thingproxy.freeboard.io/fetch/"
    ];
    
    const TARGET_BASE = "https://www.rojadirectatv3.pl/agenda.php";
    const agendaLista = $('#agenda-lista');

    async function cargarAgenda(proxyIndex = 0) {
        if (proxyIndex >= PROXIES.length) {
            agendaLista.html('<p style="text-align:center; color:white; padding:20px;">Error: Todos los servidores de carga están saturados. Intenta recargar en un momento.</p>');
            return;
        }

        const currentProxy = PROXIES[proxyIndex];
        const finalUrl = currentProxy + encodeURIComponent(TARGET_BASE);

        try {
            console.log("Intentando con proxy:", currentProxy);
            const respuesta = await fetch(finalUrl);
            
            if (!respuesta.ok) throw new Error("Error en servidor");

            const data = await respuesta.json();
            // Algunos proxies devuelven el string directo, otros un objeto con .contents
            const htmlRaw = data.contents || data; 
            
            const doc = new DOMParser().parseFromString(htmlRaw, 'text/html');
            const partidosRaw = doc.querySelectorAll('.menu > li');

            if (partidosRaw.length === 0) {
                // Si no hay errores pero no hay partidos, probamos el siguiente proxy por si acaso
                throw new Error("HTML vacío");
            }

            agendaLista.empty();

            partidosRaw.forEach(partido => {
                const linkPrincipal = partido.querySelector('a');
                if (!linkPrincipal) return;

                const titulo = linkPrincipal.textContent.split('\n')[0].trim();
                const horaLocal = linkPrincipal.querySelector('.t')?.textContent.trim() || "--:--";

                let canalesHtml = '<div class="canales" style="display:none; background: rgba(0,0,0,0.5);">';
                const subitems = partido.querySelectorAll('ul li a');
                
                subitems.forEach(canal => {
                    const nombreCanal = canal.textContent.trim();
                    let hrefOriginal = canal.href;

                    // Reparar links si vienen relativos
                    if (hrefOriginal.includes('applewebdata') || !hrefOriginal.startsWith('http')) {
                        const slug = hrefOriginal.split('/').pop();
                        hrefOriginal = `https://www.rojadirectatv3.pl/${slug}`;
                    }

                    canalesHtml += `<a href="#" data-url="${hrefOriginal}" class="canal-link" style="display:block; padding:12px; color:#60a5fa; text-decoration:none; border-bottom:1px solid #333;">➤ ${nombreCanal}</a>`;
                });
                
                canalesHtml += '</div>';
                
                const eventoHtml = `
                    <div class="evento-contenedor" style="margin-bottom:10px; border-radius:10px; overflow:hidden; border: 1px solid #333;">
                        <div class="evento" style="padding:15px; background:#1b263b; cursor:pointer; display:flex; justify-content:space-between; align-items:center;">
                            <span style="color:#f87171; font-weight:bold;">${horaLocal}</span>
                            <span style="color:white; flex:1; margin-left:15px;">${titulo}</span>
                            <i class="fas fa-chevron-down" style="color:#60a5fa;"></i>
                        </div>
                        ${canalesHtml}
                    </div>`;
                agendaLista.append(eventoHtml);
            });

        } catch (error) {
            console.warn(`Proxy ${proxyIndex} falló. Intentando con el siguiente...`);
            cargarAgenda(proxyIndex + 1); // SALTO AUTOMÁTICO AL SIGUIENTE PROXY
        }
    }

    // EL DETECTIVE (Lógica de extracción al hacer clic)
    agendaLista.on('click', '.canal-link', async function(e) {
        e.preventDefault();
        const btn = $(this);
        const urlCascara = btn.attr('data-url');
        const originalText = btn.text();
        
        btn.html('<i class="fas fa-spinner fa-spin"></i> Buscando señal limpia...');

        try {
            // Aquí también usamos AllOrigins pero con un fallback si falla
            const response = await fetch(PROXIES[0] + encodeURIComponent(urlCascara));
            const data = await response.json();
            const pageDoc = new DOMParser().parseFromString(data.contents || data, 'text/html');
            
            const iframe = pageDoc.querySelector('iframe[src*="capoplay.net"], iframe[src*="capoplayer.net"]');
            
            if (iframe && iframe.src) {
                window.open(`embed/eventos.html?r=${btoa(iframe.src)}`, '_blank');
            } else {
                window.open(`embed/eventos.html?r=${btoa(urlCascara)}`, '_blank');
            }
        } catch (err) {
            window.open(`embed/eventos.html?r=${btoa(urlCascara)}`, '_blank');
        } finally {
            btn.text(originalText);
        }
    });

    agendaLista.on('click', '.evento', function() {
        $(this).siblings('.canales').slideToggle('fast');
        $(this).find('i').toggleClass('fa-chevron-down fa-chevron-up');
    });

    cargarAgenda();
});

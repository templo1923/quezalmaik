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
            const htmlContent = data.contents; 

            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlContent, 'text/html');
            const partidosRaw = doc.querySelectorAll('.menu > li');

            agendaLista.empty();
            const hoy = new Date();
            tituloAgenda.text('AGENDA - ' + hoy.getDate() + ' DE ' + hoy.toLocaleString('es-ES', { month: 'long' }).toUpperCase());

            partidosRaw.forEach(partido => {
                const linkPrincipal = partido.querySelector('a');
                if (!linkPrincipal) return;

                const titulo = linkPrincipal.textContent.split('\n')[0].trim();
                const horaLocal = linkPrincipal.querySelector('.t')?.textContent.trim() || "--:--";

                let canalesHtml = '<div class="canales">';
                const subitems = partido.querySelectorAll('ul li a');
                
                if (subitems.length > 0) {
                    subitems.forEach(canal => {
                        const nombreCanal = canal.textContent.trim();
                        const hrefOriginal = canal.href;
                        let rParam = "";

                        // Extraemos el parámetro 'r' que es la URL real
                        if (hrefOriginal.includes('?r=')) {
                            rParam = new URLSearchParams(hrefOriginal.split('?')[1]).get("r");
                        } else {
                            rParam = btoa(hrefOriginal); // Si no hay 'r', codificamos la URL original
                        }

                        // FORZAMOS EL ENLACE A TU VIVO.HTML
                        canalesHtml += `<a href="vivo.html?stream=${rParam}" class="canal-link">➤ ${nombreCanal}</a>`;
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
                    </div>
                `;
                agendaLista.append(eventoHtml);
            });

        } catch (error) {
            console.error("Error:", error);
            agendaLista.html('<p class="error">Error de sincronización.</p>');
        }
    }

    // EVENTO CORREGIDO: Evita que el navegador use el link original si falla algo
    agendaLista.on('click', '.canal-link', function(e) {
        e.preventDefault(); // Detiene el salto a la web de ellos
        const destino = $(this).attr('href');
        window.location.href = destino; // Fuerza a que vaya a TU vivo.html
    });

    agendaLista.on('click', '.evento', function() {
        const subMenu = $(this).siblings('.canales');
        $('.canales').not(subMenu).slideUp('fast');
        subMenu.slideToggle('fast');
    });

    cargarAgenda();
    setInterval(cargarAgenda, 60000);
});

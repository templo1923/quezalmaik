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
                    let rParam = "";

                    // Extraemos el parámetro 'r' de la fuente
                    if (hrefOriginal.includes('?r=')) {
                        rParam = new URLSearchParams(hrefOriginal.split('?')[1]).get("r");
                    } else {
                        // Si no tiene 'r', codificamos la URL completa para que eventos.html la entienda
                        rParam = btoa(hrefOriginal);
                    }

                    // USAMOS TU REPRODUCTOR QUE SÍ FUNCIONA (eventos.html)
                    canalesHtml += `<a href="embed/eventos.html?r=${rParam}" class="canal-link">➤ ${nombreCanal}</a>`;
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

    // INTERCEPTOR DE CLIC: Evita que el navegador abra la web de ellos
    agendaLista.on('click', '.canal-link', function(e) {
        e.preventDefault();
        const urlDestino = $(this).attr('href');
        // Abrimos en una ventana nueva para que eventos.html cargue con su propio contexto
        window.open(urlDestino, '_blank');
    });

    agendaLista.on('click', '.evento', function() {
        $(this).siblings('.canales').slideToggle('fast');
    });

    cargarAgenda();
});

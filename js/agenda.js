$(document).ready(function() {
    // Usamos el proxy que normalmente es más estable
    const PROXY = "https://api.allorigins.win/get?url=";
    const TARGET = encodeURIComponent("https://www.rojadirectatv3.pl/agenda.php");
    
    const agendaLista = $('#agenda-lista');

    async function cargarAgenda() {
        try {
            const res = await fetch(PROXY + TARGET);
            const data = await res.json();
            const doc = new DOMParser().parseFromString(data.contents, 'text/html');
            const partidos = doc.querySelectorAll('.menu > li');

            if (partidos.length === 0) return;

            agendaLista.empty();

            partidos.forEach(partido => {
                const link = partido.querySelector('a');
                if (!link) return;

                const titulo = link.textContent.split('\n')[0].trim();
                const hora = link.querySelector('.t')?.textContent.trim() || "--:--";

                let canales = '<div class="canales" style="display:none;">';
                const linksCanales = partido.querySelectorAll('ul li a');

                linksCanales.forEach(c => {
                    const nombre = c.textContent.trim();
                    // Mandamos el link original codificado en Base64 para eventos.html
                    const urlFinal = `embed/eventos.html?r=${btoa(c.href)}`;
                    canales += `<a href="${urlFinal}" class="canal-link" style="display:block; padding:10px; color:#60a5fa;">➤ ${nombre}</a>`;
                });
                canales += '</div>';

                const html = `
                    <div class="evento-contenedor" style="border-bottom:1px solid #333;">
                        <div class="evento" style="padding:15px; cursor:pointer; color:white;">
                            <span style="color:red; font-weight:bold;">${hora}</span> ${titulo}
                        </div>
                        ${canales}
                    </div>`;
                agendaLista.append(html);
            });
        } catch (e) {
            console.error("Error cargando agenda");
        }
    }

    agendaLista.on('click', '.evento', function() {
        $(this).siblings('.canales').slideToggle('fast');
    });

    cargarAgenda();
});

$(document).ready(function() {

    const AGENDA_URL = "https://golazoplay.com/agenda.json";
    const agendaLista = $('#agenda-lista');
    const tituloAgenda = $('#agenda-titulo');

    function convertirHora(utcHour) {
        const DateTime = luxon.DateTime;
        const utcDateTime = DateTime.fromISO(utcHour, { zone: "America/Lima" });
        return utcDateTime.toLocal().toFormat("HH:mm");
    }

    async function cargarAgenda() {
        try {
            const respuesta = await fetch(AGENDA_URL);
            const json = await respuesta.json();
            const eventos = json.data;

            agendaLista.empty();

            const hoy = new Date();
            tituloAgenda.text('AGENDA - ' + hoy.getDate() + ' DE ' + hoy.toLocaleString('es-ES', { month: 'long' }).toUpperCase() + ' DE ' + hoy.getFullYear());

            eventos.sort((a, b) => a.attributes.diary_hour.localeCompare(b.attributes.diary_hour));

            eventos.forEach(evento => {
                const attr = evento.attributes;
                const horaLocal = convertirHora(attr.diary_hour);
                const titulo = attr.diary_description;

                let urlIcono = "https://i.imgur.com/Vdef5Rz.png"; 
                if (attr.country?.data?.attributes?.image?.data?.attributes?.url) {
                    urlIcono = "https://img.golazoplay.com" + attr.country.data.attributes.image.data.attributes.url;
                }

                let canalesHtml = '<div class="canales">';
                if (attr.embeds && attr.embeds.data.length > 0) {
                    attr.embeds.data.forEach(embed => {
                        const nombreCanal = embed.attributes.embed_name;
                        
                        // --- INICIO DE LA CORRECCIÓN FINAL ---
                        // La URL del JSON viene así: "/embed/eventos.html?r=URL_REAL_CODIFICADA"
                        const urlRelativaConParametro = embed.attributes.embed_iframe;

                        // 1. Extraemos solo el parámetro "r" (la URL real codificada)
                        const params = new URLSearchParams(urlRelativaConParametro.split('?')[1]);
                        const urlRealCodificada = params.get("r");
                        
                        // 2. Usamos esa URL real codificada para nuestro reproductor
                        canalesHtml += `<a href="embed/eventos.html?r=${urlRealCodificada}" target="_blank" class="canal-link">➤ ${nombreCanal}</a>`;
                        // --- FIN DE LA CORRECCIÓN FINAL ---
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
            console.error("Error al cargar la agenda:", error);
            agendaLista.html('<p class="error">No se pudo cargar la agenda.</p>');
        }
    }

    agendaLista.on('click', '.evento', function() {
        const subMenu = $(this).siblings('.canales');
        $('.canales').not(subMenu).slideUp('fast');
        subMenu.slideToggle('fast');
    });

    cargarAgenda();
    setInterval(cargarAgenda, 60000);
});
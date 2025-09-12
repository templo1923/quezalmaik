$(document).ready(function() {

    // --- CONFIGURACIÓN PARA CAMBIAR LA FUENTE DE EVENTOS ---
    // Para cambiar la fuente, simplemente comenta una línea y descomenta la otra.
    
     const AGENDA_URL = "https://golazoplay.com/agenda.json";
    //const AGENDA_URL = "https://api.allorigins.win/raw?url=https://ftvhd.com/diaries.json";

    // --- FIN DE LA CONFIGURACIÓN ---


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
            
            const esFuenteGolazo = AGENDA_URL.includes("golazoplay");
            const eventos = esFuenteGolazo ? json.data : json.diaries;

            if (!eventos || !Array.isArray(eventos)) {
                throw new Error("La estructura del JSON no es la esperada.");
            }

            agendaLista.empty();
            const hoy = new Date();
            tituloAgenda.text('AGENDA - ' + hoy.getDate() + ' DE ' + hoy.toLocaleString('es-ES', { month: 'long' }).toUpperCase() + ' DE ' + hoy.getFullYear());
            
            if (esFuenteGolazo) {
                eventos.sort((a, b) => a.attributes.diary_hour.localeCompare(b.attributes.diary_hour));
            } else {
                eventos.sort((a, b) => a.time.localeCompare(b.time));
            }

            eventos.forEach(evento => {
                let horaLocal, titulo, urlIcono, canales;

                if (esFuenteGolazo) {
                    const attr = evento.attributes;
                    horaLocal = convertirHora(attr.diary_hour);
                    titulo = attr.diary_description;
                    canales = attr.embeds?.data || [];
                    
                    urlIcono = "https://i.imgur.com/Vdef5Rz.png"; 
                    if (attr.country?.data?.attributes?.image?.data?.attributes?.url) {
                        urlIcono = "https://img.golazoplay.com" + attr.country.data.attributes.image.data.attributes.url;
                    }
                } else {
                    horaLocal = evento.time; 
                    titulo = evento.title;
                    canales = evento.channels || [];
                    urlIcono = evento.league?.logo || "https://i.imgur.com/Vdef5Rz.png";
                }

                let canalesHtml = '<div class="canales">';
                if (canales.length > 0) {
                    canales.forEach(canal => {
                        const nombreCanal = esFuenteGolazo ? canal.attributes.embed_name : canal.name;
                        let urlParaReproductor = esFuenteGolazo ? canal.attributes.embed_iframe : canal.url;
                        
                        if (typeof urlParaReproductor === 'string' && urlParaReproductor.trim() !== '') {
                            let urlFinalCodificada;
                            if (esFuenteGolazo) {
                                const params = new URLSearchParams(urlParaReproductor.split('?')[1]);
                                urlFinalCodificada = params.get("r");
                            } else {
                                urlFinalCodificada = btoa(urlParaReproductor);
                            }
                            
                            if (urlFinalCodificada) {
                                canalesHtml += `<a href="embed/eventos.html?r=${urlFinalCodificada}" target="_blank" class="canal-link">➤ ${nombreCanal}</a>`;
                            }
                        }
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
            agendaLista.html('<p class="error" style="padding: 20px; text-align: center;">No se pudo cargar la agenda. Verifica la URL del JSON.</p>');
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
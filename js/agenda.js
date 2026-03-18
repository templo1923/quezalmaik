$(document).ready(function() {
    // Usamos tu proxy de Vercel para evitar bloqueos de CORS
    const PROXY = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") 
        ? "https://api.allorigins.win/get?url=" 
        : "/api/proxy?url=";

    const DATA_URL = "https://pltvhd.com/diaries.json";
    const agendaLista = $('#agenda-lista');

    async function cargarAgenda() {
        try {
            const res = await fetch(PROXY + encodeURIComponent(DATA_URL));
            const json = await res.json();
            
            // Si usas AllOrigins en local, los datos vienen en json.contents (como string)
            // Si usas tu proxy de Vercel, puede venir el objeto directo.
            const rawData = typeof json.contents === "string" ? JSON.parse(json.contents) : json;
            const eventos = rawData.data;

            if (!eventos || eventos.length === 0) {
                agendaLista.html('<p style="color:white; text-align:center;">No hay partidos programados hoy.</p>');
                return;
            }

            agendaLista.empty();

            eventos.forEach(evento => {
                const attr = evento.attributes;
                const titulo = attr.diary_description;
                const hora = attr.diary_hour.substring(0, 5); // Para que quede 14:00 en vez de 14:00:00
                const categoria = attr.country.data.attributes.name;
                
                // Construimos la lista de canales (embeds)
                let canalesHtml = '<div class="canales" style="display:none; background: #1b263b; border-radius: 0 0 10px 10px;">';
                
                attr.embeds.data.forEach(embed => {
                    const eAttr = embed.attributes;
                    // El link ya viene con /embed/eventos.html?r=...
                    // Solo le pegamos tu dominio si es necesario, o lo mandamos directo
                    canalesHtml += `
                        <a href="${eAttr.embed_iframe}" class="canal-link" style="display:block; color:#60a5fa; padding:12px; text-decoration:none; border-bottom:1px solid #2a3a4d;">
                            <i class="fas fa-play-circle"></i> ${eAttr.embed_name}
                        </a>`;
                });
                canalesHtml += '</div>';

                const htmlRow = `
                    <div class="evento-contenedor" style="margin-bottom: 10px; border-radius: 10px; overflow: hidden; background: #2a2a2a;">
                        <div class="evento" style="cursor:pointer; padding:15px; display:flex; justify-content:space-between; align-items:center;">
                            <div style="display:flex; flex-direction:column;">
                                <span style="color:#60a5fa; font-size: 12px; font-weight: bold; text-transform: uppercase;">${categoria}</span>
                                <span style="color:white; font-size: 15px;">${titulo}</span>
                            </div>
                            <span style="color:#ff4d4d; font-weight:bold; background:#1a1a1a; padding:5px 10px; border-radius:5px; font-size: 14px;">${hora}</span>
                        </div>
                        ${canalesHtml}
                    </div>`;
                
                agendaLista.append(htmlRow);
            });

        } catch (e) {
            console.error("Error cargando JSON:", e);
            agendaLista.html('<p style="color:white; text-align:center;">Error al cargar la agenda de PLTV.</p>');
        }
    }

    // Lógica para abrir los canales
    agendaLista.on('click', '.evento', function() {
        $(this).siblings('.canales').slideToggle('fast');
    });

    cargarAgenda();
});

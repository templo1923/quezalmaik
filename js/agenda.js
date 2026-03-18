/* global luxon, jQuery */
const $ = jQuery;

const AGENDA_URL = "https://pltvhd.com/diaries.json";
const IMG_BASE = "https://pltvhd.com";

$(document).ready(function () {
    obtenerAgenda();

    // Acordeón de canales
    $(document).on("click", ".toggle-submenu", function (e) {
        if ($(e.target).closest('a').length) return;
        
        const $submenu = $(this).find("ul");
        $(".agenda-list ul").not($submenu).slideUp();
        $submenu.slideToggle();
        $(this).toggleClass("active").siblings().removeClass("active");
    });

    setInterval(obtenerAgenda, 120000); // Actualiza cada 2 min
});

async function obtenerAgenda() {
    const menuElement = document.getElementById("menu");
    const titleElement = document.getElementById("title-agenda");

    if (!menuElement) return; // Si no encuentra el ID, no hace nada y evita el error

    try {
        const response = await fetch(AGENDA_URL, { cache: "no-store" });
        const result = await response.json();
        
        if (!result || !result.data) return;

        // Título con fecha
        if (titleElement && result.data[0]) {
            const dateStr = result.data[0].attributes.date_diary;
            const [y, m, d] = dateStr.split("-").map(Number);
            const fecha = new Date(y, m - 1, d);
            titleElement.innerHTML = "Agenda - " + fecha.toLocaleDateString("es-ES", { day: 'numeric', month: 'long' });
        }

        let html = "";
        result.data.forEach((evento) => {
            const attr = evento.attributes;
            const embeds = attr.embeds?.data || [];
            
            let imageUrl = `${IMG_BASE}/uploads/sin_imagen_d36205f0e8.png`;
            const flagPath = attr.country?.data?.attributes?.image?.data?.attributes?.url;
            if (flagPath) imageUrl = flagPath.startsWith('http') ? flagPath : `${IMG_BASE}${flagPath}`;

            const horaLocal = attr.diary_hour ? attr.diary_hour.substring(0, 5) : "--:--";

            html += `
                <li class="toggle-submenu">
                    <div>
                        <time>${horaLocal}</time>
                        <img src="${imageUrl}" loading="lazy">
                        <span>${attr.diary_description}</span>
                    </div>
                    <ul class="agenda-submenu">
                        ${embeds.map(emb => {
                            // Si el link es relativo, le ponemos el prefijo del reproductor
                            let finalLink = emb.attributes.embed_iframe;
                            if (finalLink.startsWith('/embed/')) {
                                finalLink = "." + finalLink; // Convierte /embed en ./embed
                            }
                            return `
                                <li>
                                    <a href="${finalLink}" class="submenu-item">
                                        ${emb.attributes.embed_name}
                                    </a>
                                </li>
                            `;
                        }).join('')}
                    </ul>
                </li>`;
        });

        menuElement.innerHTML = html;

    } catch (error) {
        console.error("❌ Error en Agenda:", error);
    }
}

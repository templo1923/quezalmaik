/* global luxon, jQuery */
const $ = jQuery;

// ✅ CONFIGURACIÓN MAIK SPORT
const AGENDA_URL = "https://pltvhd.com/diaries.json";
const IMG_BASE   = "https://pltvhd.com"; // Cambiado para que carguen los logos

document.addEventListener("DOMContentLoaded", function () {
    obtenerAgenda();

    // Manejo de submenús (Canales)
    $(document).on("click", ".toggle-submenu", function (e) {
        // Si hizo clic en un link de canal, no cerrar el menú
        if ($(e.target).closest('.submenu-item').length) return;

        const $submenu = $(this).find("ul");
        if (!$submenu.is(":visible")) {
            $(".agenda-list ul").slideUp();
            $submenu.slideDown();
            $(".agenda-list > li").removeClass("active");
            $(this).addClass("active");
        } else {
            $submenu.slideUp();
            $(this).removeClass("active");
        }
    });

    // Refrescar cada minuto
    setInterval(obtenerAgenda, 60000);
});

function convertToUserTimeZone(utcHour) {
    const DateTime = luxon.DateTime;
    // El JSON viene en formato HH:mm:ss, le damos una fecha dummy para convertir
    const dt = DateTime.fromFormat(utcHour, "HH:mm:ss", { zone: "America/Lima" });
    return dt.toLocal().toFormat("HH:mm");
}

async function obtenerAgenda() {
    const menuElement = document.getElementById("menu");
    const titleElement = document.getElementById("title-agenda");

    try {
        const response = await fetch(AGENDA_URL, { cache: "no-store" });
        const result = await response.json();
        renderAgenda(result, menuElement, titleElement);
    } catch (error) {
        console.error("❌ Error:", error);
    }
}

function renderAgenda(result, menuElement, titleElement) {
    if (!result || !result.data) return;

    // Título con la fecha del primer evento
    if (titleElement && result.data[0]) {
        const fecha = new Date(result.data[0].attributes.date_diary + "T00:00:00");
        titleElement.innerHTML = "Agenda - " + fecha.toLocaleDateString("es-ES", { day: 'numeric', month: 'long' });
    }

    let html = "";
    result.data.forEach((evento) => {
        const attr = evento.attributes;
        const embeds = attr.embeds.data || [];
        
        // CORRECCIÓN DE IMAGEN
        let imageUrl = `${IMG_BASE}/uploads/sin_imagen_d36205f0e8.png`;
        const flag = attr.country?.data?.attributes?.image?.data?.attributes?.url;
        if (flag) imageUrl = `${IMG_BASE}${flag}`;

        html += `
            <li class="toggle-submenu">
                <div>
                    <time>${convertToUserTimeZone(attr.diary_hour)}</time>
                    <img src="${imageUrl}" alt="logo" loading="lazy">
                    <span>${attr.diary_description}</span>
                </div>
                <ul>
                    ${embeds.map(emb => `
                        <li>
                            <a href="${emb.attributes.embed_iframe}" class="submenu-item">
                                ${emb.attributes.embed_name}
                            </a>
                        </li>
                    `).join('')}
                </ul>
            </li>`;
    });

    menuElement.innerHTML = html;
}

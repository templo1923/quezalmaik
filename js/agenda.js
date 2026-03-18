/* global luxon, jQuery */
const $ = jQuery;

// ✅ CONFIGURACIÓN MAIK SPORT
const AGENDA_URL = "https://pltvhd.com/diaries.json";
const IMG_BASE = "https://pltvhd.com"; 

// Si estás en Vercel y configuraste el proxy en vercel.json, usa '/api/proxy?url='
const PROXY = (window.location.hostname === "localhost") 
    ? "https://api.allorigins.win/get?url=" 
    : "/api/proxy?url="; 

document.addEventListener("DOMContentLoaded", function () {
    obtenerAgenda();

    // Manejo de submenús (Canales) con el estilo de la referencia
    $(document).on("click", ".toggle-submenu", function (e) {
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

    // Refrescar cada 2 minutos para no saturar
    setInterval(obtenerAgenda, 120000);
});

// Convierte la hora del JSON a tu hora local (Bogotá)
function convertToUserTimeZone(utcHour) {
    try {
        const DateTime = luxon.DateTime;
        // El JSON suele venir en formato de red, lo ajustamos
        const dt = DateTime.fromFormat(utcHour, "HH:mm:ss", { zone: "America/Lima" });
        return dt.toLocal().toFormat("HH:mm");
    } catch (e) {
        return utcHour.substring(0, 5); // Fallback: corta los segundos
    }
}

async function obtenerAgenda() {
    const menuElement = document.getElementById("menu");
    const titleElement = document.getElementById("title-agenda");

    try {
        // Intentamos fetch directo, si da error de CORS, usa el PROXY
        let response;
        try {
            response = await fetch(AGENDA_URL, { cache: "no-store" });
        } catch (corsErr) {
            response = await fetch(PROXY + encodeURIComponent(AGENDA_URL));
        }
        
        const result = await response.json();
        // Si viene de AllOrigins, los datos están en .contents
        const finalData = result.contents ? JSON.parse(result.contents) : result;
        
        renderAgenda(finalData, menuElement, titleElement);
    } catch (error) {
        console.error("❌ Error en Agenda:", error);
    }
}

function renderAgenda(result, menuElement, titleElement) {
    if (!result || !result.data) return;

    // Actualiza el título con la fecha actual del servidor
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
        
        // LÓGICA DE IMAGEN: Detecta si es URL completa o relativa
        let imageUrl = `${IMG_BASE}/uploads/sin_imagen_d36205f0e8.png`;
        const flagPath = attr.country?.data?.attributes?.image?.data?.attributes?.url;
        
        if (flagPath) {
            imageUrl = flagPath.startsWith('http') ? flagPath : `${IMG_BASE}${flagPath}`;
        }

        html += `
            <li class="toggle-submenu">
                <div>
                    <time>${convertToUserTimeZone(attr.diary_hour)}</time>
                    <img src="${imageUrl}" alt="icon" loading="lazy" onerror="this.src='https://img.icons8.com/color/48/football--v1.png'">
                    <span>${attr.diary_description}</span>
                </div>
                <ul>
                    ${embeds.map(emb => {
                        const link = emb.attributes.embed_iframe;
                        // Si el link ya es hacia tu eventos.html, lo dejamos, si no, lo preparamos
                        const finalHref = link.startsWith('/') ? `..${link}` : link;
                        
                        return `
                            <li>
                                <a href="${finalHref}" class="submenu-item">
                                    ${emb.attributes.embed_name}
                                </a>
                            </li>
                        `;
                    }).join('')}
                </ul>
            </li>`;
    });

    menuElement.innerHTML = html;
}

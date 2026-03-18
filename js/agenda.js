/* global luxon, jQuery */
const $ = jQuery;

const AGENDA_URL = "https://pltvhd.com/diaries.json";
const IMG_BASE = "https://pltvhd.com";

$(document).ready(function () {
    obtenerAgenda();/* global luxon, jQuery */
const $ = jQuery;

// CAMBIO AQUÍ: Ahora pedimos la ruta interna que creamos en vercel.json
const AGENDA_URL = "/api/agenda"; 
const IMG_BASE = "https://pltvhd.com";

$(document).ready(function () {
    obtenerAgenda();

    $(document).on("click", ".toggle-submenu", function (e) {
        if ($(e.target).closest('a').length) return;
        const $submenu = $(this).find("ul");
        $(".agenda-list ul").not($submenu).slideUp();
        $submenu.slideToggle();
        $(this).toggleClass("active");
    });

    setInterval(obtenerAgenda, 120000);
});

async function obtenerAgenda() {
    const menuElement = document.getElementById("menu");
    const titleElement = document.getElementById("title-agenda");

    if (!menuElement) {
        console.error("❌ No encontré el ID 'menu' en tu HTML");
        return;
    }

    try {
        const response = await fetch(AGENDA_URL); // Vercel hará el trabajo por ti
        const result = await response.json();
        
        if (!result || !result.data) {
            console.log("⚠️ El JSON llegó vacío");
            return;
        }

        // Título con fecha
        if (titleElement && result.data[0]) {
            const dateStr = result.data[0].attributes.date_diary;
            titleElement.innerHTML = "Agenda - " + dateStr;
        }

        let html = "";
        result.data.forEach((evento) => {
            const attr = evento.attributes;
            const embeds = attr.embeds?.data || [];
            
            let imageUrl = `${IMG_BASE}/uploads/sin_imagen_d36205f0e8.png`;
            const flagPath = attr.country?.data?.attributes?.image?.data?.attributes?.url;
            if (flagPath) imageUrl = flagPath.startsWith('http') ? flagPath : `${IMG_BASE}${flagPath}`;

            html += `
                <li class="toggle-submenu">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <time style="background:green; color:white; padding:5px; border-radius:5px;">${attr.diary_hour.substring(0,5)}</time>
                        <img src="${imageUrl}" style="width:25px; height:25px; border-radius:50%;">
                        <span style="font-weight:bold;">${attr.diary_description}</span>
                    </div>
                    <ul style="display:none; list-style:none; padding:10px;">
                        ${embeds.map(emb => `
                            <li style="margin:5px 0;">
                                <a href="${emb.attributes.embed_iframe.replace('/embed/', './embed/')}" 
                                   style="color:lightgreen; text-decoration:none;">
                                   ▶ ${emb.attributes.embed_name}
                                </a>
                            </li>
                        `).join('')}
                    </ul>
                </li>`;
        });

        menuElement.innerHTML = html;

    } catch (error) {
        console.error("❌ El error sigue siendo de conexión:", error);
    }
}

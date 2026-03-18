/* global luxon, jQuery */
const $ = jQuery;

// ✅ Usamos la ruta interna configurada en vercel.json
const AGENDA_URL = "/api/agenda"; 
const IMG_BASE = "https://cdn.pltvhd.com";

$(document).ready(function () {
    obtenerAgenda();

    // Manejo de clics para abrir y cerrar canales
    $(document).on("click", ".toggle-submenu", function (e) {
        // Si haces clic en el link del canal, no cerramos el menú
        if ($(e.target).closest('a').length) return;
        
        const $submenu = $(this).find("ul");
        // Cerramos los otros que estén abiertos para que se vea ordenado
        $(".agenda-lista ul").not($submenu).slideUp();
        // Abrimos o cerramos el actual
        $submenu.slideToggle();
        $(this).toggleClass("active");
    });

    // Recargar automáticamente cada 2 minutos
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
        const response = await fetch(AGENDA_URL); 
        const result = await response.json();
        
        if (!result || !result.data) {
            console.log("⚠️ El JSON llegó vacío");
            return;
        }

        // Ponemos la fecha en el título de la agenda
        if (titleElement && result.data[0]) {
            const dateStr = result.data[0].attributes.date_diary;
            titleElement.innerHTML = "Agenda - " + dateStr;
        }

        let html = "";
        result.data.forEach((evento) => {
            const attr = evento.attributes;
            const embeds = attr.embeds?.data || [];
            
            // Lógica para las imágenes de las banderas
            let imageUrl = `${IMG_BASE}/uploads/sin_imagen_d36205f0e8.png`;
            const flagPath = attr.country?.data?.attributes?.image?.data?.attributes?.url;
            if (flagPath) imageUrl = flagPath.startsWith('http') ? flagPath : `${IMG_BASE}${flagPath}`;

            html += `
                <li class="toggle-submenu" style="list-style:none; margin-bottom:10px; background:#0f172a; padding:15px; border-radius:12px; border:1px solid #333; cursor:pointer;">
                    <div style="display:flex; align-items:center; gap:12px;">
                        <time style="background:#22c55e; color:black; padding:5px 10px; border-radius:8px; font-weight:900;">${attr.diary_hour.substring(0,5)}</time>
                        <img src="${imageUrl}" style="width:25px; height:25px; border-radius:50%; object-fit:cover;">
                        <span style="font-weight:bold; color:white;">${attr.diary_description}</span>
                    </div>
                    <ul style="display:none; list-style:none; padding:15px 0 0 45px;">
                        ${embeds.map(emb => {
                            // Arreglamos la ruta del link para que busque tu eventos.html
                            let path = emb.attributes.embed_iframe;
                            if (path.startsWith('/embed/')) path = "." + path;
                            
                            return `
                                <li style="margin-bottom:10px;">
                                    <a href="${path}" style="color:#86efac; text-decoration:none; font-weight:bold; display:block;">
                                       ▶ ${emb.attributes.embed_name}
                                    </a>
                                </li>`;
                        }).join('')}
                    </ul>
                </li>`;
        });

        menuElement.innerHTML = html;

    } catch (error) {
        console.error("❌ Error de conexión:", error);
    }
}

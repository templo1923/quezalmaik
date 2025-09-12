$(document).ready(function() {

    // --- LÓGICA PARA EL CARRUSEL ---
    const carousel = $('.carousel');
    const items = $('.carousel-item');
    const totalItems = items.length;
    let currentIndex = 0;

    function updateCarousel() {
        carousel.css('transform', `translateX(-${currentIndex * 100}%)`);
    }

    $('#nextBtn').click(function() {
        currentIndex = (currentIndex + 1) % totalItems;
        updateCarousel();
    });

    $('#prevBtn').click(function() {
        currentIndex = (currentIndex - 1 + totalItems) % totalItems;
        updateCarousel();
    });

    // Avance automático cada 5 segundos
    setInterval(function() {
        $('#nextBtn').click();
    }, 5000);


    // --- LÓGICA PARA CARGAR LOS CANALES ---
    async function cargarCanales() {
        try {
            const respuesta = await fetch('canales.json');
            const canales = await respuesta.json();
            const container = $('#channels-grid');

            container.empty(); // Limpia el contenedor antes de llenarlo

            canales.forEach(canal => {
                // Obtenemos la URL del reproductor de Quetzalito directamente del JSON
                const urlReproductor = canal.url;
                
                const canalHtml = `
                    <div class="channel-card">
                        <img src="${canal.logo}" alt="${canal.nombre}">
                        <h3>${canal.nombre}</h3>
                        <a href="${urlReproductor}" target="_blank">
                            <i class="fas fa-play"></i> Ver Canal
                        </a>
                    </div>
                `;
                container.append(canalHtml);
            });

        } catch (error) {
            console.error("Error al cargar los canales:", error);
            $('#channels-grid').html('<p style="color:red;">Error al cargar la lista de canales.</p>');
        }
    }

    cargarCanales();
});
export default async function handler(req, res) {
    const { url } = req.query;
    
    if (!url) {
        return res.status(400).send("Falta la URL del video.");
    }

    try {
        const response = await fetch(url, {
            headers: {
                // Engaño de navegador real
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
                // El secreto está aquí: Hacerles creer que estás en SU web
                "Referer": "https://tvtvhd.com/",
                "Origin": "https://tvtvhd.com",
                "Accept": "*/*",
                "Accept-Language": "es-ES,es;q=0.9"
            }
        });

        // Si el origen da error, pasamos ese error para saber qué pasa
        if (!response.ok) {
            return res.status(response.status).send(`Error en el servidor de video: ${response.statusText}`);
        }

        const contentType = response.headers.get("content-type") || "";

        // CASO 1: Es el archivo de lista (.m3u8)
        if (contentType.includes("mpegurl") || contentType.includes("application/vnd.apple.mpegurl") || url.includes(".m3u8")) {
            const text = await response.text();
            const baseUrl = url.substring(0, url.lastIndexOf("/") + 1);
            
            // Re-escribimos los pedazos de video para que TAMBIÉN pasen por el proxy
            const fixedData = text.split("\n").map(line => {
                if (!line.trim() || line.startsWith("#")) return line;
                let fullUrl = line.startsWith("http") ? line : baseUrl + line;
                return `/api/video-proxy?url=${encodeURIComponent(fullUrl)}`;
            }).join("\n");

            res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
            res.setHeader("Access-Control-Allow-Origin", "*");
            return res.status(200).send(fixedData);
        }

        // CASO 2: Son los pedazos de video (.ts) - Se mandan como binario
        const buffer = await response.arrayBuffer();
        res.setHeader("Content-Type", contentType);
        res.setHeader("Access-Control-Allow-Origin", "*");
        return res.status(200).send(Buffer.from(buffer));

    } catch (e) {
        console.error("Proxy Error Maik Sport:", e);
        return res.status(500).send("Error interno del servidor de Maikol");
    }
}

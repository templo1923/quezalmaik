export default async function handler(req, res) {
    const { url } = req.query;
    if (!url) return res.status(400).send("Falta la URL");

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Accept': '*/*',
                'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
                'Referer': 'https://tvtvhd.com/',
                'Origin': 'https://tvtvhd.com',
                'Sec-Fetch-Dest': 'empty',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Site': 'cross-site',
                'Connection': 'keep-alive',
            }
        });

        // Si sigue dando 403, es por la IP del servidor de Vercel
        if (response.status === 403) {
            return res.status(403).send("Bloqueo de IP: El servidor de video detectó el proxy.");
        }

        const contentType = response.headers.get("content-type") || "";
        
        if (contentType.includes("mpegurl") || url.includes(".m3u8")) {
            let text = await response.text();
            const baseUrl = url.substring(0, url.lastIndexOf("/") + 1);
            
            // Re-escribimos los segmentos para que sigan pasando por el proxy
            const fixedData = text.split("\n").map(line => {
                if (!line.trim() || line.startsWith("#")) return line;
                let fullUrl = line.startsWith("http") ? line : baseUrl + line;
                return `/api/video-proxy?url=${encodeURIComponent(fullUrl)}`;
            }).join("\n");

            res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
            res.setHeader("Access-Control-Allow-Origin", "*");
            return res.status(200).send(fixedData);
        }

        // Para los segmentos .ts (video)
        const buffer = await response.arrayBuffer();
        res.setHeader("Content-Type", contentType);
        res.setHeader("Access-Control-Allow-Origin", "*");
        return res.status(200).send(Buffer.from(buffer));

    } catch (e) {
        return res.status(500).send("Error en Maik Proxy");
    }
}

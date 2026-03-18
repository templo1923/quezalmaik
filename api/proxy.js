export default async function handler(req, res) {
    const { url } = req.query;
    if (!url) return res.status(400).send("Falta la URL");

    try {
        const response = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/119.0.0.0 Safari/537.36",
                "Referer": "https://tvtvhd.com/",
                "Origin": "https://tvtvhd.com"
            }
        });

        const contentType = response.headers.get("content-type");
        const data = await response.text();

        // Si es una lista de reproducción (.m3u8), arreglamos los links internos
        if (contentType.includes("mpegurl") || contentType.includes("application/vnd.apple.mpegurl")) {
            const baseUrl = url.substring(0, url.lastIndexOf("/") + 1);
            
            // Esta magia hace que cada pedacito de video también pase por tu proxy
            const fixedData = data.split("\n").map(line => {
                if (line.startsWith("http")) {
                    return `/api/video-proxy?url=${encodeURIComponent(line)}`;
                } else if (line.endsWith(".ts") || line.endsWith(".m3u8")) {
                    return `/api/video-proxy?url=${encodeURIComponent(baseUrl + line)}`;
                }
                return line;
            }).join("\n");

            res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
            res.setHeader("Access-Control-Allow-Origin", "*");
            return res.status(200).send(fixedData);
        }

        // Si es un pedazo de video (.ts), lo mandamos directo como binario
        const binaryData = await response.arrayBuffer();
        res.setHeader("Content-Type", contentType);
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.status(200).send(Buffer.from(binaryData));

    } catch (e) {
        console.error("Error Proxy:", e);
        res.status(500).send("Error en el servidor de Maik Sport");
    }
}

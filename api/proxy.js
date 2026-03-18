export default async function handler(req, res) {
    const { url } = req.query;
    if (!url) return res.status(400).send("Falta la URL");

    try {
        const response = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
                "Referer": "https://tvtvhd.com/",
                "Origin": "https://tvtvhd.com",
                "Accept": "*/*"
            }
        });

        if (!response.ok) {
            return res.status(response.status).send(`Error del origen: ${response.statusText}`);
        }

        const contentType = response.headers.get("content-type") || "";
        
        // Si es la lista de canales (.m3u8), arreglamos los links internos para que sigan usando el proxy
        if (contentType.includes("mpegurl") || contentType.includes("application/vnd.apple.mpegurl") || url.includes(".m3u8")) {
            const text = await response.text();
            const baseUrl = url.substring(0, url.lastIndexOf("/") + 1);
            
            const fixedData = text.split("\n").map(line => {
                if (line.trim() === "" || line.startsWith("#")) return line;
                
                let fullUrl = line.startsWith("http") ? line : baseUrl + line;
                return `/api/video-proxy?url=${encodeURIComponent(fullUrl)}`;
            }).join("\n");

            res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
            res.setHeader("Access-Control-Allow-Origin", "*");
            return res.status(200).send(fixedData);
        }

        // Si es un fragmento de video (.ts), lo enviamos como buffer binario (esto evita el Error 500)
        const buffer = await response.arrayBuffer();
        res.setHeader("Content-Type", contentType);
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Cache-Control", "public, max-age=10"); // Cache corta para streaming
        return res.status(200).send(Buffer.from(buffer));

    } catch (e) {
        console.error("Error en Proxy Maik:", e);
        return res.status(500).send("Error interno en el proxy");
    }
}

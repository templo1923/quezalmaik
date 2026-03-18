export default async function handler(req, res) {
    const { url } = req.query;
    if (!url) return res.status(400).send("No hay URL");

    try {
        const response = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
                "Referer": "https://tvtvhd.com/",
                "Origin": "https://tvtvhd.com"
            }
        });

        const data = await response.arrayBuffer();
        res.setHeader("Content-Type", response.headers.get("content-type") || "application/x-mpegURL");
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.status(200).send(Buffer.from(data));
    } catch (e) {
        res.status(500).send("Error en el proxy");
    }
}

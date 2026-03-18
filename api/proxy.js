export default async function handler(req, res) {
    const { url } = req.query;

    if (!url) {
        return res.status(400).json({ error: 'Falta la URL' });
    }

    try {
        const response = await fetch(decodeURIComponent(url), {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
                'Referer': 'https://www.google.com/'
            }
        });

        const data = await response.text();
        
        // Configuramos los headers para que tu web pueda leerlo sin bloqueos de CORS
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Content-Type', 'application/json');
        
        return res.status(200).json({ contents: data });
    } catch (error) {
        return res.status(500).json({ error: 'Error al obtener los datos' });
    }
}

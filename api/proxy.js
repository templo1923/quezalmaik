export default async function handler(req, res) {
    const { url } = req.query;

    if (!url) return res.status(400).send('Falta la URL');

    try {
        const response = await fetch(decodeURIComponent(url), {
            headers: {
                // Engañamos al sitio para que crea que somos un celular Android
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.162 Mobile Safari/537.36',
                'Referer': 'https://www.google.com/'
            }
        });

        const html = await response.text();
        
        // Esto permite que tu JS en el navegador lea los datos sin errores de CORS
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Content-Type', 'application/json');
        
        return res.status(200).json({ contents: html });
    } catch (error) {
        return res.status(500).json({ error: 'Error en el servidor proxy' });
    }
}

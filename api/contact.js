export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({
            error: 'Method not allowed'
        });
    }

    try {
        const { name, email, offer, message } = req.body;

        if (!name || !email || !offer) {
            return res.status(400).json({
                error: 'Missing required fields'
            });
        }

        console.log('Nueva oferta recibida:', {
            name,
            email,
            offer,
            message
        });

        return res.status(200).json({
            success: true
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: 'Server error'
        });
    }
}

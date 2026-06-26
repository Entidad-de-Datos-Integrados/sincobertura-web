import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    try {
        const { name, email, offer, message } = req.body;

        if (!name || !email || !offer) {
            return res.status(400).json({
                error: "Missing required fields"
            });
        }

        const data = await resend.emails.send({
            from: "SinCobertura <offers@sincobertura.com>",
            to: ["offers@sincobertura.com"],
            subject: `Nueva oferta para sincobertura.com — $${offer}`,
            replyTo: email,
            html: `
                <h2>Nueva oferta recibida</h2>
                <p><strong>Nombre:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Oferta:</strong> $${offer}</p>
                <p><strong>Mensaje:</strong></p>
                <p>${message || "Sin mensaje"}</p>
            `
        });

        return res.status(200).json({
            success: true,
            emailId: data.id
        });

    } catch (error) {
        console.error("RESEND ERROR:", error);

        return res.status(500).json({
            error: "Server error"
        });
    }
}

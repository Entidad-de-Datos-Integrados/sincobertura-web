const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({
            success: false,
            message: "Method not allowed"
        });
    }

    try {
        const {
            name,
            email,
            offer,
            message
        } = req.body;

        const turnstileToken = req.body["cf-turnstile-response"];

        if (!name || !email || !offer) {
            return res.status(400).json({
                success: false,
                message: "Por favor completa todos los campos obligatorios."
            });
        }

        if (!turnstileToken) {
            return res.status(400).json({
                success: false,
                message: "Verificación CAPTCHA requerida."
            });
        }

        const verification = await fetch(
            "https://challenges.cloudflare.com/turnstile/v0/siteverify",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: new URLSearchParams({
                    secret: process.env.TURNSTILE_SECRET_KEY,
                    response: turnstileToken
                })
            }
        );

        const verificationResult = await verification.json();

        if (!verificationResult.success) {
            return res.status(403).json({
                success: false,
                message: "Verificación de seguridad fallida."
            });
        }

        const data = await resend.emails.send({
            from: "SinCobertura <onboarding@resend.dev>",
            to: ["wiinix20@gmail.com"],
            subject: `💼 Nueva oferta por SinCobertura.com — $${offer}`,
            replyTo: email,
            html: `
                <div style="font-family:Arial,sans-serif;line-height:1.6">
                    <h2>📩 Nueva oferta recibida</h2>

                    <p><strong>Nombre:</strong> ${name}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Oferta:</strong> $${offer}</p>

                    <hr/>

                    <p><strong>Mensaje:</strong></p>
                    <p>${message || "Sin mensaje adicional"}</p>
                </div>
            `
        });

        return res.status(200).json({
            success: true,
            message: "Oferta enviada correctamente. Te contactaremos en menos de 24 horas.",
            emailId: data.id
        });

    } catch (error) {
        console.error("API ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Error interno. Intenta nuevamente."
        });
    }
};

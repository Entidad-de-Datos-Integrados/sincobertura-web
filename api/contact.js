const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const {
            name,
            email,
            offer,
            message
        } = req.body;

        const turnstileToken = req.body["cf-turnstile-response"];

        console.log("TURNSTILE_SECRET:", process.env.TURNSTILE_SECRET_KEY);
        console.log("TOKEN:", turnstileToken);

        if (!name || !email || !offer) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        if (!turnstileToken) {
            return res.status(400).json({ error: "Captcha required" });
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

        console.log("VERIFICATION:", verificationResult);

        if (!verificationResult.success) {
            return res.status(403).json({ error: "Captcha failed" });
        }

        const data = await resend.emails.send({
            from: "SinCobertura <onboarding@resend.dev>",
            to: ["offers@sincobertura.com"],
            subject: `Nueva oferta — $${offer}`,
            replyTo: email,
            html: `
                <h2>Nueva oferta</h2>
                <p><b>Nombre:</b> ${name}</p>
                <p><b>Email:</b> ${email}</p>
                <p><b>Oferta:</b> $${offer}</p>
                <p><b>Mensaje:</b> ${message || "Sin mensaje"}</p>
            `
        });

        return res.status(200).json({
            success: true,
            emailId: data.id
        });

    } catch (error) {
        console.error("ERROR:", error);
        return res.status(500).json({ error: "Server error" });
    }
};

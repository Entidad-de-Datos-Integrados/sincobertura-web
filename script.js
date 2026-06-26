/**
 * SinCobertura.com
 * Landing premium para venta de dominio
 */

document.addEventListener('DOMContentLoaded', () => {
    initCharacterCounter();
    initSmoothScroll();
    initContactForm();
    initParticles();
});

/* =========================
   CHARACTER COUNTER
========================= */
function initCharacterCounter() {
    const textarea = document.getElementById('formMessage');
    const counter = document.getElementById('charCounter');

    if (!textarea || !counter) return;

    textarea.addEventListener('input', () => {
        counter.textContent = `${textarea.value.length} / 500`;
    });
}

/* =========================
   SMOOTH SCROLL
========================= */
function initSmoothScroll() {
    const anchors = document.querySelectorAll('a[href^="#"]');

    anchors.forEach(anchor => {
        anchor.addEventListener('click', e => {
            const targetSelector = anchor.getAttribute('href');
            const target = document.querySelector(targetSelector);

            if (!target) return;

            e.preventDefault();

            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        });
    });
}

/* =========================
   CONTACT FORM
========================= */
function initContactForm() {
    const form = document.getElementById('contactForm');
    const status = document.getElementById('formStatus');
    const submitBtn = document.getElementById('submitBtn');

    if (!form || !status || !submitBtn) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('formName')?.value.trim();
        const email = document.getElementById('formEmail')?.value.trim();
        const offer = document.getElementById('formOffer')?.value.trim();

        clearStatus(status);

        if (!name || !email || !offer) {
            showError(status, 'Completa todos los campos obligatorios.');
            return;
        }

        if (!isValidEmail(email)) {
            showError(status, 'Introduce un correo válido.');
            return;
        }

        if (Number(offer) <= 0 || Number.isNaN(Number(offer))) {
            showError(status, 'La oferta debe ser mayor que 0.');
            return;
        }

        const captchaResponse = form.querySelector(
            '[name="cf-turnstile-response"]'
        );

        if (!captchaResponse || !captchaResponse.value) {
            showError(status, 'Completa la verificación CAPTCHA.');
            return;
        }

        submitBtn.disabled = true;
        submitBtn.innerHTML =
            '<i class="fas fa-spinner fa-spin"></i> Enviando...';

        try {

            /* =========================
               🟢 PAYLOAD REAL (FIX)
            ========================= */
            const payload = {
                name,
                email,
                offer,
                message: document.getElementById('formMessage')?.value || '',
                "cf-turnstile-response": captchaResponse.value
            };

            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Error en el envío');
            }

            form.reset();

            if (window.turnstile) {
                turnstile.reset();
            }

            const counter = document.getElementById('charCounter');
            if (counter) counter.textContent = '0 / 500';

            /* =========================
               🟣 UI PREMIUM (NUEVO)
            ========================= */
            showPremiumSuccess(document.querySelector(".contact-container"));

        } catch (error) {
            console.error(error);

            showError(
                status,
                'No se pudo enviar el formulario. Intenta nuevamente.'
            );
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML =
                '<i class="fas fa-paper-plane"></i> Enviar oferta';
        }
    });
}

/* =========================
   🟣 PREMIUM SUCCESS SCREEN (NUEVO)
========================= */
function showPremiumSuccess(container) {
    container.innerHTML = `
        <div style="
            text-align:center;
            padding:60px 20px;
        ">
            <div style="font-size:64px;">✅</div>

            <h2 style="margin-top:20px;font-size:28px;">
                Oferta enviada
            </h2>

            <p style="color:#64748b;margin-top:10px;">
                Hemos recibido tu propuesta para <strong>SinCobertura.com</strong>
            </p>

            <div style="
                margin:30px auto;
                padding:20px;
                max-width:420px;
                background:#f8fafc;
                border:1px solid #e2e8f0;
                border-radius:16px;
            ">
                <p style="margin:0;font-weight:600;">
                    ⏱ Tiempo de respuesta
                </p>
                <p style="margin-top:8px;color:#475569;">
                    Normalmente respondemos en menos de 24 horas
                </p>
            </div>

            <p style="color:#94a3b8;font-size:14px;">
                Puedes cerrar esta página o seguir navegando
            </p>
        </div>
    `;
}

/* =========================
   HELPERS
========================= */
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function clearStatus(statusEl) {
    statusEl.className = '';
    statusEl.style.display = 'none';
    statusEl.textContent = '';
}

function showError(statusEl, message) {
    statusEl.className = 'error';
    statusEl.style.display = 'block';
    statusEl.textContent = `❌ ${message}`;
}

/* =========================
   PARTICLES
========================= */
function initParticles() {
    if (typeof particlesJS === 'undefined') return;

    particlesJS('particles-js', {
        particles: {
            number: {
                value: 45,
                density: {
                    enable: true,
                    value_area: 800
                }
            },
            color: {
                value: '#3b82f6'
            },
            shape: {
                type: 'circle'
            },
            opacity: {
                value: 0.25,
                random: true,
                anim: {
                    enable: true,
                    speed: 0.6,
                    opacity_min: 0.1,
                    sync: false
                }
            },
            size: {
                value: 3,
                random: true
            },
            line_linked: {
                enable: true,
                distance: 160,
                color: '#3b82f6',
                opacity: 0.12,
                width: 1
            },
            move: {
                enable: true,
                speed: 0.6,
                direction: 'none',
                random: true,
                straight: false,
                out_mode: 'out',
                bounce: false
            }
        },
        interactivity: {
            detect_on: 'canvas',
            events: {
                onhover: {
                    enable: true,
                    mode: 'grab'
                },
                onclick: {
                    enable: false
                },
                resize: true
            },
            modes: {
                grab: {
                    distance: 140,
                    line_linked: {
                        opacity: 0.25
                    }
                }
            }
        },
        retina_detect: true
    });
}

console.log('SinCobertura.com premium landing loaded');

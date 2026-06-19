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

        /*
         * Turnstile:
         * Cloudflare inyecta un input hidden:
         * cf-turnstile-response
         */
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
            const formData = new FormData(form);

            const response = await fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: {
                    Accept: 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Error en el envío');
            }

            form.reset();

            if (window.turnstile) {
                turnstile.reset();
            }

            const counter = document.getElementById('charCounter');
            if (counter) counter.textContent = '0 / 500';

            showSuccess(
                status,
                'Oferta enviada correctamente. Responderemos pronto.'
            );
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

function showSuccess(statusEl, message) {
    statusEl.className = 'success';
    statusEl.style.display = 'block';
    statusEl.textContent = `✅ ${message}`;
}

/* =========================
   PARTICLES
========================= */
function initParticles() {
    if (typeof particlesJS === 'undefined') return;

    particlesJS('particles-js', {
        particles: {
            number: {
                value: 35,
                density: {
                    enable: true,
                    value_area: 900
                }
            },
            color: {
                value: '#2563eb'
            },
            shape: {
                type: 'circle'
            },
            opacity: {
                value: 0.35,
                random: true
            },
            size: {
                value: 2.5,
                random: true
            },
            line_linked: {
                enable: true,
                distance: 130,
                color: '#2563eb',
                opacity: 0.18,
                width: 1
            },
            move: {
                enable: true,
                speed: 0.8,
                random: true,
                straight: false,
                out_mode: 'out'
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
                    enable: true,
                    mode: 'push'
                },
                resize: true
            },
            modes: {
                grab: {
                    distance: 110,
                    line_linked: {
                        opacity: 0.4
                    }
                },
                push: {
                    particles_nb: 2
                }
            }
        },
        retina_detect: true
    });
}

console.log('SinCobertura.com premium landing loaded');

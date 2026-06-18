/**
 * SinCobertura.com - Interacciones y funcionalidades
 */

document.addEventListener('DOMContentLoaded', function() {

    // ==========================================
    // 1. CONTADOR DE VISITAS CON LOCALSTORAGE
    // ==========================================
    function actualizarContadorVisitas() {
        const contadorSpan = document.getElementById('visitCounter');
        if (!contadorSpan) return;

        let visitas = localStorage.getItem('sincobertura_visitas');
        
        if (visitas === null) {
            visitas = 1;
        } else {
            visitas = parseInt(visitas) + 1;
        }
        
        localStorage.setItem('sincobertura_visitas', visitas);
        contadorSpan.textContent = visitas;
    }
    
    actualizarContadorVisitas();

    // ==========================================
    // 2. SMOOTH SCROLL
    // ==========================================
    document.querySelectorAll('a[href^="#"]').forEach(enlace => {
        enlace.addEventListener('click', function(e) {
            const destino = document.querySelector(this.getAttribute('href'));
            if (destino) {
                e.preventDefault();
                destino.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // ==========================================
    // 3. CALCULADORA DE SUBREDES
    // ==========================================
    function calcularSubred() {
        const ipInput = document.getElementById('ipInput');
        const maskInput = document.getElementById('maskInput');
        
        let ip = ipInput.value.trim();
        let cidr = parseInt(maskInput.value);
        
        if (!ip) {
            alert('Por favor, introduce una dirección IP válida.');
            return;
        }
        
        if (isNaN(cidr) || cidr < 0 || cidr > 32) {
            alert('La máscara CIDR debe ser un número entre 0 y 32.');
            return;
        }
        
        const ipParts = ip.split('.').map(Number);
        if (ipParts.length !== 4 || ipParts.some(n => isNaN(n) || n < 0 || n > 255)) {
            alert('La IP debe tener el formato correcto (Ej: 192.168.1.0)');
            return;
        }
        
        const maskBinary = '1'.repeat(cidr) + '0'.repeat(32 - cidr);
        const maskDecimal = [];
        for (let i = 0; i < 32; i += 8) {
            const byte = parseInt(maskBinary.substr(i, 8), 2);
            maskDecimal.push(byte);
        }
        
        const network = ipParts.map((octet, index) => octet & maskDecimal[index]);
        const wildcard = maskDecimal.map(octet => 255 - octet);
        const broadcast = network.map((octet, index) => octet | wildcard[index]);
        
        const firstHost = [...network];
        const lastHost = [...broadcast];
        if (cidr < 31) {
            if (cidr < 32) {
                let carry = 1;
                for (let i = 3; i >= 0 && carry > 0; i--) {
                    const sum = firstHost[i] + carry;
                    if (sum > 255) {
                        firstHost[i] = 0;
                        carry = 1;
                    } else {
                        firstHost[i] = sum;
                        carry = 0;
                    }
                }
                carry = 1;
                for (let i = 3; i >= 0 && carry > 0; i--) {
                    const diff = lastHost[i] - carry;
                    if (diff < 0) {
                        lastHost[i] = 255;
                        carry = 1;
                    } else {
                        lastHost[i] = diff;
                        carry = 0;
                    }
                }
            }
        }
        
        let totalHosts = Math.pow(2, 32 - cidr);
        if (cidr < 31) {
            totalHosts = totalHosts - 2;
        } else if (cidr === 31) {
            totalHosts = 2;
        } else if (cidr === 32) {
            totalHosts = 1;
        }
        
        document.getElementById('networkAddress').textContent = network.join('.');
        document.getElementById('broadcastAddress').textContent = broadcast.join('.');
        document.getElementById('hostRange').textContent = `${firstHost.join('.')} - ${lastHost.join('.')}`;
        document.getElementById('totalHosts').textContent = totalHosts;
        document.getElementById('decimalMask').textContent = maskDecimal.join('.');
    }
    
    const calcButton = document.getElementById('calcButton');
    if (calcButton) {
        calcButton.addEventListener('click', calcularSubred);
    }
    
    document.getElementById('ipInput')?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') calcularSubred();
    });
    document.getElementById('maskInput')?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') calcularSubred();
    });
    
    calcularSubred();

    // ==========================================
    // 4. FORMULARIO DE CONTACTO
    // ==========================================
    const contactForm = document.getElementById('contactForm');
    const formStatus = document.getElementById('formStatus');
    const submitBtn = document.getElementById('submitBtn');

    if (contactForm) {
        contact
    }

    const textarea = document.getElementById('formMessage');
    const counter = document.getElementById('charCounter');

    textarea.addEventListener('change', () => {
        const currentLength = textarea.value.length;
        counter.textContent = `${currentLength} / 500 caracteres`;
    });

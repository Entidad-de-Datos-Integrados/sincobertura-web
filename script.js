/**
 * SinCobertura.com - Interacciones y funcionalidades
 * Contador de visitas con LocalStorage + Calculadora de subredes
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
            // Primera visita
            visitas = 1;
        } else {
            visitas = parseInt(visitas) + 1;
        }
        
        localStorage.setItem('sincobertura_visitas', visitas);
        contadorSpan.textContent = visitas;
    }
    
    actualizarContadorVisitas();

    // ==========================================
    // 2. SMOOTH SCROLL para enlaces internos
    // ==========================================
    const linksInternos = document.querySelectorAll('a[href^="#"]');
    
    linksInternos.forEach(enlace => {
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
    // 3. BOTÓN "HACER UNA OFERTA"
    // ==========================================
    const btnOferta = document.getElementById('contactButton');
    
    if (btnOferta) {
        btnOferta.addEventListener('click', function(e) {
            console.log('🔔 Botón de oferta clickeado');
            this.style.transform = 'scale(0.96)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });
    }

    // ==========================================
    // 4. CALCULADORA DE SUBREDES
    // ==========================================
    function calcularSubred() {
        const ipInput = document.getElementById('ipInput');
        const maskInput = document.getElementById('maskInput');
        
        let ip = ipInput.value.trim();
        let cidr = parseInt(maskInput.value);
        
        // Validaciones básicas
        if (!ip) {
            alert('Por favor, introduce una dirección IP válida.');
            return;
        }
        
        if (isNaN(cidr) || cidr < 0 || cidr > 32) {
            alert('La máscara CIDR debe ser un número entre 0 y 32.');
            return;
        }
        
        // Convertir IP a array de números
        const ipParts = ip.split('.').map(Number);
        if (ipParts.length !== 4 || ipParts.some(n => isNaN(n) || n < 0 || n > 255)) {
            alert('La IP debe tener el formato correcto (Ej: 192.168.1.0)');
            return;
        }
        
        // Calcular máscara de subred en decimal
        const maskBinary = '1'.repeat(cidr) + '0'.repeat(32 - cidr);
        const maskDecimal = [];
        for (let i = 0; i < 32; i += 8) {
            const byte = parseInt(maskBinary.substr(i, 8), 2);
            maskDecimal.push(byte);
        }
        
        // Calcular dirección de red (AND bit a bit)
        const network = ipParts.map((octet, index) => octet & maskDecimal[index]);
        
        // Calcular broadcast (red + ~máscara)
        const wildcard = maskDecimal.map(octet => 255 - octet);
        const broadcast = network.map((octet, index) => octet | wildcard[index]);
        
        // Calcular rango de hosts
        const firstHost = [...network];
        const lastHost = [...broadcast];
        // Ajustar para redes /32 (no hay hosts) y /31 (2 hosts)
        if (cidr < 31) {
            if (cidr < 32) {
                // Si la red tiene más de 2 hosts, sumamos 1 al último octeto
                // Primera IP usable: network + 1
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
                // Última IP usable: broadcast - 1
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
        
        // Calcular total de hosts
        let totalHosts = Math.pow(2, 32 - cidr);
        if (cidr < 31) {
            totalHosts = totalHosts - 2;
        } else if (cidr === 31) {
            totalHosts = 2;
        } else if (cidr === 32) {
            totalHosts = 1;
        }
        
        // Mostrar resultados
        document.getElementById('networkAddress').textContent = network.join('.');
        document.getElementById('broadcastAddress').textContent = broadcast.join('.');
        document.getElementById('hostRange').textContent = `${firstHost.join('.')} - ${lastHost.join('.')}`;
        document.getElementById('totalHosts').textContent = totalHosts;
        document.getElementById('decimalMask').textContent = maskDecimal.join('.');
    }
    
    // Evento del botón de calcular
    const calcButton = document.getElementById('calcButton');
    if (calcButton) {
        calcButton.addEventListener('click', calcularSubred);
    }
    
    // Calcular al presionar Enter en los inputs
    document.getElementById('ipInput')?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') calcularSubred();
    });
    document.getElementById('maskInput')?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') calcularSubred();
    });
    
    // Cálculo inicial automático
    calcularSubred();

    // ==========================================
    // 5. LOG DE INICIO
    // ==========================================
    console.log('🚀 SinCobertura.com - Dominio listo para tu próximo proyecto.');
    console.log('📊 Versión con HTML, CSS y JS separados (buenas prácticas)');
    console.log('🔄 Contador de visitas activo con LocalStorage');
    console.log('🧮 Calculadora de subredes funcional');

});

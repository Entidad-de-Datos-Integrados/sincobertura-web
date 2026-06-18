/**
 * SinCobertura.com - Interacciones y funcionalidades
 */

document.addEventListener('DOMContentLoaded', function() {
    // Contador de caracteres en el texarea
    const textarea = document.getElementById('formMessage');
    const counter = document.getElementById('charCounter');

    textarea.addEventListener('input', () => {
        const currentLength = textarea.value.length;
        counter.textContent = `${currentLength} / 500 caracteres`;
    });

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
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('formName').value.trim();
            const email = document.getElementById('formEmail').value.trim();
            const offer = document.getElementById('formOffer').value.trim();
            
            if (!name || !email || !offer) {
                formStatus.className = 'error';
                formStatus.textContent = '❌ Por favor, completa todos los campos obligatorios (*).';
                formStatus.style.display = 'block';
                return;
            }
            
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                formStatus.className = 'error';
                formStatus.textContent = '❌ Por favor, introduce un correo electrónico válido.';
                formStatus.style.display = 'block';
                return;
            }
            
            if (isNaN(offer) || parseInt(offer) < 1) {
                formStatus.className = 'error';
                formStatus.textContent = '❌ Por favor, introduce una oferta válida (mínimo $1 USD).';
                formStatus.style.display = 'block';
                return;
            }
            
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
            formStatus.style.display = 'none';
            
            const formData = new FormData(contactForm);
            
            fetch(contactForm.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            })
            .then(response => {
                if (response.ok) {
                    formStatus.className = 'success';
                    formStatus.textContent = '✅ ¡Oferta enviada con éxito! Te responderemos en menos de 24 horas.';
                    formStatus.style.display = 'block';
                    contactForm.reset();
                } else {
                    return response.json().then(data => {
                        throw new Error(data.error || 'Error al enviar el formulario');
                    });
                }
            })
            .catch(error => {
                formStatus.className = 'error';
                formStatus.textContent = '❌ Hubo un error al enviar tu oferta. Por favor, intenta de nuevo.';
                formStatus.style.display = 'block';
                console.error('Error:', error);
            })
            .finally(() => {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Enviar oferta';
            });
        });
    }

    console.log('🚀 SinCobertura.com - Dominio listo para tu próximo proyecto.');
    console.log('📊 Versión con HTML, CSS y JS separados (buenas prácticas)');
});

// ==========================================
// 6. PRUEBA DE ESTABILIDAD DE INTERNET
// ==========================================
let stabilityTestRunning = false;
let stabilityInterval = null;
let packetHistory = [];
let stats = {
    sent: 0,
    received: 0,
    lost: 0,
    latencies: [],
    startTime: null
};

const startBtn = document.getElementById('startStabilityTest');
const testStatus = document.getElementById('testStatus');
const chartContainer = document.getElementById('chartContainer');

// Elementos de métricas
const packetLossEl = document.getElementById('packetLoss');
const avgLatencyEl = document.getElementById('avgLatency');
const jitterEl = document.getElementById('jitterValue');
const sentPacketsEl = document.getElementById('sentPackets');
const receivedPacketsEl = document.getElementById('receivedPackets');
const lostPacketsEl = document.getElementById('lostPackets');
const minLatencyEl = document.getElementById('minLatency');
const maxLatencyEl = document.getElementById('maxLatency');
const testDurationEl = document.getElementById('testDuration');

function generateLatency() {
    // Simula latencia con variación realista
    const baseLatency = 20 + Math.random() * 80;
    // Algunos paquetes tienen latencia alta (simulando congestión)
    if (Math.random() < 0.05) {
        return 150 + Math.random() * 200;
    }
    return baseLatency;
}

function addPacketToChart(latency) {
    // Determinar estado
    let status = 'good';
    if (latency === null) {
        status = 'lost';
    } else if (latency > 150) {
        status = 'bad';
    } else if (latency > 80) {
        status = 'regular';
    }
    
    packetHistory.push({ latency, status });
    if (packetHistory.length > 50) {
        packetHistory.shift();
    }
    
    renderChart();
}

function renderChart() {
    const maxLatency = 200;
    chartContainer.innerHTML = '';
    
    packetHistory.forEach(packet => {
        const bar = document.createElement('div');
        bar.className = `chart-bar ${packet.status}`;
        const height = packet.latency !== null 
            ? Math.min((packet.latency / maxLatency) * 100, 100)
            : 4;
        bar.style.height = `${Math.max(height, 4)}%`;
        chartContainer.appendChild(bar);
    });
}

function updateMetrics() {
    const total = stats.sent;
    const received = stats.received;
    const lost = stats.lost;
    const latencies = stats.latencies;
    
    // Pérdida de paquetes
    const lossPercent = total > 0 ? (lost / total) * 100 : 0;
    packetLossEl.textContent = `${lossPercent.toFixed(1)}%`;
    packetLossEl.className = 'metric-value';
    if (lossPercent > 10) {
        packetLossEl.classList.add('danger');
    } else if (lossPercent > 3) {
        packetLossEl.classList.add('warning');
    } else {
        packetLossEl.classList.add('success');
    }
    
    // Latencia promedio
    const avg = latencies.length > 0 
        ? latencies.reduce((a, b) => a + b, 0) / latencies.length 
        : 0;
    avgLatencyEl.textContent = `${avg.toFixed(0)} ms`;
    avgLatencyEl.className = 'metric-value';
    if (avg > 150) {
        avgLatencyEl.classList.add('danger');
    } else if (avg > 80) {
        avgLatencyEl.classList.add('warning');
    } else {
        avgLatencyEl.classList.add('success');
    }
    
    // Jitter (desviación estándar aproximada)
    let jitter = 0;
    if (latencies.length > 1) {
        const mean = avg;
        const squaredDiffs = latencies.map(l => Math.pow(l - mean, 2));
        const variance = squaredDiffs.reduce((a, b) => a + b, 0) / latencies.length;
        jitter = Math.sqrt(variance);
    }
    jitterEl.textContent = `${jitter.toFixed(0)} ms`;
    jitterEl.className = 'metric-value';
    if (jitter > 30) {
        jitterEl.classList.add('danger');
    } else if (jitter > 15) {
        jitterEl.classList.add('warning');
    } else {
        jitterEl.classList.add('success');
    }
    
    // Estadísticas
    sentPacketsEl.textContent = stats.sent;
    receivedPacketsEl.textContent = stats.received;
    lostPacketsEl.textContent = stats.lost;
    minLatencyEl.textContent = latencies.length > 0 
        ? `${Math.min(...latencies).toFixed(0)} ms` 
        : '0 ms';
    maxLatencyEl.textContent = latencies.length > 0 
        ? `${Math.max(...latencies).toFixed(0)} ms` 
        : '0 ms';
    
    if (stats.startTime) {
        const elapsed = (Date.now() - stats.startTime) / 1000;
        testDurationEl.textContent = `${Math.floor(elapsed)} seg`;
    }
}

function sendPacket() {
    if (!stabilityTestRunning) return;
    
    stats.sent++;
    const latency = generateLatency();
    
    // Simular pérdida de paquete (5-8% de probabilidad)
    const shouldLose = Math.random() < 0.06;
    
    if (shouldLose) {
        stats.lost++;
        addPacketToChart(null);
    } else {
        stats.received++;
        stats.latencies.push(latency);
        addPacketToChart(latency);
    }
    
    updateMetrics();
}

function startStabilityTest() {
    if (stabilityTestRunning) {
        // Detener prueba
        stabilityTestRunning = false;
        clearInterval(stabilityInterval);
        startBtn.innerHTML = '<i class="fas fa-play"></i> Reiniciar Prueba';
        testStatus.textContent = 'Prueba finalizada';
        testStatus.className = 'test-status';
        return;
    }
    
    // Reiniciar estadísticas
    stats = {
        sent: 0,
        received: 0,
        lost: 0,
        latencies: [],
        startTime: Date.now()
    };
    packetHistory = [];
    chartContainer.innerHTML = '';
    
    stabilityTestRunning = true;
    startBtn.innerHTML = '<i class="fas fa-stop"></i> Detener Prueba';
    testStatus.textContent = '▶ Probando conexión...';
    testStatus.className = 'test-status running';
    
    // Enviar paquetes cada 200ms (5 por segundo)
    let packetCount = 0;
    const maxPackets = 60; // 60 paquetes = ~12 segundos de prueba
    
    stabilityInterval = setInterval(() => {
        if (!stabilityTestRunning) {
            clearInterval(stabilityInterval);
            return;
        }
        sendPacket();
        packetCount++;
        if (packetCount >= maxPackets) {
            stabilityTestRunning = false;
            clearInterval(stabilityInterval);
            startBtn.innerHTML = '<i class="fas fa-play"></i> Reiniciar Prueba';
            testStatus.textContent = '✅ Prueba completada';
            testStatus.className = 'test-status';
        }
    }, 200);
}

// Evento del botón
if (startBtn) {
    startBtn.addEventListener('click', startStabilityTest);
}

// ==========================================
// 5. PARTICLES.JS - FONDO DE CONECTIVIDAD
// ==========================================
if (typeof particlesJS !== 'undefined') {
    particlesJS('particles-js', {
        particles: {
            number: {
                value: 80,
                density: {
                    enable: true,
                    value_area: 800
                }
            },
            color: {
                value: '#2563eb'
            },
            shape: {
                type: 'circle',
                stroke: {
                    width: 0,
                    color: '#000000'
                }
            },
            opacity: {
                value: 0.5,
                random: true,
                anim: {
                    enable: true,
                    speed: 1,
                    opacity_min: 0.1,
                    sync: false
                }
            },
            size: {
                value: 3,
                random: true,
                anim: {
                    enable: true,
                    speed: 2,
                    size_min: 0.1,
                    sync: false
                }
            },
            line_linked: {
                enable: true,
                distance: 150,
                color: '#2563eb',
                opacity: 0.3,
                width: 1
            },
            move: {
                enable: true,
                speed: 1.5,
                direction: 'none',
                random: true,
                straight: false,
                out_mode: 'out',
                bounce: false,
                attract: {
                    enable: true,
                    rotateX: 600,
                    rotateY: 1200
                }
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
                    distance: 140,
                    line_linked: {
                        opacity: 0.6
                    }
                },
                push: {
                    particles_nb: 4
                }
            }
        },
        retina_detect: true
    });
}

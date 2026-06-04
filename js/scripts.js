/**
 * LOBOLINK CAREER STUDIO - F1 PERFORMANCE ENGINE
 * Controlador Asíncrono para la Hoja de Vida de Jorge Leonardo Torres Romero (2026)
 */

document.addEventListener("DOMContentLoaded", () => {
    // 1. Detección automática de idioma mediante la etiqueta <html lang="...">
    const htmlLanguage = document.documentElement.lang.toLowerCase();
    let dataUrl = "data/datos.json"; // Repositorio en Español por defecto

    if (htmlLanguage === "en" || window.location.pathname.toLowerCase().includes("-en")) {
        dataUrl = "data/datos-en.json"; // Futuro repositorio en Inglés
    }

    // 2. Arrancar la carga de datos del piloto
    fetchRaceData(dataUrl);
});

/**
 * Realiza la petición asíncrona al JSON de configuración
 */
async function fetchRaceData(url) {
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Código de respuesta HTTP: ${response.status}. Revisa la existencia del JSON.`);
        }
        
        const telemetryData = await response.json();
        
        // Ejecución secuencial y controlada de inyecciones (Previene congelamientos de pantalla)
        if (telemetryData.informacion_personal) {
            renderCockpitProfile(telemetryData.informacion_personal, telemetryData.perfil_profesional);
        }
        if (telemetryData.habilidades_modulares) {
            renderSetupSkills(telemetryData.habilidades_modulares);
        }
        if (telemetryData.experiencia_laboral) {
            renderTrackRecord(telemetryData.experiencia_laboral);
        }
        if (telemetryData.educacion_formal || telemetryData.certificaciones_cursos) {
            renderGridAcademy(telemetryData.educacion_formal, telemetryData.certificaciones_cursos);
        }
        
        // Activar hilos de animaciones visuales e interactividad
        initializeIntersectionObserver();
        initializeScrollSpy();
        
    } catch (error) {
        console.error("❌ [F1 ENGINE CRITICAL ERROR]: ", error.message);
        
        // Banner de emergencia visual en el DOM en caso de desconexión de datos
        const pilotNameEl = document.getElementById("client-name");
        if (pilotNameEl) {
            pilotNameEl.style.color = "#ff3333";
            pilotNameEl.textContent = "ENGINE_DOWN_500";
        }
    }
}

/**
 * Inyecta los datos principales del Cockpit (Sección Perfil)
 */
function renderCockpitProfile(personal, perfilProfesional) {
    // Textos de identidad
    const elName = document.getElementById("client-name");
    if (elName) elName.textContent = personal.nombre_completo;

    const elTitle = document.getElementById("client-title");
    if (elTitle) elTitle.textContent = personal.titular_profesional;

    const elSummary = document.getElementById("client-summary");
    if (elSummary) elSummary.textContent = perfilProfesional;

    // Datos de telemetría lateral
    const elEmail = document.getElementById("client-email");
    if (elEmail) elEmail.textContent = personal.email;

    const elPhone = document.getElementById("client-phone");
    if (elPhone) elPhone.textContent = personal.telefono;

    const elLocation = document.getElementById("client-location");
    if (elLocation) elLocation.textContent = personal.ubicacion;

    const elIdCard = document.getElementById("client-id-card");
    if (elIdCard) elIdCard.textContent = personal.identificacion;

    // Renderizado dinámico de las Licencias de Conducción (Badges de Pista)
    const licensesContainer = document.getElementById("client-licenses");
    if (licensesContainer && personal.licencias) {
        licensesContainer.innerHTML = personal.licencias
            .map(lic => `<span class="license-tag"><i class="fa-solid fa-id-card-clip"></i> L_${lic}</span>`)
            .join("");
    }

    // Enlaces de comunicación directa
    const whatsappBtn = document.getElementById("client-whatsapp");
    if (whatsappBtn && personal.whatsapp_url) {
        whatsappBtn.href = personal.whatsapp_url;
    }

    const emailBtn = document.getElementById("client-email-btn");
    if (emailBtn && personal.email) {
        emailBtn.href = `mailto:${personal.email}?subject=Contacto%20Desde%20Perfil%20F1%20Mantenimiento`;
    }
}

/**
 * Inyecta las operaciones del Track Record (Línea de Tiempo de Experiencia)
 */
function renderTrackRecord(experiencias) {
    const container = document.getElementById("experience-timeline");
    if (!container) return;
    
    let htmlBuffer = "";
    experiencias.forEach(exp => {
        // Mapear cada función laboral como un ítem de telemetría individual
        const funcionesHTML = exp.funciones.map(func => `<li>${func}</li>`).join("");
        
        htmlBuffer += `
            <div class="timeline-item-cyber reveal-ready">
                <div class="timeline-node"></div>
                <div class="timeline-header-block">
                    <div>
                        <h3 class="company-tech">${exp.empresa}</h3>
                        <span class="role-tech">${exp.cargo}</span>
                    </div>
                    <span class="period-badge-cyber">${exp.periodo}</span>
                </div>
                <div class="timeline-body-cyber">
                    <ul>${funcionesHTML}</ul>
                </div>
            </div>`;
    });
    
    container.innerHTML = htmlBuffer;
}

/**
 * Inyecta la configuración de capacidades (Módulos de Habilidades)
 */
function renderSetupSkills(habilidades) {
    const container = document.getElementById("skills-grid");
    if (!container) return;
    
    let htmlBuffer = "";
    habilidades.forEach(module => {
        const tagsHTML = module.tecnologias.map(tech => `<span class="skill-tag">${tech}</span>`).join("");
        
        htmlBuffer += `
            <div class="skill-module-card reveal-ready">
                <div class="skill-card-header">
                    <i class="${module.icono}"></i>
                    <h3>${module.categoria}</h3>
                </div>
                <div class="skills-tags-container">${tagsHTML}</div>
            </div>`;
    });
    
    container.innerHTML = htmlBuffer;
}

/**
 * Inyecta la formación académica y certificaciones (Grid Academy)
 */
function renderGridAcademy(educacion, certificaciones) {
    const eduContainer = document.getElementById("education-container");
    if (eduContainer && educacion) {
        eduContainer.innerHTML = educacion.map(edu => `
            <div class="education-card-cyber reveal-ready">
                <div class="edu-year">// ${edu.año}</div>
                <div class="edu-title">${edu.titulo}</div>
                <div class="edu-institution">${edu.institucion}</div>
            </div>`).join("");
    }
    
    const certContainer = document.getElementById("certifications-container");
    if (certContainer && certificaciones) {
        certContainer.innerHTML = certificaciones.map(cert => `
            <div class="education-card-cyber reveal-ready">
                <div class="edu-year">// ${cert.año}</div>
                <div class="edu-title">${cert.curso}</div>
                <div class="edu-institution">${cert.institucion}</div>
            </div>`).join("");
    }
}

/**
 * Observador de intersección para activar las transiciones y efectos visuales de aceleración
 */
function initializeIntersectionObserver() {
    const elementsToReveal = document.querySelectorAll(".reveal-ready");
    if (!elementsToReveal.length) return;
    
    const raceObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("reveal-active");
            }
        });
    }, { rootMargin: "0px 0px -50px 0px", threshold: 0.05 });
    
    elementsToReveal.forEach(el => raceObserver.observe(el));
}

/**
 * Sincroniza el estado activo del menú de navegación según la posición en pista (Scroll Position)
 */
function initializeScrollSpy() {
    const sections = document.querySelectorAll("section[id]");
    const navLinks = document.querySelectorAll(".nav-link");
    if (!sections.length || !navLinks.length) return;
    
    window.addEventListener("scroll", () => {
        let currentSectionId = "";
        const scrollPosition = window.scrollY + 220; // Offset para anticipar el cambio visual
        
        sections.forEach(section => {
            if (scrollPosition >= section.offsetTop && scrollPosition < section.offsetTop + section.offsetHeight) {
                currentSectionId = section.getAttribute("id");
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove("active");
            if (link.getAttribute("href") === `#${currentSectionId}`) {
                link.classList.add("active");
            }
        });
    }, { passive: true });
}
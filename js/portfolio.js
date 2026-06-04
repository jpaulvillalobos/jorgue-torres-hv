/**
 * LOBOLINK CAREER STUDIO - PORTFOLIO LOGS ENGINE
 * Gestor del procesamiento de datos para portafolio.json y portafolio-en.json
 */

document.addEventListener("DOMContentLoaded", () => {
    // 1. DETECCIÓN ELECTRÓNICA DE IDIOMA DIRECTAMENTE DESDE EL HTML
    // Lee si la etiqueta raíz es <html lang="es"> o <html lang="en">
    const currentLang = document.documentElement.lang || 'es';
    
    // Configuración por defecto de la ruta en español
    let portfolioJsonUrl = "data/portafolio.json"; 
    
    // Si detecta inglés, reasigna automáticamente el flujo hacia el JSON en inglés
    if (currentLang === 'en') {
        portfolioJsonUrl = "data/portafolio-en.json";
    }

    console.log(`[Engine Status] Idioma detectado: "${currentLang}". Cargando origen: ${portfolioJsonUrl}`);

    // Intentar leer la telemetría del portafolio correspondiente
    fetch(portfolioJsonUrl)
        .then(response => {
            if (!response.ok) throw new Error(`No se pudo mapear el archivo: ${portfolioJsonUrl}`);
            return response.json();
        })
        .then(data => {
            renderPortfolio(data.proyectos);
            setupFilterSystem(data.proyectos, currentLang); // Pasamos el idioma al sistema de filtros
        })
        .catch(err => {
            console.error("❌ Error en el motor del portafolio:", err);
            const container = document.getElementById("projects-container");
            if (container) {
                const errorMessage = currentLang === 'en' 
                    ? `[CRITICAL_ERROR]: PORTFOLIO_DATA_UNREACHABLE // Verify ${portfolioJsonUrl}`
                    : `[ERROR_CRÍTICO]: DATOS_PORTAFOLIO_INACCESIBLES // Verifica ${portfolioJsonUrl}`;

                container.innerHTML = `
                    <div class="mono-text" style="grid-column: 1/-1; text-align: center; color: #ff3333; padding: 40px;">
                        ${errorMessage}
                    </div>`;
            }
        });
});

/**
 * Renderiza las tarjetas de proyectos en el contenedor de la pista
 */
function renderPortfolio(proyectos) {
    const container = document.getElementById("projects-container");
    if (!container) return;
    
    if (!proyectos || proyectos.length === 0) {
        container.innerHTML = `<div class="mono-text" style="grid-column: 1/-1; text-align: center; padding: 40px;">NO_RECORDS_FOUND</div>`;
        return;
    }

    container.innerHTML = proyectos.map(project => `
        <div class="project-card-f1" data-category="${project.categoria_id}" style="opacity: 0; transition: opacity 0.3s ease;">
            <div class="project-img-wrapper">
                <img src="${project.imagen_url}" alt="${project.titulo}">
                <div class="project-badge-tag">${project.categoria_label}</div>
            </div>
            <div class="project-info-content">
                <div class="project-meta-date">// ${project.fecha_operacion}</div>
                <h3 class="project-headline">${project.titulo}</h3>
                <p class="project-description-text">${project.descripcion}</p>
                <div class="project-tech-stack-row">
                    ${project.herramientas_tags.map(tag => `<span class="tech-pill-f1">${tag}</span>`).join('')}
                </div>
            </div>
        </div>
    `).join('');
    
    // Suavizado de aparición con transiciones CSS
    setTimeout(() => {
        document.querySelectorAll('.project-card-f1').forEach(card => card.style.opacity = "1");
    }, 50);
}

/**
 * Genera dinámicamente los botones de filtrado basándose en las categorías existentes
 */
function setupFilterSystem(proyectos, currentLang) {
    const filterHub = document.getElementById("portfolio-filters");
    if (!filterHub || !proyectos) return;

    const categoriasUnicas = [];
    const mapeoCategorias = {};

    proyectos.forEach(p => {
        if (!mapeoCategorias[p.categoria_id]) {
            mapeoCategorias[p.categoria_id] = p.categoria_label;
            categoriasUnicas.push({ id: p.categoria_id, label: p.categoria_label });
        }
    });

    // Cambiar dinámicamente el texto del botón principal según el idioma de la página
    const mainFilterText = currentLang === 'en' ? 'ALL_LOGS' : 'TODO_LOG';
    
    // Limpiamos y aseguramos que el botón inicial "ALL" esté correctamente configurado
    filterHub.innerHTML = `
        <button class="filter-btn-f1 active" data-filter="all">
            <span>${mainFilterText}</span>
        </button>
    `;

    // Inyectar el resto de botones dinámicos en el panel de control
    categoriasUnicas.forEach(cat => {
        const btn = document.createElement("button");
        btn.className = "filter-btn-f1";
        btn.setAttribute("data-filter", cat.id);
        btn.innerHTML = `<span>// ${cat.label.toUpperCase().replace(/ /g, "_")}</span>`;
        filterHub.appendChild(btn);
    });

    // Delegación y manejo del evento de filtrado por categoría
    const botones = filterHub.querySelectorAll(".filter-btn-f1");
    botones.forEach(btn => {
        btn.addEventListener("click", () => {
            botones.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            const filtro = btn.getAttribute("data-filter");
            const tarjetas = document.querySelectorAll(".project-card-f1");

            tarjetas.forEach(card => {
                if (filtro === "all" || card.getAttribute("data-category") === filtro) {
                    card.style.display = "flex";
                    setTimeout(() => card.style.opacity = "1", 10);
                } else {
                    card.style.opacity = "0";
                    card.style.display = "none";
                }
            });
        });
    });
}
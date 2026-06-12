class ProjectCard extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    const title = this.getAttribute('title') || 'Project Title';
    const description = this.getAttribute('description') || 'A cool project description template. Edit this in your HTML to showcase your actual work.';
    const tags = this.getAttribute('tags') ? this.getAttribute('tags').split(',') : ['HTML', 'CSS', 'JS'];
    const link = this.getAttribute('link') || '#';
    const github = this.getAttribute('github') || '';
    const image = this.getAttribute('image') || '';

    // Create container inside the custom element
    const container = document.createElement('div');
    container.className = 'project-card';

    // Build the tags list HTML
    const tagsHTML = tags
      .map(tag => `<span class="project-tag">${tag.trim()}</span>`)
      .join('');

    // Build image HTML if image attribute exists
    const imageHTML = image
      ? `<div class="project-card-image-wrapper">
           <img class="project-card-image" src="${image}" alt="${title}">
         </div>`
      : `<div class="project-card-image-wrapper placeholder-wrapper">
           <div class="project-card-placeholder-glow"></div>
           <span class="project-card-placeholder-text">${title.charAt(0).toUpperCase()}</span>
         </div>`;

    // Build action links HTML
    let linksHTML = '';
    if (github) {
      linksHTML += `
        <a href="${github}" class="project-card-icon-link" target="_blank" rel="noopener" aria-label="GitHub Repository">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22" />
          </svg>
        </a>
      `;
    }

    linksHTML += `
      <a href="${link}" class="project-card-link-btn" target="_blank" rel="noopener">
        <span>View Project</span>
        <svg class="arrow-icon" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 7h12M8 2l5 5-5 5" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </a>
    `;

    container.innerHTML = `
      ${imageHTML}
      <div class="project-card-content">
        <div class="project-card-tags">
          ${tagsHTML}
        </div>
        <h3 class="project-card-title">${title}</h3>
        <p class="project-card-desc">${description}</p>
        <div class="project-card-actions">
          ${linksHTML}
        </div>
      </div>
    `;

    this.appendChild(container);
  }
}

// Register Web Component
customElements.define('project-card', ProjectCard);

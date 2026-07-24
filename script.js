// JavaScript for Permeet Valicha Portfolio

document.addEventListener('DOMContentLoaded', function () {
    // Experience-letter preview: viewing stays on the portfolio; saving is an explicit choice.
    const experienceModal = document.getElementById('experience-letter-modal');
    const experiencePreview = document.getElementById('experience-letter-preview');
    const experienceTitle = document.getElementById('experience-letter-title');
    const experienceDownload = document.getElementById('experience-letter-download');
    const experienceCloseButton = document.querySelector('[data-close-experience-modal]');
    let experienceTrigger = null;

    function closeExperienceModal() {
        if (!experienceModal) return;
        experienceModal.classList.add('hidden');
        experienceModal.classList.remove('flex');
        experienceModal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('overflow-hidden');
        experienceTrigger?.focus();
    }

    function openExperienceLetter(button) {
        if (!experienceModal || !experiencePreview || !experienceDownload) return;
        const imagePath = button.dataset.experienceLetter;
        experienceTrigger = button;
        experiencePreview.src = imagePath;
        experiencePreview.alt = `${button.dataset.experienceTitle || 'Experience letter'} preview`;
        experienceTitle.textContent = button.dataset.experienceTitle || 'Experience Letter';
        experienceDownload.href = imagePath;
        experienceDownload.download = imagePath.split('/').pop() || 'experience-letter.jpg';
        experienceModal.classList.remove('hidden');
        experienceModal.classList.add('flex');
        experienceModal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('overflow-hidden');
        experienceCloseButton?.focus();
    }

    document.addEventListener('click', event => {
        const button = event.target.closest('[data-experience-letter]');
        if (button) openExperienceLetter(button);
    });

    // Only former employers can display a letter. "Present" means the job is still current.
    function updateExperienceLetterButtons(scope = document) {
        scope.querySelectorAll('.experience-entry').forEach(entry => {
            const period = entry.querySelector('.experience-date')?.textContent || '';
            const letterButton = entry.querySelector('[data-experience-letter]');
            if (!letterButton || /\bpresent\b/i.test(period)) return;

            letterButton.classList.remove('hidden');
            letterButton.classList.add('inline-flex');
        });
    }

    updateExperienceLetterButtons();

    // Paste a published Google Sheet CSV URL here once. After that, future edits happen only in Google Sheets.
    const GOOGLE_SHEET_EXPERIENCE_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRqd_jeruC8e1swrlIpvfJYwijMCXTLY-Tty4Lz9xouU5fRJfO6fSIW65TC8Nv_dCPheHUnSSzhCMic/pub?output=csv';
    const experienceList = document.getElementById('experience-list');

    function parseCsv(csv) {
        const rows = [];
        let row = [], value = '', quoted = false;
        for (let i = 0; i < csv.length; i += 1) {
            const char = csv[i], next = csv[i + 1];
            if (char === '"' && quoted && next === '"') { value += '"'; i += 1; }
            else if (char === '"') quoted = !quoted;
            else if (char === ',' && !quoted) { row.push(value.trim()); value = ''; }
            else if ((char === '\n' || char === '\r') && !quoted) {
                if (char === '\r' && next === '\n') i += 1;
                row.push(value.trim());
                if (row.some(cell => cell)) rows.push(row);
                row = []; value = '';
            } else value += char;
        }
        if (value || row.length) { row.push(value.trim()); rows.push(row); }
        const headers = rows.shift().map(header => header.toLowerCase().replace(/[^a-z]/g, ''));
        return rows.map(rowData => Object.fromEntries(headers.map((header, index) => [header, rowData[index] || ''])));
    }

    function escapeHtml(value = '') {
        return value.replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
    }

    function renderSheetExperiences(experiences) {
        if (!experienceList || !experiences.length) return;
        const existingLetterImages = {
            'weuno technologies': 'images/experience-letters/weuno-experience-letter.jfif',
            'sapphire consultancy services': 'images/experience-letters/sapphire-experience-letter.jfif',
            'vativeapps': 'images/experience-letters/vativeapps-experience-letter.jpg'
        };
        const companyLogos = {
            'vativeapps': { src: 'images/dark-logo.png', alt: 'vativeApps', width: 130, website: 'https://vativeapps.com' },
            'weuno technologies': { src: 'images/Weuno_logo.png', alt: 'WeUno Logo', width: 70, website: 'https://weuno.com' },
            'sapphire consultancy services': { src: 'images/sapphire.png', alt: 'Sapphire Logo', width: 80, website: 'https://sapphire.co' }
        };
        experienceList.innerHTML = experiences.map((experience, index) => {
            const company = escapeHtml(experience.company);
            const companyKey = (experience.company || '').trim().toLowerCase();
            const letterImage = experience.letterimage || existingLetterImages[companyKey] || '';
            const logo = companyLogos[companyKey];
            const role = escapeHtml(experience.role);
            const startDate = escapeHtml(experience.startdate);
            const endDate = escapeHtml(experience.enddate || 'Present');
            const period = `${startDate} — ${endDate}`;
            const companyWebsite = experience.website || logo?.website || '';
            const companyHeading = logo
                ? `<div class="flex items-center gap-3"><a href="${escapeHtml(companyWebsite)}" target="_blank" rel="noopener noreferrer" class="relative z-50 flex items-center gap-4 group hover:scale-[1.02] transition-all duration-300"><img src="${logo.src}" alt="${logo.alt}" class="experience-logo" style="width: ${logo.width}px; height: auto; object-fit: contain;"><h4 class="text-2xl font-bold text-on-surface group-hover:text-primary transition-colors">${company}</h4></a></div>`
                : `<h4 class="text-2xl font-bold text-on-surface">${companyWebsite ? `<a href="${escapeHtml(companyWebsite)}" target="_blank" rel="noopener noreferrer" class="group hover:text-primary transition-colors">${company}</a>` : company}</h4>`;
            // Every new line in the Google Sheet Description cell becomes its own bullet point.
            // A pipe (|) is also supported for users who prefer entering bullets on one line.
            const duties = (experience.description || '').split(/\r?\n|\|/).filter(duty => duty.trim()).map(duty => `<li class="flex items-start gap-3"><span class="material-symbols-outlined text-primary text-sm mt-1">check_circle</span>${escapeHtml(duty.trim())}</li>`).join('');
            const letterButton = letterImage ? `<button type="button" data-experience-letter="${escapeHtml(letterImage)}" data-experience-title="${company} — Experience Letter" class="experience-letter-button mt-6 hidden items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white transition-all hover:bg-primary-container hover:shadow-lg"><span class="material-symbols-outlined text-base">description</span>View Experience Letter</button>` : '';
            return `<div class="experience-entry relative pl-12 border-l-2 ${index === 0 ? 'border-primary-container' : 'border-outline-variant'} reveal active"><div class="absolute -left-[9px] top-0 w-4 h-4 ${index === 0 ? 'bg-primary ring-primary-fixed' : 'bg-outline-variant ring-surface'} rounded-full ring-4"></div><div class="flex flex-col md:flex-row md:items-center justify-between mb-4">${companyHeading}<span class="experience-date text-sm font-bold text-on-surface-variant px-3 py-1 bg-surface-container-high rounded-lg w-fit">${period}</span></div><h5 class="text-lg font-semibold text-on-surface-variant mb-4">${role}</h5><ul class="space-y-3 text-on-surface-variant max-w-3xl">${duties}</ul>${letterButton}</div>`;
        }).join('');
        updateExperienceLetterButtons(experienceList);
    }

    if (GOOGLE_SHEET_EXPERIENCE_CSV_URL) {
        fetch(GOOGLE_SHEET_EXPERIENCE_CSV_URL)
            .then(response => {
                if (!response.ok) throw new Error('Unable to load Google Sheet');
                return response.text();
            })
            .then(parseCsv)
            .then(renderSheetExperiences)
            .catch(() => console.warn('Google Sheet could not be loaded; showing portfolio fallback experiences.'));
    }

    experienceCloseButton?.addEventListener('click', closeExperienceModal);
    experienceDownload?.addEventListener('click', async event => {
        event.preventDefault();
        const imagePath = experienceDownload.href;
        const fileName = experienceDownload.download || 'experience-letter.jpg';

        try {
            const response = await fetch(imagePath);
            if (!response.ok) throw new Error('Unable to load experience letter');

            const imageBlob = await response.blob();
            const temporaryUrl = URL.createObjectURL(imageBlob);
            const downloadLink = document.createElement('a');
            downloadLink.href = temporaryUrl;
            downloadLink.download = fileName;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            downloadLink.remove();
            URL.revokeObjectURL(temporaryUrl);
        } catch (error) {
            // Fallback for browsers that block fetching local files.
            window.open(imagePath, '_blank', 'noopener,noreferrer');
        }
    });
    experienceModal?.addEventListener('click', event => {
        if (event.target === experienceModal) closeExperienceModal();
    });
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && experienceModal && !experienceModal.classList.contains('hidden')) {
            closeExperienceModal();
        }
    });

    // Recommendations & Testimonials: data is kept in an external JSON file so real LinkedIn feedback can be updated cleanly.
    const testimonialsGrid = document.getElementById('testimonials-grid');
    const recommendationModal = document.getElementById('recommendation-modal');
    const modalName = document.getElementById('modal-recommendation-name');
    const modalRole = document.getElementById('modal-recommendation-role');
    const modalText = document.getElementById('modal-recommendation-text');
    const modalAvatar = document.getElementById('modal-recommendation-avatar');
    const closeRecommendationModalButton = document.getElementById('close-recommendation-modal');

    function formatTestimonialSubtitle(item) {
        const role = (item.role || '').trim();
        const company = (item.company || '').trim();
        if (!role) return company;
        if (!company || role.includes(company)) return role;
        return `${role} · ${company}`;
    }

    function openRecommendationModal(item) {
        if (!recommendationModal || !modalName || !modalRole || !modalText || !modalAvatar) return;

        modalName.textContent = item.name || 'LinkedIn Recommendation';
        modalRole.textContent = item.role || item.company || 'Professional Recommendation';
        modalText.textContent = item.comment || '';

        if (item.avatar) {
            modalAvatar.src = item.avatar;
            modalAvatar.alt = `${item.name || 'Recommendation'} profile`;
            modalAvatar.classList.remove('hidden');
        } else {
            modalAvatar.classList.add('hidden');
        }

        recommendationModal.classList.remove('hidden');
        recommendationModal.classList.add('flex');
        closeRecommendationModalButton?.focus();
    }

    function closeRecommendationModal() {
        if (!recommendationModal) return;
        recommendationModal.classList.add('hidden');
        recommendationModal.classList.remove('flex');
    }

    async function loadTestimonials() {
        try {
            const response = await fetch('./testimonials.json');
            if (!response.ok) throw new Error('Unable to load testimonials');
            const testimonials = await response.json();
            renderTestimonials(testimonials);
        } catch (error) {
            console.warn('Testimonials data could not be loaded:', error);
            testimonialsGrid.innerHTML = '<p class="text-sm text-on-surface-variant">Recommendations are temporarily unavailable.</p>';
        }
    }

    function renderTestimonials(items) {
        if (!testimonialsGrid) return;

        testimonialsGrid.innerHTML = items.map((item, index) => `
            <article class="reveal group flex w-full min-w-0 max-w-full flex-col overflow-hidden rounded-2xl border border-surface-container-highest bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-6" style="transition-delay: ${index * 80}ms;">
                <div class="mb-4 flex min-w-0 items-start gap-3 sm:mb-5 sm:gap-4">
                    <img src="${item.avatar}" alt="${escapeHtml(item.name)} profile" loading="lazy" class="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-primary-fixed sm:h-14 sm:w-14" />
                    <div class="min-w-0 flex-1">
                        <h3 class="break-words text-base font-bold leading-snug text-on-surface sm:text-lg">${escapeHtml(item.name)}</h3>
                        <p class="testimonial-role text-xs font-medium text-on-surface-variant sm:text-sm">${escapeHtml(formatTestimonialSubtitle(item))}</p>
                    </div>
                </div>
                <p class="testimonial-preview mb-4 text-sm leading-relaxed text-on-surface-variant sm:mb-5">“${escapeHtml(item.comment)}”</p>
                <div class="testimonial-card-footer flex flex-col items-stretch gap-3 border-t border-surface-container-highest pt-4 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                    <div class="flex min-w-0 items-center gap-1.5 text-xs font-semibold text-on-surface-variant">
                        <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linkedin/linkedin-original.svg" alt="LinkedIn" class="h-3.5 w-3.5 shrink-0" loading="lazy" />
                        <span>${escapeHtml(item.date || '')}</span>
                    </div>
                    <button type="button"
                        data-recommendation-name="${escapeHtml(item.name)}"
                        data-recommendation-role="${escapeHtml(item.role || item.company || '')}"
                        data-recommendation-comment="${escapeHtml(item.comment)}"
                        data-recommendation-avatar="${escapeHtml(item.avatar || '')}"
                        class="testimonial-view-button inline-flex w-full items-center justify-center gap-1 text-xs font-bold text-primary transition-all duration-300 hover:gap-2 sm:w-auto sm:justify-start sm:whitespace-nowrap"
                        aria-label="View full recommendation from ${escapeHtml(item.name)}">
                        <span class="sm:hidden">View full</span>
                        <span class="hidden sm:inline">View Recommendation</span>
                        <span class="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                </div>
            </article>
        `).join('');

        const revealElements = testimonialsGrid.querySelectorAll('.reveal');
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

        revealElements.forEach(element => revealObserver.observe(element));
    }

    loadTestimonials();

    document.addEventListener('click', event => {
        const button = event.target.closest('.testimonial-view-button');
        if (!button) return;

        openRecommendationModal({
            name: button.dataset.recommendationName || 'LinkedIn Recommendation',
            role: button.dataset.recommendationRole || '',
            comment: button.dataset.recommendationComment || '',
            avatar: button.dataset.recommendationAvatar || ''
        });
    });

    closeRecommendationModalButton?.addEventListener('click', closeRecommendationModal);
    recommendationModal?.addEventListener('click', event => {
        if (event.target === recommendationModal) closeRecommendationModal();
    });
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && recommendationModal && !recommendationModal.classList.contains('hidden')) {
            closeRecommendationModal();
        }
    });

    // Theme toggle: preserves the visitor's preference between visits.
    const themeToggles = document.querySelectorAll('.theme-toggle');
    const themeIcons = document.querySelectorAll('.theme-icon');
    const isLocalhost = window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.protocol === 'file:';
    const savedTheme = localStorage.getItem('portfolio-theme');

    function setTheme(isDark) {
        document.documentElement.classList.toggle('dark', isDark);
        localStorage.setItem('portfolio-theme', isDark ? 'dark' : 'light');

        themeIcons.forEach(icon => {
            icon.textContent = isDark ? 'light_mode' : 'dark_mode';
        });

        themeToggles.forEach(toggle => {
            const label = isDark ? 'Switch to light mode' : 'Switch to dark mode';
            toggle.setAttribute('aria-label', label);
            toggle.setAttribute('title', label);
        });
    }

    setTheme(isLocalhost ? false : savedTheme ? savedTheme === 'dark' : false);
    themeToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            setTheme(!document.documentElement.classList.contains('dark'));
        });
    });

    // Protection Logic (Only active on live site, disabled on localhost)
    if (!isLocalhost) {
        // Disable Text Selection
        document.body.classList.add('no-select');

        // Disable Right Click
        document.addEventListener('contextmenu', function (e) {
            e.preventDefault();
        }, false);

        // Disable Copy/Inspect Shortcuts
        document.addEventListener('keydown', function (e) {
            // Block Ctrl+C, Ctrl+V, Ctrl+U, Ctrl+Shift+I (Inspect), F12
            if (e.ctrlKey && (e.keyCode === 67 || e.keyCode === 86 || e.keyCode === 85 || e.keyCode === 73) ||
                (e.ctrlKey && e.shiftKey && e.keyCode === 73) ||
                e.keyCode === 123) {
                e.preventDefault();
                return false;
            }
        });
    }

    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Scroll Reveal Logic
    const revealElements = document.querySelectorAll('.reveal');

    const revealCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Optional: stop observing once revealed
            }
        });
    };

    const revealOptions = {
        threshold: 0.15, // Trigger when 15% of the element is visible
        rootMargin: "0px 0px -50px 0px"
    };

    const revealObserver = new IntersectionObserver(revealCallback, revealOptions);

    revealElements.forEach(el => {
        revealObserver.observe(el);
    });

    // Skill Modal Logic
    const skillData = {
        "Manual Testing": {
            desc: "Rigorous exploratory and functional testing. I carefully inspect user flows and edge cases to catch visual and functional issues before they reach production.",
            cover: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop",
            icon: "fact_check",
            isLogo: false
        },
        "Regression Testing": {
            desc: "Ensuring new updates don't break existing features. I build and execute extensive test suites to verify that the core system remains stable across releases.",
            cover: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?q=80&w=600&auto=format&fit=crop",
            icon: "settings_backup_restore",
            isLogo: false
        },
        "Sanity / Smoke Testing": {
            desc: "Rapid health checks on crucial application flows. I ensure that new builds are stable enough for in-depth testing, saving time and resources.",
            cover: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=600&auto=format&fit=crop",
            icon: "bolt",
            isLogo: false
        },
        "UI/UX Testing": {
            desc: "Testing the application across multiple devices and browsers to ensure a flawless, intuitive, and responsive user experience.",
            cover: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600&auto=format&fit=crop",
            icon: "devices",
            isLogo: false
        },
        "API Testing": {
            desc: "Validating backend endpoints using Postman. I ensure proper data formatting, accurate response codes, and secure data transmission.",
            cover: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=600&auto=format&fit=crop",
            icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postman/postman-original.svg",
            isLogo: true
        },
        "Selenium WebDriver": {
            desc: "Developing robust, maintainable UI automation frameworks to dramatically reduce manual testing effort.",
            cover: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=600&auto=format&fit=crop",
            icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/selenium/selenium-original.svg",
            isLogo: true
        },
        "Bug Reporting": {
            desc: "Documenting defects with extreme precision in JIRA: exact steps to reproduce, environmental details, logs, and visual evidence.",
            cover: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=600&auto=format&fit=crop",
            icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jira/jira-original.svg",
            isLogo: true
        },
        "Python": {
            desc: "Writing efficient automation scripts, custom testing tools, and data validation processes using Python's powerful ecosystem.",
            cover: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=600&auto=format&fit=crop",
            icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
            isLogo: true
        },
        "Java": {
            desc: "Developing enterprise-scale automation frameworks like Page Object Model (POM) for scalable and maintainable Selenium testing.",
            cover: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=600&auto=format&fit=crop",
            icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg",
            isLogo: true
        },
        "JMeter": {
            desc: "Simulating heavy user traffic and load conditions to identify bottlenecks and ensure backend stability under pressure.",
            cover: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=600&auto=format&fit=crop",
            icon: "https://jmeter.apache.org/images/logo.svg",
            isLogo: true
        },
        "SDLC/STLC": {
            desc: "Deep involvement in all phases of the Software Testing Life Cycle, from requirement analysis and planning to execution and closure.",
            cover: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=600&auto=format&fit=crop",
            icon: "schema",
            isLogo: false
        },
        "MySQL": {
            desc: "Writing complex SQL queries to validate database states, verify data migrations, and ensure backend data integrity.",
            cover: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?q=80&w=600&auto=format&fit=crop",
            icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg",
            isLogo: true
        },
        "Git": {
            desc: "Managing automation codebases, handling merge requests, and integrating automated tests smoothly into CI/CD pipelines.",
            cover: "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?q=80&w=600&auto=format&fit=crop",
            icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg",
            isLogo: true
        }
    };

    const modal = document.getElementById('skill-modal');
    const modalBackdrop = document.getElementById('skill-modal-backdrop');
    const modalCover = document.getElementById('skill-modal-cover');
    const modalTitle = document.getElementById('skill-modal-title');
    const modalDesc = document.getElementById('skill-modal-desc');
    const modalContent = document.getElementById('skill-modal-content');
    const modalIconContainer = document.getElementById('skill-modal-icon-container');

    const openModal = (skillKey) => {
        const data = skillData[skillKey];
        if (!data) return;

        modalTitle.innerText = skillKey;
        modalDesc.innerText = data.desc;
        modalCover.src = data.cover;
        modalIconContainer.innerHTML = data.isLogo ?
            `<img src="${data.icon}" class="skill-modal-logo w-12 h-12 object-contain" alt="Skill Icon">` :
            `<span class="material-symbols-outlined text-3xl text-primary">${data.icon}</span>`;

        modal.classList.remove('hidden');
        requestAnimationFrame(() => {
            modal.classList.remove('opacity-0');
            modalContent.classList.replace('scale-95', 'scale-100');
            modalContent.classList.replace('opacity-0', 'opacity-100');
            [modalCover, modalIconContainer, modalTitle, modalDesc].forEach(el => el.classList.add('scale-100', 'translate-y-0'));
        });
        document.body.classList.add('overflow-hidden');
    };

    const closeModal = () => {
        modal.classList.add('opacity-0');
        modalContent.classList.remove('scale-100', 'opacity-100');
        modalContent.classList.add('scale-95', 'opacity-0');

        // Reset inner elements
        modalCover.classList.remove('scale-100');
        modalCover.classList.add('scale-105');
        modalIconContainer.classList.remove('translate-y-0');
        modalIconContainer.classList.add('-translate-y-2');
        modalTitle.classList.remove('translate-y-0');
        modalTitle.classList.add('translate-y-2');
        modalDesc.classList.remove('translate-y-0');
        modalDesc.classList.add('translate-y-2');

        setTimeout(() => {
            modal.classList.add('hidden');
            document.body.classList.remove('overflow-hidden'); // Restore scroll
        }, 500);
    };

    document.querySelectorAll('.skill-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const skillKey = chip.getAttribute('data-skill');
            openModal(skillKey);
        });
    });

    modalBackdrop.addEventListener('click', closeModal);

    // Typing Animation Logic
    const typingElement = document.getElementById('typing-role');
    const roles = ["SQA Engineer", "Automation Tester", "Bug Hunter"];
    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeSpeed = 100;

    function type() {
        const currentRole = roles[roleIndex];

        if (isDeleting) {
            typingElement.textContent = currentRole.substring(0, charIndex - 1);
            charIndex--;
            typeSpeed = 50;
        } else {
            typingElement.textContent = currentRole.substring(0, charIndex + 1);
            charIndex++;
            typeSpeed = 100;
        }

        if (!isDeleting && charIndex === currentRole.length) {
            isDeleting = true;
            typeSpeed = 2000; // Pause at end
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
            typeSpeed = 500;
        }

        setTimeout(type, typeSpeed);
    }

    if (typingElement) {
        type();
    }
    // SMTP.js Contact Form Submission
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');
    const submitBtn = document.getElementById('submit-btn');
    const spinner = document.getElementById('loading-spinner');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = contactForm.querySelector('[name="name"]').value;
            const email = contactForm.querySelector('[name="email"]').value;
            const subject = contactForm.querySelector('[name="subject"]').value;
            const message = contactForm.querySelector('[name="message"]').value;

            // Show Loading State
            submitBtn.disabled = true;
            spinner.classList.remove('hidden');
            formStatus.classList.add('hidden');

            Email.send({
                Host: "smtp.gmail.com",
                Username: "permeetvalicha@gmail.com",
                Password: "ukcg dzew hcgs zmam",
                To: 'permeet.valicha@vativeapps.com',
                From: "permeetvalicha@gmail.com",
                Subject: "Portfolio: " + (subject || "New Message"),
                Body: `
                    <h3>New Message from Portfolio</h3>
                    <p><b>Name:</b> ${name}</p>
                    <p><b>Email:</b> ${email}</p>
                    <p><b>Message:</b></p>
                    <p>${message}</p>
                `
            }).then(
                message => {
                    if (message === "OK") {
                        formStatus.textContent = "Message sent successfully! I'll get back to you soon.";
                        formStatus.className = "text-primary bg-primary-container p-4 rounded-lg block mb-4 text-center";
                        contactForm.reset();
                    } else {
                        formStatus.textContent = "Error: " + message;
                        formStatus.className = "text-error bg-error-container p-4 rounded-lg block mb-4 text-center";
                    }
                    submitBtn.disabled = false;
                    spinner.classList.add('hidden');
                    formStatus.classList.remove('hidden');
                }
            );
        });
    }
    // Contact Modal Logic
    const contactModal = document.getElementById('contact-modal');
    const contactModalBackdrop = document.getElementById('contact-modal-backdrop');
    const contactModalContent = document.getElementById('contact-modal-content');
    const contactModalClose = document.getElementById('contact-modal-close');
    const contactTriggers = document.querySelectorAll('.contact-trigger, #contact-btn-nav');

    const openContactModal = () => {
        contactModal.classList.remove('hidden');
        // Trigger reflow
        void contactModal.offsetWidth;
        contactModal.classList.remove('opacity-0', 'pointer-events-none');
        contactModalContent.classList.remove('translate-y-8', 'scale-95', 'opacity-0');
        contactModalContent.classList.add('translate-y-0', 'scale-100', 'opacity-100');
        document.body.classList.add('overflow-hidden'); // Prevent scroll
    };

    const closeContactModal = () => {
        contactModal.classList.add('opacity-0', 'pointer-events-none');
        contactModalContent.classList.remove('translate-y-0', 'scale-100', 'opacity-100');
        contactModalContent.classList.add('translate-y-8', 'scale-95', 'opacity-0');

        setTimeout(() => {
            contactModal.classList.add('hidden');
            document.body.classList.remove('overflow-hidden'); // Restore scroll
        }, 500);
    };

    contactTriggers.forEach(btn => {
        btn.addEventListener('click', openContactModal);
    });

    contactModalClose.addEventListener('click', closeContactModal);
    contactModalBackdrop.addEventListener('click', closeContactModal);

    // Copy to Clipboard Logic
    const copyButtons = document.querySelectorAll('.copy-btn');
    copyButtons.forEach(btn => {
        btn.addEventListener('click', function () {
            const textToCopy = this.getAttribute('data-copy');
            const originalIcon = this.innerHTML;

            navigator.clipboard.writeText(textToCopy).then(() => {
                // Success Feedback
                this.innerHTML = '<span class="material-symbols-outlined text-lg text-green-400">check</span>';
                this.classList.add('bg-green-400/10');

                setTimeout(() => {
                    this.innerHTML = originalIcon;
                    this.classList.remove('bg-green-400/10');
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy: ', err);
            });
        });
    });
    // Counter Animation Logic
    const counters = document.querySelectorAll('.counter');
    const startCounter = (counter) => {
        const target = +counter.getAttribute('data-target');
        const suffix = counter.getAttribute('data-suffix') || '';
        let current = 0;
        const duration = 2000;
        const increment = target / (duration / 16); // 60fps

        const updateCount = () => {
            current += increment;
            if (current < target) {
                counter.innerText = Math.floor(current) + suffix;
                requestAnimationFrame(updateCount);
            } else {
                counter.innerText = target + suffix;
            }
        };
        updateCount();
    };

    const counterObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                startCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    counters.forEach(counter => {
        counterObserver.observe(counter);
    });

    // Video Modal Logic
    const videoModal = document.getElementById('video-modal');
    const videoModalBackdrop = document.getElementById('video-modal-backdrop');
    const videoModalContent = document.getElementById('video-modal-content');
    const videoModalClose = document.getElementById('video-modal-close');
    const videoIframe = document.getElementById('video-iframe');
    const videoTriggers = document.querySelectorAll('.video-trigger');

    const openVideoModal = (videoUrl) => {
        videoIframe.src = videoUrl;
        videoModal.classList.remove('hidden');
        // Trigger reflow
        void videoModal.offsetWidth;
        videoModal.classList.remove('opacity-0', 'pointer-events-none');
        videoModalContent.classList.remove('translate-y-8', 'scale-95', 'opacity-0');
        videoModalContent.classList.add('translate-y-0', 'scale-100', 'opacity-100');
        document.body.classList.add('overflow-hidden'); // Prevent scroll
    };

    const closeVideoModal = () => {
        videoModal.classList.add('opacity-0', 'pointer-events-none');
        videoModalContent.classList.remove('translate-y-0', 'scale-100', 'opacity-100');
        videoModalContent.classList.add('translate-y-8', 'scale-95', 'opacity-0');

        setTimeout(() => {
            videoModal.classList.add('hidden');
            videoIframe.src = ''; // Stop video playback
            document.body.classList.remove('overflow-hidden'); // Restore scroll
        }, 500);
    };

    videoTriggers.forEach(btn => {
        btn.addEventListener('click', () => {
            const videoUrl = btn.getAttribute('data-video');
            if (videoUrl) {
                openVideoModal(videoUrl);
            }
        });
    });

    if (videoModalClose) videoModalClose.addEventListener('click', closeVideoModal);
    if (videoModalBackdrop) videoModalBackdrop.addEventListener('click', closeVideoModal);

    // Mobile Menu Logic (Sidebar Right-to-Left)
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuBackdrop = document.getElementById('mobile-menu-backdrop');
    const closeMenuBtn = document.getElementById('close-menu');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    const openMobileMenu = () => {
        if (mobileMenuBackdrop) mobileMenuBackdrop.classList.remove('hidden');
        setTimeout(() => {
            if (mobileMenuBackdrop) mobileMenuBackdrop.classList.remove('opacity-0');
            if (mobileMenu) {
                mobileMenu.classList.remove('translate-x-full');
                mobileMenu.classList.add('translate-x-0');
            }
        }, 10);
        document.body.classList.add('overflow-hidden');
    };

    const closeMobileMenu = () => {
        if (mobileMenu) {
            mobileMenu.classList.remove('translate-x-0');
            mobileMenu.classList.add('translate-x-full');
        }
        if (mobileMenuBackdrop) mobileMenuBackdrop.classList.add('opacity-0');
        setTimeout(() => {
            if (mobileMenuBackdrop) mobileMenuBackdrop.classList.add('hidden');
        }, 500);
        document.body.classList.remove('overflow-hidden');
    };

    // Mobile Sidebar Contact Button
    const contactBtnMobile = document.getElementById('contact-btn-mobile');
    if (contactBtnMobile) {
        contactBtnMobile.addEventListener('click', () => {
            closeMobileMenu();
            // Since openModal is local to its scope, I'll use the generic contact modal trigger if available
            // or trigger a click on the main contact button
            const mainContactBtn = document.getElementById('contact-btn-nav');
            if (mainContactBtn) mainContactBtn.click();
        });
    }

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', openMobileMenu);
        if (closeMenuBtn) closeMenuBtn.addEventListener('click', closeMobileMenu);
        if (mobileMenuBackdrop) mobileMenuBackdrop.addEventListener('click', closeMobileMenu);

        mobileLinks.forEach(link => {
            link.addEventListener('click', closeMobileMenu);
        });
    }

    // Hero Section Action Animations
    const heroSection = document.getElementById('hero-section');
    const cubeWrapper = document.getElementById('cube-wrapper');
    const canvas = document.getElementById('hero-canvas');

    if (heroSection && canvas) {
        // 2. Interactive Particle Network (Canvas)
        const ctx = canvas.getContext('2d');
        let particlesArray = [];

        canvas.width = heroSection.offsetWidth;
        canvas.height = heroSection.offsetHeight;

        window.addEventListener('resize', () => {
            canvas.width = heroSection.offsetWidth;
            canvas.height = heroSection.offsetHeight;
            initParticles();
        });

        let mouse = {
            x: null,
            y: null,
            radius: 150
        }

        heroSection.addEventListener('mousemove', function (event) {
            const rect = heroSection.getBoundingClientRect();
            mouse.x = event.clientX - rect.left;
            mouse.y = event.clientY - rect.top;
        });

        heroSection.addEventListener('mouseleave', function () {
            mouse.x = undefined;
            mouse.y = undefined;
        });

        class Particle {
            constructor(x, y, directionX, directionY, size, color) {
                this.x = x;
                this.y = y;
                this.directionX = directionX;
                this.directionY = directionY;
                this.size = size;
                this.color = color;
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
                ctx.fillStyle = this.color;
                ctx.fill();
            }

            update() {
                // Bounce off edges
                if (this.x > canvas.width || this.x < 0) this.directionX = -this.directionX;
                if (this.y > canvas.height || this.y < 0) this.directionY = -this.directionY;

                // Mouse interaction collision
                if (mouse.x && mouse.y) {
                    let dx = mouse.x - this.x;
                    let dy = mouse.y - this.y;
                    let distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < mouse.radius + this.size) {
                        if (mouse.x < this.x && this.x < canvas.width - this.size * 10) this.x += 2;
                        if (mouse.x > this.x && this.x > this.size * 10) this.x -= 2;
                        if (mouse.y < this.y && this.y < canvas.height - this.size * 10) this.y += 2;
                        if (mouse.y > this.y && this.y > this.size * 10) this.y -= 2;
                    }
                }

                this.x += this.directionX;
                this.y += this.directionY;
                this.draw();
            }
        }

        function initParticles() {
            particlesArray = [];
            // Optimize density based on screen size
            const density = window.innerWidth < 768 ? 12000 : 9000;
            let numberOfParticles = (canvas.height * canvas.width) / density;
            for (let i = 0; i < numberOfParticles; i++) {
                let size = (Math.random() * 2) + 1;
                let x = (Math.random() * ((canvas.width - size * 2) - (size * 2)) + size * 2);
                let y = (Math.random() * ((canvas.height - size * 2) - (size * 2)) + size * 2);
                let directionX = (Math.random() * 2) - 1;
                let directionY = (Math.random() * 2) - 1;
                let color = '#003f87'; // Primary blue color
                particlesArray.push(new Particle(x, y, directionX, directionY, size, color));
            }
        }

        function animateParticles() {
            requestAnimationFrame(animateParticles);
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (let i = 0; i < particlesArray.length; i++) {
                particlesArray[i].update();
            }
            connectParticles();
        }

        function connectParticles() {
            let opacityValue = 1;
            for (let a = 0; a < particlesArray.length; a++) {
                for (let b = a; b < particlesArray.length; b++) {
                    let distance = ((particlesArray[a].x - particlesArray[b].x) * (particlesArray[a].x - particlesArray[b].x)) +
                        ((particlesArray[a].y - particlesArray[b].y) * (particlesArray[a].y - particlesArray[b].y));
                    if (distance < 15000) { // Capped connection distance for consistency
                        opacityValue = 1 - (distance / 15000);
                        ctx.strokeStyle = `rgba(0, 63, 135, ${opacityValue * 0.4})`; // Tech blue lines
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                        ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                        ctx.stroke();
                    }
                }

                // Connect to mouse
                if (mouse.x && mouse.y) {
                    let distanceToMouse = ((particlesArray[a].x - mouse.x) * (particlesArray[a].x - mouse.x)) +
                        ((particlesArray[a].y - mouse.y) * (particlesArray[a].y - mouse.y));
                    if (distanceToMouse < 25000) {
                        opacityValue = 1 - (distanceToMouse / 25000);
                        ctx.strokeStyle = `rgba(34, 197, 94, ${opacityValue * 0.8})`; // Green glow when near mouse
                        ctx.lineWidth = 1.5;
                        ctx.beginPath();
                        ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                        ctx.lineTo(mouse.x, mouse.y);
                        ctx.stroke();
                    }
                }
            }
        }

        initParticles();
        animateParticles();
    }

    // Profile Picture Carousel Logic
    const profilePic = document.getElementById('profile-pic');
    if (profilePic) {
        // Updated to only use 2 images as requested
        const profileImages = [
            "images/PV-IMG 1.jpg",
            "images/PV-IMG 2.jpg"
        ];

        // Preload images to prevent flashes
        profileImages.forEach(src => {
            const img = new Image();
            img.src = src;
        });

        let currentImgIndex = 0;
        setInterval(() => {
            currentImgIndex = (currentImgIndex + 1) % profileImages.length;
            // Directly change src to avoid white background flash
            profilePic.src = profileImages[currentImgIndex];
        }, 5000); // 5 seconds per image
    }

    // Project Carousel Logic
    const projectSlider = document.getElementById('project-slider');
    const projectPrev = document.getElementById('project-prev');
    const projectNext = document.getElementById('project-next');

    if (projectSlider && projectPrev && projectNext) {
        const scrollAmount = 400; // Adjust based on card width

        projectNext.addEventListener('click', () => {
            projectSlider.scrollBy({
                left: scrollAmount,
                behavior: 'smooth'
            });
        });

        projectPrev.addEventListener('click', () => {
            projectSlider.scrollBy({
                left: -scrollAmount,
                behavior: 'smooth'
            });
        });

        // Hide/Show buttons based on scroll position
        const updateButtons = () => {
            const isMobile = window.innerWidth < 1024; // lg breakpoint

            // Only manage display if not on mobile
            if (isMobile) {
                projectPrev.style.display = 'none';
                projectNext.style.display = 'none';
                return;
            }

            // Strict visibility logic for Desktop
            if (projectSlider.scrollLeft > 20) {
                projectPrev.style.display = 'flex';
                projectPrev.style.pointerEvents = 'auto';
            } else {
                projectPrev.style.display = 'none';
                projectPrev.style.pointerEvents = 'none';
            }

            const isAtEnd = projectSlider.scrollLeft + projectSlider.clientWidth >= projectSlider.scrollWidth - 20;
            if (isAtEnd) {
                projectNext.style.display = 'none';
                projectNext.style.pointerEvents = 'none';
            } else {
                projectNext.style.display = 'flex';
                projectNext.style.pointerEvents = 'auto';
            }
        };

        projectSlider.addEventListener('scroll', updateButtons);
        window.addEventListener('resize', updateButtons);
        setTimeout(updateButtons, 100); // Initial check after some delay for rendering
    }
});



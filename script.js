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

    // Tools carousel
    const toolsCarousel = document.getElementById('tools-carousel');
    const toolsPrevButton = document.querySelector('.tools-carousel-prev');
    const toolsNextButton = document.querySelector('.tools-carousel-next');

    function updateToolsCarouselButtons() {
        if (!toolsCarousel || !toolsPrevButton || !toolsNextButton) return;

        const maxScrollLeft = toolsCarousel.scrollWidth - toolsCarousel.clientWidth;
        toolsPrevButton.disabled = toolsCarousel.scrollLeft <= 4;
        toolsNextButton.disabled = toolsCarousel.scrollLeft >= maxScrollLeft - 4;
    }

    if (toolsCarousel && toolsPrevButton && toolsNextButton) {
        const getScrollAmount = () => {
            const card = toolsCarousel.querySelector('.tool-card');
            if (!card) return 240;
            const styles = getComputedStyle(toolsCarousel);
            const gap = parseFloat(styles.columnGap || styles.gap || '16');
            return card.getBoundingClientRect().width + (Number.isFinite(gap) ? gap : 16);
        };

        toolsPrevButton.addEventListener('click', () => {
            toolsCarousel.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' });
        });

        toolsNextButton.addEventListener('click', () => {
            toolsCarousel.scrollBy({ left: getScrollAmount(), behavior: 'smooth' });
        });

        toolsCarousel.addEventListener('scroll', updateToolsCarouselButtons, { passive: true });
        window.addEventListener('resize', updateToolsCarouselButtons);
        requestAnimationFrame(updateToolsCarouselButtons);
    }

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
        // Use a minimum increment of 1 per frame so small targets (like 2)
        // reach their final value almost instantly instead of counting slowly.
        let increment = target / (duration / 16); // 60fps
        if (increment < 1) increment = 1;

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

// Skills Proficiency Doughnut Chart (Chart.js)
    const skillsCanvas = document.getElementById('skills-doughnut-chart');
    const skillsCenterValue = document.getElementById('skills-chart-center-value');
    const skillsLegendContainer = document.getElementById('skills-chart-legend');

    if (skillsCanvas && typeof Chart !== 'undefined') {
        const skillsData = [
            { label: 'Manual Testing', value: 95 },
            { label: 'API Testing', value: 90 },
            { label: 'Mobile Testing', value: 85 },
            { label: 'Regression Testing', value: 92 },
            { label: 'Web / Cross-Browser', value: 88 },
            { label: 'AI-Assisted Testing', value: 80 },
{ label: 'Performance Testing', value: 75 },
            { label: 'Automation Testing', value: 70 }
        ];

// Portfolio theme palette (premium blue family with subtle harmony)
        const palette = ['#003f87', '#115cb9', '#0056b3', '#2f6fd6', '#4a7fd4', '#7ba3e8', '#a6c0f2', '#c7d6f8'];

        const labels = skillsData.map(item => item.label);
        const values = skillsData.map(item => item.value);
        const colors = palette;

        const overall = Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);

        const skillsChart = new Chart(skillsCanvas, {
            type: 'doughnut',
            data: {
                labels,
                datasets: [{
                    data: values,
                    backgroundColor: colors,
                    borderColor: '#f8f9fa',
                    borderWidth: 3,
                    hoverOffset: 8,
                    hoverBorderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                cutout: '72%',
                onClick: (event, elements) => {
                    if (elements && elements.length) {
                        const index = elements[0].index;
                        highlightSkill(index);
                    }
                },
                onHover: (event, elements) => {
                    if (elements && elements.length) {
                        const index = elements[0].index;
                        highlightSkill(index);
                    } else {
                        resetCenter();
                    }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        enabled: false,
                    }
                },
                animation: {
                    animateRotate: true,
                    animateScale: true,
                    duration: 1200
                }
            }
        });

        // --- Center text logic: show meaningful role by default, skill on hover ---
        const centerValueEl = document.getElementById('skills-chart-center-value');
        const centerLabelEl = document.getElementById('skills-chart-center-label');
        const defaultValue = 'QA Engineer';
        const defaultLabel = 'Testing Expertise';

        function highlightSkill(index) {
            const item = skillsData[index];
            if (centerValueEl) centerValueEl.textContent = item.label;
            if (centerLabelEl) centerLabelEl.textContent = `${item.value}% Proficiency`;
        }

        function resetCenter() {
            if (centerValueEl) centerValueEl.textContent = defaultValue;
            if (centerLabelEl) centerLabelEl.textContent = defaultLabel;
        }

        // --- Build skill cards with animated progress bars ---
        if (skillsLegendContainer) {
            skillsLegendContainer.innerHTML = skillsData.map((item, index) => `
                <div class="skill-card" data-skill-index="${index}">
                    <div class="skill-card-head">
                        <span class="skill-card-dot" style="background-color: ${colors[index]};"></span>
                        <span class="skill-card-name">${item.label}</span>
                        <span class="skill-card-value">${item.value}%</span>
                    </div>
                    <div class="skill-card-track">
                        <div class="skill-card-fill" data-width="${item.value}" style="background: linear-gradient(90deg, ${colors[index]}, ${colors[index]}cc);"></div>
                    </div>
                </div>
            `).join('');

            // Hover on a card highlights the matching chart segment
            skillsLegendContainer.querySelectorAll('.skill-card').forEach(card => {
                card.addEventListener('mouseenter', () => {
                    const idx = parseInt(card.dataset.skillIndex, 10);
                    skillsChart.setActiveElements([{ datasetIndex: 0, index: idx }]);
                    skillsChart.update();
                    highlightSkill(idx);
                });
                card.addEventListener('mouseleave', () => {
                    skillsChart.setActiveElements([]);
                    skillsChart.update();
                    resetCenter();
                });
            });

            // Animate progress bars when the legend enters the viewport
            const fills = skillsLegendContainer.querySelectorAll('.skill-card-fill');
            const fillObserver = new IntersectionObserver((entries, obs) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const fill = entry.target;
                        fill.style.width = fill.dataset.width + '%';
                        obs.unobserve(fill);
                    }
                });
            }, { threshold: 0.3 });
            fills.forEach(fill => fillObserver.observe(fill));
        }

        // --- Build the metrics strip below the cards ---
        const skillsMetrics = document.getElementById('skills-metrics');
        if (skillsMetrics) {
            const metrics = [
                { icon: 'workspace_premium', text: '3+ Years Experience' },
                { icon: 'fact_check', text: '1200+ Test Cases Executed' },
                { icon: 'bug_report', text: '600+ Bugs Reported' },
                { icon: 'api', text: '40+ APIs Tested' },
                { icon: 'rocket_launch', text: 'Multiple Production Releases Supported' }
            ];
            skillsMetrics.innerHTML = metrics.map(metric => `
                <span class="skill-metric">
                    <span class="material-symbols-outlined">${metric.icon}</span>
                    ${metric.text}
                </span>
            `).join('');
        }
    }

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

// ============================================
// Case Study Accordion
// ============================================
document.addEventListener('DOMContentLoaded', function () {
    const caseStudyHeaders = document.querySelectorAll('.case-study-header');

    caseStudyHeaders.forEach(function (header) {
        header.addEventListener('click', function () {
            const body = this.nextElementSibling;
            const isOpen = body.classList.contains('open');

            // Close all other case studies
            document.querySelectorAll('.case-study-body').forEach(function (b) {
                b.classList.remove('open');
                b.previousElementSibling.classList.remove('is-open');
                b.previousElementSibling.setAttribute('aria-expanded', 'false');
            });

            // Toggle current
            if (!isOpen) {
                body.classList.add('open');
                this.classList.add('is-open');
                this.setAttribute('aria-expanded', 'true');
            }
        });

// Keyboard support for accessibility
        header.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
});

// ============================================
// AI Skills Chat Widget (Floating Assistant)
// ============================================
document.addEventListener('DOMContentLoaded', function () {
    const chatBtn = document.getElementById('ai-chat-btn');
    const chatWindow = document.getElementById('ai-chat-window');
    const chatClose = document.getElementById('ai-chat-close');
    const chatForm = document.getElementById('ai-chat-form');
    const chatInput = document.getElementById('ai-chat-input');
    const chatMessages = document.getElementById('ai-messages');

    if (!chatBtn || !chatWindow || !chatForm || !chatInput || !chatMessages) return;

    // Knowledge base: keywords -> answer
    const knowledgeBase = [
        {
            keywords: ['manual', 'manual testing', 'manual'],
            answer: 'Permeet is a <b>Manual QA Specialist</b> with 2+ years of experience. He performs end-to-end manual testing of mobile & web applications, designs detailed test cases (positive, negative & edge scenarios), and validates core feature functionality across enterprise and product-based environments.'
        },
        {
            keywords: ['api', 'postman', 'swagger', 'rest', 'endpoint'],
            answer: 'Permeet performs <b>API Testing</b> using tools like <b>Postman</b> and <b>Swagger</b>. He validates data integrity, request/response schemas, status codes, error handling, and system communication across modules. He has tested 150+ APIs and also validates payment flows via webhook-style triggers.'
        },
        {
            keywords: ['mobile', 'android', 'ios', 'mobile testing', 'app'],
            answer: 'Permeet has strong <b>Mobile Testing</b> skills on Android (and cross-platform thinking for iOS). He tests mobile applications using Android Studio, covering functional flows, UI/UX, device compatibility, and cross-platform behavior.'
        },
        {
            keywords: ['web', 'cross browser', 'browser', 'web testing', 'responsive'],
            answer: 'Permeet performs <b>Web Testing & Cross-Browser</b> validation, ensuring responsive layouts and consistent functionality across browsers (Chrome, Firefox, Safari, Edge). He uses browser DevTools for debugging and responsive design verification.'
        },
        {
            keywords: ['regression', 'regression testing'],
            answer: 'Permeet runs <b>Regression Testing</b> across every release cycle to ensure application stability and that fixes don\u2019t introduce new issues. He has completed 50+ regression cycles and supports the core regression suite both manually and with Selenium automation.'
        },
        {
            keywords: ['smoke', 'smoke testing'],
            answer: '<b>Smoke Testing</b> is a core part of Permeet\u2019s workflow. He runs quick, high-level smoke checks on critical functionality to validate that a build is stable enough for detailed testing.'
        },
        {
            keywords: ['sanity', 'sanity testing'],
            answer: 'Permeet uses <b>Sanity Testing</b> to verify that specific new features or fixes work correctly after a new build, without running the full regression suite.'
        },
        {
            keywords: ['exploratory', 'exploratory testing', 'ad hoc', 'ad-hoc'],
            answer: 'Permeet applies <b>Exploratory Testing</b> (ad-hoc) to uncover issues not covered by scripted tests. He combines it with structured suites to catch edge cases an automated test alone would miss.'
        },
        {
            keywords: ['usability', 'ux', 'ui', 'user experience'],
            answer: 'Permeet performs <b>Usability & UI/UX Testing</b> to validate intuitive navigation, clear feedback, consistent styling, and smooth user flows across desktop and mobile.'
        },
        {
            keywords: ['accessibility', 'a11y', '508', 'wcag'],
            answer: 'Permeet considers <b>Accessibility Testing</b> by validating keyboard navigation, screen-reader friendliness, contrast, and ARIA attributes to make products usable for everyone.'
        },
        {
            keywords: ['performance', 'load', 'jmeter', 'performance testing'],
            answer: 'Permeet has performed <b>Performance Testing</b> using tools like <b>JMeter</b> to evaluate system responsiveness, stability, and behavior under various load conditions.'
        },
        {
            keywords: ['security', 'rbac', 'authorization', 'authentication', 'security testing'],
            answer: 'Permeet conducts <b>Security Testing</b> including <b>Role-Based Access Control (RBAC)</b> validation. He personally uncovered 15+ critical RBAC bypass issues and validates authorization boundaries, authentication flows, and sensitive data protection.'
        },
        {
            keywords: ['ai', 'ai assisted', 'ai-assisted', 'ai testing', 'machine learning', 'ml', 'ai-based'],
            answer: 'Permeet has hands-on experience with <b>AI-Assisted Testing</b> on AI-based assessment, personality evaluation, and AI-driven platform systems. He validates scoring integrity, AI workflow logic, and data consistency between the UI and the AI backend.'
        },
        {
            keywords: ['automation', 'selenium', 'playwright', 'automation testing'],
            answer: 'Permeet has <b>Automation Testing</b> experience with <b>Selenium</b> (and exposure to <b>Playwright</b>). He builds core regression suites for repeatable, reliable validation while pairing automation with manual exploratory testing.'
        },
        {
            keywords: ['cross platform', 'cross-platform', 'platform'],
            answer: 'Permeet validates <b>Cross-Platform</b> behavior so applications work consistently across different operating systems, devices, and environments.'
        },
        {
            keywords: ['test case', 'test cases', 'test design', 'test case design', 'scenario'],
            answer: 'Permeet is a <b>Test Case Design Expert</b>. He creates structured, comprehensive test cases covering positive, negative, edge, and boundary scenarios to ensure full requirement validation.'
        },
        {
            keywords: ['bug', 'defect', 'bugs', 'bug reporting', 'bug report', 'jira', 'redmine'],
            answer: 'Permeet is skilled in <b>Bug Lifecycle Management</b>. He reports and tracks defects using <b>Jira</b> and <b>Redmine</b>, with clear reproduction steps, prioritization, and verification after fixes. He has reported 300+ bugs.'
        },
        {
            keywords: ['experience', 'years', 'background', 'about', 'experience?', 'who is', 'cv', 'resume'],
            answer: 'Permeet Valicha is a Software QA Engineer with <b>2+ years of experience</b> across vativeApps (Mid-level SQA Engineer), WeUno Technologies (Jr. SQA Engineer), and Sapphire Consultancy Services (SQA Intern). He specializes in Manual, API, Mobile, Web, and AI-Assisted testing.'
        },
        {
            keywords: ['tools', 'toolkit', 'tech stack', 'stack'],
            answer: 'Permeet\u2019s toolkit includes <b>Jira, Postman, Swagger, Firebase, Git, GitHub, DevTools, AI Tools, Figma, Android Studio, JMeter, SQL, Selenium, Playwright, Python</b>, and VS Code.'
        },
        {
            keywords: ['contact', 'email', 'phone', 'linkedin', 'reach', 'hire'],
            answer: 'You can reach Permeet via email at <b>permeetvalicha@gmail.com</b>, phone <b>0302 2081313</b>, or on <a href="https://www.linkedin.com/in/permeet-valicha-016511210/" target="_blank" rel="noopener noreferrer" style="color:#003f87;font-weight:700;text-decoration:underline;">LinkedIn</a>. He is open to international, remote, and relocation roles.'
        },
        {
            keywords: ['hello', 'hi', 'hey', 'salam', 'help', 'what can you do'],
            answer: 'Hi! 👋 I can tell you about Permeet\u2019s QA skills. Try asking about <b>Manual</b>, <b>API</b>, <b>Mobile</b>, <b>Web</b>, <b>Regression</b>, <b>Smoke</b>, <b>Sanity</b>, <b>Exploratory</b>, <b>Usability</b>, <b>Accessibility</b>, <b>Cross Browser</b>, <b>Performance</b>, <b>Security</b>, or <b>AI-Assisted</b> testing.'
        }
    ];

    const fallback = 'I can help with Permeet\u2019s QA skills! Try asking about <b>Manual Testing</b>, <b>API Testing</b>, <b>Mobile Testing</b>, <b>Web Testing</b>, <b>Regression</b>, <b>Smoke</b>, <b>Sanity</b>, <b>Exploratory</b>, <b>Usability</b>, <b>Accessibility</b>, <b>Cross Browser</b>, <b>Performance</b>, <b>Security</b>, or <b>AI-Assisted</b> testing.';

    function getAnswer(query) {
        const text = query.toLowerCase().trim();
        // First try exact keyword match
        for (const item of knowledgeBase) {
            for (const keyword of item.keywords) {
                if (text.includes(keyword)) return item.answer;
            }
        }
        return fallback;
    }

    function addMessage(text, sender) {
        const wrapper = document.createElement('div');
        wrapper.className = sender === 'user' ? 'user-msg' : 'ai-msg';
        const bubble = document.createElement('div');
        bubble.className = 'msg-bubble';
        bubble.innerHTML = text;
        wrapper.appendChild(bubble);
        chatMessages.appendChild(wrapper);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function showTyping(callback) {
        const wrapper = document.createElement('div');
        wrapper.className = 'ai-msg';
        wrapper.id = 'typing-indicator';
        wrapper.innerHTML = '<div class="msg-bubble typing-dots"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>';
        chatMessages.appendChild(wrapper);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        setTimeout(() => {
            const typing = document.getElementById('typing-indicator');
            if (typing) typing.remove();
            callback();
        }, 700);
    }

    function toggleChat(open) {
        chatWindow.classList.toggle('active', open);
        chatBtn.classList.toggle('open', open);
        if (open) {
            chatInput.focus();
        }
    }

    chatBtn.addEventListener('click', () => {
        toggleChat(!chatWindow.classList.contains('active'));
    });

    chatClose.addEventListener('click', () => toggleChat(false));

    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = chatInput.value.trim();
        if (!query) return;
        addMessage(query, 'user');
        chatInput.value = '';
        showTyping(() => {
            addMessage(getAnswer(query), 'ai');
        });
    });
});



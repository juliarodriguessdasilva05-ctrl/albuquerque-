document.addEventListener('DOMContentLoaded', () => {
    // 1. Atualizar ano no footer
    document.getElementById('year').textContent = new Date().getFullYear();

    // 2. Dark Mode com LocalStorage
    const themeToggle = document.getElementById('theme-toggle');
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    themeToggle.textContent = currentTheme === 'dark' ? '☀️' : '🌙';

    themeToggle.addEventListener('click', () => {
        const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
        trackEvent('theme_toggle', { theme: newTheme });
    });

    // 3. Header Glassmorphism no Scroll
    const header = document.getElementById('main-header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 4. Menu Mobile
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    menuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('active');
        menuBtn.textContent = mobileMenu.classList.contains('active') ? '✕' : '☰';
    });
    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
            menuBtn.textContent = '☰';
        });
    });

    // 5. Rastreamento de UTMs e Injeção Automática no WhatsApp
    const urlParams = new URLSearchParams(window.location.search);
    const utmData = {
        source: urlParams.get('utm_source') || 'direto',
        medium: urlParams.get('utm_medium') || 'none',
        campaign: urlParams.get('utm_campaign') || 'none'
    };
    
    if (utmData.source !== 'direto') {
        localStorage.setItem('utm_data', JSON.stringify(utmData));
    }

    const getUtmText = () => {
        const saved = localStorage.getItem('utm_data');
        if (saved) {
            const data = JSON.parse(saved);
            return ` (Origem: ${data.source} / ${data.campaign})`;
        }
        return '';
    };

    // Atualiza TODOS os links do WhatsApp (incluindo o botão flutuante) com a UTM
    const waLinks = document.querySelectorAll('.wa-link');
    waLinks.forEach(link => {
        const baseUrl = link.href.split('?')[0];
        const text = link.href.includes('text=') ? decodeURIComponent(link.href.split('text=')[1]) : 'Olá! Gostaria de agendar um horário.';
        const newText = text + getUtmText();
        link.href = `${baseUrl}?text=${encodeURIComponent(newText)}`;
    });

    // 6. Formulário Inteligente (Fallback para WhatsApp)
    const contactForm = document.getElementById('contact-form');
    const successModal = document.getElementById('success-modal');
    const closeModal = document.querySelector('.close-modal');
    const confirmWaSend = document.getElementById('confirm-wa-send');
    let finalWaLink = '';

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const service = document.getElementById('service').value;
        const message = document.getElementById('message').value;
        const utmSuffix = getUtmText();

        const waMessage = `Olá, J&E Albuquerque! Meu nome é *${name}*.\nTenho interesse no serviço: *${service}*.\n\nMensagem: ${message || 'Gostaria de mais informações.'}\n\n📍 *Site Web*${utmSuffix}`;
        
        finalWaLink = `https://wa.me/5511960966646?text=${encodeURIComponent(waMessage)}`;
        
        successModal.style.display = 'flex';
        trackEvent('form_submission', { service: service });
    });

    confirmWaSend.addEventListener('click', () => {
        window.open(finalWaLink, '_blank');
        successModal.style.display = 'none';
        contactForm.reset();
    });

    closeModal.addEventListener('click', () => { successModal.style.display = 'none'; });
    window.addEventListener('click', (e) => {
        if (e.target === successModal) successModal.style.display = 'none';
    });

    // 7. FAQ Accordion
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(q => {
        q.addEventListener('click', () => {
            const item = q.parentElement;
            const isActive = item.classList.contains('active');
            document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
            if (!isActive) item.classList.add('active');
        });
    });

    // 8. Banner de Cookies (LGPD) e Função trackEvent
    const cookieBanner = document.getElementById('cookie-banner');
    const acceptCookiesBtn = document.getElementById('accept-cookies');

    if (!localStorage.getItem('cookies_accepted')) {
        setTimeout(() => { cookieBanner.style.display = 'flex'; }, 1000);
    }

    acceptCookiesBtn.addEventListener('click', () => {
        localStorage.setItem('cookies_accepted', 'true');
        cookieBanner.style.display = 'none';
        trackEvent('cookie_consent', { status: 'accepted' });
    });

    // Função de Rastreamento Segura (Respeita LGPD)
    window.trackEvent = function(eventName, parameters = {}) {
        const consent = localStorage.getItem('cookies_accepted');
        if (consent === 'true') {
            console.log(`[TRACKING] Event: ${eventName}`, parameters);
            // Descomente as linhas abaixo quando configurar GTM/GA4/Pixel:
            // if (typeof gtag !== 'undefined') { gtag('event', eventName, parameters); }
            // if (typeof fbq !== 'undefined') { fbq('trackCustom', eventName, parameters); }
        } else {
            console.log(`[TRACKING BLOCKED] Consent not given for: ${eventName}`);
        }
    };
});
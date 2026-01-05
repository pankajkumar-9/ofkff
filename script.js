// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {

    // Smooth scrolling removed to use native browser behavior (snappier)

    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "50px" /* Trigger slightly before element is in view */
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const fadeElements = document.querySelectorAll('.fade-in');
    fadeElements.forEach(el => observer.observe(el));
});

// Cart Logic
let cartCount = parseInt(sessionStorage.getItem('ofkff_cart_count')) || 0;

// Initialize cart count on load
updateCartUI();

function addToCart() {
    cartCount++;
    sessionStorage.setItem('ofkff_cart_count', cartCount);
    updateCartUI();

    // Animate feedback
    const cartIcon = document.querySelector('.cart-icon');
    if (cartIcon) {
        cartIcon.style.transform = "scale(1.2)";
        setTimeout(() => {
            cartIcon.style.transform = "scale(1)";
        }, 200);
    }
}

function updateCartUI() {
    const cartCountElements = document.querySelectorAll('.cart-count');
    cartCountElements.forEach(el => {
        el.innerText = cartCount;
        // Hide badge if 0
        if (cartCount === 0) {
            el.style.display = 'none';
        } else {
            el.style.display = 'flex';
        }
    });
}

function openCart() {
    if (cartCount === 0) {
        alert("Your cart is empty! Add some products first.");
        return;
    }

    // Create Modal HTML
    const modalHtml = `
        <div class="cart-modal-overlay" onclick="closeCart(event)">
            <div class="cart-modal">
                <h3>Your Cart</h3>
                <p>You have <strong>${cartCount}</strong> items ready for checkout.</p>
                <div class="cart-actions">
                    <button class="btn" style="border: 1px solid #ccc; background: transparent;" onclick="closeCart(event, true)">Close</button>
                    <button class="btn btn-primary" onclick="window.open('https://forms.gle/Aht1BTsPW9bXUKKX6', '_blank'); closeCart(event, true)">Buy Now</button>
                </div>
            </div>
        </div>
    `;

    // Append to body
    const modalContainer = document.createElement('div');
    modalContainer.id = 'cart-modal-container';
    modalContainer.innerHTML = modalHtml;
    document.body.appendChild(modalContainer);
}

function closeCart(e, force = false) {
    if (force || e.target.classList.contains('cart-modal-overlay')) {
        const container = document.getElementById('cart-modal-container');
        if (container) {
            container.remove();
        }
    }
}

// Smart Farm Input Calculator
const landInput = document.getElementById('landSize');
const cropSelect = document.getElementById('cropType');

// Elements to update
const resVermi = document.getElementById('res-vermi');
const resJeeva = document.getElementById('res-jeeva');
const resNima = document.getElementById('res-nima');
const resBrahma = document.getElementById('res-brahma');

function calculateDosage() {
    if (!landInput || !cropSelect || !resVermi) return; // Guard clause

    let acres = parseFloat(landInput.value) || 0;
    if (acres < 0) acres = 0;

    // Base rates per acre
    // Vermicompost: 1000 kg (Field), 1200 kg (Veg), 1500 kg (Fruit)
    // Jeevamrut: 200 L (Standard across)
    // Nimastra: 100 L (Standard diluted)
    // Brahmastra: 10 L (Standard diluted concentrate)

    let vermiRate = 1000;
    let jeevaRate = 200;
    let nimaRate = 100;
    let brahmaRate = 10;

    const crop = cropSelect.value;
    if (crop === 'veggies') {
        vermiRate = 1200;
        nimaRate = 120; // Slightly higher pest risk
    } else if (crop === 'fruits') {
        vermiRate = 1500; // Trees need more base nutrition
        jeevaRate = 250;
    }

    // Calculate
    const totalVermi = Math.round(acres * vermiRate);
    const totalJeeva = Math.round(acres * jeevaRate);
    const totalNima = Math.round(acres * nimaRate);
    const totalBrahma = Math.round(acres * brahmaRate);

    // Update DOM with animation effect (simple text update for now)
    resVermi.innerText = totalVermi.toLocaleString();
    resJeeva.innerText = totalJeeva.toLocaleString();
    resNima.innerText = totalNima.toLocaleString();
    resBrahma.innerText = totalBrahma.toLocaleString();
}

// Event Listeners
if (landInput) {
    landInput.addEventListener('input', calculateDosage);
    cropSelect.addEventListener('change', calculateDosage);
    // Determine initial values on load
    calculateDosage();
}

function generateQuote() {
    if (!landInput || !cropSelect) return;
    const acres = landInput.value;
    const crop = cropSelect.options[cropSelect.selectedIndex].text;

    // Get current calculated values
    const vermi = resVermi.innerText;
    const jeeva = resJeeva.innerText;
    const nima = resNima.innerText;
    const brahma = resBrahma.innerText;

    // Construct message
    const subject = encodeURIComponent(`Custom Quote Request: ${crop} Farm`);
    const body = encodeURIComponent(
        `Hello,

I'm interested in the Organic Farming Kit.

Farm Details:
- Land Size: ${acres} Acres
- Crop Type: ${crop}

Estimated Requirements:
- Vermicompost: ${vermi} kg
- Jeevamrut: ${jeeva} L
- Nimastra: ${nima} L
- Brahmastra: ${brahma} L

Please provide a quote for this season kit.`
    );

    // Open Mail Client
    window.location.href = `mailto:pankajbarik34@gmail.com?subject=${subject}&body=${body}`;
}

// FAQ Accordion Logic
const accordions = document.querySelectorAll('.accordion-header');

accordions.forEach(acc => {
    acc.addEventListener('click', function () {
        // Toggle active class on header
        this.classList.toggle('active');

        // Toggle panel visibility
        const panel = this.nextElementSibling;
        if (panel.style.maxHeight) {
            panel.style.maxHeight = null;
        } else {
            // Close other open panels (optional - exclusive accordion)
            accordions.forEach(otherAcc => {
                if (otherAcc !== this && otherAcc.classList.contains('active')) {
                    otherAcc.classList.remove('active');
                    otherAcc.nextElementSibling.style.maxHeight = null;
                }
            });
            panel.style.maxHeight = panel.scrollHeight + "px";
        }
    });
});
/* Animation Removed as per request */


/* =========================================
   2. Crop Doctor Wizard Logic
   ========================================= */
let doctorState = {
    problem: '',
    crop: ''
};

function nextDoctorStep(problemType) {
    doctorState.problem = problemType;
    document.getElementById('doctor-step-1').style.display = 'none';

    // Show step 2 with fade in
    const step2 = document.getElementById('doctor-step-2');
    step2.style.display = 'block';
    step2.style.opacity = 0;
    setTimeout(() => step2.style.opacity = 1, 50);
}

function showDoctorResult(cropType) {
    doctorState.crop = cropType;
    document.getElementById('doctor-step-2').style.display = 'none';

    // Logic for recommendation
    let title = "Recommended: Jeevamrut";
    let desc = "Universal immunity booster for overall health.";
    let link = "jeevamrut.html";

    if (doctorState.problem === 'pests') {
        if (cropType === 'veg') {
            title = "Recommended: Nimastra";
            desc = "Best for sucking pests (aphids, jassids) on soft vegetables.";
            link = "nimastra.html";
        } else {
            title = "Recommended: Brahmastra";
            desc = "Strong defense for larger crops and stubborn pests.";
            link = "brahmastra.html";
        }
    } else if (doctorState.problem === 'growth') {
        title = "Recommended: Vermicompost";
        desc = "Your soil needs organic carbon and nutrition.";
        link = "vermicompost.html";
    }

    // Update DOM
    document.getElementById('res-title').innerText = title;
    document.getElementById('res-desc').innerText = desc;
    document.getElementById('res-link').href = link;

    const resDiv = document.getElementById('doctor-result');
    resDiv.style.display = 'block';
}

function resetDoctor() {
    doctorState = { problem: '', crop: '' };
    document.getElementById('doctor-result').style.display = 'none';
    document.getElementById('doctor-step-1').style.display = 'block';
}


/* =========================================
   3. Multilingual Support System
   ========================================= */
const translations = {
    'en': {
        'nav_problem': 'The Problem',
        'nav_solution': 'The Solution',
        'nav_works': 'How It Works',
        'nav_impact': 'Impact',
        'nav_gallery': 'Gallery',
        'nav_about': 'About',
        'nav_contact': 'Contact',
        'hero_title': 'OFKFF: Organic Farming Kit For Farmers',
        'hero_desc': 'A simple, low-cost solution for chemical-free and sustainable farming',
        'hero_btn': 'Explore the Model',
        'prob_title': 'Why We Need Change',
        'sol_title': 'The 4-Component Solution',
        'sol_subtitle': 'A self-sustaining ecosystem for complete plant nutrition and protection.',
        'doctor_title': 'Interactive Crop Doctor',
        'doctor_desc': 'Diagnose current issues and find the perfect organic solution.',
        'doctor_q1': 'What is the problem?',
        'doctor_q2': 'What is your crop?',
        'opt_pests': 'Insects / Pests',
        'opt_growth': 'Slow Growth',
        'opt_disease': 'Yellow Leaves / Virus',
        'opt_veg': 'Vegetables',
        'opt_grain': 'Paddy / Wheat',
        'impact_title': 'Real World Impact',
        'stat_farmers': 'Farmers Trained',
        'stat_acres': 'Acres Regenerated',
        'stat_chem': 'Kg Chemicals Saved',
        'about_title': 'About The Project',
        'about_desc': 'We are building a scalable framework for the next agricultural revolution. This is not just a project; it\'s a proven blueprint for sustainable rural economies.',
        'contact_title': 'Get in Touch',
        'contact_desc': 'Interested in adopting this model or investing in the future of farming?',
        'loc_title': 'Visit Our Production Unit',
        'loc_desc': 'See sustainable farming in action at our model farm.',
        'loc_subtitle': 'Central Unit',
        'loc_addr': 'AT/PO - RAIKALA,<br>VIA - JHUMPURA, DIST - KEONJHAR<br>PIN - 758031',
        'loc_btn': 'Get Directions'
    },
    'hi': {
        'nav_problem': 'समस्या',
        'nav_solution': 'समाधान',
        'nav_works': 'कैसे काम करता है',
        'nav_impact': 'प्रभाव',
        'nav_gallery': 'गैलरी',
        'nav_about': 'बारे में',
        'nav_contact': 'संपर्क करें',
        'hero_title': 'OFKFF: किसानों के लिए जैविक खेती किट',
        'hero_desc': 'रसायन मुक्त और टिकाऊ खेती के लिए एक सरल, कम लागत वाला समाधान',
        'hero_btn': 'मॉडल देखें',
        'prob_title': 'बदलाव क्यों जरूरी है?',
        'sol_title': '4-घटक समाधान',
        'sol_subtitle': 'पूर्ण पौधों के पोषण और सुरक्षा के लिए एक आत्मनिर्भर पारिस्थितिकी तंत्र।',
        'doctor_title': 'फसल डॉक्टर (Crop Doctor)',
        'doctor_desc': 'अपनी फसल की समस्या बताएं और सही जैविक समाधान पाएं।',
        'doctor_q1': 'समस्या क्या है?',
        'doctor_q2': 'आपकी फसल कौन सी है?',
        'opt_pests': 'कीड़े / इल्ली',
        'opt_growth': 'रुकी हुई वृद्धि',
        'opt_disease': 'पीलापन / रोग',
        'opt_veg': 'सब्जियां',
        'opt_grain': 'धान / गेहूं',
        'impact_title': 'वास्तविक प्रभाव',
        'stat_farmers': 'किसान प्रशिक्षित',
        'stat_acres': 'एकड़ भूमि पुनर्जीवित',
        'stat_chem': 'किलो रसायन बचाया',
        'about_title': 'परियोजना के बारे में',
        'about_desc': 'हम अगली कृषि क्रांति के लिए एक स्केलेबल ढांचा बना रहे हैं। यह केवल एक परियोजना नहीं है; यह टिकाऊ ग्रामीण अर्थव्यवस्थाओं के लिए एक सिद्ध खाका है।',
        'contact_title': 'संपर्क करें',
        'contact_desc': 'क्या आप इस मॉडल को अपनाने या खेती के भविष्य में निवेश करने में रुचि रखते हैं?',
        'loc_title': 'हमारी उत्पादन इकाई पर पधारें',
        'loc_desc': 'हमारे मॉडल फार्म पर टिकाऊ खेती को क्रियान्वित होते देखें।',
        'loc_subtitle': 'केंद्रीय इकाई',
        'loc_addr': 'मु/पो - रायकला,<br>वाया - झुम्पुरा, जिला - क्योंझर<br>पिन - 758031',
        'loc_btn': 'दिशा - निर्देश प्राप्त करें'
    },
    'or': {
        'nav_problem': 'ସମସ୍ୟା',
        'nav_solution': 'ସମାଧାନ',
        'nav_works': 'କିପରି କାମ କରେ',
        'nav_impact': 'ପ୍ରଭାବ',
        'nav_gallery': 'ଗ୍ୟାଲେରୀ',
        'nav_about': 'ଆମ ବିଷୟରେ',
        'nav_contact': 'ଯୋଗାଯୋଗ',
        'hero_title': 'OFKFF: ଚାଷୀଙ୍କ ପାଇଁ ଜୈବିକ ଚାଷ କିଟ୍',
        'hero_desc': 'ରାସାୟନିକ ମୁକ୍ତ ଏବଂ ସ୍ଥାୟୀ ଚାଷ ପାଇଁ ଏକ ସରଳ, ସ୍ୱଳ୍ପ ମୂଲ୍ୟର ସମାଧାନ',
        'hero_btn': 'ମଡେଲ୍ ଦେଖନ୍ତୁ',
        'prob_title': 'ପରିବର୍ତ୍ତନ କାହିଁକି ଆବଶ୍ୟକ?',
        'sol_title': '୪-ଉପାଦାନ ସମାଧାନ',
        'sol_subtitle': 'ସମ୍ପୂର୍ଣ୍ଣ ଉଦ୍ଭିଦ ପୁଷ୍ଟିକର ଏବଂ ସୁରକ୍ଷା ପାଇଁ ଏକ ଆତ୍ମନିର୍ଭରଶୀଳ ପରିବେଶ |',
        'doctor_title': 'ଫସଲ ଡାକ୍ତର (Crop Doctor)',
        'doctor_desc': 'ଆପଣଙ୍କ ଫସଲର ସମସ୍ୟା ଜାଣନ୍ତୁ ଏବଂ ସମାଧାନ ପାଆନ୍ତୁ |',
        'doctor_q1': 'ସମସ୍ୟା କଣ?',
        'doctor_q2': 'ଆପଣଙ୍କ ଫସଲ କଣ?',
        'opt_pests': 'ପୋକ / ରୋଗ',
        'opt_growth': 'ବୃଦ୍ଧି ହେଉନାହିଁ',
        'opt_disease': 'ହଳଦିଆ ପତ୍ର / ରୋଗ',
        'opt_veg': 'ପରିବା',
        'opt_grain': 'ଧାନ / ଗହମ',
        'impact_title': 'ବାସ୍ତବ ପ୍ରଭାବ',
        'stat_farmers': 'ଚାଷୀ ତାଲିମ ପ୍ରାପ୍ତ',
        'stat_acres': 'ଏକର ଜମି ପୁନରୁଦ୍ଧାର',
        'stat_chem': 'କିଲୋ ରାସାୟନିକ ସଞ୍ଚୟ',
        'about_title': 'ପ୍ରକଳ୍ପ ବିଷୟରେ',
        'about_desc': 'ଆମେ ପରବର୍ତ୍ତୀ କୃଷି ବିପ୍ଳବ ପାଇଁ ଏକ ଢାଞ୍ଚା ନିର୍ମାଣ କରୁଛୁ | ଏହା କେବଳ ଏକ ପ୍ରକଳ୍ପ ନୁହେଁ; ଏହା ସ୍ଥାୟୀ ଗ୍ରାମୀଣ ଅର୍ଥନୀତି ପାଇଁ ଏକ ପ୍ରମାଣିତ ନକ୍ସା |',
        'contact_title': 'ଯୋଗାଯୋଗ କରନ୍ତୁ',
        'contact_desc': 'ଆପଣ ଏହି ମଡେଲ୍ ଗ୍ରହଣ କରିବାକୁ କିମ୍ବା ଚାଷର ଭବିଷ୍ୟତରେ ବିନିଯୋଗ କରିବାକୁ ଆଗ୍ରହୀ କି?',
        'loc_title': 'ଆମର ଉତ୍ପାଦନ ୟୁନିଟ୍ ପରିଦର୍ଶନ କରନ୍ତୁ',
        'loc_desc': 'ଆମର ମଡେଲ୍ ଫାର୍ମରେ ସ୍ଥାୟୀ ଚାଷ ଦେଖନ୍ତୁ |',
        'loc_subtitle': 'କେନ୍ଦ୍ରୀୟ ୟୁନିଟ୍',
        'loc_addr': 'ମୁ/ପୋ - ରାଇକଳା,<br>ଭାୟା - ଝୁମ୍ପୁରା, ଜିଲ୍ଲା - କେନ୍ଦୁଝର<br>ପିନ୍ - ୭୫୮୦୩୧',
        'loc_btn': 'ଦିଗ ନିର୍ଦ୍ଦେଶ'
    }
};

function changeLanguage(lang) {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        // Safety check for translation existence
        if (translations[lang] && translations[lang][key]) {
            el.innerHTML = translations[lang][key];
        } else if (translations['en'] && translations['en'][key]) {
            // Fallback to English
            el.innerHTML = translations['en'][key];
        }
    });
    // Save preference
    localStorage.setItem('ofkff_lang', lang);
}

// Load saved language
const savedLang = localStorage.getItem('ofkff_lang');
if (savedLang) {
    document.getElementById('langSelect').value = savedLang;
    changeLanguage(savedLang);
}

// Mobile Menu Toggle
function toggleMobileMenu() {
    const nav = document.getElementById('mobileNav');
    const hamburger = document.querySelector('.hamburger');

    // Toggle active class
    if (nav.classList.contains('active')) {
        nav.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
    } else {
        nav.classList.add('active');
        hamburger.setAttribute('aria-expanded', 'true');
    }
}

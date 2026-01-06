// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {

    // Smooth scrolling removed to use native browser behavior (snappier)

    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "50px" /* Trigger slightly before element is in view */
    };

    // Initialize Chatbot
    initChatbot();

    // Initialize components
    renderProducts();
    updateCartIcon();

    // Animate elements on scroll
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
// Uses 'cart' key in localStorage to store array of {name, price, quantity}
let cart = JSON.parse(localStorage.getItem('cart')) || [];

function updateCartCount() {
    const count = cart.reduce((acc, item) => acc + item.quantity, 0);
    const cartCountElements = document.querySelectorAll('.cart-count');

    cartCountElements.forEach(el => {
        el.innerText = count;
        el.style.display = count > 0 ? 'flex' : 'none';

        // Optional: Animate
        el.style.animation = 'none';
        el.offsetHeight; /* trigger reflow */
        el.style.animation = 'popIn 0.3s ease';
    });
}

// Initialize on load
updateCartCount();

function addToCart(name, price) {
    const existingItem = cart.find(item => item.name === name);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ name, price, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();

    // Visual Feedback
    const btn = event.target; // Assuming click event context
    const originalText = btn.innerText;
    btn.innerText = 'Added!';
    btn.style.backgroundColor = '#2e7d32'; // Green
    btn.style.color = 'white';

    setTimeout(() => {
        btn.innerText = originalText;
        btn.style.backgroundColor = '';
        btn.style.color = '';
    }, 1500);
}

function updateCartUI() {
    // Deprecated, mapped to updateCartCount
    updateCartCount();
}

function openCart() {
    window.location.href = 'cart.html';
}

// These functions are used by cart.html to manage state
function updateCartItem(index, change) {
    if (cart[index]) {
        cart[index].quantity += change;
        if (cart[index].quantity <= 0) {
            cart.splice(index, 1);
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount(); // from script.js scope if available, else standard

        // If we are on the cart page
        if (typeof renderCartPage === 'function') {
            renderCartPage();
        }
    }
}

function removeCartItem(index) {
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount(); // from script.js scope

    if (typeof renderCartPage === 'function') {
        renderCartPage();
    }
}

// Modal logic removed

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

    // Verify result elements exist
    // Verify result elements exist
    if (!resVermi || !resJeeva || !resNima || !resBrahma) return;

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

    // Get current language
    const currentLang = localStorage.getItem('ofkff_lang') || 'en';
    const t = translations[currentLang];

    // Logic for recommendation
    let title = t['doc_res_default_title'];
    let desc = t['doc_res_default_desc'];
    let link = "jeevamrut.html";

    if (doctorState.problem === 'pests') {
        if (cropType === 'veg') {
            title = t['doc_res_nima_title'];
            desc = t['doc_res_nima_desc'];
            link = "nimastra.html";
        } else {
            title = t['doc_res_brahma_title'];
            desc = t['doc_res_brahma_desc'];
            link = "brahmastra.html";
        }
    } else if (doctorState.problem === 'growth') {
        title = t['doc_res_vermi_title'];
        desc = t['doc_res_vermi_desc'];
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
        // Problem Section
        'prob_soil': 'Soil Degradation',
        'prob_soil_desc': 'Chemical overuse is stripping the earth of its nutrients, leading to barren lands.',
        'prob_health': 'Health Risks',
        'prob_health_desc': 'Toxic residues in food are causing severe long-term health issues for consumers.',
        'prob_cost': 'High Input Costs',
        'prob_cost_desc': 'Rising costs of fertilizers and pesticides are debt-trapping farmers.',
        // Calculator Section
        'calc_title': 'Smart Farm Estimator',
        'calc_farm_details': 'Farm Details',
        'calc_subtitle': 'Calculate exactly what your farm needs for a chemical-free season.',
        'calc_disclaimer': '*Estimates based on standard organic farming protocols (TNAU/NCOF).',
        'calc_cost_note': '*Excluding delivery',
        'calc_crop_type': 'Select Crop Type',
        'calc_opt_paddy': 'Paddy / Wheat / Cereals',
        'calc_opt_veggies': 'Vegetables / Commercial Crops',
        'calc_opt_fruits': 'Fruit Orchards (Mango, Coconut)',
        'calc_land_size': 'Land Size (in Acres)',
        'calc_season_kit': 'Your Season Kit',
        'calc_soil_nutrition': 'Soil Nutrition',
        'calc_immunity': 'Immunity Booster (Monthly)',
        'calc_pest_repel': 'Pest Repellent',
        'calc_defense': 'Critical Defense',
        'calc_pest_repel': 'Pest Repellent',
        'calc_defense': 'Critical Defense',
        'calc_est_cost': 'Estimated Cost',
        'calc_quote_btn': 'Get Custom Quote for this Kit',
        'btn_buy_now': 'Buy Now',
        'btn_add_cart': 'Add to Cart',
        'btn_shop_now': 'Shop Now',
        'starts_at': 'Starts @',
        'nav_home': 'Back to Home',
        // Cart Page
        'cart_title': 'Your Cart',
        'cart_col_prod': 'Product',
        'cart_col_price': 'Price',
        'cart_col_qty': 'Quantity',
        'cart_col_total': 'Total',
        'cart_col_action': 'Action',
        'cart_grand_total': 'Grand Total:',
        'cart_checkout': 'Proceed to Checkout',
        'cart_empty': 'Your cart is empty.',
        'cart_browse': 'Browse Products',
        'cart_payment_note': 'Payment will be collected after order confirmation via the form.',
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
        'impact_cost_red': 'Reduced farming costs by up to <strong>60%</strong>',
        'impact_chem_free': 'Chemical-free, nutrient-rich food supply',
        'impact_regen': 'Regenerated soil health for future generations',
        'impact_employ': 'New employment opportunities in rural areas',
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
        'loc_btn': 'Get Directions',
        // How It Works
        'work_title': 'How It Works',
        'work_step1_title': 'Production',
        'work_step1_desc': 'Setting up the 4 components.',
        'work_step2_title': 'Demo Field',
        'work_step2_desc': 'Showcasing results live.',
        'work_step3_title': 'Training',
        'work_step3_desc': 'Educating fellow farmers.',
        'work_step4_title': 'Selling',
        'work_step4_desc': 'Market access & profit.',
        // Prototype
        'proto_title': 'The Model in Action',
        'proto_bottom_desc': 'Our pilot setup demonstrates how these components integrate seamlessly into a standard farm layout.',
        // Gallery
        'gal_title': 'Gallery',
        'gal_desc': 'Snapshots from our journey, training sessions, and success stories.',
        'filter_all': 'All',
        'filter_field': 'Field Work',
        'filter_train': 'Training',
        'filter_prod': 'Product',
        // About Innovator
        'innov_title': 'About the Innovator',
        'innov_name': 'Pankaj Kumar Barik',
        'innov_desc': 'A student innovator focused on sustainable and affordable farming solutions. My work centers on reducing chemical dependency in agriculture through practical, logically adaptable organic methods. The complete organic farming kit reflects a vision of farmer self reliance, soil health and scalable rural impact.',
        // FAQ
        'faq_title': 'Frequently Asked Questions',
        'faq_subtitle': 'Common questions about the Organic Farming Kit.',
        'faq_q1': 'How long does the transition to organic take?',
        'faq_a1': 'It typically takes <strong>2-3 years</strong> for soil to fully regenerate its microbial health. We recommend a phased approach: reduce chemical inputs by 50% in Year 1, and aim for 100% organic by Year 2.',
        'faq_q2': 'Will my yield drop if I stop using chemicals?',
        'faq_a2': 'A minor dip (5-10%) is possible in the first year as the soil ecosystem recovers. However, by Year 3, yields typically stabilize or exceed conventional levels, while your input costs drop by up to <strong>60%</strong>, leading to higher net profit.',
        'faq_q3': 'Is Nimastra as fast as chemical pesticides?',
        'faq_a3': 'Chemicals kill instantly but damage the ecosystem. Nimastra works differently: it repels pests, makes the plant bitter, and disrupts their breeding cycle. For best results, use it <strong>preventively every 10-15 days</strong> rather than waiting for an infestation.',
        'faq_view_more': 'View All Questions',
        'faq_view_less': 'Show Less',
        'faq_q4': 'What is the shelf life of Jeevamrut?',
        'faq_a4': 'Since Jeevamrut contains billions of live active microbes, it is most effective when used within <strong>7-12 days</strong> of preparation. After this period, the microbial count begins to decline naturally.',
        'faq_q5': 'Can I mix these with chemical fertilizers?',
        'faq_a5': '<strong>No.</strong> Chemical fertilizers and strong pesticides will kill the beneficial microbes (bacteria, fungi) present in the organic kit. If you are transitioning, maintain at least a <strong>7-day gap</strong> between applying chemical inputs and organic bio-inputs.',
        'faq_q6': 'How much Vermicompost is needed per acre?',
        'faq_a6': 'The standard TNAU recommendation is <strong>1000-2000 kg (1-2 tons) per acre</strong> for field crops like Paddy and Wheat. For commercial vegetable crops, the dosage may go up to 3000-4000 kg depending on soil health.',
        'faq_q7': 'Do you offer bulk discounts for FPOs?',
        'faq_a7': 'Absolutely. We work with Farmer Producer Organizations (FPOs) to provide kits at wholesale rates. Please use the contact form below to request a bulk quote.',
        // Chatbot
        'chat_greeting': 'May I help you?',
        'chat_title': 'Assistant',
        'chat_opt_cost': 'Calculate Cost',
        'chat_opt_prod': 'Product Guide',
        'chat_opt_expert': 'Chat with Expert',
        // Doctor Results
        'doc_res_default_title': 'Recommended: Jeevamrut',
        'doc_res_default_desc': 'Universal immunity booster for overall health.',
        'doc_res_nima_title': 'Recommended: Nimastra',
        'doc_res_nima_desc': 'Best for sucking pests (aphids, jassids) on soft vegetables.',
        'doc_res_brahma_title': 'Recommended: Brahmastra',
        'doc_res_brahma_desc': 'Strong defense for larger crops and stubborn pests.',
        'doc_res_vermi_title': 'Recommended: Vermicompost',
        'doc_res_vermi_desc': 'Your soil needs organic carbon and nutrition.'
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
        // Problem Section
        'prob_soil': 'मिट्टी का क्षरण',
        'prob_soil_desc': 'रसायनों का अत्यधिक उपयोग धरती से पोषक तत्वों को छीन रहा है, जिससे भूमि बंजर हो रही है।',
        'prob_health': 'स्वास्थ्य जोखिम',
        'prob_health_desc': 'भोजन में विषाक्त अवशेष उपभोक्ताओं के लिए गंभीर दीर्घकालिक स्वास्थ्य समस्याएं पैदा कर रहे हैं।',
        'prob_cost': 'उच्च लागत',
        'prob_cost_desc': 'उर्वरकों और कीटनाशकों की बढ़ती लागत किसानों को कर्ज के जाल में फंसा रही है।',
        // Calculator Section
        'calc_title': 'स्मार्ट फार्म एस्टिमेटर',
        'calc_farm_details': 'खेत का विवरण',
        'calc_subtitle': 'गणित करें कि आपके खेत को रसायन मुक्त मौसम के लिए क्या चाहिए।',
        'calc_disclaimer': '*अनुमान मानक जैविक खेती प्रोटोकॉल (TNAU/NCOF) पर आधारित हैं।',
        'calc_cost_note': '*डिलीवरी शामिल नहीं है',
        'calc_crop_type': 'फसल का प्रकार चुनें',
        'calc_opt_paddy': 'धान / गेहूं / अनाज',
        'calc_opt_veggies': 'सब्जियां / नकदी फसलें',
        'calc_opt_fruits': 'फलों के बाग (आम, नारियल)',
        'calc_land_size': 'भूमि का आकार (एकड़ में)',
        'calc_season_kit': 'आपकी सीजन किट',
        'calc_soil_nutrition': 'मिट्टी का पोषण',
        'calc_immunity': 'रोग प्रतिरोधक क्षमता (मासिक)',
        'calc_pest_repel': 'कीट विकर्षक',
        'calc_defense': 'महत्वपूर्ण सुरक्षा',
        'calc_pest_repel': 'कीट विकर्षक',
        'calc_defense': 'महत्वपूर्ण सुरक्षा',
        'calc_est_cost': 'अनुमानित लागत',
        'calc_quote_btn': 'इस किट के लिए कोट प्राप्त करें',
        'btn_buy_now': 'अभी खरीदें',
        'btn_add_cart': 'कार्ट में जोड़ें',
        'btn_shop_now': 'अभी खरीदें',
        'starts_at': 'शुरुवाती कीमत',
        'nav_home': 'घर वापस',
        // Cart Page
        'cart_title': 'आपका कार्ट',
        'cart_col_prod': 'उत्पाद',
        'cart_col_price': 'मूल्य',
        'cart_col_qty': 'मात्रा',
        'cart_col_total': 'कुल',
        'cart_col_action': 'कार्रवाई',
        'cart_grand_total': 'कुल योग:',
        'cart_checkout': 'चेकआउट करें',
        'cart_empty': 'आपका कार्ट खाली है ।',
        'cart_browse': 'उत्पाद देखें',
        'cart_payment_note': 'फॉर्म के माध्यम से ऑर्डर की पुष्टि के बाद भुगतान लिया जाएगा।',
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
        'impact_cost_red': 'खेती की लागत <strong>60%</strong> तक कम की गई',
        'impact_chem_free': 'रसायन मुक्त, पोषक तत्वों से भरपूर खाद्य आपूर्ति',
        'impact_regen': 'भविष्य की पीढ़ियों के लिए मिट्टी के स्वास्थ्य को पुनर्जीवित किया',
        'impact_employ': 'ग्रामीण क्षेत्रों में रोजगार के नए अवसर',
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
        'loc_btn': 'दिशा - निर्देश प्राप्त करें',
        // How It Works
        'work_title': 'यह कैसे काम करता है',
        'work_step1_title': 'उत्पादन',
        'work_step1_desc': '4 घटकों की स्थापना।',
        'work_step2_title': 'डेमो फील्ड',
        'work_step2_desc': 'परिणामों का लाइव प्रदर्शन।',
        'work_step3_title': 'प्रशिक्षण',
        'work_step3_desc': 'साथी किसानों को शिक्षित करना।',
        'work_step4_title': 'बिक्री',
        'work_step4_desc': 'बाजार पहुंच और लाभ।',
        // Prototype
        'proto_title': 'क्रियान्वित मॉडल',
        'proto_bottom_desc': 'हमारा पायलट सेटअप दिखाता है कि कैसे ये घटक एक मानक फार्म लेआउट में मूल रूप से एकीकृत होते हैं।',
        // Gallery
        'gal_title': 'गैलरी',
        'gal_desc': 'हमारी यात्रा, प्रशिक्षण सत्रों और सफलता की कहानियों की झलकियाँ।',
        'filter_all': 'सभी',
        'filter_field': 'क्षेत्र कार्य',
        'filter_train': 'प्रशिक्षण',
        'filter_prod': 'उत्पाद',
        // About Innovator
        'innov_title': 'इनोवेटर के बारे में',
        'innov_name': 'पंकज कुमार बारीक',
        'innov_desc': 'टिकाऊ और किफायती खेती के समाधानों पर केंद्रित एक छात्र अन्वेषक। मेरा काम व्यावहारिक, तार्किक रूप से अनुकूलनीय जैविक तरीकों के माध्यम से कृषि में रासायनिक निर्भरता को कम करने पर केंद्रित है। पूर्ण जैविक खेती किट किसान आत्मनिर्भरता, मिट्टी के स्वास्थ्य और स्केलेबल ग्रामीण प्रभाव के दृष्टिकोण को दर्शाती है।',
        // FAQ
        'faq_title': 'अक्सर पूछे जाने वाले प्रश्न',
        'faq_subtitle': 'जैविक खेती किट के बारे में सामान्य प्रश्न।',
        'faq_q1': 'जैविक खेती में बदलाव में कितना समय लगता है?',
        'faq_a1': 'मिट्टी को अपने माइक्रोबियल स्वास्थ्य को पूरी तरह से पुनर्जीवित करने में आमतौर पर <strong>2-3 साल</strong> लगते हैं। हम एक चरणबद्ध दृष्टिकोण की सलाह देते हैं: पहले साल में रासायनिक इनपुट 50% कम करें और दूसरे साल तक 100% जैविक का लक्ष्य रखें।',
        'faq_q2': 'क्या रसायन बंद करने से मेरी उपज गिर जाएगी?',
        'faq_a2': 'पहले साल में 5-10% की मामूली गिरावट संभव है क्योंकि मिट्टी का पारिस्थितिकी तंत्र ठीक हो रहा होता है। हालांकि, तीसरे साल तक, पैदावार आमतौर पर पारंपरिक स्तरों से अधिक या स्थिर हो जाती है, जबकि आपकी लागत <strong>60%</strong> तक कम हो जाती है, जिससे अधिक शुद्ध लाभ होता है।',
        'faq_q3': 'क्या नीमास्त्र रासायनिक कीटनाशकों जितना तेज है?',
        'faq_a3': 'रसायन तुरंत मारते हैं लेकिन पारिस्थितिकी तंत्र को नुकसान पहुंचाते हैं। नीमास्त्र अलग तरह से काम करता है: यह कीटों को दूर भगाता है, पौधे को कड़वा बनाता है और उनके प्रजनन चक्र को बाधित करता है। सर्वोत्तम परिणामों के लिए, संक्रमण का इंतजार करने के बजाय इसे <strong>हर 10-15 दिनों में निवारक रूप से</strong> उपयोग करें।',
        'faq_view_more': 'सभी प्रश्न देखें',
        'faq_view_less': 'कम दिखाएं',
        'faq_q4': 'जीवामृत की शेल्फ लाइफ क्या है?',
        'faq_a4': 'चूंकि जीवामृत में अरबों जीवित सक्रिय रोगाणु होते हैं, इसलिए यह तैयारी के <strong>7-12 दिनों</strong> के भीतर उपयोग किए जाने पर सबसे प्रभावी होता है। इस अवधि के बाद, माइक्रोबियल गिनती स्वाभाविक रूप से कम होने लगती है।',
        'faq_q5': 'क्या मैं इन्हें रासायनिक उर्वरकों के साथ मिला सकता हूँ?',
        'faq_a5': '<strong>नहीं।</strong> रासायनिक उर्वरक और मजबूत कीटनाशक जैविक किट में मौजूद लाभकारी रोगाणुओं (बैक्टीरिया, कवक) को मार देंगे। यदि आप बदलाव कर रहे हैं, तो रासायनिक इनपुट और जैविक जैव-इनपुट लागू करने के बीच कम से कम <strong>7 दिनों का अंतर</strong> रखें।',
        'faq_q6': 'प्रति एकड़ कितने वर्मीकम्पोस्ट की आवश्यकता है?',
        'faq_a6': 'धान और गेहूं जैसी खेत की फसलों के लिए मानक TNAU सिफारिश <strong>1000-2000 किग्रा (1-2 टन) प्रति एकड़</strong> है। वाणिज्यिक सब्जी फसलों के लिए, मिट्टी के स्वास्थ्य के आधार पर खुराक 3000-4000 किग्रा तक जा सकती है।',
        'faq_q7': 'क्या आप FPO के लिए थोक छूट प्रदान करते हैं?',
        'faq_a7': 'बिलकुल। हम थोक दरों पर किट प्रदान करने के लिए किसान उत्पादक संगठनों (FPO) के साथ काम करते हैं। कृपया थोक उद्धरण का अनुरोध करने के लिए नीचे दिए गए संपर्क फ़ॉर्म का उपयोग करें।',
        // Chatbot
        'chat_greeting': 'क्या मैं आपकी मदद कर सकता हूँ?',
        'chat_title': 'सहायक',
        'chat_opt_cost': 'लागत की गणना करें',
        'chat_opt_prod': 'उत्पाद गाइड',
        'chat_opt_expert': 'विशेषज्ञ से बात करें',
        // Doctor Results
        'doc_res_default_title': 'अनुशंसित: जीवामृत',
        'doc_res_default_desc': 'समग्र स्वास्थ्य के लिए सार्वभौमिक प्रतिरक्षा बूस्टर।',
        'doc_res_nima_title': 'अनुशंसित: नीमास्त्र',
        'doc_res_nima_desc': 'नरम सब्जियों पर चूसने वाले कीटों (एफिड्स, जैसिड्स) के लिए सर्वोत्तम।',
        'doc_res_brahma_title': 'अनुशंसित: ब्रह्मास्त्र',
        'doc_res_brahma_desc': 'बड़ी फसलों और जिद्दी कीटों के लिए मजबूत सुरक्षा।',
        'doc_res_vermi_title': 'अनुशंसित: वर्मीकम्पोस्ट',
        'doc_res_vermi_desc': 'आपकी मिट्टी को जैविक कार्बन और पोषण की आवश्यकता है।'
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
        // Problem Section
        'prob_soil': 'ମାଟିର ଅବକ୍ଷୟ',
        'prob_soil_desc': 'ରାସାୟନିକ ପଦାର୍ଥର ଅତ୍ୟଧିକ ବ୍ୟବହାର ପୃଥିବୀରୁ ପୁଷ୍ଟିକର ତତ୍ତ୍ୱ ନଷ୍ଟ କରୁଛି, ଯାହା ଜମିକୁ ବଞ୍ଜର କରୁଛି |',
        'prob_health': 'ସ୍ୱାସ୍ଥ୍ୟ ବିପଦ',
        'prob_health_desc': 'ଖାଦ୍ୟରେ ଥିବା ବିଷାକ୍ତ ଅବଶିଷ୍ଟାଂଶ ଉପଭୋକ୍ତାମାନଙ୍କ ପାଇଁ ଗୁରୁତର ଦୀର୍ଘକାଳୀନ ସ୍ୱାସ୍ଥ୍ୟ ସମସ୍ୟା ସୃଷ୍ଟି କରୁଛି |',
        'prob_cost': 'ଉଚ୍ଚ ମୂଲ୍ୟ',
        'prob_cost_desc': 'ସାର ଏବଂ କୀଟନାଶକର ବଢୁଥିବା ମୂଲ୍ୟ ଚାଷୀଙ୍କୁ ଋଣ ଯନ୍ତାରେ ପକାଉଛି |',
        // Calculator Section
        'calc_title': 'ସ୍ମାର୍ଟ ଫାର୍ମ ଏଷ୍ଟିମେଟର',
        'calc_farm_details': 'ଚାଷ ଜମି ବିବରଣୀ',
        'calc_subtitle': 'ରାସାୟନିକ ମୁକ୍ତ ଚାଷ ପାଇଁ ଆପଣଙ୍କ ଜମିରେ କଣ ଆବଶ୍ୟକ ତାହା ଗଣନା କରନ୍ତୁ |',
        'calc_disclaimer': '*ଆକଳନ ମାନକ ଜୈବିକ ଚାଷ ନିୟମାବଳୀ (TNAU/NCOF) ଉପରେ ଆଧାରିତ |',
        'calc_cost_note': '*ଡେଲିଭରି ଅନ୍ତର୍ଭୁକ୍ତ ନୁହେଁ',
        'calc_crop_type': 'ଫସଲ ପ୍ରକାର ବାଛନ୍ତୁ',
        'calc_opt_paddy': 'ଧାନ / ଗହମ / ଶସ୍ୟ',
        'calc_opt_veggies': 'ପନିପରିବା / ବ୍ୟବସାୟିକ ଫସଲ',
        'calc_opt_fruits': 'ଫଳ ବଗିଚା (ଆମ୍ବ, ନଡ଼ିଆ)',
        'calc_land_size': 'ଜମିର ଆକାର (ଏକରରେ)',
        'calc_season_kit': 'ଆପଣଙ୍କ ସିଜନ୍ କିଟ୍',
        'calc_soil_nutrition': 'ମାଟିର ପୁଷ୍ଟି',
        'calc_immunity': 'ରୋଗ ପ୍ରତିରୋଧକ ଶକ୍ତି (ମାସିକ)',
        'calc_pest_repel': 'ପୋକ ନିବାରକ',
        'calc_defense': 'ଗୁରୁତ୍ୱପୂର୍ଣ୍ଣ ସୁରକ୍ଷା',
        'calc_est_cost': 'ଆନୁମାନିକ ମୂଲ୍ୟ',
        'calc_quote_btn': 'ଏହି କିଟ୍ ପାଇଁ କୋଟ୍ ପାଆନ୍ତୁ',
        'btn_buy_now': 'ବର୍ତ୍ତମାନ କିଣନ୍ତୁ',
        'btn_add_cart': 'କାର୍ଟରେ ଯୋଡନ୍ତୁ',
        'btn_shop_now': 'ବର୍ତ୍ତମାନ କିଣନ୍ତୁ',
        'starts_at': 'ପ୍ରାରମ୍ଭିକ ମୂଲ୍ୟ',
        'nav_home': 'ମୂଳ ପୃଷ୍ଠାକୁ ଫେରନ୍ତୁ',
        // Cart Page
        'cart_title': 'ଆପଣଙ୍କ କାର୍ଟ',
        'cart_col_prod': 'ଉତ୍ପାଦ',
        'cart_col_price': 'ମୂଲ୍ୟ',
        'cart_col_qty': 'ପରିମାଣ',
        'cart_col_total': 'ସମୁଦାୟ',
        'cart_col_action': 'କାର୍ଯ୍ୟ',
        'cart_grand_total': 'ସର୍ବମୋଟ:',
        'cart_checkout': 'ଚେକ୍ ଆଉଟ୍ କରନ୍ତୁ',
        'cart_empty': 'ଆପଣଙ୍କ କାର୍ଟ ଖାଲି ଅଛି |',
        'cart_browse': 'ଉତ୍ପାଦ ଦେଖନ୍ତୁ',
        'cart_payment_note': 'ଫର୍ମ ମାଧ୍ୟମରେ ଅର୍ଡର ନିଶ୍ଚିତ ହେବା ପରେ ଦେୟ ସଂଗ୍ରହ କରାଯିବ |',
        'prob_title': 'ପରିବର୍ତ୍ତନ କାହିଁକି ଆବଶ୍ୟକ?',
        'sol_title': '୪-ଉପାଦାନ ସମାଧାନ',
        'sol_subtitle': 'ସମ୍ପୂର୍ଣ୍ଣ ଉଦ୍ଭିଦ ପୁଷ୍ଟିକର ଏବଂ ସୁରକ୍ଷା ପାଇଁ ଏକ ଆତ୍ମନିର୍ଭରଶୀଳ ପରିବେଶ |',
        'doctor_title': 'ଫସଲ ଡାକ୍ତର (Crop Doctor)',
        'doctor_desc': 'ଆପଣଙ୍କ ଫସଲର ସମସ୍ୟା ଜାଣନ୍ତୁ ଏବଂ ସମାଧାନ ପାଆନ୍ତୁ |',
        'doc_res_default_title': 'ପରାମର୍ଶିତ: ଜୀବାମୃତ',
        'doc_res_default_desc': 'ସାମଗ୍ରିକ ସ୍ୱାସ୍ଥ୍ୟ ପାଇଁ ସର୍ବଭାରତୀୟ ରୋଗ ପ୍ରତିରୋଧକ ଶକ୍ତି ବୃଦ୍ଧିକାରୀ |',
        'doc_res_nima_title': 'ପରାମର୍ଶିତ: ନୀମାସ୍ତ୍ର',
        'doc_res_nima_desc': 'ନରମ ପନିପରିବାରେ ଶୋଷୁଥିବା ପୋକ (aphids, jassids) ପାଇଁ ସର୍ବୋତ୍ତମ |',
        'doc_res_brahma_title': 'ପରାମର୍ଶିତ: ବ୍ରହ୍ମାସ୍ତ୍ର',
        'doc_res_brahma_desc': 'ବଡ ଫସଲ ଏବଂ ଜିଦ୍ଖୋର ପୋକ ପାଇଁ ଦୃଢ ସୁରକ୍ଷା |',
        'doc_res_vermi_title': 'ପରାମର୍ଶିତ: ଭର୍ମିକମ୍ପୋଷ୍ଟ',
        'doc_res_vermi_desc': 'ଆପଣଙ୍କ ମାଟିରେ ଜୈବିକ ଅଙ୍ଗାରକ ଏବଂ ପୁଷ୍ଟିକର ଆବଶ୍ୟକତା ଅଛି |',
        'doctor_q1': 'ସମସ୍ୟା କଣ?',
        'doctor_q2': 'ଆପଣଙ୍କ ଫସଲ କଣ?',
        'opt_pests': 'ପୋକ / ରୋଗ',
        'opt_growth': 'ବୃଦ୍ଧି ହେଉନାହିଁ',
        'opt_disease': 'ହଳଦିଆ ପତ୍ର / ରୋଗ',
        'opt_veg': 'ପରିବା',
        'opt_grain': 'ଧାନ / ଗହମ',
        'impact_title': 'ବାସ୍ତବ ପ୍ରଭାବ',
        'impact_cost_red': 'ଚାଷ ଖର୍ଚ୍ଚ <strong>୬୦%</strong> ପର୍ଯ୍ୟନ୍ତ କମାଇ ଦିଆଯାଇଛି',
        'impact_chem_free': 'ରାସାୟନିକ ମୁକ୍ତ, ପୁଷ୍ଟିକର ଖାଦ୍ୟ ଯୋଗାଣ',
        'impact_regen': 'ଭବିଷ୍ୟତ ପାଇଁ ମାଟିର ସ୍ୱାସ୍ଥ୍ୟ ପୁନରୁଦ୍ଧାର',
        'impact_employ': 'ଗ୍ରାମାଞ୍ଚଳରେ ନୂତନ ନିଯୁକ୍ତି ସୁଯୋଗ',
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
        'loc_btn': 'ଦିଗ ନିର୍ଦ୍ଦେଶ',
        // How It Works
        'work_title': 'ଏହା କିପରି କାମ କରେ',
        'work_step1_title': 'ଉତ୍ପାଦନ',
        'work_step1_desc': '୪ଟି ଉପାଦାନର ସ୍ଥାପନା।',
        'work_step2_title': 'ଡେମୋ ଫିଲ୍ଡ',
        'work_step2_desc': 'ଫଳାଫଳର ଲାଇଭ୍ ପ୍ରଦର୍ଶନ।',
        'work_step3_title': 'ତାଲିମ',
        'work_step3_desc': 'ସାଥୀ ଚାଷୀଙ୍କୁ ଶିକ୍ଷିତ କରିବା।',
        'work_step4_title': 'ବିକ୍ରୟ',
        'work_step4_desc': 'ବଜାର ପ୍ରବେଶ ଏବଂ ଲାଭ।',
        // Prototype
        'proto_title': 'କାର୍ଯ୍ୟକ୍ଷମ ମଡେଲ୍',
        'proto_bottom_desc': 'ଆମର ପାଇଲଟ୍ ସେଟଅପ୍ ଦର୍ଶାଏ ଯେ କିପରି ଏହି ଉପାଦାନଗୁଡିକ ଏକ ମାନକ ଫାର୍ମ ଲେଆଉଟ୍ ରେ ସହଜରେ ମିଶିଯାଏ |',
        // Gallery
        'gal_title': 'ଗ୍ୟାଲେରୀ',
        'gal_desc': 'ଆମର ଯାତ୍ରା, ତାଲିମ ଅଧିବେଶନ ଏବଂ ସଫଳତାର କାହାଣୀ |',
        'filter_all': 'ସମସ୍ତ',
        'filter_field': 'କ୍ଷେତ୍ର କାର୍ଯ୍ୟ',
        'filter_train': 'ତାଲିମ',
        'filter_prod': 'ଉତ୍ପାଦ',
        // About Innovator
        'innov_title': 'ଉଦ୍ଭାବକଙ୍କ ବିଷୟରେ',
        'innov_name': 'ପଙ୍କଜ କୁମାର ବାରିକ',
        'innov_desc': 'ସ୍ଥାୟୀ ଏବଂ ସୁଲଭ ଚାଷ ସମାଧାନ ଉପରେ ଧ୍ୟାନ ଦେଉଥିବା ଜଣେ ଛାତ୍ର ଉଦ୍ଭାବକ | ମୋର କାର୍ଯ୍ୟ ବ୍ୟବହାରିକ, ଯୁକ୍ତିଯୁକ୍ତ ଭାବରେ ଗ୍ରହଣୀୟ ଜୈବିକ ପଦ୍ଧତି ମାଧ୍ୟମରେ କୃଷିରେ ରାସାୟନିକ ନିର୍ଭରଶୀଳତା ହ୍ରାସ କରିବା ଉପରେ କେନ୍ଦ୍ରିତ | ସମ୍ପୂର୍ଣ୍ଣ ଜୈବିକ ଚାଷ କିଟ୍ ଚାଷୀ ଆତ୍ମନିର୍ଭରଶୀଳତା, ମାଟିର ସ୍ୱାସ୍ଥ୍ୟ ଏବଂ ବ୍ୟାପକ ଗ୍ରାମୀଣ ପ୍ରଭାବର ଦୃଷ୍ଟିକୋଣକୁ ପ୍ରତିଫଳିତ କରେ |',
        // FAQ
        'faq_title': 'ବାରମ୍ବାର ପଚରାଯାଉଥିବା ପ୍ରଶ୍ନ',
        'faq_subtitle': 'ଜୈବିକ ଚାଷ କିଟ୍ ବିଷୟରେ ସାଧାରଣ ପ୍ରଶ୍ନ |',
        'faq_q1': 'ଜୈବିକ ଚାଷକୁ ପରିବର୍ତ୍ତନ ହେବାକୁ କେତେ ସମୟ ଲାଗେ?',
        'faq_a1': 'ମାଟି ନିଜର ମାଇକ୍ରୋବିଆଲ୍ ସ୍ୱାସ୍ଥ୍ୟକୁ ସମ୍ପୂର୍ଣ୍ଣ ରୂପେ ଫେରି ପାଇବାକୁ ସାଧାରଣତଃ <strong>୨-୩ ବର୍ଷ</strong> ଲାଗେ | ଆମେ ଏକ ପର୍ଯ୍ୟାୟ କ୍ରମିକ ପନ୍ଥା ସୁପାରିଶ କରୁ: ପ୍ରଥମ ବର୍ଷରେ ରାସାୟନିକ ବ୍ୟବହାର ୫୦% କମାନ୍ତୁ ଏବଂ ଦ୍ୱିତୀୟ ବର୍ଷ ସୁଦ୍ଧା ୧୦୦% ଜୈବିକ ଲକ୍ଷ୍ୟ ରଖନ୍ତୁ |',
        'faq_q2': 'ଯଦି ମୁଁ ରାସାୟନିକ ପଦାର୍ଥ ବନ୍ଦ କରେ ତେବେ ମୋର ଅମଳ କମିଯିବ କି?',
        'faq_a2': 'ପ୍ରଥମ ବର୍ଷରେ ୫-୧୦% ର ସାମାନ୍ୟ ହ୍ରାସ ସମ୍ଭବ ଯେହେତୁ ମାଟିର ପରିବେଶ ସୁସ୍ଥ ହେଉଥାଏ | ତଥାପି, ତୃତୀୟ ବର୍ଷ ସୁଦ୍ଧା, ଅମଳ ସାଧାରଣତଃ ପାରମ୍ପାରିକ ସ୍ତରଠାରୁ ଅଧିକ ବା ସ୍ଥିର ହୋଇଯାଏ, ଯେତେବେଳେ କି ଆପଣଙ୍କ ଖର୍ଚ୍ଚ <strong>୬୦%</strong> ପର୍ଯ୍ୟନ୍ତ କମିଯାଏ, ଯାହା ଅଧିକ ନିଟ୍ ଲାଭ ଦିଏ |',
        'faq_q3': 'ନିମାସ୍ତ୍ର କଣ ରାସାୟନିକ କୀଟନାଶକ ପରି ଶୀଘ୍ର କାମ କରେ?',
        'faq_a3': 'ରାସାୟନିକ ପଦାର୍ଥ ତୁରନ୍ତ ମାରିଦିଏ କିନ୍ତୁ ପରିବେଶକୁ କ୍ଷତି ପହଞ୍ଚାଏ | ନିମାସ୍ତ୍ର ଭିନ୍ନ ଭାବରେ କାମ କରେ: ଏହା ପୋକଙ୍କୁ ଦୂରେଇ ଦିଏ, ଗଛକୁ ପିତା କରିଦିଏ ଏବଂ ସେମାନଙ୍କ ବଂଶବୃଦ୍ଧି ଚକ୍ରକୁ ବାଧା ଦିଏ | ସର୍ବୋତ୍ତମ ଫଳାଫଳ ପାଇଁ, ଆକ୍ରମଣର ଅପେକ୍ଷା ନକରି ଏହାକୁ <strong>ପ୍ରତି ୧୦-୧୫ ଦିନରେ ପ୍ରତିଷେଧକ ଭାବରେ</strong> ବ୍ୟବହାର କରନ୍ତୁ |',
        'faq_view_more': 'ସମସ୍ତ ପ୍ରଶ୍ନ ଦେଖନ୍ତୁ',
        'faq_view_less': 'କମ୍ ଦେଖାନ୍ତୁ',
        'faq_q4': 'ଜୀବାମୃତର ସେଲଫ୍ ଲାଇଫ୍ କଣ?',
        'faq_a4': 'ଯେହେତୁ ଜୀବାମୃତରେ କୋଟି କୋଟି ଜୀବନ୍ତ ସକ୍ରିୟ ଅଣୁଜୀବ ଥାଏ, ଏହା ପ୍ରସ୍ତୁତିର <strong>୭-୧୨ ଦିନ</strong> ମଧ୍ୟରେ ବ୍ୟବହାର କରାଗଲେ ସବୁଠାରୁ ପ୍ରଭାବଶାଳୀ ହୁଏ | ଏହି ସମୟ ପରେ, ଅଣୁଜୀବ ସଂଖ୍ୟା ସ୍ୱାଭାବିକ ଭାବରେ କମିବାକୁ ଲାଗେ |',
        'faq_q5': 'ମୁଁ କଣ ଏଗୁଡିକୁ ରାସାୟନିକ ସାର ସହିତ ମିଶାଇ ପାରିବି?',
        'faq_a5': '<strong>ନା।</strong> ରାସାୟନିକ ସାର ଏବଂ ଶକ୍ତିଶାଳୀ କୀଟନାଶକ ଜୈବିକ କିଟ୍ ରେ ଥିବା ଉପକାରୀ ଅଣୁଜୀବ (ବ୍ୟାକ୍ଟେରିଆ, କବକ) କୁ ମାରିଦେବ | ଯଦି ଆପଣ ପରିବର୍ତ୍ତନ କରୁଛନ୍ତି, ତେବେ ରାସାୟନିକ ଏବଂ ଜୈବିକ ପ୍ରୟୋଗ ମଧ୍ୟରେ ଅନ୍ତତଃ ପକ୍ଷେ <strong>୭ ଦିନର ବ୍ୟବଧାନ</strong> ରଖନ୍ତୁ |',
        'faq_q6': 'ଏକର ପିଛା କେତେ ଭର୍ମିକମ୍ପୋଷ୍ଟ ଆବଶ୍ୟକ?',
        'faq_a6': 'ଧାନ ଏବଂ ଗହମ ଭଳି ଫସଲ ପାଇଁ ମାନକ TNAU ସୁପାରିଶ ହେଉଛି <strong>୧୦୦୦-୨୦୦୦ କିଗ୍ରା (୧-୨ ଟନ୍) ଏକର ପିଛା</strong> | ବାଣିଜ୍ୟିକ ପରିବା ଫସଲ ପାଇଁ, ମାଟିର ସ୍ୱାସ୍ଥ୍ୟ ଉପରେ ନିର୍ଭର କରି ମାତ୍ରା ୩୦୦୦-୪୦୦୦ କିଗ୍ରା ପର୍ଯ୍ୟନ୍ତ ଯାଇପାରେ |',
        'faq_q7': 'ଆପଣ FPO ପାଇଁ ପାଇକାରୀ ରିହାତି ଦିଅନ୍ତି କି?',
        'faq_a7': 'ନିଶ୍ଚିତ ଭାବରେ | ଆମେ ପାଇକାରୀ ଦରରେ କିଟ୍ ଯୋଗାଇବା ପାଇଁ କୃଷକ ଉତ୍ପାଦକ ସଂଗଠନ (FPO) ସହିତ କାମ କରୁ | ଦୟାକରି ପାଇକାରୀ ମୂଲ୍ୟ ପାଇଁ ନିମ୍ନରେ ଥିବା ଯୋଗାଯୋଗ ଫର୍ମ ବ୍ୟବହାର କରନ୍ତୁ |',
        // Chatbot
        'chat_greeting': 'ମୁଁ ଆପଣଙ୍କୁ ସାହାଯ୍ୟ କରିପାରିବି କି?',
        'chat_title': 'ସହାୟକ',
        'chat_opt_cost': 'ମୂଲ୍ୟ ଗଣନା କରନ୍ତୁ',
        'chat_opt_prod': 'ଉତ୍ପାଦ ଗାଇଡ୍',
        'chat_opt_expert': 'ବିଶେଷଜ୍ଞଙ୍କ ସହ କଥା ହୁଅନ୍ତୁ',
        // Problem Section
        'prob_soil': 'ମୃତ୍ତିକା ଅବକ୍ଷୟ',
        'prob_soil_desc': 'ରାସାୟନିକ ପଦାର୍ଥର ଅତ୍ୟଧିକ ବ୍ୟବହାର ଦ୍ୱାରା ମାଟିରୁ ପୋଷକ ତତ୍ତ୍ୱ ନଷ୍ଟ ହୋଇଯାଉଛି।',
        'prob_health': 'ସ୍ୱାସ୍ଥ୍ୟ ବିପଦ',
        'prob_health_desc': 'ଖାଦ୍ୟରେ ବିଷାକ୍ତ ଅବଶେଷ ସ୍ୱାସ୍ଥ୍ୟ ପାଇଁ ଗୁରୁତର ସମସ୍ୟା ସୃଷ୍ଟି କରୁଛି।',
        'prob_cost': 'ଉଚ୍ଚ ଖର୍ଚ୍ଚ',
        'prob_cost_desc': 'ସାର ଏବଂ କୀଟନାଶକର ବର୍ଦ୍ଧିତ ମୂଲ୍ୟ ଚାଷୀଙ୍କୁ ଋଣରେ ବୁଡ଼ାଇ ଦେଉଛି।',
        // Calculator Section
        'calc_farm_details': 'ଫାର୍ମ ବିବରଣୀ',
        'calc_crop_type': 'ଫସଲ ପ୍ରକାର ଚୟନ କରନ୍ତୁ',
        'calc_land_size': 'ଜମି ଆକାର (ଏକର)',
        'calc_season_kit': 'ଆପଣଙ୍କର ଋତୁ କିଟ୍',
        'calc_soil_nutrition': 'ମାଟି ପୋଷଣ',
        'calc_immunity': 'ରୋଗ ପ୍ରତିରୋଧକ ଶକ୍ତି (ମାସିକ)',
        'calc_pest_repel': 'ପୋକ ନିବାରକ',
        'calc_defense': 'ଗୁରୁତର ସୁରକ୍ଷା',
        'calc_est_cost': 'ଆନୁମାନିକ ମୂଲ୍ୟ',
        'calc_quote_btn': 'ଏହି କିଟ୍ ପାଇଁ କୋଟ୍ ପ୍ରାପ୍ତ କରନ୍ତୁ',
        'btn_buy_now': 'ଏବେ କିଣନ୍ତୁ',
        'btn_add_cart': 'କାର୍ଟରେ ଯୋଡନ୍ତୁ',
        'btn_shop_now': 'ଦୋକାନ ଦେଖନ୍ତୁ',
        'starts_at': 'ମୂଲ୍ୟ ଆରମ୍ଭ',
        'nav_home': 'ଘରକୁ ଫେରନ୍ତୁ',
        // Cart Page
        'cart_title': 'ଆପଣଙ୍କ କାର୍ଟ',
        'cart_col_prod': 'ଉତ୍ପାଦ',
        'cart_col_price': 'ମୂଲ୍ୟ',
        'cart_col_qty': 'ପରିମାଣ',
        'cart_col_total': 'ମୋଟ',
        'cart_col_action': 'କାର୍ଯ୍ୟ',
        'cart_grand_total': 'ସର୍ବମୋଟ:',
        'cart_checkout': 'ଚେକ୍ ଆଉଟ୍ କରନ୍ତୁ',
        'cart_empty': 'ଆପଣଙ୍କ କାର୍ଟ ଖାଲି ଅଛି |',
        'cart_browse': 'ଉତ୍ପାଦ ଦେଖନ୍ତୁ',
        'cart_payment_note': 'ଫର୍ମ ମାଧ୍ୟମରେ ଅର୍ଡର ନିଶ୍ଚିତ ହେବା ପରେ ଦେୟ ସଂଗ୍ରହ କରାଯିବ |'
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

// --- Theme Logic ---
function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    localStorage.setItem('ofkff_theme', isDark ? 'dark' : 'light');
    updateThemeIcon(isDark);
}

function updateThemeIcon(isDark) {
    const btn = document.getElementById('themeToggle');
    if (btn) {
        btn.innerText = isDark ? '☀️' : '🌙'; // Sun for dark mode (to switch to light), Moon for light mode
        btn.style.transform = 'rotate(360deg)';
        setTimeout(() => btn.style.transform = 'rotate(0deg)', 300);
    }
}

// Init Theme
const savedTheme = localStorage.getItem('ofkff_theme');
const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    document.body.classList.add('dark-theme');
    updateThemeIcon(true);
} else {
    updateThemeIcon(false);
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


// --- UI Interactions (restored) ---
document.addEventListener('DOMContentLoaded', () => {
    // FAQ Accordion Logic
    const accordions = document.querySelectorAll('.accordion-header');

    accordions.forEach(acc => {
        acc.addEventListener('click', function () {
            const item = this.parentElement;
            item.classList.toggle('active');

            const panel = this.nextElementSibling;
            if (item.classList.contains('active')) {
                panel.style.maxHeight = (panel.scrollHeight + 32) + "px";
            } else {
                panel.style.maxHeight = null;
            }

            // Exclusive Accordion (Close others)
            accordions.forEach(otherAcc => {
                const otherItem = otherAcc.parentElement;
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                    otherItem.querySelector('.accordion-content').style.maxHeight = null;
                }
            });
        });
    });

    // Scroll Hint Logic
    const scrollContainers = document.querySelectorAll('.snap-container');
    if (scrollContainers.length > 0) {
        scrollContainers.forEach(container => {
            const hideHint = () => {
                const hint = container.parentElement.querySelector('.scroll-hint');
                if (hint) hint.classList.add('hidden');
                container.removeEventListener('scroll', hideHint);
            };
            container.addEventListener('scroll', hideHint, { passive: true });
        });
    }
});

function toggleFaq() {
    const hiddenContent = document.querySelector('.faq-hidden-content');
    const btn = document.getElementById('toggle-faq-btn');

    if (hiddenContent.style.display === 'none' || !hiddenContent.style.display) {
        hiddenContent.style.display = 'block';
        btn.innerText = 'Show Less';
        // Check current language for translation
        const currentLang = localStorage.getItem('ofkff_lang') || 'en';
        if (currentLang !== 'en' && translations[currentLang]['faq_view_less']) {
            btn.innerText = translations[currentLang]['faq_view_less'];
        }
    } else {
        hiddenContent.style.display = 'none';
        btn.innerText = 'View All Questions';
        // Check current language for translation
        const currentLang = localStorage.getItem('ofkff_lang') || 'en';
        if (currentLang !== 'en' && translations[currentLang]['faq_view_more']) {
            btn.innerText = translations[currentLang]['faq_view_more'];
        }
        document.querySelector('.accordion').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

// Gallery Filtering Logic (Consolidated)
const filterBtns = document.querySelectorAll('.filter-btn');
const galleryItems = document.querySelectorAll('.gallery-item');

if (filterBtns.length > 0) {
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filterValue = btn.getAttribute('data-filter');
            galleryItems.forEach(item => {
                if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
                    item.style.display = 'block';
                    item.style.animation = 'none';
                    item.offsetHeight;
                    item.style.animation = 'fadeIn 0.5s forwards';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
}

// --- Chatbot Logic ---
function initChatbot() {
    const chatbotHTML = `
        <div class="chatbot-container">
            <div class="chatbot-greeting" data-i18n="chat_greeting">May I help you?</div>
            <div class="chatbot-menu">
                <div class="chatbot-header">
                    <h4 data-i18n="chat_title">Assistant</h4>
                    <button onclick="toggleChat()" style="background:none;border:none;margin-left:auto;cursor:pointer;font-size:1.2rem;color:white;">&times;</button>
                </div>
                <button class="chat-option" onclick="scrollToEstimator()">
                    <span class="icon">💰</span> <span data-i18n="chat_opt_cost">Calculate Cost</span>
                </button>
                <button class="chat-option" onclick="location.href='index.html#solution'">
                    <span class="icon">🌱</span> <span data-i18n="chat_opt_prod">Product Info</span>
                </button>
                <button class="chat-option" onclick="window.open('https://wa.me/916372494799', '_blank')">
                    <span class="icon">👨‍🌾</span> <span data-i18n="chat_opt_expert">Chat with Expert</span>
                </button>
            </div>
            <div class="chatbot-toggle" onclick="toggleChat()">
                <img src="assets/cow_icon.png" alt="Chatbot">
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', chatbotHTML);

    // Greeting Scroll Logic
    window.addEventListener('scroll', () => {
        const greeting = document.querySelector('.chatbot-greeting');
        if (greeting && window.scrollY > 100) {
            greeting.style.display = 'none';
        }
    }, { passive: true });

    window.toggleChat = function () {
        const menu = document.querySelector('.chatbot-menu');
        const greeting = document.querySelector('.chatbot-greeting');
        menu.classList.toggle('active');

        // Always hide greeting permanently when interacted with
        if (greeting) {
            greeting.style.display = 'none';
        }
    };

    window.scrollToEstimator = function () {
        if (!document.getElementById('estimator')) {
            window.location.href = 'index.html#estimator';
        } else {
            document.getElementById('estimator').scrollIntoView({ behavior: 'smooth' });
        }
        toggleChat(); // Close menu
    };
}
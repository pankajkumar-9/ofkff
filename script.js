// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {

    // Smooth scrolling removed to use native browser behavior (snappier)

    // -----------------------------------------------------------
    // CURIOSITY ENGINE (Scroll Animations)
    // -----------------------------------------------------------
    const observerOptions = {
        threshold: 0.15, // Wait until 15% visible for better effect
        rootMargin: "0px 0px -50px 0px" // Trigger slightly before leaving viewport
    };

    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;

                // Add visible class
                target.classList.add('anim-visible');

                // Handle Staggered Children
                if (target.classList.contains('anim-stagger-container')) {
                    const children = target.querySelectorAll('.anim-on-scroll');
                    children.forEach((child, index) => {
                        // Dynamic Delay: 100ms per item
                        setTimeout(() => {
                            child.classList.add('anim-visible');
                        }, index * 100);
                    });
                }

                // Stop observing once animated (Performance)
                scrollObserver.unobserve(target);
            }
        });
    }, observerOptions);

    // Observe all singular animated elements
    document.querySelectorAll('.anim-on-scroll').forEach(el => {
        // If inside a stagger container, don't observe individually
        if (!el.closest('.anim-stagger-container')) {
            scrollObserver.observe(el);
        }
    });

    // Observe stagger containers
    document.querySelectorAll('.anim-stagger-container').forEach(el => {
        scrollObserver.observe(el);
    });

    // --- Consolidated Logic ---

    // 1. FAQ Accordion Logic
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

    // 2. Scroll Hint Logic
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

    // 3. Init Chatbot
    if (typeof initChatbot === 'function') {
        initChatbot();
    }
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

function addToCart(name, price, el) {
    const existingItem = cart.find(item => item.name === name);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ name, price, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();

    // Visual Feedback
    const btn = el || (typeof event !== 'undefined' ? event.target : null); // Support explicit element or event.target
    if (!btn) return;
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
    let link = "marketplace.html";

    if (doctorState.problem === 'pests') {
        if (cropType === 'veg') {
            title = t['doc_res_nima_title'];
            desc = t['doc_res_nima_desc'];
            link = "marketplace.html";
        } else {
            title = t['doc_res_brahma_title'];
            desc = t['doc_res_brahma_desc'];
            link = "marketplace.html";
        }
    } else if (doctorState.problem === 'growth') {
        title = t['doc_res_vermi_title'];
        desc = t['doc_res_vermi_desc'];
        link = "marketplace.html";
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
        'doc_res_vermi_desc': 'Your soil needs organic carbon and nutrition.',
        // Vermicompost Page
        'vermi_hero_label': 'The Foundation of Life',
        'vermi_hero_title': 'Vermicompost',
        'vermi_hero_subtitle': 'The science of turning organic waste into nature\'s most potent fertilizer.',
        'vermi_intro_title': '"Black Gold" Defined',
        'vermi_intro_p1': 'Vermicompost is not just compost. It is a <strong>biotechnological process</strong> where earthworms and bio-engineered microorganisms work in harmony to transform organic waste into a nutrient-rich, dark, and odorless soil conditioner.',
        'vermi_intro_p2': 'Scientifically, it is the excreta of earthworms, rich in humus and teeming with beneficial bacteria, fungi, and actinomycetes. Unlike regular thermal compost which relies on heat, vermicompost relies on the <strong>biological activity</strong> of the worm\'s gut, which acts as a miniature bioreactor.',
        'vermi_arch_title': 'Meet the Architect: <em>Eisenia fetida</em>',
        'vermi_arch_c1_title': 'Epigeic Nature',
        'vermi_arch_c1_desc': 'These "Red Wigglers" don\'t burrow deep. They thrive on the surface layer, consuming organic litter. This makes them perfect for composting bins.',
        'vermi_arch_c2_title': 'Voracious Appetite',
        'vermi_arch_c2_desc': 'A single worm can consume its own body weight in waste <strong>every single day</strong>. They are relentless recycling machines.',
        'vermi_arch_c3_title': 'The Gut Bioreactor',
        'vermi_arch_c3_desc': 'Inside the worm\'s gizzard, waste is ground up and coated with enzymes (protease, lipase, amylase, cellulase) and mucus, boosting microbial activity by 1000x.',
        'vermi_proc_title': 'How It\'s Made',
        'vermi_proc_subtitle': 'From waste to wealth: The scientific layering method.',
        'vermi_proc_s1_title': 'Bedding Preparation',
        'vermi_proc_s1_desc': 'A carbon-rich layer (shredded cardboard, dry leaves, coconut coir) mimics the forest floor. It provides aeration and retains moisture (keep like a wrung-out sponge).',
        'vermi_proc_s2_title': 'Inoculation',
        'vermi_proc_s2_desc': 'Earthworms are introduced. We start with ~1000 worms per square meter. They burrow away from light into the moist bedding.',
        'vermi_proc_s3_title': 'Feeding',
        'vermi_proc_s3_desc': 'Nitrogen-rich waste (vegetable peels, cow dung, crop residue) is added in chopped layers. <strong>Avoid:</strong> Meat, dairy, and citrus to prevent acidity.',
        'vermi_proc_s4_title': 'Harvesting',
        'vermi_proc_s4_desc': 'After 60-90 days, the top material is consumed. The black, granular castings settle at the bottom. We separate worms using light migration or sieving.',
        'vermi_nut_title': 'Nutrient Profile Analysis',
        'vermi_nut_h3': 'Superior Plant Nutrition',
        'vermi_nut_t_n_label': 'Nitrogen (N)',
        'vermi_nut_t_n_desc': 'Essential for leafy growth and protein synthesis.',
        'vermi_nut_t_p_label': 'Phosphorus (P)',
        'vermi_nut_t_p_desc': 'Crucial for root development and flowering.',
        'vermi_nut_t_k_label': 'Potassium (K)',
        'vermi_nut_t_k_desc': 'Builds immunity and disease resistance.',
        'vermi_nut_t_c_label': 'Organic Carbon',
        'vermi_nut_t_c_desc': 'Energy source for soil microbes.',
        'vermi_nut_t_cn_label': 'C:N Ratio',
        'vermi_nut_t_cn_desc': 'Ideal balance for plant uptake.',
        'vermi_nut_note': '*Also contains Calcium, Magnesium, Zinc, Copper, Iron, and growth hormones like Auxins and Cytokinins.',
        'vermi_ben_title': 'Why Crops Thrive',
        'vermi_ben_c1_title': '🌱 Physical Soil Improvement',
        'vermi_ben_c1_desc': 'Vermicompost improves soil aeration and texture. It increases water-holding capacity by up to <strong>30-40%</strong>, reducing irrigation needs significantly during droughts.',
        'vermi_ben_c2_title': '🦠 Biological Activation',
        'vermi_ben_c2_desc': 'It adds 10-20 times more microbial activity than regular soil. These microbes (nitrogen fixers, phosphate solubilizers) continue to work for months, making nutrients available "on demand".',
        'vermi_ben_c3_title': '🛡️ Plant Defense',
        'vermi_ben_c3_desc': 'Rich in chitinase enzyme, which breaks down the cell walls of pests and fungi. It acts as a natural bio-control agent against root rot and nematodes.',
        'vermi_comp_vs': 'vs. Chemical Fertilizers',
        'vermi_comp_bad': 'Chemicals',
        'vermi_comp_bad_desc': 'Explosive, short-term growth. Kills soil life. Acidifies soil over time.',
        'vermi_comp_good': 'Vermicompost',
        'vermi_comp_good_desc': 'Sustained, long-term health. Regenerates soil life. Balances pH (Neutral 6.8 - 7.5).',
        'vermi_buy_badge': 'OFKFF Premium Grade',
        'vermi_buy_title': 'Start Your Soil Transformation',
        'vermi_buy_desc': 'Our vermicompost is produced under strict quality control. We use a blend of cow dung and green biomass to ensure a balanced C:N ratio. Sieved to 4mm for easy application.',
        'vermi_buy_list1': '📦 1kg / 5kg / 50kg Bags',
        'vermi_buy_list2': '💧 Moisture: 30% (Live Microbes)',
        'vermi_buy_list3': '🌿 Weed Seed Free',
        'vermi_buy_list4': '🔬 Lab Tested Quality',
        'vermi_buy_price': 'From ₹20',
        'vermi_buy_unit': '/ kg',
        'vermi_buy_note': 'Free delivery for bulk orders > 100kg',
        // Jeevamrut Page
        'jeeva_hero_label': 'The Elixir of Life',
        'jeeva_hero_title': 'Jeevamrut',
        'jeeva_hero_subtitle': 'A potent microbial culture that acts as an immunity booster for your soil and crops.',
        'jeeva_intro_title': 'Microbial Explosion',
        'jeeva_intro_p1': 'Jeevamrut (literally "Life Elixir") is not just a fertilizer, but a catalyst. It creates a massive inoculum of beneficial bacteria and fungi that solubilize nutrients locked in the soil, making them available to plant roots.',
        'jeeva_intro_p2': 'One gram of indigenous cow dung contains up to <strong>300 to 500 million</strong> beneficial microbes. Through our fermentation process, this population explodes into the billions, creating a living, breathing soil amendment.',
        'jeeva_ing_title': 'The Ancient Recipe',
        'jeeva_ing_c1_title': 'Cow Dung & Urine',
        'jeeva_ing_c1_desc': 'The source of microbes. We use only fresh dung from indigenous (Desi) cows for maximum microbial count.',
        'jeeva_ing_c2_title': 'Black Jaggery',
        'jeeva_ing_c2_desc': 'Provides the initial energy (carbohydrates) for the microbes to multiply rapidly during fermentation.',
        'jeeva_ing_c3_title': 'Pulse Flour',
        'jeeva_ing_c3_desc': 'Gram or pigeon pea flour acts as a protein source, building the body mass of the multiplying bacteria.',
        'jeeva_process_note': 'Fermented for 48-72 hours in the shade, stirred clockwise twice a day to oxygenate the culture.',
        'jeeva_ben_title': 'Triple Action Impact',
        'jeeva_ben_c1_title': '🛡️ Crop Immunity',
        'jeeva_ben_c1_desc': 'Acts like a vaccination for plants. It strengthens the internal defense system (SAR) against diseases and climatic stress.',
        'jeeva_ben_c2_title': '🔓 Nutrient Unlocking',
        'jeeva_ben_c2_desc': 'Solubilizes locked Nitrogen, Phosphorus, and Potassium already present in the soil but unavailable to roots.',
        'jeeva_ben_c3_title': '🪱 Earthworm Magnet',
        'jeeva_ben_c3_desc': 'The distinct smell and biological signals attract deep-burrowing earthworms to the surface, naturally tilling your land.',
        'jeeva_use_title': 'Application Guide',
        'jeeva_use_c1_title': 'Soil Drenching',
        'jeeva_use_c1_desc': '<strong>200 Liters / Acre</strong>. Apply once a month with irrigation water. This is the most effective method for soil health.',
        'jeeva_use_c2_title': 'Foliar Spray',
        'jeeva_use_c2_desc': '<strong>10% Solution</strong>. Mix 1 Liter strained Jeevamrut in 10 Liters water. Spray every 21 days for lush green growth.',
        'jeeva_use_c3_title': 'Precaution',
        'jeeva_use_c3_desc': 'Use within <strong>12 days</strong> of preparation. Do NOT mix with chemical fungicides, as they will kill the live microbes instantly.',
        'jeeva_buy_badge': 'Live Culture',
        'jeeva_buy_title': 'Boost Your Soil Today',
        'jeeva_buy_desc': 'Order fresh Jeevamrut culture. Prepared on-demand to ensure maximum microbial count upon delivery.',
        'jeeva_buy_list1': '📦 5L / 10L / 20L Jerry Cans',
        'jeeva_buy_list2': '⏳ Shelf Life: 12 Days',
        'jeeva_buy_list3': '🐮 Desi Cow Source',
        'jeeva_buy_list4': '🧊 Cool Transport',
        'jeeva_buy_price': 'From ₹20',
        'jeeva_buy_unit': '/ Liter',
        'jeeva_buy_btn': 'Order Now →',
        'jeeva_ing_c4_title': 'Handful of Soil',
        'jeeva_ing_c4_desc': 'The Diversity. Introduces local soil-specific microbes to the mixture.',
        'jeeva_proc_title': 'The Brewing Process',
        'jeeva_proc_subtitle': 'Transformation happens in the shade.',
        'jeeva_proc_s1_title': 'The Mixture',
        'jeeva_proc_s1_desc': 'Mix all ingredients in a 200L plastic drum (avoid metal). Fill with water. Keep in shade.',
        'jeeva_proc_s2_title': 'The Clockwise Stir',
        'jeeva_proc_s2_desc': 'Stir the solution clockwise for 10 minutes, twice a day. This creates a vortex, sucking oxygen into the depth of the drum to fuel aerobic bacteria.',
        'jeeva_proc_s3_title': 'The Bloom (48Hrs)',
        'jeeva_proc_s3_desc': 'By day 3, the fermentation peaks. The microbial count increases exponentially. A sweet, fermented smell indicates it is ready.',
        'jeeva_proc_s4_title': 'Application',
        'jeeva_proc_s4_desc': 'Use within 7 days. Apply with irrigation water or spray (filtered) on leaves.',
        'jeeva_nut_title': 'Microbial Warfare',
        'jeeva_nut_h3': 'The Defensive Shield',
        'jeeva_nut_p1': 'Modern agriculture suffers from a lack of "Good Guys" in the soil. Pathogens thrive in sterile soil. Jeevamrut floods the field with beneficials.',
        'jeeva_nut_t_l_label': 'Nitrogen Fixers',
        'jeeva_nut_t_l_desc': 'Azotobacter & Rhizobium pull nitrogen from the air.',
        'jeeva_nut_t_p_label': 'Phosphate Solubilizers',
        'jeeva_nut_t_p_desc': 'Dissolve the phosphorus locked in rocks/soil.',
        'jeeva_nut_t_psi_label': 'Pseudomonas',
        'jeeva_nut_t_psi_desc': 'Protects roots from fungal diseases.',
        'jeeva_nut_t_tri_label': 'Trichoderma',
        'jeeva_nut_t_tri_desc': 'A legendary anti-fungal agent.',
        'jeeva_comp_subtitle': 'Chemical fertilizers force-feed the plant but kill the soil. Jeevamrut feeds the soil, which feeds the plant forever.',
        'jeeva_comp_bad': 'Urea / DAP',
        'jeeva_comp_bad_desc': 'Salts accumulate. Earthworms die. Soil becomes hard like concrete.',
        'jeeva_comp_good': 'Jeevamrut',
        'jeeva_comp_good_desc': 'Soil becomes soft and porous. Earthworms return. Water retention doubles.',
        // Shared Related Products
        'related_title': 'Complete Your Kit',
        'related_vermi_title': 'Vermicompost',
        'related_vermi_desc': 'Solid nutrition and organic carbon foundation.',
        'related_jeeva_title': 'Jeevamrut',
        'related_jeeva_desc': 'Liquid microbial culture for immunity.',
        'related_nimastra_title': 'Nimastra',
        'related_nimastra_desc': 'First line of defense against soft-bodied pests.',
        'related_brahma_title': 'Brahmastra',
        'related_brahma_desc': 'Ultimate protection against larger insects and borers.',
        // Marketplace Banner
        'market_banner_title': 'Visit Our Premium Marketplace',
        'market_banner_desc': 'Browse our complete collection of organic inputs, compare products, and order directly online.',
        'market_banner_btn': 'Explore Store',
        // Nimastra Page
        'nima_hero_label': 'Nature\'s Shield',
        'nima_hero_title': 'Nimastra',
        'nima_hero_subtitle': 'The ultimate broad-spectrum botanical repellent against sucking pests.',
        'nima_intro_title': 'Bitter Protection',
        'nima_intro_p1': 'Nimastra is derived principally from the miracle tree: <strong>Neem</strong> (*Azadirachta indica*). Unlike chemical poisons that kill instantly (and harm benign insects), Nimastra works intelligently.',
        'nima_intro_p2': 'It contains <strong>Azadirachtin</strong>, a complex alkaloid that acts as an anti-feedant. When sprayed, it makes the plant unpalatable. Pests simply stop eating and starve, disrupting their lifecycle without poisoning the ecosystem.',
        'nima_ing_title': '100% Organic Formulation',
        'nima_ing_c1_title': 'Neem Leaves & Seed',
        'nima_ing_c1_desc': 'Crushed leaves and seed kernels provide the highest concentration of Azadirachtin, the active pest-repelling compound.',
        'nima_ing_c2_title': 'Cow Urine (Gomutra)',
        'nima_ing_c2_desc': 'Acts as a potent bio-fertilizer and its strong ammonia smell naturally repels many airborne pests.',
        'nima_ing_c3_title': 'Cow Dung',
        'nima_ing_c3_desc': 'Provides essential microbial cultures that help in extracting the medicinal properties of Neem into the solution.',
        'nima_ben_title': 'Defending Against',
        'nima_ben_c1_title': '🦟 Sucking Pests',
        'nima_ben_c1_desc': 'Highly effective against Aphids, Jassids, Whiteflies, and Thrips that suck the sap out of tender leaves.',
        'nima_ben_c2_title': '🐛 Early Larvae',
        'nima_ben_c2_desc': 'Controls small caterpillars and leaf miners in their early stages by preventing them from molting.',
        'nima_ben_c3_title': '🐝 Eco-Safe',
        'nima_ben_c3_desc': 'Harmless to pollinators like bees and butterflies. It specifically targets pests that chew or suck on the plant.',
        'nima_use_title': 'Application Guide',
        'nima_use_c1_title': 'Preventive Spray',
        'nima_use_c1_desc': 'Spray every <strong>15 days</strong> as a routine to keep pests away from your field.',
        'nima_use_c2_title': 'Curative Spray',
        'nima_use_c2_desc': 'If pests are seen, spray every <strong>7 days</strong> until population is controlled. Mix 1 Liter Nimastra in 15 Liters water.',
        'nima_use_c3_title': 'Important Note',
        'nima_use_c3_desc': 'Always filter the solution with a cloth before putting it in the spray tank to avoid nozzle clogging.',
        'nima_buy_badge': 'Organic Pesticide',
        'nima_buy_title': 'Secure Your Harvest',
        'nima_buy_desc': 'Don\'t let pests ruin your hard work. Use Nimastra for a chemical-free, safe, and effective defense.',
        'nima_buy_list1': '📦 1L / 5L Bottles',
        'nima_buy_list2': '🛡️ 6 Month Shelf Life',
        'nima_buy_list3': '🌿 100% Botanical',
        'nima_buy_list4': '🚫 No Chemical Residue',
        'nima_buy_price': 'From ₹100',
        'nima_buy_unit': '/ Liter',
        'nima_buy_btn': 'Order Now →',
        'nima_proc_title': 'The Extraction Process',
        'nima_proc_subtitle': 'Cold extraction to preserve active compounds.',
        'nima_proc_s1_title': 'The Crush',
        'nima_proc_s1_desc': 'Crush the Neem leaves into a fine paste. The finer the paste, the stronger the medicine (chutney consistency).',
        'nima_proc_s2_title': 'The Mix',
        'nima_proc_s2_desc': 'Mix the paste with Cow Urine and Dung in a plastic drum. Add 100L water. Stir clockwise.',
        'nima_proc_s3_title': 'Fermentation (48Hrs)',
        'nima_proc_s3_desc': 'Keep in shade. Stir twice daily. The microbes from the dung will break down the leaves and extract the juices.',
        'nima_proc_s4_title': 'The Filter',
        'nima_proc_s4_desc': 'Double filter using a cloth. This is Critical! Any solid particle can clog your sprayer nozzle.',
        'nima_sci_title': 'How It Works',
        'nima_sci_h3': 'Systemic Defense',
        'nima_sci_p1': 'Nimastra doesn\'t just sit on the leaf. It is partially absorbed, making the plant\'s sap slightly bitter. This provides long-lasting protection.',
        'nima_sci_c1_title': '🛑 Anti-Feedant',
        'nima_sci_c1_desc': 'Pests lose their appetite and starve to death.',
        'nima_sci_c2_title': '🦋 Oviposition Deterrent',
        'nima_sci_c2_desc': 'Moths and flies refuse to lay eggs on Nimastra treated leaves.',
        'nima_sci_c3_title': '🌱 Growth Regulator',
        'nima_sci_c3_desc': 'Prevents larvae from molting into adults.',
        'nima_target_title': 'Primary Targets',
        'nima_target_c1': '🦟 Aphids & Jassids',
        'nima_target_c1_desc': 'Sucking pests that curl leaves. Nimastra clears them in 2 sprays.',
        'nima_target_c2': '⬜ Whiteflies',
        'nima_target_c2_desc': 'Vectors of viral diseases. Nimastra breaks their breeding cycle.',
        'nima_target_c3': '🐛 Small Caterpillars',
        'nima_target_c3_desc': 'Effective against early instar larvae before they grow big.',
        // Brahmastra Page
        'brahma_hero_label': 'The Ultimate Weapon',
        'brahma_hero_title': 'Brahmastra',
        'brahma_hero_subtitle': 'Powerful organic protection against heavy infestations, borers, and caterpillars.',
        'brahma_intro_title': 'Precision Defense',
        'brahma_intro_p1': 'As the name suggests (Brahma + Astra), this is the ultimate solution for stubborn pests that resist milder repellents. It is a potent brew of five specific bitter leaves boiled in cow urine.',
        'brahma_intro_p2': 'Brahmastra works as both a stomach poison and a nerve poison for insects, yet it is completely biodegradable and safe for the soil ecosystem.',
        'brahma_ing_title': 'Five Leaf Potency',
        'brahma_ing_c1_title': 'Neem & Castor',
        'brahma_ing_c1_desc': 'The foundation of the mix. Castor leaves contain Ricin, which is toxic to many chewing pests.',
        'brahma_ing_c2_title': 'Custard Apple & Papaya',
        'brahma_ing_c2_desc': 'Leaves contain varying alkaloids that disrupt the digestive system of caterpillars.',
        'brahma_ing_c3_title': 'Datura / Lantana',
        'brahma_ing_c3_desc': 'Highly potent wild plants that act as nerve agents for insects, causing paralysis.',
        'brahma_ing_c4_title': 'Cow Urine',
        'brahma_ing_c4_desc': 'The Extraction Medium. Boiling in urine intensifies the extraction of alkaloids unlike water.',
        'brahma_ben_title': 'Heavy Duty Control',
        'brahma_ben_c1_title': '🐛 Large Caterpillars',
        'brahma_ben_c1_desc': 'Effective against Helicoverpa and Spodoptera larvae that cause massive defoliation.',
        'brahma_ben_c2_title': '🪵 Stem & Fruit Borers',
        'brahma_ben_c2_desc': 'Penetrates and controls internal pests that bore into stems and pods, often hard to reach with contact sprays.',
        'brahma_ben_c3_title': '🪲 Hard Shell Beetles',
        'brahma_ben_c3_desc': 'The strong formulation affects even hard-shelled beetles that may be resistant to Nimastra.',
        'brahma_use_title': 'Application Guide',
        'brahma_use_c1_title': 'Curative Only',
        'brahma_use_c1_desc': 'Use <strong>ONLY</strong> when infestation is severe. Do not use as a routine preventive spray like Nimastra.',
        'brahma_use_c2_title': 'Dosage',
        'brahma_use_c2_desc': '<strong>2.5% to 3% Solution</strong>. Mix 300-450ml of Brahmastra in a 15 Liter spray tank.',
        'brahma_use_c3_title': 'Precautions',
        'brahma_use_c3_desc': 'Wear gloves. Stop spraying <strong>7 days</strong> before harvest. Do not mix with Jeevamrut.',
        'brahma_buy_badge': 'High Potency',
        'brahma_buy_title': 'Ultimate Crop Protection',
        'brahma_buy_desc': 'When other remedies fail, trust Brahmastra. The strongest organic formulation in our arsenal.',
        'brahma_buy_list1': '📦 1L / 5L Packs',
        'brahma_buy_list2': '⏳ 6 Month Stability',
        'brahma_buy_list3': '🍃 5-Leaf Formula',
        'brahma_buy_list4': '⚠️ Handle with Care',
        'brahma_buy_price': 'From ₹150',
        'brahma_buy_unit': '/ Liter',
        'brahma_buy_btn': 'Order Now →',
        'brahma_proc_title': 'The Fire Ritual',
        'brahma_proc_subtitle': 'Thermal extraction releases the highest potency.',
        'brahma_proc_s1_title': 'The Crush',
        'brahma_proc_s1_desc': 'Chop all 5 types of leaves into fine pieces or paste to maximize surface area.',
        'brahma_proc_s2_title': 'The Mix',
        'brahma_proc_s2_desc': 'Add the chopped leaves into 10L Cow Urine in a large metal vessel (copper/brass preferred, or steel).',
        'brahma_proc_s3_title': 'The Boil',
        'brahma_proc_s3_desc': 'Boil the mixture on low flame until powerful fumes arise (usually 1 hour). Let it cool for 24 hours to marinate.',
        'brahma_proc_s4_title': 'The Storage',
        'brahma_proc_s4_desc': 'Filter the dark, concentrated liquid. It can be stored in bottles for 6 months.',
        'brahma_sci_title': 'Target Mechanism',
        'brahma_sci_h3': 'Neurological Disruption',
        'brahma_sci_p1': 'This is not a repellent; it\'s a contact and stomach poison for insects. The alkaloids bind to the insect\'s gut receptors, causing them to stop feeding instantly.',
        'brahma_sci_target1_title': 'Target: Stem Borer',
        'brahma_sci_target1_desc': 'Penetrates the stem tissue to reach hiding larvae.',
        'brahma_sci_target2_title': 'Target: Fruit Borer',
        'brahma_sci_target2_desc': 'Excellent for Tomato and Brinjal fruit borers.',
        'brahma_warning_title': 'Use with Caution',
        'brahma_warning_desc': 'Brahmastra is powerful. Overuse can affect soil microbes. Treat it like an antibiotic—use only when necessary.',
        'brahma_warn_c1_title': '⚠️ Curative Only',
        'brahma_warn_c1_desc': 'Do not spray as a preventive measure. Use only when you see visible pest damage.',
        'brahma_warn_c2_title': '🧤 Protective Gear',
        'brahma_warn_c2_desc': 'It is a potent irritant. Wear gloves and mask while spraying.',
        'brahma_warn_c3_title': '🌜 Evening Spray',
        'brahma_warn_c3_desc': 'Spray after sunset to avoid harming foraging honeybees.',
    },
    'hi': {
        // Nimastra Page
        'nima_hero_label': 'प्रकृति की ढाल',
        'nima_hero_title': 'नीमास्त्र',
        'nima_hero_subtitle': 'रस चूसने वाले कीटों के खिलाफ सबसे बेहतरीन वनस्पति विकर्षक।',
        'nima_intro_title': 'कड़वी सुरक्षा',
        'nima_intro_p1': 'नीमास्त्र मुख्य रूप से चमत्कारी पेड़: <strong>नीम</strong> (*Azadirachta indica*) से प्राप्त होता है। रासायनिक जहरों के विपरीत जो तुरंत मारते हैं (और मित्र कीटों को नुकसान पहुंचाते हैं), नीमास्त्र बुद्धिमानी से काम करता है।',
        'nima_intro_p2': 'इसमें <strong>Azadirachtin</strong> होता है, एक जटिल क्षारीय जो एक एंटी-फीडेंट (खिलाने से रोकने वाला) के रूप में कार्य करता है। जब छिड़काव किया जाता है, तो यह पौधे को बेस्वाद बना देता है। कीट बस खाना बंद कर देते हैं और भूखे मर जाते हैं, जिससे पारिस्थितिकी तंत्र को जहर दिए बिना उनका जीवन चक्र बाधित हो जाता है।',
        'nima_ing_title': '100% जैविक सूत्रीकरण',
        'nima_ing_c1_title': 'नीम के पत्ते और बीज',
        'nima_ing_c1_desc': 'कुचले हुए पत्ते और बीज की गुठली Azadirachtin की उच्चतम एकाग्रता प्रदान करती है, जो सक्रिय कीट-विकर्षक यौगिक है।',
        'nima_ing_c2_title': 'गाय का मूत्र (गोमूत्र)',
        'nima_ing_c2_desc': 'एक शक्तिशाली जैव-उर्वरक के रूप में कार्य करता है और इसकी तेज अमोनिया गंध स्वाभाविक रूप से कई हवाई कीटों को दूर भगाती है।',
        'nima_ing_c3_title': 'गोबर',
        'nima_ing_c3_desc': 'आवश्यक माइक्रोबियल कल्चर प्रदान करता है जो घोल में नीम के औषधीय गुणों को निकालने में मदद करते हैं।',
        'nima_ben_title': 'इनके खिलाफ रक्षा',
        'nima_ben_c1_title': '🦟 रस चूसने वाले कीट',
        'nima_ben_c1_desc': 'एफिड्स (माहू), जैसिड्स, व्हाइटफ्लाइज (सफेद मक्खी) और थ्रिप्स के खिलाफ अत्यधिक प्रभावी जो कोमल पत्तियों से रस चूसते हैं।',
        'nima_ben_c2_title': '🐛 शुरुआती लार्वा',
        'nima_ben_c2_desc': 'छोटी इल्लियों और लीफ माइनर्स को उनके शुरुआती चरणों में वयस्क बनने से रोकता है।',
        'nima_ben_c3_title': '🐝 पर्यावरण-सुरक्षित',
        'nima_ben_c3_desc': 'मधुमक्खियों और तितलियों जैसे परागणकों के लिए हानिरहित। यह विशेष रूप से उन कीटों को लक्षित करता है जो पौधे को चबाते या चूसते हैं।',
        'nima_use_title': 'आवेदन गाइड',
        'nima_use_c1_title': 'निवारक स्प्रे',
        'nima_use_c1_desc': 'कीटों को अपने खेत से दूर रखने के लिए नियमित रूप से हर <strong>15 दिनों</strong> में स्प्रे करें।',
        'nima_use_c2_title': 'उपचारात्मक स्प्रे',
        'nima_use_c2_desc': 'यदि कीट दिखाई देते हैं, तो जनसंख्या नियंत्रित होने तक हर <strong>7 दिनों</strong> में स्प्रे करें। 1 लीटर नीमास्त्र 15 लीटर पानी में मिलाएं।',
        'nima_use_c3_title': 'महत्वपूर्ण लेख',
        'nima_use_c3_desc': 'नोजल क्लॉगिंग (जाम होना) से बचने के लिए स्प्रे टैंक में डालने से पहले हमेशा घोल को कपड़े से छान लें।',
        'nima_buy_badge': 'जैविक कीटनाशक',
        'nima_buy_title': 'अपनी फसल सुरक्षित करें',
        'nima_buy_desc': 'कीटों को अपनी मेहनत बर्बाद न करने दें। रसायन मुक्त, सुरक्षित और प्रभावी रक्षा के लिए नीमास्त्र का उपयोग करें।',
        'nima_buy_list1': '📦 1L / 5L बोतलें',
        'nima_buy_list2': '🛡️ 6 महीने की शेल्फ लाइफ',
        'nima_buy_list3': '🌿 100% वनस्पति',
        'nima_buy_list4': '🚫 कोई रासायनिक अवशेष नहीं',
        'nima_buy_price': '₹100 से शुरू',
        'nima_buy_unit': '/ लीटर',
        'nima_buy_btn': 'अभी ऑर्डर करें →',
        'nima_proc_title': 'निष्कर्षण प्रक्रिया',
        'nima_proc_subtitle': 'सक्रिय यौगिकों को संरक्षित करने के लिए ठंडा निष्कर्षण।',
        'nima_proc_s1_title': 'क्रश (कुचलना)',
        'nima_proc_s1_desc': 'नीम की पत्तियों को बारीक पेस्ट में कुचल लें। पेस्ट जितना बारीक होगा, दवा उतनी ही मजबूत होगी (चटनी की स्थिरता)।',
        'nima_proc_s2_title': 'मिक्स (मिलाना)',
        'nima_proc_s2_desc': 'प्लास्टिक के ड्रम में गौमूत्र और गोबर के साथ पेस्ट मिलाएं। 100 लीटर पानी डालें। घड़ी की दिशा में हिलाएं।',
        'nima_proc_s3_title': 'किण्वन (48 घंटे)',
        'nima_proc_s3_desc': 'छांव में रखें। दिन में दो बार हिलाएं। गोबर के रोगाणु पत्तियों को तोड़ देंगे और रस निकाल लेंगे।',
        'nima_proc_s4_title': 'फिल्टर (छानना)',
        'nima_proc_s4_desc': 'कपड़े का उपयोग करके दो बार फिल्टर करें। यह महत्वपूर्ण है! कोई भी ठोस कण आपके स्प्रेयर नोजल को रोक सकता है।',
        'nima_sci_title': 'यह कैसे काम करता है',
        'nima_sci_h3': 'प्रणालीगत रक्षा',
        'nima_sci_p1': 'नीमास्त्र सिर्फ पत्ते पर नहीं बैठता है। यह आंशिक रूप से अवशोषित हो जाता है, जिससे पौधे का रस थोड़ा कड़वा हो जाता है। यह लंबे समय तक चलने वाली सुरक्षा प्रदान करता है।',
        'nima_sci_c1_title': '🛑 एंटी-फीडेंट',
        'nima_sci_c1_desc': 'कीट अपनी भूख खो देते हैं और भूखे मर जाते हैं।',
        'nima_sci_c2_title': '🦋 अंडा देने से रोकता है',
        'nima_sci_c2_desc': 'पतंगे और मक्खियां नीमास्त्र उपचारित पत्तियों पर अंडे देने से मना कर देती हैं।',
        'nima_sci_c3_title': '🌱 विकास नियामक',
        'nima_sci_c3_desc': 'लार्वा को वयस्कों में बदलने से रोकता है।',
        'nima_target_title': 'प्राथमिक लक्ष्य',
        'nima_target_c1': '🦟 माहू और जैसिड्स',
        'nima_target_c1_desc': 'रस चूसने वाले कीट जो पत्तियों को मोड़ते हैं। नीमास्त्र उन्हें 2 स्प्रे में साफ करता है।',
        'nima_target_c2': '⬜ सफेद मक्खी',
        'nima_target_c2_desc': 'वायरल रोगों के वाहक। नीमास्त्र उनके प्रजनन चक्र को तोड़ता है।',
        'nima_target_c3': '🐛 छोटी इल्लियाँ',
        'nima_target_c3_desc': 'बड़े होने से पहले शुरुआती इंस्टार लार्वा के खिलाफ प्रभावी।',
        // Brahmastra Page
        'brahma_hero_label': 'परम शस्त्र',
        'brahma_hero_title': 'ब्रह्मास्त्र',
        'brahma_hero_subtitle': 'भारी संक्रमण, बोरर्स (छेदक) और इल्लियों के खिलाफ शक्तिशाली जैविक सुरक्षा।',
        'brahma_intro_title': 'सटीक रक्षा',
        'brahma_intro_p1': 'जैसा कि नाम से पता चलता है (ब्रह्मा + अस्त्र), यह जिद्दी कीटों के लिए अंतिम समाधान है जो हल्के विकर्षक का विरोध करते हैं। यह गाय के मूत्र में उबले हुए पांच विशिष्ट कड़वे पत्तों का एक शक्तिशाली काढ़ा है।',
        'brahma_intro_p2': 'ब्रह्मास्त्र कीड़ों के लिए पेट के जहर और तंत्रिका जहर दोनों के रूप में काम करता है, फिर भी यह पूरी तरह से बायोडिग्रेडेबल और मिट्टी के पारिस्थितिकी तंत्र के लिए सुरक्षित है।',
        'brahma_ing_title': 'पाँच पत्तों की शक्ति',
        'brahma_ing_c1_title': 'नीम और अरंडी',
        'brahma_ing_c1_desc': 'मिश्रण की नींव। अरंडी के पत्तों में रिकिन होता है, जो कई चबाने वाले कीटों के लिए विषाक्त है।',
        'brahma_ing_c2_title': 'सीताफल और पपीता',
        'brahma_ing_c2_desc': 'पत्तियों में अलग-अलग एल्कलॉइड होते हैं जो इल्लियों के पाचन तंत्र को बाधित करते हैं।',
        'brahma_ing_c3_title': 'धतूरा / लैंटाना',
        'brahma_ing_c3_desc': 'अत्यधिक शक्तिशाली जंगली पौधे जो कीड़ों के लिए तंत्रिका एजेंटों के रूप में कार्य करते हैं, जिससे पक्षाघात होता है।',
        'brahma_ing_c4_title': 'गोमूत्र',
        'brahma_ing_c4_desc': 'निष्कर्षण माध्यम। मूत्र में उबालने से पानी के विपरीत एल्कलॉइड का निष्कर्षण तेज हो जाता है।',
        'brahma_ben_title': 'भारी नियंत्रण',
        'brahma_ben_c1_title': '🐛 बड़ी इल्लियाँ',
        'brahma_ben_c1_desc': 'हेलिकोवर्पा और स्पोडोप्टेरा लार्वा के खिलाफ प्रभावी जो बड़े पैमाने पर पत्तियों को खाते हैं।',
        'brahma_ben_c2_title': '🪵 तना और फल छेदक',
        'brahma_ben_c2_desc': 'आंतरिक कीटों को भेदता है और नियंत्रित करता है जो तनों और फलियों में घुस जाते हैं, अक्सर संपर्क स्प्रे के साथ पहुंचना मुश्किल होता है।',
        'brahma_ben_c3_title': '🪲 हार्ड शेल बीटल',
        'brahma_ben_c3_desc': 'मजबूत फॉर्मूलेशन हार्ड-शेल वाले बीटल को भी प्रभावित करता है जो नीमास्त्र के प्रतिरोधी हो सकते हैं।',
        'brahma_use_title': 'आवेदन गाइड',
        'brahma_use_c1_title': 'केवल उपचारात्मक',
        'brahma_use_c1_desc': '<strong>केवल</strong> तब उपयोग करें जब संक्रमण गंभीर हो। नीमास्त्र की तरह नियमित निवारक स्प्रे के रूप में उपयोग न करें।',
        'brahma_use_c2_title': 'खुराक',
        'brahma_use_c2_desc': '<strong>2.5% से 3% समाधान</strong>। 15 लीटर स्प्रे टैंक में 300-450 मिलीलीटर ब्रह्मास्त्र मिलाएं।',
        'brahma_use_c3_title': 'सावधानियां',
        'brahma_use_c3_desc': 'दस्ताने पहनें। कटाई से <strong>7 दिन</strong> पहले छिड़काव बंद कर दें। जीवामृत के साथ न मिलाएं।',
        'brahma_buy_badge': 'उच्च शक्ति',
        'brahma_buy_title': 'परम फसल सुरक्षा',
        'brahma_buy_desc': 'जब अन्य उपाय विफल हो जाते हैं, तो ब्रह्मास्त्र पर भरोसा करें। हमारे शस्त्रागार में सबसे मजबूत जैविक सूत्रीकरण।',
        'brahma_buy_list1': '📦 1L / 5L पैक',
        'brahma_buy_list2': '⏳ 6 महीने की स्थिरता',
        'brahma_buy_list3': '🍃 5-लीफ फॉर्मूला',
        'brahma_buy_list4': '⚠️ सावधानी से संभालें',
        'brahma_buy_price': '₹150 से शुरू',
        'brahma_buy_unit': '/ लीटर',
        'brahma_buy_btn': 'अभी ऑर्डर करें →',
        'brahma_proc_title': 'अग्नि अनुष्ठान',
        'brahma_proc_subtitle': 'थर्मल निष्कर्षण उच्चतम शक्ति जारी करता है।',
        'brahma_proc_s1_title': 'क्रश (कुचलना)',
        'brahma_proc_s1_desc': 'सतह क्षेत्र को अधिकतम करने के लिए सभी 5 प्रकार की पत्तियों को महीन टुकड़ों या पेस्ट में काट लें।',
        'brahma_proc_s2_title': 'मिक्स (मिलाना)',
        'brahma_proc_s2_desc': 'कटी हुई पत्तियों को एक बड़े धातु के बर्तन (तांबा/पीतल पसंदीदा, या स्टील) में 10 लीटर गोमूत्र में डालें।',
        'brahma_proc_s3_title': 'उबालना',
        'brahma_proc_s3_desc': 'मिश्रण को धीमी आंच पर उबालें जब तक कि शक्तिशाली धुआं न उठने लगे (आमतौर पर 1 घंटा)। इसे मैरीनेट करने के लिए 24 घंटे तक ठंडा होने दें।',
        'brahma_proc_s4_title': 'भंडारण',
        'brahma_proc_s4_desc': 'गहरे, केंद्रित तरल को छान लें। इसे 6 महीने तक बोतलों में रखा जा सकता है।',
        'brahma_sci_title': 'लक्ष्य तंत्र',
        'brahma_sci_h3': 'न्यूरोलॉजिकल व्यवधान',
        'brahma_sci_p1': 'यह एक विकर्षक नहीं है; यह कीड़ों के लिए संपर्क और पेट का जहर है। अल्कलॉइड कीट के पेट के रिसेप्टर्स से बंध जाते हैं, जिससे वे तुरंत भोजन करना बंद कर देते हैं।',
        'brahma_sci_target1_title': 'लक्ष्य: तना छेदक',
        'brahma_sci_target1_desc': 'छिपे हुए लार्वा तक पहुंचने के लिए तने के ऊतकों में प्रवेश करता है।',
        'brahma_sci_target2_title': 'लक्ष्य: फल छेदक',
        'brahma_sci_target2_desc': 'टमाटर और बैंगन फल छेदक के लिए उत्कृष्ट।',
        'brahma_warning_title': 'सावधानी के साथ प्रयोग करें',
        'brahma_warning_desc': 'ब्रह्मास्त्र शक्तिशाली है। अति प्रयोग मिट्टी के रोगाणुओं को प्रभावित कर सकता है। इसे एंटीबायोटिक की तरह समझें—केवल आवश्यक होने पर ही उपयोग करें।',
        'brahma_warn_c1_title': '⚠️ केवल उपचारात्मक',
        'brahma_warn_c1_desc': 'निवारक उपाय के रूप में स्प्रे न करें। केवल तभी उपयोग करें जब आप दृश्यमान कीट क्षति देखें।',
        'brahma_warn_c2_title': '🧤 सुरक्षात्मक गियर',
        'brahma_warn_c2_desc': 'यह एक शक्तिशाली अड़चन है। छिड़काव करते समय दस्ताने और मास्क पहनें।',
        'brahma_warn_c3_title': '🌜 शाम का स्प्रे',
        'brahma_warn_c3_desc': 'मधुमक्खियों को नुकसान पहुंचाने से बचने के लिए सूर्यास्त के बाद स्प्रे करें।',
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
        'doc_res_vermi_desc': 'आपकी मिट्टी को जैविक कार्बन और पोषण की आवश्यकता है।',
        // Vermicompost Page
        'vermi_hero_label': 'जीवन की नींव',
        'vermi_hero_title': 'वर्मीकम्पोस्ट (केंचुआ खाद)',
        'vermi_hero_subtitle': 'जैविक कचरे को प्रकृति के सबसे शक्तिशाली उर्वरक में बदलने का विज्ञान।',
        'vermi_intro_title': '"काला सोना" परिभाषित',
        'vermi_intro_p1': 'वर्मीकम्पोस्ट केवल खाद नहीं है। यह एक <strong>जैव-तकनीकी प्रक्रिया</strong> है जहां केंचुए और सूक्ष्मजीव मिलकर जैविक कचरे को पोषक तत्वों से भरपूर, गहरे रंग के और गंधहीन मिट्टी कंडीशनर में बदलते हैं।',
        'vermi_intro_p2': 'वैज्ञानिक रूप से, यह केंचुओं का मल है, जो ह्यूमस से भरपूर होता है और लाभकारी बैक्टीरिया और कवक से भरा होता है। नियमित कम्पोस्ट के विपरीत जो गर्मी पर निर्भर करता है, वर्मीकम्पोस्ट कीड़े के आंत की <strong>जैविक गतिविधि</strong> पर निर्भर करता है।',
        'vermi_arch_title': 'निर्माता से मिलें: <em>Eisenia fetida</em>',
        'vermi_arch_c1_title': 'सतही प्रकृति',
        'vermi_arch_c1_desc': 'ये "लाल कीड़े" गहराई में नहीं जाते। वे सतह पर पनपते हैं और जैविक कूड़े का सेवन करते हैं। यह उन्हें खाद के डिब्बे के लिए एकदम सही बनाता है।',
        'vermi_arch_c2_title': 'विशाल भूख',
        'vermi_arch_c2_desc': 'एक अकेला कीड़ा अपने शरीर के वजन के बराबर कचरा <strong>हर एक दिन</strong> खा सकता है। वे अथक रीसाइक्लिंग मशीनें हैं।',
        'vermi_arch_c3_title': 'आंत बायोरिएक्टर',
        'vermi_arch_c3_desc': 'कीड़े के गिज़ार्ड के अंदर, कचरे को पीसकर एंजाइमों (प्रोटीज, लाइपेज, एमाइलेज) और बलगम के साथ लेपित किया जाता है, जिससे माइक्रोबियल गतिविधि 1000 गुना बढ़ जाती है।',
        'vermi_proc_title': 'यह कैसे बनता है',
        'vermi_proc_subtitle': 'कचरे से धन तक: वैज्ञानिक परत विधि।',
        'vermi_proc_s1_title': 'बिस्तर की तैयारी',
        'vermi_proc_s1_desc': 'एक कार्बन-समृद्ध परत (कटा हुआ कार्डबोर्ड, सूखी पत्तियां, नारियल जटा) जंगल के फर्श की नकल करती है। यह हवा का संचार करती है और नमी बनाए रखती है।',
        'vermi_proc_s2_title': 'कीड़े डालना',
        'vermi_proc_s2_desc': 'केंचुए पेश किए जाते हैं। हम प्रति वर्ग मीटर ~1000 कीड़ों से शुरू करते हैं। वे प्रकाश से दूर नम बिस्तर में चले जाते हैं।',
        'vermi_proc_s3_title': 'खिलाना',
        'vermi_proc_s3_desc': 'नाइट्रोजन युक्त कचरा (सब्जी के छिलके, गाय का गोबर) कटी हुई परतों में डाला जाता है। <strong>बचें:</strong> अम्लता को रोकने के लिए मांस, डेयरी और खट्टे फल।',
        'vermi_proc_s4_title': 'कटाई',
        'vermi_proc_s4_desc': '60-90 दिनों के बाद, शीर्ष सामग्री का सेवन किया जाता है। काली, दानेदार कास्टिंग (खाद) नीचे जम जाती है। हम कीड़ों को अलग करते हैं।',
        'vermi_nut_title': 'पोषक तत्व प्रोफ़ाइल विश्लेषण',
        'vermi_nut_h3': 'श्रेष्ठ पौधों का पोषण',
        'vermi_nut_t_n_label': 'नाइट्रोजन (N)',
        'vermi_nut_t_n_desc': 'पत्तेदार विकास और प्रोटीन संश्लेषण के लिए आवश्यक।',
        'vermi_nut_t_p_label': 'फास्फोरस (P)',
        'vermi_nut_t_p_desc': 'जड़ विकास और फूल आने के लिए महत्वपूर्ण।',
        'vermi_nut_t_k_label': 'पोटैशियम (K)',
        'vermi_nut_t_k_desc': 'रोग प्रतिरोधक क्षमता और और बिमारियों से लड़ने की शक्ति बढ़ाता है।',
        'vermi_nut_t_c_label': 'जैविक कार्बन',
        'vermi_nut_t_c_desc': 'मिट्टी के रोगाणुओं के लिए ऊर्जा स्रोत।',
        'vermi_nut_t_cn_label': 'C:N अनुपात',
        'vermi_nut_t_cn_desc': 'पौधों के ग्रहण के लिए आदर्श संतुलन।',
        'vermi_nut_note': '*इसमें कैल्शियम, मैग्नीशियम और ऑक्सिन और साइटोकाइनिन जैसे वृद्धि हार्मोन भी होते हैं।',
        'vermi_ben_title': 'फसलें क्यों पनपती हैं',
        'vermi_ben_c1_title': '🌱 भौतिक मिट्टी सुधार',
        'vermi_ben_c1_desc': 'वर्मीकम्पोस्ट मिट्टी की हवा और बनावट में सुधार करता है। यह जल धारण क्षमता को <strong>30-40%</strong> तक बढ़ाता है, जिससे सूखे के दौरान सिंचाई की आवश्यकता कम हो जाती है।',
        'vermi_ben_c2_title': '🦠 जैविक सक्रियता',
        'vermi_ben_c2_desc': 'यह नियमित मिट्टी की तुलना में 10-20 गुना अधिक माइक्रोबियल गतिविधि जोड़ता है। ये रोगाणु महीनों तक काम करना जारी रखते हैं, पोषक तत्वों को "मांग पर" उपलब्ध कराते हैं।',
        'vermi_ben_c3_title': '🛡️ पौधों की रक्षा',
        'vermi_ben_c3_desc': 'काइटिनेज एंजाइम से भरपूर, जो कीटों और कवक की कोशिका दीवारों को तोड़ता है। यह जड़ सड़न और निमेटोड के खिलाफ एक प्राकृतिक जैव-नियंत्रण एजेंट के रूप में कार्य करता है।',
        'vermi_comp_vs': 'बनाम रासायनिक उर्वरक',
        'vermi_comp_bad': 'रसायन',
        'vermi_comp_bad_desc': 'विस्फोटक, अल्पकालिक वृद्धि। मिट्टी के जीवन को मारता है। समय के साथ मिट्टी को अम्लीय बनाता है।',
        'vermi_comp_good': 'वर्मीकम्पोस्ट',
        'vermi_comp_good_desc': 'निरंतर, दीर्घकालिक स्वास्थ्य। मिट्टी के जीवन को पुनर्जीवित करता है। पीएच को संतुलित करता है (तटस्थ 6.8 - 7.5)।',
        'vermi_buy_badge': 'OFKFF प्रीमियम ग्रेड',
        'vermi_buy_title': 'अपनी मिट्टी का परिवर्तन शुरू करें',
        'vermi_buy_desc': 'हमारा वर्मीकम्पोस्ट सख्त गुणवत्ता नियंत्रण के तहत उत्पादित होता है। हम संतुलित C:N अनुपात सुनिश्चित करने के लिए गाय के गोबर और हरे बायोमास के मिश्रण का उपयोग करते हैं।',
        'vermi_buy_list1': '📦 1 किग्रा / 5 किग्रा / 50 किग्रा बैग',
        'vermi_buy_list2': '💧 नमी: 30% (जीवित रोगाणु)',
        'vermi_buy_list3': '🌿 खरपतवार बीज मुक्त',
        'vermi_buy_list4': '🔬 लैब परीक्षित गुणवत्ता',
        'vermi_buy_price': '₹20 से शुरू',
        'vermi_buy_unit': '/ किग्रा',
        'vermi_buy_note': '100 किग्रा से अधिक के थोक ऑर्डर के लिए मुफ्त डिलीवरी',
        // Jeevamrut Page
        'jeeva_hero_label': 'जीवन का अमृत',
        'jeeva_hero_title': 'जीवामृत',
        'jeeva_hero_subtitle': 'एक शक्तिशाली माइक्रोबियल कल्चर जो आपकी मिट्टी और फसलों के लिए प्रतिरक्षा बूस्टर के रूप में कार्य करता है।',
        'jeeva_intro_title': 'सूक्ष्मजीव विस्फोट',
        'jeeva_intro_p1': 'जीवामृत केवल खाद नहीं है, बल्कि एक उत्प्रेरक है। यह लाभकारी बैक्टीरिया और कवक का एक विशाल द्रव्यमान बनाता है जो मिट्टी में बंद पोषक तत्वों को घुलनशील बनाता है।',
        'jeeva_intro_p2': 'एक ग्राम देशी गाय के गोबर में <strong>300 से 500 मिलियन</strong> लाभकारी रोगाणु होते हैं। हमारी किण्वन प्रक्रिया के माध्यम से, यह संख्या अरबों में बदल जाती है।',
        'jeeva_ing_title': 'प्राचीन विधि',
        'jeeva_ing_c1_title': 'गाय का गोबर और मूत्र',
        'jeeva_ing_c1_desc': 'रोगाणुओं का स्रोत। हम अधिकतम संख्या के लिए केवल देशी गायों के ताजे गोबर का उपयोग करते हैं।',
        'jeeva_ing_c2_title': 'काला गुड़',
        'jeeva_ing_c2_desc': 'किण्वन के दौरान रोगाणुओं को तेजी से गुणा करने के लिए प्रारंभिक ऊर्जा (कार्बोहाइड्रेट) प्रदान करता है।',
        'jeeva_ing_c3_title': 'दाल का आटा',
        'jeeva_ing_c3_desc': 'बेसन या अरहर का आटा प्रोटीन स्रोत के रूप में कार्य करता है, जो बैक्टीरिया के शरीर का निर्माण करता है।',
        'jeeva_process_note': 'छाया में 48-72 घंटों के लिए किण्वित, संस्कृति को ऑक्सीजन देने के लिए दिन में दो बार घड़ी की दिशा में हिलाया जाता है।',
        'jeeva_ben_title': 'तिहरा प्रभाव',
        'jeeva_ben_c1_title': '🛡️ फसल प्रतिरक्षा',
        'jeeva_ben_c1_desc': 'पौधों के लिए टीकाकरण की तरह काम करता है। यह बीमारियों और जलवायु तनाव के खिलाफ आंतरिक रक्षा प्रणाली (SAR) को मजबूत करता है।',
        'jeeva_ben_c2_title': '🔓 पोषक तत्व खोलना',
        'jeeva_ben_c2_desc': 'मिट्टी में मौजूद नाइट्रोजन, फास्फोरस और पोटेशियम को घुलनशील बनाता है जो जड़ों के लिए उपलब्ध नहीं थे।',
        'jeeva_ben_c3_title': '🪱 केंचुआ चुंबक',
        'jeeva_ben_c3_desc': 'विशिष्ट गंध और जैविक संकेत गहरे केंचुओं को सतह पर आकर्षित करते हैं, जो स्वाभाविक रूप से आपकी भूमि की जुताई करते हैं।',
        'jeeva_use_title': 'उपयोग गाइड',
        'jeeva_use_c1_title': 'मिट्टी में',
        'jeeva_use_c1_desc': '<strong>200 लीटर / एकड़</strong>। सिंचाई के पानी के साथ महीने में एक बार प्रयोग करें।',
        'jeeva_use_c2_title': 'छिड़काव (Spray)',
        'jeeva_use_c2_desc': '<strong>10% घोल</strong>। 1 लीटर छना हुआ जीवामृत 10 लीटर पानी में मिलाएं। हर 21 दिनों में स्प्रे करें।',
        'jeeva_use_c3_title': 'सावधानी',
        'jeeva_use_c3_desc': 'तैयारी के <strong>12 दिनों</strong> के भीतर प्रयोग करें। रासायनिक कवकनाशकों के साथ न मिलाएं, क्योंकि वे जीवित रोगाणुओं को मार देंगे।',
        'jeeva_buy_badge': 'जीवित कल्चर',
        'jeeva_buy_title': 'आज ही अपनी मिट्टी को बढ़ावा दें',
        'jeeva_buy_desc': 'ताजा जीवामृत कल्चर ऑर्डर करें। डिलीवरी पर अधिकतम माइक्रोबियल संख्या सुनिश्चित करने के लिए मांग पर तैयार किया गया।',
        'jeeva_buy_list1': '📦 5L / 10L / 20L जेरी कैन',
        'jeeva_buy_list2': '⏳ शेल्फ लाइफ: 12 दिन',
        'jeeva_buy_list3': '🐮 देशी गाय स्रोत',
        'jeeva_buy_list4': '🧊 ठंडा परिवहन',
        'jeeva_buy_price': '₹20 से शुरू',
        'jeeva_buy_unit': '/ लीटर',
        'jeeva_buy_btn': 'अभी ऑर्डर करें →',
        'jeeva_ing_c4_title': 'मुट्ठी भर मिट्टी',
        'jeeva_ing_c4_desc': 'विविधता। मिश्रण में स्थानीय मिट्टी के विशिष्ट रोगाणुओं का परिचय देता है।',
        'jeeva_proc_title': 'बनाने की प्रक्रिया',
        'jeeva_proc_subtitle': 'परिवर्तन छाया में होता है।',
        'jeeva_proc_s1_title': 'मिश्रण (The Mixture)',
        'jeeva_proc_s1_desc': 'सभी सामग्री को 200 लीटर प्लास्टिक ड्रम (धातु से बचें) में मिलाएं। पानी से भरें। छाया में रखें।',
        'jeeva_proc_s2_title': 'घड़ी की दिशा में हिलाना',
        'jeeva_proc_s2_desc': 'घोल को दिन में दो बार 10 मिनट के लिए घड़ी की दिशा में हिलाएं। यह एक भंवर बनाता है, एरोबिक बैक्टीरिया को ईंधन देने के लिए ड्रम की गहराई में ऑक्सीजन खींचता है।',
        'jeeva_proc_s3_title': 'उफान (48 घंटे)',
        'jeeva_proc_s3_desc': 'तीसरे दिन तक, किण्वन चरम पर होता है। माइक्रोबियल गिनती तेजी से बढ़ती है। एक मीठी, किण्वित गंध बताती है कि यह तैयार है।',
        'jeeva_proc_s4_title': 'आवेदन',
        'jeeva_proc_s4_desc': '7 दिनों के भीतर प्रयोग करें। सिंचाई के पानी के साथ या पत्तियों पर स्प्रे (छानकर) करें।',
        'jeeva_nut_title': 'माइक्रोबियल युद्ध',
        'jeeva_nut_h3': 'रक्षात्मक ढाल',
        'jeeva_nut_p1': 'आधुनिक कृषि मिट्टी में "अच्छे लोगों" की कमी से ग्रस्त है। रोगाणु बाँझ मिट्टी में पनपते हैं। जीवामृत खेत को लाभार्थियों से भर देता है।',
        'jeeva_nut_t_l_label': 'नाइट्रोजन फिक्सर',
        'jeeva_nut_t_l_desc': 'एज़ोटोबैक्टर और राइजोबियम हवा से नाइट्रोजन खींचते हैं।',
        'jeeva_nut_t_p_label': 'फॉस्फेट घुलनशील',
        'jeeva_nut_t_p_desc': 'चट्टानों/मिट्टी में बंद फास्फोरस को घोलें।',
        'jeeva_nut_t_psi_label': 'स्यूडोमोनास',
        'jeeva_nut_t_psi_desc': 'जड़ों को फंगल रोगों से बचाता है।',
        'jeeva_nut_t_tri_label': 'ट्राइकोडर्मा',
        'jeeva_nut_t_tri_desc': 'एक प्रसिद्ध एंटी-फंगल एजेंट।',
        'jeeva_comp_subtitle': 'रासायनिक उर्वरक पौधे को जबरदस्ती खिलाते हैं लेकिन मिट्टी को मार देते हैं। जीवामृत मिट्टी को खिलाता है, जो पौधे को हमेशा के लिए खिलाती है।',
        'jeeva_comp_bad': 'यूरिया / डीएपी',
        'jeeva_comp_bad_desc': 'लवण जमा हो जाते हैं। केंचुए मर जाते हैं। मिट्टी कंक्रीट की तरह सख्त हो जाती है।',
        'jeeva_comp_good': 'जीवामृत',
        'jeeva_comp_good_desc': 'मिट्टी नरम औ र झरझरी हो जाती है। केंचुए लौट आते हैं। जलधारण क्षमता दोगुनी हो जाती है।',
        // Shared Related Products
        'related_title': 'अपनी किट पूरी करें',
        'related_vermi_title': 'वर्मीकम्पोस्ट',
        'related_vermi_desc': 'ठोस पोषण और जैविक कार्बन नींव।',
        'related_jeeva_title': 'जीवामृत',
        'related_jeeva_desc': 'प्रतिरक्षा के लिए तरल माइक्रोबियल कल्चर।',
        'related_nimastra_title': 'नीमास्त्र',
        'related_nimastra_desc': 'नरम शरीर वाले कीटों के खिलाफ रक्षा की पहली रेखा।',
        'related_brahma_title': 'ब्रह्मास्त्र',
        'related_brahma_desc': 'बड़े कीड़ों और बेधक कीटों के खिलाफ अत्यंत सुरक्षा।',
        // Marketplace Banner
        'market_banner_title': 'हमारे प्रीमियम मार्केटप्लेस पर जाएं',
        'market_banner_desc': 'हमारे जैविक उत्पादों का पूरा संग्रह देखें, तुलना करें और सीधे ऑनलाइन ऑर्डर करें।',
        'market_banner_btn': 'स्टोर देखें',
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
        'faq_a3': 'ରାସାୟନିକ ପଦାର୍ଥ ତୁରନ୍ତ ମାରିଦିଏ କିନ୍ତୁ ପରିବେଶକୁ କ୍ଷତି ପହଞ୍ଚାଏ | ନିମାସ୍ତ୍ର ଭିନ୍ନ ଭାବରେ କାମ କରେ: ଏହା ପୋକଙ୍କୁ ଦୂରେଇ ଦିଏ, ଗଛକୁ ପିତା ବନାଏ ଏବଂ ସେମାନଙ୍କ ବଂଶବୃଦ୍ଧି ଚକ୍ରକୁ ବାଧା ଦିଏ | ସର୍ବୋତ୍ତମ ଫଳାଫଳ ପାଇଁ, ଆକ୍ରମଣର ଅପେକ୍ଷା ନକରି ଏହାକୁ <strong>ପ୍ରତି ୧୦-୧୫ ଦିନରେ ପ୍ରତିଷେଧକ ଭାବରେ</strong> ବ୍ୟବହାର କରନ୍ତୁ |',
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
        'cart_payment_note': 'ଫର୍ମ ମାଧ୍ୟମରେ ଅର୍ଡର ନିଶ୍ଚିତ ହେବା ପରେ ଦେୟ ସଂଗ୍ରହ କରାଯିବ |',
        // Doctor Results
        'doc_res_default_title': 'ପରାମର୍ଶିତ: ଜୀବାମୃତ',
        'doc_res_default_desc': 'ସାମଗ୍ରିକ ସ୍ୱାସ୍ଥ୍ୟ ପାଇଁ ସର୍ବଭାରତୀୟ ରୋଗ ପ୍ରତିରୋଧକ ଶକ୍ତି ବୃଦ୍ଧିକାରୀ |',
        'doc_res_nima_title': 'ପରାମର୍ଶିତ: ନୀମାସ୍ତ୍ର',
        'doc_res_nima_desc': 'ନରମ ପନିପରିବାରେ ଶୋଷୁଥିବା ପୋକ (aphids, jassids) ପାଇଁ ସର୍ବୋତ୍ତମ |',
        'doc_res_brahma_title': 'ପରାମର୍ଶିତ: ବ୍ରହ୍ମାସ୍ତ୍ର',
        'doc_res_brahma_desc': 'ବଡ ଫସଲ ଏବଂ ଜିଦ୍ଖୋର ପୋକ ପାଇଁ ଦୃଢ ସୁରକ୍ଷା |',
        'doc_res_vermi_title': 'ପରାମର୍ଶିତ: ଭର୍ମିକମ୍ପୋଷ୍ଟ',
        'doc_res_vermi_desc': 'ଆପଣଙ୍କ ମାଟିରେ ଜୈବିକ ଅଙ୍ଗାରକ ଏବଂ ପୁଷ୍ଟିକର ଆବଶ୍ୟକତା ଅଛି |',
        // Vermicompost Page
        'vermi_hero_label': 'ଜୀବନର ମୂଳଦୁଆ',
        'vermi_hero_title': 'ଭର୍ମିକମ୍ପୋଷ୍ଟ (କେଞ୍ଚୁଆ ଖତ)',
        'vermi_hero_subtitle': 'ଜୈବିକ ବର୍ଜ୍ୟବସ୍ତୁକୁ ପ୍ରକୃତିର ସବୁଠାରୁ ଶକ୍ତିଶାଳୀ ସାରରେ ପରିଣତ କରିବାର ବିଜ୍ଞାନ |',
        'vermi_intro_title': '"କଳା ସୁନା" ପରିଭାଷିତ',
        'vermi_intro_p1': 'ଭର୍ମିକମ୍ପୋଷ୍ଟ କେବଳ ଖତ ନୁହେଁ | ଏହା ହେଉଛି ଏକ <strong>ଜୈବ-ଯାନ୍ତ୍ରିକ ପ୍ରକ୍ରିୟା</strong> ଯେଉଁଠାରେ ବର୍ଜ୍ୟବସ୍ତୁ କୁ ପୁଷ୍ଟିକର ମାଟିରେ ପରିଣତ କରିବା ପାଇଁ ଜିଆ ଏବଂ ଅଣୁଜୀବ ଏକାଠି କାମ କରନ୍ତି |',
        'vermi_intro_p2': 'ବୈଜ୍ଞାନିକ ଦୃଷ୍ଟିକୋଣରୁ, ଏହା ଜିଆ ମଳ, ଯାହା ହ୍ୟୁମସରେ ଭରପୂର ଏବଂ ଉପକାରୀ ବ୍ୟାକ୍ଟେରିଆରେ ପରିପୂର୍ଣ୍ଣ | ନିୟମିତ କମ୍ପୋଷ୍ଟ ବିପରୀତ ଯାହା ଉତ୍ତାପ ଉପରେ ନିର୍ଭର କରେ, ଭର୍ମିକମ୍ପୋଷ୍ଟ ଜିଆ ପେଟର <strong>ଜୈବିକ କାର୍ଯ୍ୟକଳାପ</strong> ଉପରେ ନିର୍ଭର କରେ |',
        'vermi_arch_title': 'ନିର୍ମାତାଙ୍କୁ ଭେଟନ୍ତୁ: <em>Eisenia fetida</em>',
        'vermi_arch_c1_title': 'ଉପର ସ୍ତରର ଜିଆ',
        'vermi_arch_c1_desc': 'ଏହି "ନାଲି ଜିଆ" ଗଭୀରକୁ ଯାଆନ୍ତି ନାହିଁ | ସେମାନେ ଭୂପୃଷ୍ଠ ସ୍ତରରେ ବଢନ୍ତି ଏବଂ ଜୈବିକ ଆବର୍ଜନା ଖାଆନ୍ତି | ଏହା ସେମାନଙ୍କୁ କମ୍ପୋଷ୍ଟିଂ ବିନ୍ ପାଇଁ ଉପଯୁକ୍ତ କରେ |',
        'vermi_arch_c2_title': 'ବିଶାଳ ଭୋକ',
        'vermi_arch_c2_desc': 'ଗୋଟିଏ ଜିଆ ନିଜ ଶରୀରର ଓଜନ ସହିତ ସମାନ ବର୍ଜ୍ୟବସ୍ତୁ <strong>ପ୍ରତିଦିନ</strong> ଖାଇପାରେ | ସେମାନେ ନିରନ୍ତର ରିସାଇକ୍ଲିଂ ମେସିନ୍ ଅଟନ୍ତି |',
        'vermi_arch_c3_title': 'ଜୈବିକ ରିଆକ୍ଟର',
        'vermi_arch_c3_desc': 'ଜିଆ ପେଟ ଭିତରେ, ଏଞ୍ଜାଇମ୍ (protease, lipase) ସାହାଯ୍ୟରେ ବର୍ଜ୍ୟବସ୍ତୁ ହଜମ ହୁଏ, ଯାହା ମାଇକ୍ରୋବିଆଲ୍ କାର୍ଯ୍ୟକଳାପକୁ ୧୦୦୦ ଗୁଣ ବଢାଇଥାଏ |',
        'vermi_proc_title': 'ଏହା କିପରି ତିଆରି ହୁଏ',
        'vermi_proc_subtitle': 'ବର୍ଜ୍ୟବସ୍ତୁରୁ ସମ୍ପଦ: ବୈଜ୍ଞାନିକ ସ୍ତର ପଦ୍ଧତି |',
        'vermi_proc_s1_title': 'ବିଛଣା ପ୍ରସ୍ତୁତି',
        'vermi_proc_s1_desc': 'ଏକ କାର୍ବନ-ଧନୀ ସ୍ତର (କାର୍ଡବୋର୍ଡ, ଶୁଖିଲା ପତ୍ର, ନଡିଆ କତା) ଜଙ୍ଗଲ ଚଟାଣକୁ ଅନୁକରଣ କରେ | ଏହା ବାୟୁ ଚଳାଚଳ ଯୋଗାଏ ଏବଂ ଆର୍ଦ୍ରତା ବଜାୟ ରଖେ |',
        'vermi_proc_s2_title': 'ଜିଆ ଛାଡିବା',
        'vermi_proc_s2_desc': 'ଜିଆମାନଙ୍କୁ ପରିଚିତ କରାଯାଏ | ଆମେ ବର୍ଗ ମିଟର ପ୍ରତି ~୧୦୦୦ ଜିଆରୁ ଆରମ୍ଭ କରୁ | ସେମାନେ ଆଲୋକରୁ ଦୂରେଇ ଓଦା ବିଛଣାକୁ ଚାଲିଯାଆନ୍ତି |',
        'vermi_proc_s3_title': 'ଖାଇବାକୁ ଦେବା',
        'vermi_proc_s3_desc': 'ନାଇଟ୍ରୋଜେନ୍ ଯୁକ୍ତ ବର୍ଜ୍ୟବସ୍ତୁ (ପନିପରିବା ଚୋପା, ଗୋବର) କଟା ଯାଇଥିବା ସ୍ତରରେ ଯୋଡାଯାଏ | <strong>ଏଡାନ୍ତୁ:</strong> ଅମ୍ଳାକ୍ତ ରୋକିବା ପାଇଁ ମାଂସ, ଦୁଗ୍ଧ ଏବଂ ଲେମ୍ବୁ ଜାତୀୟ ଫଳ |',
        'vermi_proc_s4_title': 'ଅମଳ',
        'vermi_proc_s4_desc': '୬୦-୯୦ ଦିନ ପରେ, ଉପର ପଦାର୍ଥ ଖିଆଯାଏ | କଳା, ଦାନାଦାର ଖତ ତଳେ ଜମା ହୁଏ | ଆମେ ଜିଆମାନଙ୍କୁ ଅଲଗା କରୁ |',
        'vermi_nut_title': 'ପୁଷ୍ଟିକର ପ୍ରୋଫାଇଲ୍ ବିଶ୍ଳେଷଣ',
        'vermi_nut_h3': 'ଶ୍ରେଷ୍ଠ ଉଦ୍ଭିଦ ପୋଷଣ',
        'vermi_nut_t_n_label': 'ନାଇଟ୍ରୋଜେନ୍ (N)',
        'vermi_nut_t_n_desc': 'ପତ୍ର ବୃଦ୍ଧି ଏବଂ ପ୍ରୋଟିନ୍ ସିନ୍ଥେସିସ୍ ପାଇଁ ଜରୁରୀ |',
        'vermi_nut_t_p_label': 'ଫସଫରସ୍ (P)',
        'vermi_nut_t_p_desc': 'ମୂଳ ବିକାଶ ଏବଂ ଫୁଲ ପାଇଁ ଗୁରୁତ୍ୱପୂର୍ଣ୍ଣ |',
        'vermi_nut_t_k_label': 'ପୋଟାସିୟମ୍ (K)',
        'vermi_nut_t_k_desc': 'ରୋଗ ପ୍ରତିରୋଧକ ଶକ୍ତି ଗଠନ କରେ |',
        'vermi_nut_t_c_label': 'ଜୈବିକ କାର୍ବନ',
        'vermi_nut_t_c_desc': 'ମାଟି ଅଣୁଜୀବ ପାଇଁ ଶକ୍ତି ଉତ୍ସ |',
        'vermi_nut_t_cn_label': 'C:N ଅନୁପାତ',
        'vermi_nut_t_cn_desc': 'ଉଦ୍ଭିଦ ଗ୍ରହଣ ପାଇଁ ଆଦର୍ଶ ସନ୍ତୁଳନ |',
        'vermi_nut_note': '*ଏଥିରେ କ୍ୟାଲସିୟମ୍, ମ୍ୟାଗ୍ନେସିୟମ୍, ଏବଂ ଅକ୍ସିନ୍ ଭଳି ବୃଦ୍ଧି ହରମୋନ୍ ମଧ୍ୟ ଥାଏ |',
        'vermi_ben_title': 'ଫସଲ କାହିଁକି ବଢେ',
        'vermi_ben_c1_title': '🌱 ଭୌତିକ ମାଟି ଉନ୍ନତି',
        'vermi_ben_c1_desc': 'ଭର୍ମିକମ୍ପୋଷ୍ଟ ମାଟିର ପବନ ଚଳାଚଳରେ ଉନ୍ନତି ଆଣେ | ଏହା ଜଳ ଧାରଣ କ୍ଷମତାକୁ <strong>୩୦-୪୦%</strong> ପର୍ଯ୍ୟନ୍ତ ବଢାଇଥାଏ |',
        'vermi_ben_c2_title': '🦠 ଜୈବିକ ସକ୍ରିୟତା',
        'vermi_ben_c2_desc': 'ଏହା ନିୟମିତ ମାଟି ଅପେକ୍ଷା ୧୦-୨୦ ଗୁଣ ଅଧିକ ମାଇକ୍ରୋବିଆଲ୍ କାର୍ଯ୍ୟକଳାପ ଯୋଡିଥାଏ | ଏହି ଅଣୁଜୀବଗୁଡିକ ମାସ ମାସ ଧରି କାମ ଜାରି ରଖନ୍ତି |',
        'vermi_ben_c3_title': '🛡️ ଉଦ୍ଭିଦ ପ୍ରତିରକ୍ଷା',
        'vermi_ben_c3_desc': 'Chitinase ଏଞ୍ଜାଇମରେ ଭରପୂର, ଯାହା ପୋକ ଏବଂ କବକର କୋଷ କାନ୍ଥକୁ ଭାଙ୍ଗିଦିଏ | ଏହା ଚେର ପଚା ବିରୁଦ୍ଧରେ ଏକ ପ୍ରାକୃତିକ ନିୟନ୍ତ୍ରଣ ଏଜେଣ୍ଟ ଭାବରେ କାମ କରେ |',
        'vermi_comp_vs': 'ବନାମ ରାସାୟନିକ ସାର',
        'vermi_comp_bad': 'ରାସାୟନିକ',
        'vermi_comp_bad_desc': 'ବିସ୍ଫୋରକ, ଅଳ୍ପ ସମୟର ବୃଦ୍ଧି | ମାଟି ଜୀବନକୁ ମାରିଦିଏ | ସମୟ ସହିତ ମାଟିକୁ ଅମ୍ଳୀୟ କରେ |',
        'vermi_comp_good': 'ଭର୍ମିକମ୍ପୋଷ୍ଟ',
        'vermi_comp_good_desc': 'ନିରନ୍ତର, ଦୀର୍ଘକାଳୀନ ସ୍ୱାସ୍ଥ୍ୟ | ମାଟି ଜୀବନକୁ ପୁନର୍ଜୀବିତ କରେ | pH ସନ୍ତୁଳନ କରେ (ନିରପେକ୍ଷ ୬.୮ - ୭.୫) |',
        'vermi_buy_badge': 'OFKFF ପ୍ରିମିୟମ୍ ଗ୍ରେଡ୍',
        'vermi_buy_title': 'ଆପଣଙ୍କ ମାଟିର ପରିବର୍ତ୍ତନ ଆରମ୍ଭ କରନ୍ତୁ',
        'vermi_buy_desc': 'ଆମର ଭର୍ମିକମ୍ପୋଷ୍ଟ କଠୋର ଗୁଣବତ୍ତା ନିୟନ୍ତ୍ରଣ ଅଧୀନରେ ଉତ୍ପାଦିତ ହୁଏ | ଆମେ ସନ୍ତୁଳିତ C:N ଅନୁପାତ ନିଶ୍ଚିତ କରିବାକୁ ଗୋବର ଏବଂ ସବୁଜ ବାୟୋମାସ୍ ର ମିଶ୍ରଣ ବ୍ୟବହାର କରୁ |',
        'vermi_buy_list1': '📦 ୧ କିଗ୍ରା / ୫ କିଗ୍ରା / ୫୦ କିଗ୍ରା ବ୍ୟାଗ୍',
        'vermi_buy_list2': '💧 ଆର୍ଦ୍ରତା: ୩୦% (ଜୀବନ୍ତ ଅଣୁଜୀବ)',
        'vermi_buy_list3': '🌿 ଘାସ ମଞ୍ଜି ମୁକ୍ତ',
        'vermi_buy_list4': '🔬 ଲ୍ୟାବ୍ ପରୀକ୍ଷିତ ଗୁଣବତ୍ତା',
        'vermi_buy_price': '₹୨୦ ରୁ ଆରମ୍ଭ',
        'vermi_buy_unit': '/ କିଗ୍ରା',
        'vermi_buy_note': '୧୦୦ କିଗ୍ରା ରୁ ଅଧିକ ଅର୍ଡର ପାଇଁ ମାଗଣା ଡେଲିଭରି',
        // Jeevamrut Page
        'jeeva_hero_label': 'ଜୀବନର ଅମୃତ',
        'jeeva_hero_title': 'ଜୀବାମୃତ',
        'jeeva_hero_subtitle': 'ଏକ ଶକ୍ତିଶାଳୀ ମାଇକ୍ରୋବିଆଲ୍ କଲଚର୍ ଯାହା ଆପଣଙ୍କ ମାଟି ଏବଂ ଫସଲ ପାଇଁ ରୋଗ ପ୍ରତିରୋଧକ ଶକ୍ତି ଭାବରେ କାମ କରେ |',
        'jeeva_intro_title': 'ଅଣୁଜୀବ ବିସ୍ଫୋରଣ',
        'jeeva_intro_p1': 'ଜୀବାମୃତ କେବଳ ସାର ନୁହେଁ, ବରଂ ଏକ ଉତ୍ପ୍ରେରକ | ଏହା ଉପକାରୀ ବ୍ୟାକ୍ଟେରିଆ ଏବଂ କବକର ଏକ ବିଶାଳ ସମୂହ ସୃଷ୍ଟି କରେ ଯାହା ମାଟିରେ ଥିବା ପୋଷକ ତତ୍ତ୍ୱକୁ ମୁକ୍ତ କରେ |',
        'jeeva_intro_p2': 'ଗୋଟିଏ ଗ୍ରାମ ଦେଶୀ ଗୋବରରେ <strong>୩୦୦ ରୁ ୫୦୦ ନିୟୁତ</strong> ଉପକାରୀ ଅଣୁଜୀବ ଥାଆନ୍ତି | ଆମର ଫାର୍ମେଣ୍ଟେସନ୍ ପ୍ରକ୍ରିୟା ମାଧ୍ୟମରେ, ଏହି ସଂଖ୍ୟା କୋଟି କୋଟିରେ ପହଞ୍ଚେ |',
        'jeeva_ing_title': 'ପ୍ରାଚୀନ ପଦ୍ଧତି',
        'jeeva_ing_c1_title': 'ଗୋବର ଓ ଗୋମୂତ୍ର',
        'jeeva_ing_c1_desc': 'ଅଣୁଜୀବର ଉତ୍ସ | ଆମେ କେବଳ ଦେଶୀ ଗାଈର ତାଜା ଗୋବର ବ୍ୟବହାର କରୁ |',
        'jeeva_ing_c2_title': 'କଳା ଗୁଡ',
        'jeeva_ing_c2_desc': 'ଅଣୁଜୀବର ଦ୍ରୁତ ବୃଦ୍ଧି ପାଇଁ ଶକ୍ତି (ଶର୍କରା) ପ୍ରଦାନ କରେ |',
        'jeeva_ing_c3_title': 'ବେସନ',
        'jeeva_ing_c3_desc': 'ପ୍ରୋଟିନ୍ ଉତ୍ସ ଭାବରେ କାମ କରେ, ଯାହା ବ୍ୟାକ୍ଟେରିଆର ଶରୀର ଗଠନ କରେ |',
        'jeeva_process_note': '୪୮-୭୨ ଘଣ୍ଟା ପାଇଁ ଛାଇରେ ରଖାଯାଏ, ଦିନକୁ ଦୁଇଥର ଘଣ୍ଟା ଦିଗରେ ଘାଣ୍ଟାଯାଏ |',
        'jeeva_ben_title': 'ତ୍ରିମୁଖୀ ପ୍ରଭାବ',
        'jeeva_ben_c1_title': '🛡️ ଫସଲ ରୋଗ ପ୍ରତିରୋଧକ',
        'jeeva_ben_c1_desc': 'ଗଛ ପାଇଁ ଟୀକାକରଣ ପରି କାମ କରେ | ଏହା ରୋଗ ଏବଂ ଜଳବାୟୁ ଚାପ ବିରୁଦ୍ଧରେ ଆଭ୍ୟନ୍ତରୀଣ ପ୍ରତିରକ୍ଷା ପ୍ରଣାଳୀ (SAR) କୁ ମଜବୁତ କରେ |',
        'jeeva_ben_c2_title': '🔓 ପୋଷକ ତତ୍ତ୍ୱ ମୁକ୍ତ',
        'jeeva_ben_c2_desc': 'ମାଟିରେ ଥିବା ନାଇଟ୍ରୋଜେନ୍, ଫସଫରସ୍ ଏବଂ ପୋଟାସିୟମ୍ କୁ ମୂଳ ପାଇଁ ଉପଲବ୍ଧ କରାଏ |',
        'jeeva_ben_c3_title': '🪱 ଜିଆ ଆକର୍ଷଣ',
        'jeeva_ben_c3_desc': 'ବିଶେଷ ଗନ୍ଧ ଏବଂ ଜୈବିକ ସଙ୍କେତ ଗଭୀରରେ ଥିବା ଜିଆଙ୍କୁ ଉପରକୁ ଆକର୍ଷିତ କରେ, ଯାହା ପ୍ରାକୃତିକ ଭାବରେ ଆପଣଙ୍କ ଜମିକୁ ହଳ କରେ |',
        'jeeva_use_title': 'ବ୍ୟବହାର ବିଧି',
        'jeeva_use_c1_title': 'ମାଟିରେ',
        'jeeva_use_c1_desc': '<strong>୨୦୦ ଲିଟର / ଏକର</strong> | ଜଳସେଚନ ପାଣି ସହିତ ମାସକୁ ଥରେ ପ୍ରୟୋଗ କରନ୍ତୁ |',
        'jeeva_use_c2_title': 'ପତ୍ର ସ୍ପ୍ରେ',
        'jeeva_use_c2_desc': '<strong>୧୦% ମିଶ୍ରଣ</strong> | ୧ ଲିଟର ଛଣା ଯାଇଥିବା ଜୀବାମୃତ ୧୦ ଲିଟର ପାଣିରେ ମିଶାନ୍ତୁ | ପ୍ରତି ୨୧ ଦିନରେ ସ୍ପ୍ରେ କରନ୍ତୁ |',
        'jeeva_use_c3_title': 'ସାବଧାନ',
        'jeeva_use_c3_desc': 'ପ୍ରସ୍ତୁତିର <strong>୧୨ ଦିନ</strong> ମଧ୍ୟରେ ବ୍ୟବହାର କରନ୍ତୁ | ରାସାୟନିକ ଔଷଧ ସହିତ ମିଶାନ୍ତୁ ନାହିଁ |',
        'jeeva_buy_badge': 'ଜୀବନ୍ତ କଲଚର୍',
        'jeeva_buy_title': 'ଆଜି ଆପଣଙ୍କ ମାଟିର ଉନ୍ନତି କରନ୍ତୁ',
        'jeeva_buy_desc': 'ତାଜା ଜୀବାମୃତ କଲଚର୍ ଅର୍ଡର କରନ୍ତୁ | ଡେଲିଭରି ସମୟରେ ଅଧିକତମ ଅଣୁଜୀବ ସଂଖ୍ୟା ନିଶ୍ଚିତ କରିବାକୁ ଅର୍ଡର ପରେ ପ୍ରସ୍ତୁତ କରାଯାଏ |',
        'jeeva_buy_list1': '📦 ୫ / ୧୦ / ୨୦ ଲିଟର ଜାର୍',
        'jeeva_buy_list2': '⏳ କାର୍ଯ୍ୟକାରୀ ସମୟ: ୧୨ ଦିନ',
        'jeeva_buy_list3': '🐮 ଦେଶୀ ଗାଈ ଉତ୍ସ',
        'jeeva_buy_list4': '🧊 ଥଣ୍ଡା ପରିବହନ',
        'jeeva_buy_price': '₹୨୦ ରୁ ଆରମ୍ଭ',
        'jeeva_buy_unit': '/ ଲିଟର',
        'jeeva_buy_btn': 'ବର୍ତ୍ତମାନ ଅର୍ଡର କରନ୍ତୁ →',
        'jeeva_ing_c4_title': 'ମୁଠାଏ ମାଟି',
        'jeeva_ing_c4_desc': 'ବିବିଧତା | ମିଶ୍ରଣରେ ସ୍ଥାନୀୟ ମାଟିର ନିର୍ଦ୍ଦିଷ୍ଟ ଅଣୁଜୀବ ସୃଷ୍ଟି କରେ |',
        'jeeva_proc_title': 'ପ୍ରସ୍ତୁତି ପ୍ରକ୍ରିୟା',
        'jeeva_proc_subtitle': 'ପରିବର୍ତ୍ତନ ଛାଇରେ ଘଟେ |',
        'jeeva_proc_s1_title': 'ମିଶ୍ରଣ (The Mixture)',
        'jeeva_proc_s1_desc': 'ସମସ୍ତ ଉପାଦାନକୁ ୨୦୦ ଲିଟର ପ୍ଲାଷ୍ଟିକ୍ ଡ୍ରମରେ ମିଶାନ୍ତୁ (ଧାତୁ ପାତ୍ର ବ୍ୟବହାର କରନ୍ତୁ ନାହିଁ) | ପାଣିରେ ଭରନ୍ତୁ | ଛାଇରେ ରଖନ୍ତୁ |',
        'jeeva_proc_s2_title': 'ଘଣ୍ଟା ଦିଗରେ ଘାଣ୍ଟିବା',
        'jeeva_proc_s2_desc': 'ଦ୍ରବଣକୁ ଦିନକୁ ଦୁଇଥର ୧୦ ମିନିଟ୍ ପାଇଁ ଘଣ୍ଟା ଦିଗରେ ଘାଣ୍ଟନ୍ତୁ | ଏହା ଏକ ଘୂର୍ଣ୍ଣି ସୃଷ୍ଟି କରେ, ଯାହା ଡ୍ରମର ଗଭୀରତାକୁ ଅମ୍ଳଜାନ ଟାଣିନିଏ |',
        'jeeva_proc_s3_title': 'ବୃଦ୍ଧି (୪୮ ଘଣ୍ଟା)',
        'jeeva_proc_s3_desc': 'ତୃତୀୟ ଦିନ ସୁଦ୍ଧା, ଫାର୍ମେଣ୍ଟେସନ୍ ଶୀର୍ଷରେ ପହଞ୍ଚେ | ଅଣୁଜୀବ ସଂଖ୍ୟା ଦ୍ରୁତ ଗତିରେ ବଢେ | ଏକ ମିଠା, ଫାର୍ମେଣ୍ଟେଡ୍ ବାସ୍ନା ସୂଚାଏ ଯେ ଏହା ପ୍ରସ୍ତୁତ |',
        'jeeva_proc_s4_title': 'ପ୍ରୟୋଗ',
        'jeeva_proc_s4_desc': '୭ ଦିନ ମଧ୍ୟରେ ବ୍ୟବହାର କରନ୍ତୁ | ଜଳସେଚନ ପାଣି ସହିତ କିମ୍ବା ପତ୍ର ଉପରେ ସ୍ପ୍ରେ (ଛାଣି କରି) କରନ୍ତୁ |',
        'jeeva_nut_title': 'ଅଣୁଜୀବ ଯୁଦ୍ଧ',
        'jeeva_nut_h3': 'ପ୍ରତିରକ୍ଷା ଢାଲ',
        'jeeva_nut_p1': 'ଆଧୁନିକ କୃଷି ମାଟିରେ "ଭଲ ବନ୍ଧୁ" ଙ୍କ ଅଭାବରୁ କଷ୍ଟ ପାଉଛି | ରୋଗକାରକ ଜୀବାଣୁ ବନ୍ଧ୍ୟା ମାଟିରେ ବଢନ୍ତି | ଜୀବାମୃତ କ୍ଷେତକୁ ଉପକାରୀ ଜୀବାଣୁରେ ଭରିଦିଏ |',
        'jeeva_nut_t_l_label': 'ନାଇଟ୍ରୋଜେନ୍ ଫିକ୍ସର୍',
        'jeeva_nut_t_l_desc': 'ଆଜୋଟୋବ୍ୟାକ୍ଟର ଏବଂ ରାଇଜୋବିୟମ୍ ପବନରୁ ନାଇଟ୍ରୋଜେନ୍ ଟାଣି ଆଣନ୍ତି |',
        'jeeva_nut_t_p_label': 'ଫସଫେଟ୍ ଦ୍ରବଣକାରୀ',
        'jeeva_nut_t_p_desc': 'ପଥର/ମାଟିରେ ଆବଦ୍ଧ ଥିବା ଫସଫରସ୍ କୁ ତରଳାଇ ଦିଏ |',
        'jeeva_nut_t_psi_label': 'ସ୍ୟୁଡୋମୋନାସ୍',
        'jeeva_nut_t_psi_desc': 'ଚେରକୁ କବକ ରୋଗରୁ ରକ୍ଷା କରେ |',
        'jeeva_nut_t_tri_label': 'ଟ୍ରାଇକୋଡର୍ମା',
        'jeeva_nut_t_tri_desc': 'ଏକ ପ୍ରସିଦ୍ଧ ଆଣ୍ଟି-ଫଙ୍ଗାଲ୍ ଏଜେଣ୍ଟ |',
        'jeeva_comp_subtitle': 'ରାସାୟନିକ ସାର ଗଛକୁ ବଳପୂର୍ବକ ଖୁଆଏ କିନ୍ତୁ ମାଟିକୁ ମାରିଦିଏ | ଜୀବାମୃତ ମାଟିକୁ ଖାଦ୍ୟ ଦିଏ, ଯାହା ଗଛକୁ ସବୁଦିନ ପାଇଁ ଖାଦ୍ୟ ଯୋଗାଏ |',
        'jeeva_comp_bad': 'ୟୁରିଆ / ଡିଏପି',
        'jeeva_comp_bad_desc': 'ଲୁଣ ଜମା ହୁଏ | ଜିଆ ମରିଯାଆନ୍ତି | ମାଟି କଂକ୍ରିଟ୍ ପରି ଶକ୍ତ ହୋଇଯାଏ |',
        'jeeva_comp_good': 'ଜୀବାମୃତ',
        'jeeva_comp_good_desc': 'ମାଟି ନରମ ଏବଂ ଛିଦ୍ରଯୁକ୍ତ ହୁଏ | ଜିଆ ଫେରି ଆସନ୍ତି | ଜଳ ଧାରଣ କ୍ଷମତା ଦ୍ୱିଗୁଣିତ ହୁଏ |',
        // Shared Related Products
        'related_title': 'ଆପଣଙ୍କ କିଟ୍ ସମ୍ପୂର୍ଣ୍ଣ କରନ୍ତୁ',
        'related_vermi_title': 'ଭର୍ମିକମ୍ପୋଷ୍ଟ',
        'related_vermi_desc': 'କଠିନ ପୋଷଣ ଏବଂ ଜୈବିକ କାର୍ବନ ମୂଳଦୁଆ |',
        'related_jeeva_title': 'ଜୀବାମୃତ',
        'related_jeeva_desc': 'ରୋଗ ପ୍ରତିରୋଧକ ଶକ୍ତି ପାଇଁ ତରଳ ଅଣୁଜୀବ କଲଚର୍ |',
        'related_nimastra_title': 'ନିମାସ୍ତ୍ର',
        'related_nimastra_desc': 'ନରମ ଶରୀର ବିଶିଷ୍ଟ ପୋକ ବିରୁଦ୍ଧରେ ପ୍ରଥମ ସୁରକ୍ଷା |',
        'related_brahma_title': 'ବ୍ରହ୍ମାସ୍ତ୍ର',
        'related_brahma_desc': 'ବଡ ପୋକ ଏବଂ ବୋରର୍ ବିରୁଦ୍ଧରେ ଚରମ ସୁରକ୍ଷା |',
        // Marketplace Banner
        'market_banner_title': 'ଆମର ପ୍ରିମିୟମ୍ ମାର୍କେଟପ୍ଲେସ୍ ପରିଦର୍ଶନ କରନ୍ତୁ',
        'market_banner_desc': 'ଆମର ସମ୍ପୂର୍ଣ୍ଣ ଜୈବିକ ଉତ୍ପାଦ ସଂଗ୍ରହ ଦେଖନ୍ତୁ, ତୁଳନା କରନ୍ତୁ ଏବଂ ସିଧାସଳଖ ଅନଲାଇନ୍ ଅର୍ଡର କରନ୍ତୁ |',
        'market_banner_btn': 'ଷ୍ଟୋର୍ ଦେଖନ୍ତୁ',
        // Nimastra Page
        'nima_hero_label': 'ପ୍ରକୃତିର ଢାଲ',
        'nima_hero_title': 'ନିମାସ୍ତ୍ର',
        'nima_hero_subtitle': 'ଚୋଷକ ପୋକ ବିରୁଦ୍ଧରେ ଚରମ ବ୍ୟାପକ-ସ୍ପେକ୍ଟ୍ରମ୍ ଉଦ୍ଭିଦ ବିକର୍ଷକ |',
        'nima_intro_title': 'ପିତା ସୁରକ୍ଷା',
        'nima_intro_p1': 'ନିମାସ୍ତ୍ର ମୁଖ୍ୟତଃ ଚମତ୍କାରୀ ଗଛ: <strong>ନିମ୍ବ</strong> ରୁ ପ୍ରାପ୍ତ ହୁଏ | ରାସାୟନିକ ବିଷ ବିପରୀତ ଯାହା ତୁରନ୍ତ ମାରିଦିଏ, ନିମାସ୍ତ୍ର ବୁଦ୍ଧିମାନ ଭାବରେ କାମ କରେ |',
        'nima_intro_p2': 'ଏଥିରେ <strong>Azadirachtin</strong> ଥାଏ, ଯାହା ଏକ ଆଣ୍ଟି-ଫିଡାଣ୍ଟ ଭାବରେ କାମ କରେ | ସ୍ପ୍ରେ କରାଗଲେ, ଏହା ଗଛକୁ ଅସ୍ୱାଦିଷ୍ଟ କରିଦିଏ | ପୋକମାନେ ଖାଇବା ବନ୍ଦ କରନ୍ତି ଏବଂ ଭୋକରେ ମରନ୍ତି |',
        'nima_ing_title': '୧୦୦% ଜୈବିକ ଫର୍ମୁଲା',
        'nima_ing_c1_title': 'ନିମ୍ବ ପତ୍ର ଓ ମଞ୍ଜି',
        'nima_ing_c1_desc': 'ଚୂର୍ଣ୍ଣ ହୋଇଥିବା ପତ୍ର ଏବଂ ମଞ୍ଜି Azadirachtin ର ସର୍ବୋଚ୍ଚ ଏକାଗ୍ରତା ପ୍ରଦାନ କରେ |',
        'nima_ing_c2_title': 'ଗୋମୂତ୍ର',
        'nima_ing_c2_desc': 'କୀଟନାଶକ ଭାବରେ କାମ କରେ ଏବଂ ଏହାର ତୀବ୍ର ଗନ୍ଧ ପ୍ରାକୃତିକ ଭାବରେ ଅନେକ ପୋକକୁ ଦୂର କରେ |',
        'nima_ing_c3_title': 'ଗୋବର',
        'nima_ing_c3_desc': 'ନିମ୍ବର ଔଷଧୀୟ ଗୁଣ ବାହାର କରିବାରେ ସାହାଯ୍ୟ କରୁଥିବା ଅଣୁଜୀବ ପ୍ରଦାନ କରେ |',
        'nima_ben_title': 'ଏହା ବିରୁଦ୍ଧରେ ରକ୍ଷା କରେ',
        'nima_ben_c1_title': '🦟 ଚୋଷକ ପୋକ',
        'nima_ben_c1_desc': 'ଜାଉପୋକ, ଧଳାମାଛି ଏବଂ ଥ୍ରିପ୍ସ ବିରୁଦ୍ଧରେ ଅତ୍ୟନ୍ତ ପ୍ରଭାବଶାଳୀ ଯାହା କଅଁଳ ପତ୍ରରୁ ରସ ଚୋଷି ନିଅନ୍ତି |',
        'nima_ben_c2_title': '🐛 ପ୍ରାରମ୍ଭିକ ଲାର୍ଭା',
        'nima_ben_c2_desc': 'ଛୋଟ ଶୁକ ନିଜର ପ୍ରାରମ୍ଭିକ ଅବସ୍ଥାରେ ନିୟନ୍ତ୍ରଣ କରେ |',
        'nima_ben_c3_title': '🐝 ଇକୋ-ସେଫ୍',
        'nima_ben_c3_desc': 'ମହୁମାଛି ଏବଂ ପ୍ରଜାପତି ପରି ପରାଗ ସଙ୍ଗମକାରୀଙ୍କ ପାଇଁ କ୍ଷତିକାରକ ନୁହେଁ |',
        'nima_use_title': 'ପ୍ରୟୋଗ ବିଧି',
        'nima_use_c1_title': 'ପ୍ରତିଷେଧକ ସ୍ପ୍ରେ',
        'nima_use_c1_desc': 'ପୋକମାନଙ୍କୁ ଦୂରରେ ରଖିବା ପାଇଁ ପ୍ରତି <strong>୧୫ ଦିନରେ</strong> ଥରେ ସ୍ପ୍ରେ କରନ୍ତୁ |',
        'nima_use_c2_title': 'ଉପଚାର ସ୍ପ୍ରେ',
        'nima_use_c2_desc': 'ଯଦି ପୋକ ଦେଖାଯାଏ, ତେବେ ଜନସଂଖ୍ୟା ନିୟନ୍ତ୍ରଣ ହେବା ପର୍ଯ୍ୟନ୍ତ ପ୍ରତି <strong>୭ ଦିନରେ</strong> ସ୍ପ୍ରେ କରନ୍ତୁ | ୧ ଲିଟର ନିମାସ୍ତ୍ର ୧୫ ଲିଟର ପାଣିରେ ମିଶାନ୍ତୁ |',
        'nima_use_c3_title': 'ଜରୁରୀ ସୂଚନା',
        'nima_use_c3_desc': 'ନୋଜଲ୍ ବନ୍ଦ ନହେବା ପାଇଁ ସ୍ପ୍ରେ ଟ୍ୟାଙ୍କରେ ପୁରାଇବା ପୂର୍ବରୁ ସର୍ବଦା ଏକ କପଡା ସହିତ ମିଶ୍ରଣକୁ ଛାଣନ୍ତୁ |',
        'nima_buy_badge': 'ଜୈବିକ କୀଟନାଶକ',
        'nima_buy_title': 'ଆପଣଙ୍କ ଅମଳ ସୁରକ୍ଷିତ କରନ୍ତୁ',
        'nima_buy_desc': 'ପୋକମାନଙ୍କୁ ଆପଣଙ୍କ ପରିଶ୍ରମ ନଷ୍ଟ କରିବାକୁ ଦିଅନ୍ତୁ ନାହିଁ | ରାସାୟନିକ ମୁକ୍ତ ଏବଂ ପ୍ରଭାବଶାଳୀ ସୁରକ୍ଷା ପାଇଁ ନିମାସ୍ତ୍ର ବ୍ୟବହାର କରନ୍ତୁ |',
        'nima_buy_list1': '📦 ୧ / ୫ ଲିଟର ବୋତଲ',
        'nima_buy_list2': '🛡️ ୬ ମାସ ରଖିହେବ',
        'nima_buy_list3': '🌿 ୧୦୦% ବନସ୍ପତି',
        'nima_buy_list4': '🚫 କୌଣସି ରାସାୟନିକ ଅବଶେଷ ନାହିଁ',
        'nima_buy_price': '₹୧୦୦ ରୁ ଆରମ୍ଭ',
        'nima_buy_unit': '/ ଲିଟର',
        'nima_buy_btn': 'ବର୍ତ୍ତମାନ ଅର୍ଡର କରନ୍ତୁ →',
        'nima_proc_title': 'ନିଷ୍କାସନ ପ୍ରକ୍ରିୟା',
        'nima_proc_subtitle': 'ସକ୍ରିୟ ଯୌଗିକ ସଂରକ୍ଷଣ ପାଇଁ ଥଣ୍ଡା ନିଷ୍କାସନ |',
        'nima_proc_s1_title': 'ଚୂର୍ଣ୍ଣ (The Crush)',
        'nima_proc_s1_desc': 'ନିମ୍ବ ପତ୍ରକୁ ମିହୀ ପେଷ୍ଟରେ ପରିଣତ କରନ୍ତୁ | ପେଷ୍ଟ ଯେତେ ମିହୀ ହେବ, ରୋଗ ପ୍ରତିରୋଧକ ଶକ୍ତି ସେତେ ଅଧିକ ହେବ (ଚଟଣି ପରି) |',
        'nima_proc_s2_title': 'ମିଶ୍ରଣ (The Mix)',
        'nima_proc_s2_desc': 'ପେଷ୍ଟକୁ ଗୋମୂତ୍ର ଏବଂ ଗୋବର ସହିତ ଏକ ପ୍ଲାଷ୍ଟିକ୍ ଡ୍ରମରେ ମିଶାନ୍ତୁ | ୧୦୦ ଲିଟର ପାଣି ମିଶାନ୍ତୁ | ଘଣ୍ଟା ଦିଗରେ ଘାଣ୍ଟନ୍ତୁ |',
        'nima_proc_s3_title': 'ଫାର୍ମେଣ୍ଟେସନ୍ (୪୮ ଘଣ୍ଟା)',
        'nima_proc_s3_desc': 'ଛାଇରେ ରଖନ୍ତୁ | ଦିନକୁ ଦୁଇଥର ଘାଣ୍ଟନ୍ତୁ | ଗୋବରର ଅଣୁଜୀବ ପତ୍ରକୁ ଭାଙ୍ଗିଦେବେ ଏବଂ ସେଥିରୁ ରସ ବାହାର କରିବେ |',
        'nima_proc_s4_title': 'ଛାଣିବା (The Filter)',
        'nima_proc_s4_desc': 'କପଡା ବ୍ୟବହାର କରି ଦୁଇଥର ଛାଣନ୍ତୁ | ଏହା ଗୁରୁତ୍ୱପୂର୍ଣ୍ଣ! କୌଣସି କଠିନ କଣିକା ଆପଣଙ୍କ ସ୍ପ୍ରେୟାର ନୋଜଲ୍ ବନ୍ଦ କରିପାରେ |',
        'nima_sci_title': 'ଏହା କିପରି କାମ କରେ',
        'nima_sci_h3': 'ପ୍ରଣାଳୀଗତ ପ୍ରତିରକ୍ଷା',
        'nima_sci_p1': 'ନିମାସ୍ତ୍ର କେବଳ ପତ୍ର ଉପରେ ବସେ ନାହିଁ | ଏହା ଆଂଶିକ ଶୋଷିତ ହୁଏ, ଯାହା ଗଛର ରସକୁ ଟିକିଏ ପିତା କରିଦିଏ | ଏହା ଦୀର୍ଘସ୍ଥାୟୀ ସୁରକ୍ଷା ପ୍ରଦାନ କରେ |',
        'nima_sci_c1_title': '🛑 ଆଣ୍ଟି-ଫିଡାଣ୍ଟ',
        'nima_sci_c1_desc': 'ପୋକମାନେ ଭୋକ ହରାନ୍ତି ଏବଂ ଭୋକରେ ମରନ୍ତି |',
        'nima_sci_c2_title': '🦋 ଅଣ୍ଡା ଦେବାରେ ବାଧା',
        'nima_sci_c2_desc': 'ପ୍ରଜାପତି ଏବଂ ମାଛି ନିମାସ୍ତ୍ର ଦ୍ୱାରା ଚିକିତ୍ସିତ ପତ୍ରରେ ଅଣ୍ଡା ଦେବାକୁ ମନା କରନ୍ତି |',
        'nima_sci_c3_title': '🌱 ବୃଦ୍ଧି ନିୟନ୍ତ୍ରକ',
        'nima_sci_c3_desc': 'ଲାର୍ଭାକୁ ବୟସ୍କ ହେବାରୁ ରୋକିଥାଏ |',
        'nima_target_title': 'ମୁଖ୍ୟ ଲକ୍ଷ୍ୟ',
        'nima_target_c1': '🦟 ଜାଉପୋକ ଓ ଜ୍ୟାସିଡ୍',
        'nima_target_c1_desc': 'ଚୋଷକ ପୋକ ଯାହା ପତ୍ରକୁ ମୋଡ଼ି ଦିଏ | ନିମାସ୍ତ୍ର ସେମାନଙ୍କୁ ୨ ଟି ସ୍ପ୍ରେରେ ସଫା କରେ |',
        'nima_target_c2': '⬜ ଧଳାମାଛି',
        'nima_target_c2_desc': 'ଭାଇରାଲ୍ ରୋଗର ବାହକ | ନିମାସ୍ତ୍ର ସେମାନଙ୍କ ବଂଶବୃଦ୍ଧି ଚକ୍ରକୁ ଭାଙ୍ଗିଦିଏ |',
        'nima_target_c3': '🐛 ଛୋଟ ଶୁକ (Caterpillars)',
        'nima_target_c3_desc': 'ବଡ ହେବା ପୂର୍ବରୁ ପ୍ରାରମ୍ଭିକ ଅବସ୍ଥାରେ ଥିବା ଲାର୍ଭା ବିରୁଦ୍ଧରେ ପ୍ରଭାବଶାଳୀ |',
        // Brahmastra Page
        'brahma_hero_label': 'ଚରମ ଅସ୍ତ୍ର',
        'brahma_hero_title': 'ବ୍ରହ୍ମାସ୍ତ୍ର',
        'brahma_hero_subtitle': 'ଭାରୀ ସଂକ୍ରମଣ, ବିନ୍ଧା ପୋକ ଏବଂ ଶୁକ ବିରୁଦ୍ଧରେ ଶକ୍ତିଶାଳୀ ଜୈବିକ ସୁରକ୍ଷା |',
        'brahma_intro_title': 'ସଠିକ ପ୍ରତିରକ୍ଷା',
        'brahma_intro_p1': 'ଯେପରି ନାମ ସୂଚାଏ (ବ୍ରହ୍ମା + ଅସ୍ତ୍ର), ଏହା ଜିଦ୍ଦି ପୋକମାନଙ୍କ ପାଇଁ ଚରମ ସମାଧାନ | ଏହା ଗୋମୂତ୍ରରେ ସିଝା ଯାଇଥିବା ପାଞ୍ଚଟି ନିର୍ଦ୍ଦିଷ୍ଟ ପିତା ପତ୍ରର ଏକ ଶକ୍ତିଶାଳୀ ମିଶ୍ରଣ |',
        'brahma_intro_p2': 'ବ୍ରହ୍ମାସ୍ତ୍ର ପୋକ ପାଇଁ ପେଟ ବିଷ ଏବଂ ସ୍ନାୟୁ ବିଷ ଭାବରେ କାମ କରେ, ତଥାପି ଏହା ସମ୍ପୂର୍ଣ୍ଣ ଜୈବିକ ଏବଂ ମାଟି ପାଇଁ ସୁରକ୍ଷିତ |',
        'brahma_ing_title': 'ପାଞ୍ଚ ପତ୍ରର ଶକ୍ତି',
        'brahma_ing_c1_title': 'ନିମ୍ବ ଓ ଜଡା',
        'brahma_ing_c1_desc': 'ମିଶ୍ରଣର ମୂଳଦୁଆ | ଜଡା ପତ୍ରରେ Ricin ଥାଏ, ଯାହା ଅନେକ ପୋକଙ୍କ ପାଇଁ ବିଷାକ୍ତ ଅଟେ |',
        'brahma_ing_c2_title': 'ଆତ ଓ ଅମୃତଭଣ୍ଡା',
        'brahma_ing_c2_desc': 'ପତ୍ରରେ ବିଭିନ୍ନ ଆଲକାଲଏଡ୍ ଥାଏ ଯାହା ଶୁକର ହଜମ ପ୍ରକ୍ରିୟାକୁ ନଷ୍ଟ କରିଦିଏ |',
        'brahma_ing_c3_title': 'ଦୁଦୁରା / ନାଗରା',
        'brahma_ing_c3_desc': 'ଅତ୍ୟନ୍ତ ଶକ୍ତିଶାଳୀ ଜଙ୍ଗଲୀ ଉଦ୍ଭିଦ ଯାହା ପୋକଙ୍କ ପାଇଁ ସ୍ନାୟୁ ଏଜେଣ୍ଟ ଭାବରେ କାମ କରେ |',
        'brahma_ben_title': 'ଶକ୍ତିଶାଳୀ ନିୟନ୍ତ୍ରଣ',
        'brahma_ben_c1_title': '🐛 ବଡ ଶୁକ',
        'brahma_ben_c1_desc': 'Helicoverpa ଏବଂ Spodoptera ଲାର୍ଭା ବିରୁଦ୍ଧରେ ପ୍ରଭାବଶାଳୀ ଯାହା ବ୍ୟାପକ ପତ୍ର ଖାଆନ୍ତି |',
        'brahma_ben_c2_title': '🪵 କାଣ୍ଡ ଓ ଫଳ ବିନ୍ଧା',
        'brahma_ben_c2_desc': 'ଭିତରେ ଥିବା ପୋକଙ୍କୁ ନିୟନ୍ତ୍ରଣ କରେ ଯାହା କାଣ୍ଡ ଏବଂ ଫଳିରେ ଥାଆନ୍ତି, ଯେଉଁଠାରେ ସାଧାରଣ ସ୍ପ୍ରେ ପହଞ୍ଚିପାରେ ନାହିଁ |',
        'brahma_ben_c3_title': '🪲 କଠିନ ଖୋଳ ବିଶିଷ୍ଟ ପୋକ',
        'brahma_ben_c3_desc': 'ଶକ୍ତିଶାଳୀ ଫର୍ମୁଲା କଠିନ ଖୋଳ ଥିବା ପୋକଙ୍କୁ ମଧ୍ୟ ପ୍ରଭାବିତ କରେ ଯାହା ନିମାସ୍ତ୍ର ପ୍ରତିରୋଧୀ ହୋଇପାରେ |',
        'brahma_use_title': 'ପ୍ରୟୋଗ ବିଧି',
        'brahma_use_c1_title': 'କେବଳ ଉପଚାର ପାଇଁ',
        'brahma_use_c1_desc': '<strong>କେବଳ</strong> ଯେତେବେଳେ ସଂକ୍ରମଣ ଗୁରୁତର ହୁଏ ସେତେବେଳେ ବ୍ୟବହାର କରନ୍ତୁ | ନିମାସ୍ତ୍ର ପରି ନିୟମିତ ପ୍ରତିଷେଧକ ଭାବରେ ବ୍ୟବହାର କରନ୍ତୁ ନାହିଁ |',
        'brahma_use_c2_title': 'ମାତ୍ରା',
        'brahma_use_c2_desc': '<strong>୨.୫% ରୁ ୩% ମିଶ୍ରଣ</strong> | ୧୫ ଲିଟର ସ୍ପ୍ରେ ଟ୍ୟାଙ୍କରେ ୩୦୦-୪୫୦ ମିଲି ବ୍ରହ୍ମାସ୍ତ୍ର ମିଶାନ୍ତୁ |',
        'brahma_use_c3_title': 'ସାବଧାନ',
        'brahma_use_c3_desc': 'ଦସ୍ତାନା ପିନ୍ଧନ୍ତୁ | ଅମଳର <strong>୭ ଦିନ</strong> ପୂର୍ବରୁ ସ୍ପ୍ରେ ବନ୍ଦ କରନ୍ତୁ | ଜୀବାମୃତ ସହିତ ମିଶାନ୍ତୁ ନାହିଁ |',
        'brahma_buy_badge': 'ଉଚ୍ଚ ଶକ୍ତି',
        'brahma_buy_title': 'ଚରମ ଫସଲ ସୁରକ୍ଷା',
        'brahma_buy_desc': 'ଯେତେବେଳେ ଅନ୍ୟ ଉପାୟ ବିଫଳ ହୁଏ, ବ୍ରହ୍ମାସ୍ତ୍ର ଉପରେ ବିଶ୍ୱାସ କରନ୍ତୁ | ଆମ ପାଖରେ ଥିବା ସବୁଠାରୁ ଶକ୍ତିଶାଳୀ ଜୈବିକ ଫର୍ମୁଲା |',
        'brahma_buy_list1': '📦 ୧ / ୫ ଲିଟର ପ୍ୟାକ୍',
        'brahma_buy_list2': '⏳ ୬ ମାସ ସ୍ଥିରତା',
        'brahma_buy_list3': '🍃 ୫-ପତ୍ର ଫର୍ମୁଲା',
        'brahma_buy_list4': '⚠️ ସାବଧାନତାର ସହ ବ୍ୟବହାର କରନ୍ତୁ',
        'brahma_buy_price': '₹୧୫୦ ରୁ ଆରମ୍ଭ',
        'brahma_buy_unit': '/ ଲିଟର',
        'brahma_buy_btn': 'ବର୍ତ୍ତମାନ ଅର୍ଡର କରନ୍ତୁ →',
        'brahma_ing_c4_title': 'ଗୋମୂତ୍ର',
        'brahma_ing_c4_desc': 'ନିଷ୍କାସନ ମାଧ୍ୟମ | ପାଣି ପରିବର୍ତ୍ତେ, ମୂତ୍ରରେ ଫୁଟାଇବା ଦ୍ୱାରା ଆଲକାଲଏଡର ନିଷ୍କାସନ ତୀବ୍ର ହୁଏ |',
        'brahma_proc_title': 'ଅଗ୍ନି ରୀତି (ଫୁଟାଇବା ପ୍ରକ୍ରିୟା)',
        'brahma_proc_subtitle': 'ତାପଜ ନିଷ୍କାସନ ସର୍ବୋଚ୍ଚ ଶକ୍ତି ନିର୍ଗତ କରେ |',
        'brahma_proc_s1_title': 'ଚୂର୍ଣ୍ଣ (The Crush)',
        'brahma_proc_s1_desc': 'ପୃଷ୍ଠଭାଗର କ୍ଷେତ୍ରଫଳ ବୃଦ୍ଧି କରିବାକୁ ସମସ୍ତ ୫ ପ୍ରକାରର ପତ୍ରକୁ ଛୋଟ ଛୋଟ ଖଣ୍ଡରେ କାଟନ୍ତୁ କିମ୍ବା ପେଷ୍ଟ କରନ୍ତୁ |',
        'brahma_proc_s2_title': 'ମିଶ୍ରଣ (The Mix)',
        'brahma_proc_s2_desc': 'କଟା ପତ୍ରକୁ ଏକ ବଡ ଧାତୁ ପାତ୍ର (ତମ୍ବା / ପିତ୍ତଳ କିମ୍ବା ଷ୍ଟିଲ୍) ରେ ୧୦ ଲିଟର ଗୋମୂତ୍ରରେ ପକାନ୍ତୁ |',
        'brahma_proc_s3_title': 'ଫୁଟାଇବା (The Boil)',
        'brahma_proc_s3_desc': 'ମିଶ୍ରଣକୁ କମ୍ ନିଆଁରେ ଫୁଟାନ୍ତୁ ଯେପର୍ଯ୍ୟନ୍ତ ଶକ୍ତିଶାଳୀ ଧୂଆଁ ବାହାରିବ ନାହିଁ (ପ୍ରାୟ ୧ ଘଣ୍ଟା) | ମ୍ୟାରିନେଟ୍ ହେବା ପାଇଁ ଏହାକୁ ୨୪ ଘଣ୍ଟା ଥଣ୍ଡା ହେବାକୁ ଦିଅନ୍ତୁ |',
        'brahma_proc_s4_title': 'ଭଣ୍ଡାରଣ (The Storage)',
        'brahma_proc_s4_desc': 'ଗାଢ, ଏକାଗ୍ର ତରଳ ପଦାର୍ଥକୁ ଛାଣନ୍ତୁ | ଏହାକୁ ବୋତଲରେ <strong>୬ ମାସ</strong> ପର୍ଯ୍ୟନ୍ତ ରଖାଯାଇପାରିବ |',
        'brahma_sci_title': 'ଲକ୍ଷ୍ୟ',
        'brahma_sci_h3': 'ସ୍ନାୟୁଗତ ବ୍ୟାଘାତ',
        'brahma_sci_p1': 'ଏହା ବିକର୍ଷକ ନୁହେଁ; ଏହା ପୋକମାନଙ୍କ ପାଇଁ ଏକ ସ୍ପର୍ଶ ଏବଂ ପେଟ ବିଷ | ଆଲକାଲଏଡଗୁଡିକ ପୋକର ପେଟ ରିସେପ୍ଟର ସହିତ ବାନ୍ଧି ହୋଇଯାଏ, ଯାହା ଦ୍ୱାରା ସେମାନେ ତୁରନ୍ତ ଖାଇବା ବନ୍ଦ କରନ୍ତି |',
        'brahma_sci_target1_title': 'ଲକ୍ଷ୍ୟ: କାଣ୍ଡ ବିନ୍ଧା',
        'brahma_sci_target1_desc': 'ଲୁଚି ରହିଥିବା ଲାର୍ଭା ପାଖରେ ପହଞ୍ଚିବା ପାଇଁ କାଣ୍ଡ ଟିସୁରେ ପ୍ରବେଶ କରେ |',
        'brahma_sci_target2_title': 'ଲକ୍ଷ୍ୟ: ଫଳ ବିନ୍ଧା',
        'brahma_sci_target2_desc': 'ଟମାଟୋ ଏବଂ ବାଇଗଣ ଫଳ ବିନ୍ଧା (borers) ପାଇଁ ଉତ୍ତମ |',
        'brahma_warning_title': 'ସାବଧାନତାର ସହ ବ୍ୟବହାର କରନ୍ତୁ',
        'brahma_warning_desc': 'ବ୍ରହ୍ମାସ୍ତ୍ର ଶକ୍ତିଶାଳୀ ଅଟେ | ଅତ୍ୟଧିକ ବ୍ୟବହାର ମାଟିର ଅଣୁଜୀବକୁ ପ୍ରଭାବିତ କରିପାରେ | ଏହାକୁ ଆଣ୍ଟିବାୟୋଟିକ୍ ପରି ବ୍ୟବହାର କରନ୍ତୁ - କେବଳ ଆବଶ୍ୟକ ହେଲେ ବ୍ୟବହାର କରନ୍ତୁ |',
        'brahma_warn_c1_title': '⚠️ କେବଳ ଉପଚାର ପାଇଁ',
        'brahma_warn_c1_desc': 'ପ୍ରତିଷେଧକ (preventive) ଉପାୟ ଭାବରେ ସ୍ପ୍ରେ କରନ୍ତୁ ନାହିଁ | କେବଳ ସେତେବେଳେ ବ୍ୟବହାର କରନ୍ତୁ ଯେତେବେଳେ ଆପଣ ପୋକ ଦ୍ୱାରା କ୍ଷତି ଦେଖିବେ |',
        'brahma_warn_c2_title': '🧤 ସୁରକ୍ଷା ଗିଅର୍',
        'brahma_warn_c2_desc': 'ଏହା ଏକ ଶକ୍ତିଶାଳୀ ଉତ୍ତେଜକ | ସ୍ପ୍ରେ କରିବା ସମୟରେ ଦସ୍ତାନା ଏବଂ ମାସ୍କ ପିନ୍ଧନ୍ତୁ |',
        'brahma_warn_c3_title': '🌜 ସନ୍ଧ୍ୟା ସ୍ପ୍ରେ',
        'brahma_warn_c3_desc': 'ମହୁମାଛିଙ୍କୁ କ୍ଷତି ପହଞ୍ଚାଇବା ଠାରୁ ଦୂରେଇ ରହିବା ପାଇଁ ସୂର୍ଯ୍ୟାସ୍ତ ପରେ ସ୍ପ୍ରେ କରନ୍ତୁ |'
    },
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
// Consolidated with main listener
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
                <button class="chat-option" onclick="window.location.href='marketplace.html'">
                    <span class="icon">🛒</span> <span data-i18n="chat_opt_market">Visit Marketplace</span>
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

// Initialize Chatbot on Load
// Chatbot init moved to main listener
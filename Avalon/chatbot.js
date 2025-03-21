import { GoogleGenerativeAI } from "@google/generative-ai";

const businessInfo = `
Medicinal plant Information:
Website: https://indiagardening.com/indian-medicinal-plants-and-their-uses-with-pictures/

{
    "aloe vera": {
        "name": "Aloe Vera",
        "scientificName": "Aloe barbadensis miller",
        "uses": [
            "Treating skin burns and wounds",
            "Sunburn relief",
            "Digestive health",
            "Skin moisturizer",
            "Minor skin infections"
        ],
        "preparation": "For skin application, cut open a leaf and extract the gel, applying directly to the affected area. For digestive issues, a small amount of aloe juice can be consumed (1-2 tablespoons), but this should be specifically prepared for internal use.",
        "precautions": "Oral aloe can cause stomach cramps and diarrhea. Not recommended during pregnancy or for people with hemorrhoids, kidney issues, or diabetes. Don't apply to deep wounds."
    },
    "turmeric": {
        "name": "Turmeric",
        "scientificName": "Curcuma longa",
        "uses": [
            "Anti-inflammatory for joint pain",
            "Digestive aid",
            "Immune support",
            "Antioxidant properties",
            "May help with depression"
        ],
        "preparation": "Add to food with black pepper to enhance absorption. For medicinal use, take 500-1000mg of curcumin daily with food. Can be mixed with honey and warm milk ('Golden Milk'). For topical use, make a paste with water or oil.",
        "precautions": "May interact with blood thinners, diabetes medications, and acid reducers. High doses might cause digestive upset. Avoid therapeutic doses during pregnancy."
    },
    "ginger": {
        "name": "Ginger",
        "scientificName": "Zingiber officinale",
        "uses": [
            "Nausea and motion sickness relief",
            "Digestive aid",
            "Anti-inflammatory for muscle pain",
            "Cold and flu symptom relief",
            "May help with menstrual cramps"
        ],
        "preparation": "For tea, steep 1-2 teaspoons of freshly grated ginger in hot water for 5-10 minutes. For nausea, chew on a small piece of fresh ginger. Dried ginger can be taken in capsules (250-500mg, 2-3 times daily).",
        "precautions": "May interact with blood thinners and diabetes medications. Large amounts may cause heartburn or digestive discomfort. Discuss with doctor if pregnant or having gallbladder disease."
    },
    "lavender": {
        "name": "Lavender",
        "scientificName": "Lavandula angustifolia",
        "uses": [
            "Anxiety and stress relief",
            "Sleep improvement",
            "Headache relief",
            "Minor burn and insect bite treatment",
            "Skin conditions like eczema"
        ],
        "preparation": "For aromatherapy, add a few drops of essential oil to a diffuser. For tea, steep 1-2 teaspoons of dried flowers for 5-10 minutes. For skin applications, dilute 3-5 drops of essential oil in 1 tablespoon of carrier oil.",
        "precautions": "Essential oil should not be ingested and should be diluted before applying to skin. May increase drowsiness when combined with sedatives. Avoid during early pregnancy or if you have hormone-sensitive conditions."
    },
    "chamomile": {
        "name": "Chamomile",
        "scientificName": "Matricaria chamomilla",
        "uses": [
            "Sleep aid and insomnia",
            "Digestive comfort",
            "Anxiety reduction",
            "Skin conditions and inflammation",
            "Menstrual pain relief"
        ],
        "preparation": "For tea, steep 1 tablespoon of dried flowers in hot water for 5-10 minutes. For skin conditions, make a strong tea and apply as a compress. For anxiety, drink 1-3 cups of tea daily.",
        "precautions": "Avoid if allergic to plants in the daisy family (ragweed, chrysanthemums). May interact with blood thinners and sedative medications. Generally considered safe during pregnancy in normal tea amounts."
    },
    "peppermint": {
        "name": "Peppermint",
        "scientificName": "Mentha piperita",
        "uses": [
            "Digestive issues including IBS",
            "Headache relief",
            "Nasal congestion and respiratory issues",
            "Bad breath",
            "Muscle pain relief"
        ],
        "preparation": "For tea, steep 1 teaspoon of dried leaves in hot water for 5-10 minutes. For IBS, enteric-coated peppermint oil capsules (0.2-0.4 ml) can be taken between meals. For headaches, diluted peppermint oil can be applied to temples.",
        "precautions": "May worsen acid reflux and heartburn. Essential oil should be diluted before topical use and not applied near the faces of infants or young children. Avoid medicinal amounts during pregnancy."
    },
    "echinacea": {
        "name": "Echinacea",
        "scientificName": "Echinacea purpurea",
        "uses": [
            "Immune system support",
            "Cold and flu prevention",
            "Infection fighting",
            "Wound healing",
            "May help with upper respiratory infections"
        ],
        "preparation": "For tea, steep 1-2 teaspoons of dried herb in hot water for 10-15 minutes. As a tincture, take 1-2 ml three times daily. Capsules typically contain 300-500mg and are taken 3 times daily at first sign of illness.",
        "precautions": "Not recommended for people with autoimmune disorders. May cause allergic reactions in people sensitive to plants in the daisy family. Not for long-term use (more than 8 weeks). May interact with immunosuppressants."
    },
    "valerian": {
        "name": "Valerian",
        "scientificName": "Valeriana officinalis",
        "uses": [
            "Sleep disorders",
            "Anxiety relief",
            "Stress reduction",
            "Menstrual cramps",
            "Headache relief"
        ],
        "preparation": "For sleep, take 300-600mg of extract 30 minutes to 2 hours before bedtime. For tea, steep 1 teaspoon of dried root in hot water for 10-15 minutes. Effects may not be felt for 2-4 weeks of regular use.",
        "precautions": "May cause drowsiness; avoid driving or operating machinery. May interact with sedatives, alcohol, some antidepressants, and other medications. Not recommended during pregnancy or breastfeeding."
    },
    "tea tree": {
        "name": "Tea Tree",
        "scientificName": "Melaleuca alternifolia",
        "uses": [
            "Acne treatment",
            "Fungal infections like athlete's foot",
            "Dandruff and scalp issues",
            "Wound cleaning",
            "Insect bites and stings"
        ],
        "preparation": "For skin conditions, dilute 5-10 drops of essential oil with 1 tablespoon of carrier oil (like coconut or olive oil). For acne, apply diluted oil with a cotton swab. For dandruff, add a few drops to shampoo.",
        "precautions": "For external use only. Can cause skin irritation in some people - always do a patch test first. Toxic if ingested. Keep away from pets, especially cats. Not for use on children under 2."
    },
    "ginkgo": {
        "name": "Ginkgo Biloba",
        "scientificName": "Ginkgo biloba",
        "uses": [
            "Memory enhancement",
            "Circulation improvement",
            "Cognitive function",
            "Eye health",
            "Tinnitus (ringing in ears)"
        ],
        "preparation": "Typically taken as standardized extract containing 24% flavone glycosides and 6% terpene lactones. Common dosage is 120-240mg daily, divided into 2-3 doses. Effects may take 4-6 weeks to notice.",
        "precautions": "May increase bleeding risk; avoid if taking blood thinners or before surgery. May cause headaches, digestive upset, or allergic reactions. Avoid raw seeds (different from medicinal extract) as they are toxic."
    },
    "elderberry": {
        "name": "Elderberry",
        "scientificName": "Sambucus nigra",
        "uses": [
            "Cold and flu symptom relief",
            "Immune system support",
            "May shorten duration of colds",
            "Sinus infection relief",
            "High in antioxidants"
        ],
        "preparation": "Available as syrup, gummies, lozenges, or capsules. For syrup, typical dosage is 1 tablespoon for adults, 1 teaspoon for children 4 times daily during illness. Can make tea from dried flowers but not berries.",
        "precautions": "Raw or unripe berries, leaves, bark, and roots are toxic and should not be consumed. Commercial preparations are safe. May interact with immunosuppressants and diuretics. Discuss with doctor before giving to children."
    },
    "St. John's wort": {
        "name": "St. John's Wort",
        "scientificName": "Hypericum perforatum",
        "uses": [
            "Mild to moderate depression",
            "Seasonal affective disorder",
            "Anxiety",
            "Sleep problems",
            "Topically for wounds and inflammation"
        ],
        "preparation": "For depression, 300mg of standardized extract (0.3% hypericin) three times daily. For tea, steep 1-2 teaspoons dried herb in hot water for 10 minutes. For topical use, oil or cream containing 1-5% extract.",
        "precautions": "INTERACTS WITH MANY MEDICATIONS including birth control pills, antidepressants, blood thinners, heart medications, and transplant drugs. Can cause photosensitivity. Not for use during pregnancy or with bipolar disorder."
    },
    "milk thistle": {
        "name": "Milk Thistle",
        "scientificName": "Silybum marianum",
        "uses": [
            "Liver support and protection",
            "May help with fatty liver disease",
            "Cholesterol management",
            "Diabetes support",
            "Antioxidant properties"
        ],
        "preparation": "Typically taken as capsules containing 140mg of silymarin 2-3 times daily. Can also be consumed as tea, but active compounds are not as well absorbed. Available as liquid extract or tincture.",
        "precautions": "May cause allergic reactions in people sensitive to plants in the ragweed family. May lower blood sugar levels. Can have a mild laxative effect. Speak with doctor before using if you have hormone-sensitive conditions."
    },
    "ashwagandha": {
        "name": "Ashwagandha",
        "scientificName": "Withania somnifera",
        "uses": [
            "Stress and anxiety reduction",
            "Adaptogen helping body manage stress",
            "May improve sleep quality",
            "Potential to increase stamina",
            "May support thyroid function"
        ],
        "preparation": "Typical dosage is 300-500mg of root extract once or twice daily. Can be taken with warm milk and honey. Available as capsules, powder, or tincture. Best taken consistently for several weeks to see benefits.",
        "precautions": "May increase thyroid hormone levels. May lower blood sugar and blood pressure. Not recommended during pregnancy. May interact with sedatives, thyroid medications, and immunosuppressants."
    },
    "lemon balm": {
        "name": "Lemon Balm",
        "scientificName": "Melissa officinalis",
        "uses": [
            "Anxiety and stress relief",
            "Sleep improvement",
            "Digestive comfort",
            "Cold sores (herpes simplex)",
            "Mental alertness combined with calming"
        ],
        "preparation": "For tea, steep 1-2 teaspoons of dried leaves in hot water for 10 minutes, drink up to 4 cups daily. For sleep, take 300-600mg of extract 30-60 minutes before bedtime. For cold sores, apply cream with 1% extract.",
        "precautions": "May interact with sedatives and thyroid medications. Can impact attention and alertness at high doses. Generally considered safe during pregnancy in normal food amounts, but medicinal amounts should be avoided."
    }
}`;

const API_KEY = "AIzaSyCvmzv8kQpkZACq3YdvUzCXw0XmhUkHcxc";
const genAI = new GoogleGenerativeAI(API_KEY);

// Create a single chat instance that persists throughout the session
let chatSession = null;

// Initialize chat with system instructions
function initChatSession() {
    const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-pro",
        systemInstruction: businessInfo
    });
    
    // Start a chat with history
    chatSession = model.startChat({
        history: [
            {
                role: "model",
                parts: [{ text: "Hello! I'm your medicinal plant Identifier.  upload a photo for identification." }]
            }
        ]
    });
    
    return chatSession;
}

// Function to process image and identify plant
async function processImage(file) {
    try {
        // Show loader
        document.querySelector(".chat-window .chat").insertAdjacentHTML("beforeend", `
            <div class="loader"></div>
        `);
        
        // Convert the image file to base64
        const base64Image = await fileToGenerativePart(file);
        
        // Prepare prompt for plant identification
        const prompt = "Identify this medicinal plant and provide its name, scientific name, and a brief description of its medicinal uses. If you can't identify it with certainty, suggest what it might be or let me know you're not sure.";
        
        // Create a new chat with the model that can process images
        const imageModel = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
        
        // Send the image and prompt to the model
        const result = await imageModel.generateContent([prompt, base64Image]);
        const response = await result.response;
        const text = response.text();
        
        // Remove loader
        document.querySelector(".chat-window .chat .loader").remove();
        
        // Display the image and response in the chat
        const reader = new FileReader();
        reader.onload = function(e) {
            document.querySelector(".chat-window .chat").insertAdjacentHTML("beforeend", `
                <div class="plant-result">
                    <h3>Plant Identification</h3>
                    <img src="${e.target.result}" alt="Uploaded plant image">
                    <p>${text}</p>
                </div>
            `);
            
            // Scroll to bottom
            scrollToBottom();
            
            // Add to chat history
            if (chatSession) {
                // We don't actually send this to the chat model, but we record it for context
                chatSession.history.push({
                    role: "user",
                    parts: [{ text: "Please identify this medicinal plant" }]
                });
                
                chatSession.history.push({
                    role: "model",
                    parts: [{ text: text }]
                });
            }
        };
        reader.readAsDataURL(file);
        
    } catch (error) {
        console.error("Error processing image:", error);
        document.querySelector(".chat-window .chat .loader").remove();
        document.querySelector(".chat-window .chat").insertAdjacentHTML("beforeend", `
            <div class="error">
                <p>Sorry, I couldn't process that image. Please try a clearer image of a medicinal plant.</p>
            </div>
        `);
        scrollToBottom();
    }
}

// Helper function to scroll chat to bottom
function scrollToBottom() {
    const chatContainer = document.querySelector(".chat-window .chat");
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Helper function to convert file to GenerativePart
async function fileToGenerativePart(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64Data = reader.result.split(',')[1];
            resolve({
                inlineData: {
                    data: base64Data,
                    mimeType: file.type
                }
            });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

async function sendMessage() {
    const userInput = document.querySelector(".chat-window input");
    const userMessage = userInput.value.trim();
    
    if (userMessage.length) {
        try {
            // Clear input and add user message to chat
            userInput.value = "";
            document.querySelector(".chat-window .chat").insertAdjacentHTML("beforeend", `
                <div class="user">
                    <p>${userMessage}</p>
                </div>
            `);
            scrollToBottom();

            // Show loader
            document.querySelector(".chat-window .chat").insertAdjacentHTML("beforeend", `
                <div class="loader"></div>
            `);

            // Initialize chat session if it doesn't exist
            if (!chatSession) {
                initChatSession();
            }
            
            // Send message and get streaming response
            let result = await chatSession.sendMessageStream(userMessage);
            
            // Prepare model response container
            document.querySelector(".chat-window .chat").insertAdjacentHTML("beforeend", `
                <div class="model">
                    <p></p>
                </div>
            `);
            
            // Remove loader when starting to display response
            document.querySelector(".chat-window .chat .loader").remove();
            
            let modelMessages = '';
            let responseText = '';

            // Process streaming response
            for await (const chunk of result.stream) {
                const chunkText = chunk.text();
                responseText += chunkText;
                modelMessages = document.querySelectorAll(".chat-window .chat div.model");
                modelMessages[modelMessages.length - 1].querySelector("p").insertAdjacentHTML("beforeend", chunkText);
                scrollToBottom();
            }

        } catch (error) {
            console.error("Error sending message:", error);
            // Remove loader if exists
            const loader = document.querySelector(".chat-window .chat .loader");
            if (loader) loader.remove();
            
            document.querySelector(".chat-window .chat").insertAdjacentHTML("beforeend", `
                <div class="error">
                    <p>The message could not be sent. Please try again.</p>
                </div>
            `);
            scrollToBottom();
        }
    }
}

// Initialize the chat interface
function initChatInterface() {
    // Send message when send button is clicked
    document.querySelector(".chat-window .input-area button")
        .addEventListener("click", () => sendMessage());
    
    // Send message when Enter key is pressed
    document.querySelector(".chat-window input")
        .addEventListener("keypress", (event) => {
            if (event.key === "Enter") {
                sendMessage();
            }
        });
    
    // Open chat when chat button is clicked
    document.querySelector(".chat-button")
        .addEventListener("click", () => {
            document.querySelector("body").classList.add("chat-open");
            
            // Initialize chat session if it doesn't exist yet
            if (!chatSession) {
                initChatSession();
            }
            
            // Focus on input when chat opens
            setTimeout(() => {
                document.querySelector(".chat-window input").focus();
            }, 300);
        });
    
    // Close chat when close button is clicked
    document.querySelector(".chat-window button.close")
        .addEventListener("click", () => {
            document.querySelector("body").classList.remove("chat-open");
        });
    
    // Handle file upload
    document.querySelector("#image-upload")
        .addEventListener("change", (event) => {
            const file = event.target.files[0];
            if (file && file.type.startsWith("image/")) {
                // Add user upload notification
                document.querySelector(".chat-window .chat").insertAdjacentHTML("beforeend", `
                    <div class="user">
                        <p>I've uploaded a plant image for identification</p>
                    </div>
                `);
                processImage(file);
            } else {
                document.querySelector(".chat-window .chat").insertAdjacentHTML("beforeend", `
                    <div class="error">
                        <p>Please upload an image file (JPG, PNG, etc.).</p>
                    </div>
                `);
                scrollToBottom();
            }
            // Clear the file input so the same file can be uploaded again
            event.target.value = "";
        });
    
    // Add click event for plant identification button
    // document.querySelector(".upload-trigger")
    //     .addEventListener("click", () => {
    //         document.querySelector("#image-upload").click();
    //     });
    
    // Add welcome message
    document.querySelector(".chat-window .chat").insertAdjacentHTML("beforeend", `
        <div class="model">
            <p>Hello! I'm your medicinal plant assistant. Ask me about any medicinal plant, or upload a photo for identification. How can I help you today?</p>
        </div>
    `);
}

// Load plant cards on the main page
function loadPlantCards() {
    const plantData = JSON.parse(businessInfo.substring(businessInfo.indexOf('{')));
    const plantGrid = document.querySelector(".plant-grid");
    
    for (const [key, plant] of Object.entries(plantData)) {
        const usesHTML = plant.uses.slice(0, 3).map(use => `<li>${use}</li>`).join('');
        
        plantGrid.insertAdjacentHTML("beforeend", `
            <div class="plant-card" data-plant="${key}">
                <div class="plant-image" style="background-image: url('images/${key.replace(/\s+/g, '-')}.jpg')"></div>
                <div class="plant-info">
                    <h3 class="plant-name">${plant.name}</h3>
                    <p class="scientific-name">${plant.scientificName}</p>
                    <h4>Common Uses:</h4>
                    <ul class="uses-list">
                        ${usesHTML}
                    </ul>
                    <button class="read-more" onclick="openPlantDetails('${key}')">Read More</button>
                </div>
            </div>
        `);
    }
}

// Open plant details modal
function openPlantDetails(plantKey) {
    const plantData = JSON.parse(businessInfo.substring(businessInfo.indexOf('{')));
    const plant = plantData[plantKey];
    
    const usesHTML = plant.uses.map(use => `<li>${use}</li>`).join('');
    
    const modal = document.createElement('div');
    modal.className = 'plant-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <button class="close-modal">&times;</button>
            <div class="modal-header">
                <h2>${plant.name}</h2>
                <br>
                <p class="scientific-name">${plant.scientificName}</p>
            </div>
            <div class="modal-body">
                <div class="modal-image" style="background-image: url('images/${plantKey.replace(/\s+/g, '-')}.jpg')"></div>
                <div class="modal-details">
                    <div class="detail-section">
                        <h3>Medicinal Uses</h3>
                        <ul>${usesHTML}</ul>
                    </div>
                    <div class="detail-section">
                        <h3>Preparation</h3>
                        <p>${plant.preparation}</p>
                    </div>
                    <div class="detail-section">
                        <h3>Precautions</h3>
                        <p>${plant.precautions}</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Prevent scrolling of the background
    document.body.style.overflow = 'hidden';
    
    // Close modal when close button is clicked
    modal.querySelector('.close-modal').addEventListener('click', () => {
        document.body.removeChild(modal);
        document.body.style.overflow = 'auto';
    });
    
    // Close modal when clicking outside the content
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            document.body.removeChild(modal);
            document.body.style.overflow = 'auto';
        }
    });
}

// Initialize the application when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
    initChatInterface();
    loadPlantCards();
    
    // Add search functionality
    const searchInput = document.querySelector("#search-input");
    searchInput.addEventListener("input", () => {
        const searchTerm = searchInput.value.toLowerCase();
        const plantCards = document.querySelectorAll(".plant-card");
        
        plantCards.forEach(card => {
            const plantName = card.querySelector(".plant-name").textContent.toLowerCase();
            const scientificName = card.querySelector(".scientific-name").textContent.toLowerCase();
            const usesText = card.querySelector(".uses-list").textContent.toLowerCase();
            
            if (plantName.includes(searchTerm) || 
                scientificName.includes(searchTerm) || 
                usesText.includes(searchTerm)) {
                card.style.display = "block";
            } else {
                card.style.display = "none";
            }
        });
    });
});

// Make openPlantDetails available globally
window.openPlantDetails = openPlantDetails;

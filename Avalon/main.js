// Plant data with detailed information
const plantData = [
    {
        id: 1,
        name: "Aloe Vera",
        description: "Aloe vera is a succulent plant species of the genus Aloe. It's widely known for its medicinal properties, particularly for treating skin conditions and burns.",
        careInfo: {
            water: "Water deeply but infrequently, allowing soil to dry out between waterings",
            sunlight: "Bright, indirect sunlight",
            soil: "Well-draining, sandy soil mix"
        },
        image: "assets/images/aloe_vera.jpg"
    },
    {
        id: 2,
        name: "Snake Plant",
        description: "The snake plant (Sansevieria) is a popular indoor plant with stiff, upright leaves. It's known for its hardiness and air-purifying qualities.",
        careInfo: {
            water: "Allow soil to dry completely between waterings",
            sunlight: "Can tolerate low light but prefers indirect sunlight",
            soil: "Well-draining potting mix"
        },
        image: "assets/images/snake_plant.jpg"
    },
    {
        id: 3,
        name: "Peace Lily",
        description: "The peace lily (Spathiphyllum) is a popular indoor plant known for its elegant white flowers and glossy leaves. It's excellent at removing air pollutants.",
        careInfo: {
            water: "Keep soil consistently moist but not soggy",
            sunlight: "Low to medium indirect light",
            soil: "Rich, loose potting soil with good drainage"
        },
        image: "assets/images/peace_lily.jpg"
    },
    {
        id: 4,
        name: "Monstera Deliciosa",
        description: "Monstera deliciosa, also known as the Swiss cheese plant, is famous for its large, perforated leaves. It's a tropical plant that adds a jungle-like feel to any space.",
        careInfo: {
            water: "Water when the top inch of soil is dry",
            sunlight: "Bright, indirect light",
            soil: "Rich, well-draining potting mix"
        },
        image: "assets/images/monstera.jpg"
    },
    {
        id: 5,
        name: "Fiddle Leaf Fig",
        description: "The fiddle leaf fig (Ficus lyrata) is a popular houseplant with large, violin-shaped leaves. It's known for its dramatic appearance and can grow quite tall indoors.",
        careInfo: {
            water: "Water when the top 1-2 inches of soil are dry",
            sunlight: "Bright, indirect light",
            soil: "Well-draining potting mix"
        },
        image: "assets/images/fiddle_leaf.jpg"
    },
    {
        id: 6,
        name: "Pothos",
        description: "Pothos (Epipremnum aureum) is a trailing vine with heart-shaped leaves. It's one of the easiest houseplants to grow and is known for its air-purifying qualities.",
        careInfo: {
            water: "Allow soil to dry out between waterings",
            sunlight: "Can tolerate low light but grows best in bright, indirect light",
            soil: "Standard potting mix"
        },
        image: "assets/images/pothos.jpg"
    },
    {
        id: 7,
        name: "Rubber Plant",
        description: "The rubber plant (Ficus elastica) is a popular houseplant with glossy, leathery leaves. It's relatively easy to care for and can grow into an impressive indoor tree.",
        careInfo: {
            water: "Water when the top inch of soil is dry",
            sunlight: "Bright, indirect light",
            soil: "Well-draining potting mix"
        },
        image: "assets/images/rubber_plant.jpg"
    },
    // Additional plants for variety (these won't be interactive)
    {
        id: 8,
        name: "Decorative Plant 1",
        description: "Decorative plant for garden variety",
        careInfo: {
            water: "Regular watering",
            sunlight: "Partial shade",
            soil: "Standard soil"
        }
    },
    {
        id: 9,
        name: "Decorative Plant 2",
        description: "Decorative plant for garden variety",
        careInfo: {
            water: "Regular watering",
            sunlight: "Partial shade",
            soil: "Standard soil"
        }
    },
    {
        id: 10,
        name: "Decorative Plant 3",
        description: "Decorative plant for garden variety",
        careInfo: {
            water: "Regular watering",
            sunlight: "Partial shade",
            soil: "Standard soil"
        }
    }
];

// Initialize the 3D garden when the page loads
window.addEventListener('load', () => {
    // Get the canvas element
    const canvas = document.getElementById('garden-canvas');
    
    // Create loading screen
    const loadingScreen = document.createElement('div');
    loadingScreen.id = 'loading-screen';
    loadingScreen.innerHTML = `
        <h2>Loading Garden...</h2>
        <div class="loading-bar-container">
            <div class="loading-bar" id="loading-bar"></div>
        </div>
    `;
    document.body.appendChild(loadingScreen);
    
    // Simulate loading progress
    let progress = 0;
    const loadingBar = document.getElementById('loading-bar');
    
    const loadingInterval = setInterval(() => {
        progress += Math.random() * 10;
        if (progress > 100) {
            progress = 100;
            clearInterval(loadingInterval);
        }
        loadingBar.style.width = `${progress}%`;
    }, 200);
    
    // Create and initialize the garden
    const garden = new Garden3D(canvas, plantData);
    garden.init();
});

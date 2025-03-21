class Garden3D {
    constructor(canvas, plantData) {
        // Store reference to canvas and plant data
        this.canvas = canvas;
        this.plantData = plantData;

        // Initialize Three.js components
        this.scene = new THREE.Scene();
        this.camera = null;
        this.renderer = null;
        this.controls = null;

        // Store initial camera settings
        this.initialCameraPosition = new THREE.Vector3(0, 15, 40);
        this.initialCameraTarget = new THREE.Vector3(0, 0, 0);

        // Initialize arrays and objects
        this.plants = [];
        this.plantModels = [];
        this.plantLabels = {};
        this.birds = [];

        // Initialize lighting references
        this.ambientLight = null;
        this.directionalLight = null;
        this.moonLight = null;
        this.stars = null;
        this.skyDome = null;
        this.isNightMode = false;

        // Initialize raycaster for mouse interaction
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.hoveredPlant = null;

        // Create info panel
        this.createInfoPanel();

        // Bind methods to this context
        this.animate = this.animate.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onClick = this.onClick.bind(this);
        this.onWindowResize = this.onWindowResize.bind(this);
        this.resetCamera = this.resetCamera.bind(this);

        // Initialize loaders
        this.textureLoader = new THREE.TextureLoader();
        this.modelLoader = new THREE.GLTFLoader();

        // Add plant label styles
        const style = document.createElement('style');
        style.textContent = `
            .plant-label {
                position: fixed;
                background: rgba(255, 255, 255, 0.95);
                padding: 12px 16px;
                border-radius: 8px;
                font-size: 14px;
                pointer-events: none;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 1000;
                border: 2px solid rgba(76, 175, 80, 0.3);
                max-width: 250px;
                transform-origin: center bottom;
                backdrop-filter: blur(5px);
            }
            
            .plant-label .plant-name {
                font-weight: 600;
                margin-bottom: 6px;
                color: #2c3e50;
                font-size: 16px;
            }
            
            .plant-label .plant-hint {
                font-size: 12px;
                color: #4CAF50;
                margin-top: 4px;
                font-style: italic;
                display: flex;
                align-items: center;
                gap: 4px;
            }

            .plant-label .plant-hint::before {
                content: "👆";
                font-size: 14px;
            }

            .plant-indicator {
                position: fixed;
                width: 40px;
                height: 40px;
                pointer-events: none;
                z-index: 999;
                background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%234CAF50"><path d="M12 2L1 21h22L12 2zm0 3.5L19.5 19h-15L12 5.5z"/></svg>');
                background-size: contain;
                background-repeat: no-repeat;
                opacity: 0;
                transition: all 0.3s ease;
                animation: bounce 1s infinite;
            }

            @keyframes bounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-8px); }
            }

            .plant-indicator.visible {
                opacity: 0.9;
            }

            .plant-info-panel {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) scale(0.9);
                background: white;
                border-radius: 16px;
                box-shadow: 0 8px 32px rgba(0,0,0,0.2);
                width: 90%;
                max-width: 600px;
                max-height: 90vh;
                overflow-y: auto;
                z-index: 1001;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                border: 2px solid rgba(76, 175, 80, 0.3);
            }

            .plant-info-panel.active {
                opacity: 1;
                visibility: visible;
                transform: translate(-50%, -50%) scale(1);
            }

            .info-header {
                padding: 20px;
                border-bottom: 1px solid rgba(0,0,0,0.1);
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: rgba(76, 175, 80, 0.1);
                border-radius: 16px 16px 0 0;
            }

            .info-header h2 {
                margin: 0;
                color: #2c3e50;
                font-size: 24px;
                font-weight: 600;
            }

            .close-btn {
                background: none;
                border: none;
                font-size: 24px;
                color: #666;
                cursor: pointer;
                padding: 4px 8px;
                border-radius: 50%;
                transition: all 0.2s ease;
            }

            .close-btn:hover {
                background: rgba(0,0,0,0.1);
                color: #333;
            }

            .info-content {
                padding: 20px;
            }

            .plant-image-container {
                width: 100%;
                height: 300px;
                border-radius: 12px;
                overflow: hidden;
                margin-bottom: 20px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }

            .plant-image {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }

            .plant-description {
                color: #666;
                line-height: 1.6;
                margin-bottom: 24px;
                font-size: 16px;
            }

            .plant-care-info {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 12px;
                border: 1px solid rgba(0,0,0,0.1);
            }

            .plant-care-info h3 {
                color: #2c3e50;
                margin: 0 0 16px 0;
                font-size: 18px;
                font-weight: 600;
            }

            .plant-care-info ul {
                list-style: none;
                padding: 0;
                margin: 0;
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 16px;
            }

            .plant-care-info li {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 12px;
                background: white;
                border-radius: 8px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            }

            .plant-care-info li strong {
                color: #4CAF50;
                min-width: 80px;
            }

            .plant-care-info li span {
                color: #666;
                flex: 1;
            }

            @media (max-width: 768px) {
                .plant-info-panel {
                    width: 95%;
                    max-height: 95vh;
                }

                .plant-image-container {
                    height: 200px;
                }

                .plant-care-info ul {
                    grid-template-columns: 1fr;
                }
            }

            .medicinal-uses {
                margin-top: 24px;
                background: #f8f9fa;
                padding: 20px;
                border-radius: 12px;
                border: 1px solid rgba(0,0,0,0.1);
            }

            .medicinal-uses h3 {
                color: #2c3e50;
                margin: 0 0 16px 0;
                font-size: 18px;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .medicinal-uses h3::before {
                content: "💊";
                font-size: 20px;
            }

            .medicinal-list {
                list-style: none;
                padding: 0;
                margin: 0;
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 12px;
            }

            .medicinal-list li {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px 16px;
                background: white;
                border-radius: 8px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.05);
                transition: all 0.2s ease;
            }

            .medicinal-list li:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }

            .medicinal-icon {
                font-size: 20px;
                color: #4CAF50;
            }

            .medicinal-text {
                color: #666;
                font-size: 14px;
                line-height: 1.4;
            }

            @media (max-width: 768px) {
                .medicinal-list {
                    grid-template-columns: 1fr;
                }
            }

            .plant-hover-tooltip {
                position: fixed;
                background: rgba(255, 255, 255, 0.95);
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 14px;
                pointer-events: none;
                z-index: 1002;
                box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                border: 1px solid rgba(76, 175, 80, 0.3);
                opacity: 0;
                transition: opacity 0.2s ease;
                white-space: nowrap;
                backdrop-filter: blur(5px);
            }

            .plant-hover-tooltip.visible {
                opacity: 1;
            }

            .back-button {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 14px 28px;
                background: rgba(255, 255, 255, 0.15);
                border: 2px solid rgba(76, 175, 80, 0.15);
                border-radius: 12px;
                font-size: 16px;
                color: rgba(44, 62, 80, 0.9);
                cursor: pointer;
                z-index: 1002;
                box-shadow: 0 6px 16px rgba(0,0,0,0.1);
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 10px;
                backdrop-filter: blur(8px);
                -webkit-backdrop-filter: blur(8px);
                font-weight: 600;
                letter-spacing: 0.3px;
            }

            .back-button:hover {
                background: rgba(255, 255, 255, 0.25);
                transform: translateY(-3px);
                box-shadow: 0 8px 24px rgba(0,0,0,0.15);
                border-color: rgba(76, 175, 80, 0.3);
                color: rgba(44, 62, 80, 0.9);
            }

            .back-button::before {
                content: "→";
                font-size: 22px;
                line-height: 1;
                transition: transform 0.3s ease;
            }

            .back-button:hover::before {
                transform: translateX(3px);
            }

            .mode-toggle {
                position: fixed;
                bottom: 20px;
                right: 20px;
                padding: 14px 28px;
                background: rgba(255, 255, 255, 0.15);
                border: 2px solid rgba(76, 175, 80, 0.15);
                border-radius: 12px;
                font-size: 16px;
                color: rgba(44, 62, 80, 0.9);
                cursor: pointer;
                z-index: 1002;
                box-shadow: 0 6px 16px rgba(0,0,0,0.1);
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 10px;
                backdrop-filter: blur(8px);
                -webkit-backdrop-filter: blur(8px);
                font-weight: 600;
                letter-spacing: 0.3px;
            }

            .mode-toggle:hover {
                background: rgba(255, 255, 255, 0.25);
                transform: translateY(-3px);
                box-shadow: 0 8px 24px rgba(0,0,0,0.15);
                border-color: rgba(76, 175, 80, 0.3);
                color: rgba(44, 62, 80, 0.9);
            }

            .mode-toggle::before {
                content: "🌞";
                font-size: 20px;
                transition: transform 0.3s ease;
            }

            .mode-toggle:hover::before {
                transform: rotate(45deg);
            }

            .reset-camera-btn {
                position: fixed;
                bottom: 20px;
                left: 20px;
                padding: 14px 28px;
                background: rgba(255, 255, 255, 0.15);
                border: 2px solid rgba(76, 175, 80, 0.15);
                border-radius: 12px;
                font-size: 16px;
                color: rgba(44, 62, 80, 0.9);
                cursor: pointer;
                z-index: 1002;
                box-shadow: 0 6px 16px rgba(0,0,0,0.1);
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 10px;
                backdrop-filter: blur(8px);
                -webkit-backdrop-filter: blur(8px);
                font-weight: 600;
                letter-spacing: 0.3px;
            }

            .reset-camera-btn:hover {
                background: rgba(255, 255, 255, 0.25);
                transform: translateY(-3px);
                box-shadow: 0 8px 24px rgba(0,0,0,0.15);
                border-color: rgba(76, 175, 80, 0.3);
                color: rgba(44, 62, 80, 0.9);
            }

            .reset-camera-btn::before {
                content: "🎥";
                font-size: 20px;
                transition: transform 0.3s ease;
            }

            .reset-camera-btn:hover::before {
                transform: scale(1.1);
            }
            @media (max-width: 768px) {
                .back-button {
                    padding: 10px 20px;
                    font-size: 14px;
                }
            }
        `;
        document.head.appendChild(style);

        // Create back button
        this.backButton = document.createElement('button');
        this.backButton.className = 'back-button';
        this.backButton.textContent = 'Back to Home';
        this.backButton.addEventListener('click', () => {
            window.location.href = 'index.html'; // Navigate to home page
        });
        document.body.appendChild(this.backButton);

        // Create hover tooltip
        this.hoverTooltip = document.createElement('div');
        this.hoverTooltip.className = 'plant-hover-tooltip';
        document.body.appendChild(this.hoverTooltip);
    }

    createInfoPanel() {
        // Create info panel for displaying plant information
        const infoPanel = document.createElement('div');
        infoPanel.className = 'plant-info-panel';
        infoPanel.innerHTML = `
            <div class="info-header">
                <h2 class="plant-name">Plant Name</h2>
                <button class="close-btn">&times;</button>
            </div>
            <div class="info-content">
                <div class="plant-image-container">
                    <img class="plant-image" src="" alt="Plant Image">
                </div>
                <div class="plant-details">
                    <p class="plant-description">Plant description goes here.</p>
                    <div class="plant-care-info">
                        <h3>Care Information</h3>
                        <ul>
                            <li><strong>Water:</strong> <span class="water-info"></span></li>
                            <li><strong>Sunlight:</strong> <span class="sunlight-info"></span></li>
                            <li><strong>Soil:</strong> <span class="soil-info"></span></li>
                        </ul>
                    </div>
                    <div class="medicinal-uses">
                        <h3>Medicinal Uses</h3>
                        <ul class="medicinal-list"></ul>
                    </div>
                </div>
            </div>
        `;

        // Add close button functionality
        infoPanel.querySelector('.close-btn').addEventListener('click', () => {
            infoPanel.classList.remove('active');
        });

        // Add to document
        document.body.appendChild(infoPanel);

        // Store reference
        this.infoPanel = infoPanel;
    }

    async init() {
        // Set up the scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87ceeb); // Sky blue

        // Set up the camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.copy(this.initialCameraPosition);
        this.camera.lookAt(this.initialCameraTarget);

        // Set up the renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // Set up controls
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.screenSpacePanning = false;
        this.controls.minDistance = 5;
        this.controls.maxDistance = 100;
        this.controls.maxPolarAngle = Math.PI / 2 - 0.1; // Prevent camera from going below ground
        this.controls.target.copy(this.initialCameraTarget);

        // Set up lights
        this.setupLights();

        // Create sky dome
        await this.createSkyDome();

        // Create the terrain
        await this.createEnvironment();

        // Create paths
        this.createGardenPaths();

        // Create rocks
        await this.addDecorativeRocks();

        // Create mountains in the distance
        await this.createMountains();

        // Load plant models
        await this.loadPlantModels();

        // Create plants based on data
        await this.createPlants();

        // Add decorative trees
        await this.addDecorativeTrees();

        // Add birds
        await this.addBirds();

        // Set up event listeners
        this.setupEventListeners();

        // Start animation loop
        this.animate = this.animate.bind(this);
        this.animate();

        // Set initial mode
        this.isNightMode = false;

        console.log('Garden initialized successfully');
    }

    setupLights() {
        // Add ambient light
        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(this.ambientLight);

        // Add directional light (sun)
        this.directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
        this.directionalLight.position.set(50, 200, 100);
        this.directionalLight.castShadow = true;

        // Configure shadow properties
        this.directionalLight.shadow.mapSize.width = 2048;
        this.directionalLight.shadow.mapSize.height = 2048;
        this.directionalLight.shadow.camera.near = 0.5;
        this.directionalLight.shadow.camera.far = 500;
        this.directionalLight.shadow.camera.left = -100;
        this.directionalLight.shadow.camera.right = 100;
        this.directionalLight.shadow.camera.top = 100;
        this.directionalLight.shadow.camera.bottom = -100;

        this.scene.add(this.directionalLight);

        // Add fog for depth
        this.scene.fog = new THREE.FogExp2(0xcccccc, 0.01);
    }

    setupEventListeners() {
        // Add event listeners for interaction
        window.addEventListener('mousemove', this.onMouseMove);
        window.addEventListener('click', this.onClick);
        window.addEventListener('resize', this.onWindowResize);

        // Create day/night toggle button
        this.createDayNightToggle();

        // Create reset camera button
        this.createResetButton();
    }

    createDayNightToggle() {
        const toggleButton = document.createElement('button');
        toggleButton.className = 'mode-toggle';
        toggleButton.textContent = 'Toggle Day/Night';

        toggleButton.addEventListener('click', async () => {
            // Toggle between day and night
            const currentSkybox = this.scene.getObjectByName('skybox');
            const isDay = currentSkybox.material.map.name === 'sky_day';

            // Load the opposite skybox texture
            const newTexture = await this.loadTexture(
                isDay ? 'assets/textures/sky_night.jpg' : 'assets/textures/sky_day.jpg'
            );
            newTexture.name = isDay ? 'sky_night' : 'sky_day';

            // Update skybox
            currentSkybox.material.map = newTexture;
            currentSkybox.material.needsUpdate = true;

            // Adjust lighting
            const ambientLight = this.scene.getObjectByName('ambientLight');
            const directionalLight = this.scene.getObjectByName('directionalLight');

            if (isDay) {
                // Switch to night
                ambientLight.intensity = 0.2;
                directionalLight.intensity = 0.3;
                this.scene.fog.color.set(0x222233);
            } else {
                // Switch to day
                ambientLight.intensity = 0.6;
                directionalLight.intensity = 1.0;
                this.scene.fog.color.set(0xcccccc);
            }
        });

        document.body.appendChild(toggleButton);
    }

    createResetButton() {
        const resetButton = document.createElement('button');
        resetButton.className = 'reset-camera-btn';
        resetButton.textContent = 'Reset View';
        resetButton.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            padding: 10px 20px;
            background: rgba(255, 255, 255, 0.9);
            border: none;
            border-radius: 5px;
            cursor: pointer;
            z-index: 2;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        `;

        resetButton.addEventListener('mouseover', () => {
            resetButton.style.background = 'rgba(255, 255, 255, 1)';
        });

        resetButton.addEventListener('mouseout', () => {
            resetButton.style.background = 'rgba(255, 255, 255, 0.9)';
        });

        resetButton.addEventListener('click', this.resetCamera);

        document.body.appendChild(resetButton);
    }

    async createSkyDome() {
        // Load day and night sky textures
        this.daySkyTexture = await this.loadTexture('assets/textures/sky_day.jpg');
        this.nightSkyTexture = await this.loadTexture('assets/textures/sky_night.jpg');

        // Create a large sphere for the sky
        const skyGeometry = new THREE.SphereGeometry(150, 32, 32);
        // Flip the geometry inside out
        skyGeometry.scale(-1, 1, 1);

        const skyMaterial = new THREE.MeshBasicMaterial({
            map: this.daySkyTexture,
            side: THREE.BackSide
        });

        this.skyDome = new THREE.Mesh(skyGeometry, skyMaterial);
        this.scene.add(this.skyDome);
    }

    async loadTexture(path) {
        return new Promise((resolve, reject) => {
            this.textureLoader.load(
                path,
                texture => {
                    resolve(texture);
                },
                undefined,
                error => {
                    console.error(`Error loading texture from ${path}:`, error);

                    // Create a fallback texture
                    const canvas = document.createElement('canvas');
                    canvas.width = 128;
                    canvas.height = 128;
                    const context = canvas.getContext('2d');

                    // Fill with a gradient
                    const gradient = context.createLinearGradient(0, 0, 0, 128);

                    if (path.includes('sky')) {
                        gradient.addColorStop(0, '#4286f4');
                        gradient.addColorStop(1, '#94c5ff');
                    } else if (path.includes('grass')) {
                        gradient.addColorStop(0, '#4a7c10');
                        gradient.addColorStop(1, '#6baa21');
                    } else if (path.includes('mountain')) {
                        gradient.addColorStop(0, '#7c8b88');
                        gradient.addColorStop(1, '#a3aeab');
                    } else {
                        gradient.addColorStop(0, '#888888');
                        gradient.addColorStop(1, '#aaaaaa');
                    }

                    context.fillStyle = gradient;
                    context.fillRect(0, 0, 128, 128);

                    const fallbackTexture = new THREE.CanvasTexture(canvas);
                    resolve(fallbackTexture);
                }
            );
        });
    }

    async createEnvironment() {
        // Create ground with realistic texture
        const groundSize = 100;
        const groundGeometry = new THREE.CircleGeometry(groundSize, 64);

        // Load grass texture
        const grassTexture = await this.loadTexture('assets/textures/grass.jpg');
        grassTexture.wrapS = THREE.RepeatWrapping;
        grassTexture.wrapT = THREE.RepeatWrapping;
        grassTexture.repeat.set(20, 20);

        // Create ground material with normal and roughness maps
        const groundMaterial = new THREE.MeshStandardMaterial({
            map: grassTexture,
            roughness: 0.8,
            metalness: 0.1
        });

        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);

        // Create garden paths
        this.createGardenPaths();

        // Add decorative rocks
        this.addDecorativeRocks();
    }

    createGardenPaths() {
        // Create garden paths using a circular pattern
        const pathMaterial = new THREE.MeshStandardMaterial({
            color: 0xd2b48c, // Tan color for dirt/gravel path
            roughness: 1.0,
            metalness: 0.0
        });

        // Main circular path
        const mainPathRadius = 20;
        const mainPathWidth = 2;
        const mainPathGeometry = new THREE.RingGeometry(
            mainPathRadius - mainPathWidth / 2,
            mainPathRadius + mainPathWidth / 2,
            64, 1
        );
        const mainPath = new THREE.Mesh(mainPathGeometry, pathMaterial);
        mainPath.rotation.x = -Math.PI / 2;
        mainPath.position.y = 0.01; // Slightly above ground to prevent z-fighting
        mainPath.receiveShadow = true;
        this.scene.add(mainPath);

        // Radial paths from center
        const radialPathCount = 6;
        for (let i = 0; i < radialPathCount; i++) {
            const angle = (i / radialPathCount) * Math.PI * 2;
            const pathLength = mainPathRadius;
            const pathWidth = 1.5;

            const radialPathGeometry = new THREE.PlaneGeometry(pathWidth, pathLength);
            const radialPath = new THREE.Mesh(radialPathGeometry, pathMaterial);

            // Position and rotate the path
            radialPath.rotation.x = -Math.PI / 2;
            radialPath.position.set(
                Math.cos(angle) * pathLength / 2,
                0.02, // Slightly above the main path
                Math.sin(angle) * pathLength / 2
            );
            radialPath.rotation.z = -angle;

            radialPath.receiveShadow = true;
            this.scene.add(radialPath);
        }

        // Central circular area
        const centralAreaRadius = 5;
        const centralAreaGeometry = new THREE.CircleGeometry(centralAreaRadius, 32);
        const centralArea = new THREE.Mesh(centralAreaGeometry, pathMaterial);
        centralArea.rotation.x = -Math.PI / 2;
        centralArea.position.y = 0.02;
        centralArea.receiveShadow = true;
        this.scene.add(centralArea);
    }

    addDecorativeRocks() {
        // Add decorative rocks throughout the garden
        const rockCount = 40;
        const rockGeometry = new THREE.DodecahedronGeometry(1, 1);
        const rockMaterial = new THREE.MeshStandardMaterial({
            color: 0x888888,
            roughness: 0.9,
            metalness: 0.1
        });

        for (let i = 0; i < rockCount; i++) {
            // Random position within the garden
            const angle = Math.random() * Math.PI * 2;
            const radius = 5 + Math.random() * 40; // Distribute from near center to edge

            const rock = new THREE.Mesh(rockGeometry, rockMaterial);
            rock.position.x = Math.cos(angle) * radius;
            rock.position.z = Math.sin(angle) * radius;
            rock.position.y = -0.2 + Math.random() * 0.4;
            rock.scale.set(
                0.3 + Math.random() * 1.2,
                0.3 + Math.random() * 0.8,
                0.3 + Math.random() * 1.2
            );

            // Random rotation
            rock.rotation.x = Math.random() * Math.PI;
            rock.rotation.y = Math.random() * Math.PI;
            rock.rotation.z = Math.random() * Math.PI;

            rock.castShadow = true;
            rock.receiveShadow = true;

            // Only add rocks that aren't on the paths
            const distanceFromCenter = Math.sqrt(
                rock.position.x * rock.position.x +
                rock.position.z * rock.position.z
            );

            // Avoid placing rocks on the main circular path
            const mainPathRadius = 20;
            const mainPathWidth = 2;
            const isOnMainPath = Math.abs(distanceFromCenter - mainPathRadius) < mainPathWidth;

            // Avoid placing rocks on the central area
            const centralAreaRadius = 5;
            const isInCentralArea = distanceFromCenter < centralAreaRadius;

            // Avoid placing rocks on radial paths
            let isOnRadialPath = false;
            const radialPathCount = 6;
            const radialPathWidth = 1.5;

            for (let j = 0; j < radialPathCount; j++) {
                const pathAngle = (j / radialPathCount) * Math.PI * 2;
                const angleDiff = Math.abs(((angle - pathAngle) + Math.PI) % (Math.PI * 2) - Math.PI);

                if (angleDiff < 0.1 && distanceFromCenter < mainPathRadius) {
                    isOnRadialPath = true;
                    break;
                }
            }

            if (!isOnMainPath && !isInCentralArea && !isOnRadialPath) {
                this.scene.add(rock);
            }
        }
    }

    async createMountains() {
        // Create realistic mountains in the distance
        const mountainTexture = await this.loadTexture('assets/textures/mountain.jpg');
        mountainTexture.wrapS = THREE.RepeatWrapping;
        mountainTexture.wrapT = THREE.RepeatWrapping;
        mountainTexture.repeat.set(5, 2);

        const mountainMaterial = new THREE.MeshStandardMaterial({
            map: mountainTexture,
            roughness: 1,
            metalness: 0,
            bumpMap: mountainTexture,
            bumpScale: 0.5,
            displacementMap: mountainTexture,
            displacementScale: 10
        });

        // Create a ring of mountains around the scene
        const mountainRanges = 8;
        const mountainDistance = 80;

        for (let i = 0; i < mountainRanges; i++) {
            const angle = (i / mountainRanges) * Math.PI * 2;

            // Create a mountain range with multiple peaks
            const mountainGroup = new THREE.Group();

            // Number of peaks in this range
            const peakCount = 3 + Math.floor(Math.random() * 4);

            for (let j = 0; j < peakCount; j++) {
                // Create a mountain peak
                const peakGeometry = new THREE.ConeGeometry(
                    10 + Math.random() * 15, // Base radius
                    20 + Math.random() * 30, // Height
                    8 + Math.floor(Math.random() * 8), // Radial segments
                    1, // Height segments
                    false // Open ended
                );

                // Distort the geometry to make it look more natural
                const vertices = peakGeometry.attributes.position;

                for (let k = 0; k < vertices.count; k++) {
                    const x = vertices.getX(k);
                    const y = vertices.getY(k);
                    const z = vertices.getZ(k);

                    // Add noise to x and z coordinates
                    const noise = (Math.random() - 0.5) * 3;

                    // More distortion at the base, less at the peak
                    const distortionFactor = 1 - (y / 30);

                    vertices.setX(k, x + noise * distortionFactor);
                    vertices.setZ(k, z + noise * distortionFactor);
                }

                const peak = new THREE.Mesh(peakGeometry, mountainMaterial);

                // Position the peak within the range
                const rangeWidth = 40;
                const offset = (j - (peakCount - 1) / 2) * (rangeWidth / peakCount);

                peak.position.set(
                    Math.cos(angle) * mountainDistance + Math.cos(angle + Math.PI / 2) * offset,
                    0, // Base at ground level
                    Math.sin(angle) * mountainDistance + Math.sin(angle + Math.PI / 2) * offset
                );

                // Random rotation for variety
                peak.rotation.y = Math.random() * Math.PI;

                // Add to mountain group
                mountainGroup.add(peak);
            }

            // Add the mountain range to the scene
            this.scene.add(mountainGroup);
        }
    }

    async loadPlantModels() {
        // Define the plant models to load
        const modelPaths = [
            { name: 'plant1', path: 'assets/models/plant1.glb' },
            { name: 'plant2', path: 'assets/models/plant2.glb' },
            { name: 'plant3', path: 'assets/models/plant3.glb' },
            { name: 'plant4', path: 'assets/models/plant4.glb' },
            { name: 'plant5', path: 'assets/models/plant5.glb' },
            { name: 'plant6', path: 'assets/models/plant6.glb' },
            { name: 'plant7', path: 'assets/models/plant7.glb' },
            { name: 'tree', path: 'assets/models/tree.glb' },
            { name: 'bush', path: 'assets/models/bush.glb' },
            { name: 'flower', path: 'assets/models/flower.glb' },
            { name: 'grass', path: 'assets/models/grass.glb' }
        ];

        // Load each model
        for (const modelInfo of modelPaths) {
            try {
                const model = await this.loadModel(modelInfo.path);
                this.plantModels.push({
                    name: modelInfo.name,
                    model: model
                });
                console.log(`Loaded model: ${modelInfo.name}`);
            } catch (error) {
                console.error(`Failed to load model ${modelInfo.name}:`, error);
                // Create a fallback model
                this.createFallbackModel(modelInfo.name);
            }
        }
    }

    createFallbackModel(modelName) {
        let fallbackModel;

        // Create different fallback models based on the name
        switch (modelName) {
            case 'tree':
                // Simple tree fallback
                const treeGroup = new THREE.Group();

                // Tree trunk
                const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.7, 5, 8);
                const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
                const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
                trunk.position.y = 2.5;
                treeGroup.add(trunk);

                // Tree foliage
                const foliageGeometry = new THREE.ConeGeometry(3, 6, 8);
                const foliageMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
                const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
                foliage.position.y = 8;
                treeGroup.add(foliage);

                fallbackModel = { scene: treeGroup };
                break;

            case 'bush':
                // Simple bush fallback
                const bushGroup = new THREE.Group();

                // Create multiple spheres for the bush
                const bushMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });

                for (let i = 0; i < 5; i++) {
                    const radius = 0.7 + Math.random() * 0.5;
                    const bushGeometry = new THREE.SphereGeometry(radius, 8, 8);
                    const bushSphere = new THREE.Mesh(bushGeometry, bushMaterial);

                    bushSphere.position.set(
                        (Math.random() - 0.5) * 1.5,
                        radius * 0.8,
                        (Math.random() - 0.5) * 1.5
                    );

                    bushGroup.add(bushSphere);
                }

                fallbackModel = { scene: bushGroup };
                break;

            case 'flower':
                // Simple flower fallback
                const flowerGroup = new THREE.Group();

                // Stem
                const stemGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1.5, 8);
                const stemMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
                const stem = new THREE.Mesh(stemGeometry, stemMaterial);
                stem.position.y = 0.75;
                flowerGroup.add(stem);

                // Flower head
                const flowerGeometry = new THREE.SphereGeometry(0.3, 16, 16);
                const flowerMaterial = new THREE.MeshStandardMaterial({
                    color: new THREE.Color().setHSL(Math.random(), 0.8, 0.6)
                });
                const flowerHead = new THREE.Mesh(flowerGeometry, flowerMaterial);
                flowerHead.position.y = 1.7;
                flowerGroup.add(flowerHead);

                // Petals
                const petalCount = 8;
                const petalMaterial = new THREE.MeshStandardMaterial({
                    color: flowerMaterial.color,
                    side: THREE.DoubleSide
                });

                for (let i = 0; i < petalCount; i++) {
                    const angle = (i / petalCount) * Math.PI * 2;
                    const petalGeometry = new THREE.PlaneGeometry(0.3, 0.5);
                    const petal = new THREE.Mesh(petalGeometry, petalMaterial);

                    petal.position.set(
                        Math.cos(angle) * 0.3,
                        1.7,
                        Math.sin(angle) * 0.3
                    );

                    petal.rotation.x = Math.PI / 2;
                    petal.rotation.y = -angle;

                    flowerGroup.add(petal);
                }

                fallbackModel = { scene: flowerGroup };
                break;

            case 'grass':
                // Simple grass fallback
                const grassGroup = new THREE.Group();

                // Create multiple grass blades
                const grassMaterial = new THREE.MeshStandardMaterial({
                    color: 0x7CFC00,
                    side: THREE.DoubleSide
                });

                for (let i = 0; i < 8; i++) {
                    const height = 0.3 + Math.random() * 0.3;
                    const grassGeometry = new THREE.PlaneGeometry(0.05, height);
                    const grassBlade = new THREE.Mesh(grassGeometry, grassMaterial);

                    grassBlade.position.set(
                        (Math.random() - 0.5) * 0.2,
                        height / 2,
                        (Math.random() - 0.5) * 0.2
                    );

                    grassBlade.rotation.y = Math.random() * Math.PI;
                    grassBlade.rotation.x = (Math.random() - 0.5) * 0.2;

                    grassGroup.add(grassBlade);
                }

                fallbackModel = { scene: grassGroup };
                break;

            default:
                // Generic plant fallback for plant1-plant7
                if (modelName.startsWith('plant')) {
                    const plantGroup = new THREE.Group();

                    // Create a unique plant based on the plant number
                    const plantNumber = parseInt(modelName.replace('plant', ''));

                    // Use the plant number to create variation
                    const hue = (plantNumber * 0.15) % 1; // Vary the color
                    const plantColor = new THREE.Color().setHSL(hue, 0.7, 0.5);

                    // Create pot
                    const potGeometry = new THREE.CylinderGeometry(0.5, 0.7, 0.8, 16);
                    const potMaterial = new THREE.MeshStandardMaterial({
                        color: 0xa52a2a // Brown pot
                    });
                    const pot = new THREE.Mesh(potGeometry, potMaterial);
                    pot.position.y = 0.4;
                    plantGroup.add(pot);

                    // Create plant base
                    const baseGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1, 8);
                    const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
                    const base = new THREE.Mesh(baseGeometry, baseMaterial);
                    base.position.y = 1.3;
                    plantGroup.add(base);

                    // Create leaves/flowers based on plant number
                    switch (plantNumber) {
                        case 1: // Aloe-like
                            for (let i = 0; i < 8; i++) {
                                const angle = (i / 8) * Math.PI * 2;
                                const leafGeometry = new THREE.ConeGeometry(0.2, 1.5, 4, 1, true);
                                const leafMaterial = new THREE.MeshStandardMaterial({
                                    color: 0x90EE90,
                                    side: THREE.DoubleSide
                                });
                                const leaf = new THREE.Mesh(leafGeometry, leafMaterial);

                                leaf.rotation.x = Math.PI / 3;
                                leaf.rotation.z = angle;
                                leaf.position.set(
                                    Math.cos(angle) * 0.3,
                                    1.3,
                                    Math.sin(angle) * 0.3
                                );

                                plantGroup.add(leaf);
                            }
                            break;

                        case 2: // Snake plant-like
                            for (let i = 0; i < 6; i++) {
                                const angle = ((i / 6) * Math.PI * 2) + (Math.random() * 0.3);
                                const leafGeometry = new THREE.PlaneGeometry(0.3, 2);
                                const leafMaterial = new THREE.MeshStandardMaterial({
                                    color: 0x006400,
                                    side: THREE.DoubleSide
                                });
                                const leaf = new THREE.Mesh(leafGeometry, leafMaterial);

                                leaf.rotation.y = angle;
                                leaf.position.set(
                                    Math.cos(angle) * 0.2,
                                    2,
                                    Math.sin(angle) * 0.2
                                );

                                plantGroup.add(leaf);
                            }
                            break;

                        case 3: // Peace lily-like
                            // Leaves
                            for (let i = 0; i < 5; i++) {
                                const angle = ((i / 5) * Math.PI * 2) + (Math.random() * 0.3);
                                const leafGeometry = new THREE.PlaneGeometry(0.6, 1.5);
                                const leafMaterial = new THREE.MeshStandardMaterial({
                                    color: 0x006400,
                                    side: THREE.DoubleSide
                                });
                                const leaf = new THREE.Mesh(leafGeometry, leafMaterial);

                                leaf.rotation.x = Math.PI / 4;
                                leaf.rotation.y = angle;
                                leaf.position.set(
                                    Math.cos(angle) * 0.4,
                                    1.5,
                                    Math.sin(angle) * 0.4
                                );

                                plantGroup.add(leaf);
                            }

                            // Flower
                            const flowerGeometry = new THREE.ConeGeometry(0.2, 0.8, 8);
                            const flowerMaterial = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
                            const flower = new THREE.Mesh(flowerGeometry, flowerMaterial);
                            flower.position.y = 2.2;
                            plantGroup.add(flower);
                            break;

                        case 4: // Monstera-like
                            for (let i = 0; i < 4; i++) {
                                const angle = ((i / 4) * Math.PI * 2) + (Math.random() * 0.3);

                                // Create a custom leaf shape with holes
                                const leafShape = new THREE.Shape();
                                leafShape.moveTo(0, 0);
                                leafShape.bezierCurveTo(0.5, 0.5, 1, 0, 1, 1);
                                leafShape.bezierCurveTo(1, 2, 0, 2, 0, 1);
                                leafShape.bezierCurveTo(0, 0, 0, 0, 0, 0);

                                // Create a hole in the leaf
                                const holeShape = new THREE.Path();
                                holeShape.ellipse(0.5, 0.8, 0.2, 0.3, 0, Math.PI * 2);
                                leafShape.holes.push(holeShape);

                                const leafGeometry = new THREE.ShapeGeometry(leafShape);
                                const leafMaterial = new THREE.MeshStandardMaterial({
                                    color: 0x228B22,
                                    side: THREE.DoubleSide
                                });
                                const leaf = new THREE.Mesh(leafGeometry, leafMaterial);

                                leaf.scale.set(1.2, 1.2, 1.2);
                                leaf.rotation.x = -Math.PI / 2;
                                leaf.rotation.z = angle;
                                leaf.position.set(
                                    Math.cos(angle) * 0.5,
                                    1.5 + i * 0.2,
                                    Math.sin(angle) * 0.5
                                );

                                plantGroup.add(leaf);
                            }
                            break;

                        case 5: // Fiddle leaf fig-like
                            for (let i = 0; i < 5; i++) {
                                const leafGeometry = new THREE.PlaneGeometry(0.8, 1);
                                const leafMaterial = new THREE.MeshStandardMaterial({
                                    color: 0x006400,
                                    side: THREE.DoubleSide
                                });
                                const leaf = new THREE.Mesh(leafGeometry, leafMaterial);

                                leaf.position.y = 1.5 + i * 0.3;
                                leaf.rotation.x = Math.PI / 6;
                                leaf.rotation.y = (i % 2) * Math.PI;

                                plantGroup.add(leaf);
                            }
                            break;

                        case 6: // Pothos-like
                            // Trailing vines
                            for (let i = 0; i < 4; i++) {
                                const angle = ((i / 4) * Math.PI * 2);

                                // Create a curved vine
                                const curve = new THREE.CubicBezierCurve3(
                                    new THREE.Vector3(0, 1.3, 0),
                                    new THREE.Vector3(Math.cos(angle) * 0.5, 1, Math.sin(angle) * 0.5),
                                    new THREE.Vector3(Math.cos(angle) * 1, 0.5, Math.sin(angle) * 1),
                                    new THREE.Vector3(Math.cos(angle) * 1.5, 0, Math.sin(angle) * 1.5)
                                );

                                const points = curve.getPoints(10);
                                const vineGeometry = new THREE.BufferGeometry().setFromPoints(points);
                                const vineMaterial = new THREE.LineBasicMaterial({ color: 0x228B22 });
                                const vine = new THREE.Line(vineGeometry, vineMaterial);

                                plantGroup.add(vine);

                                // Add leaves along the vine
                                for (let j = 0; j < 4; j++) {
                                    const t = j / 3;
                                    const position = curve.getPointAt(t);

                                    const leafGeometry = new THREE.PlaneGeometry(0.3, 0.3);
                                    const leafMaterial = new THREE.MeshStandardMaterial({
                                        color: 0x90EE90,
                                        side: THREE.DoubleSide
                                    });
                                    const leaf = new THREE.Mesh(leafGeometry, leafMaterial);

                                    leaf.position.copy(position);
                                    leaf.rotation.x = Math.PI / 2;
                                    leaf.rotation.z = Math.random() * Math.PI * 2;

                                    plantGroup.add(leaf);
                                }
                            }
                            break;

                        case 7: // Rubber plant-like
                            for (let i = 0; i < 6; i++) {
                                const leafGeometry = new THREE.PlaneGeometry(0.7, 0.9);
                                const leafMaterial = new THREE.MeshStandardMaterial({
                                    color: 0x006400,
                                    side: THREE.DoubleSide,
                                    metalness: 0.3,
                                    roughness: 0.4
                                });
                                const leaf = new THREE.Mesh(leafGeometry, leafMaterial);

                                leaf.position.y = 1.3 + i * 0.25;
                                leaf.rotation.x = Math.PI / 6;
                                leaf.rotation.y = (i % 3) * (Math.PI * 2 / 3);

                                plantGroup.add(leaf);
                            }
                            break;
                    }

                    fallbackModel = { scene: plantGroup };
                }
                break;
        }

        // Add the fallback model to the plant models array
        if (fallbackModel) {
            this.plantModels.push({
                name: modelName,
                model: fallbackModel
            });
            console.log(`Created fallback model for: ${modelName}`);
        }
    }

    async loadModel(path) {
        return new Promise((resolve, reject) => {
            this.modelLoader.load(
                path,
                model => {
                    resolve(model);
                },
                undefined,
                error => {
                    console.error(`Error loading model from ${path}:`, error);
                    reject(error);
                }
            );
        });
    }

    async createPlants() {
        // Create interactive plants based on plant data
        const plantCount = Math.min(this.plantData.length, 10); // Limit to 10 plants
        const radius = 15; // Radius of the circle where plants are placed

        for (let i = 0; i < plantCount; i++) {
            const plantData = this.plantData[i];

            // Calculate position in a circle
            const angle = (i / plantCount) * Math.PI * 2;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;

            // Get a model for this plant
            // For the first 7 plants, use the corresponding model
            // For additional plants, use random models
            let modelName;
            if (i < 7) {
                modelName = `plant${i + 1}`;
            } else {
                // Use bush, flower, or grass for additional plants
                const additionalModels = ['bush', 'flower', 'grass'];
                modelName = additionalModels[Math.floor(Math.random() * additionalModels.length)];
            }

            const modelInfo = this.plantModels.find(m => m.name === modelName);

            if (modelInfo) {
                // Clone the model
                const plantModel = modelInfo.model.scene.clone();

                // Scale and position the plant
                plantModel.scale.set(2, 2, 2);
                plantModel.position.set(x, 0, z);

                // Rotate to face center
                plantModel.rotation.y = Math.atan2(-x, -z);

                // Add random rotation variation
                plantModel.rotation.y += (Math.random() - 0.5) * 0.5;

                // Enable shadows
                plantModel.traverse(child => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });

                // Store plant data with the model
                plantModel.userData = {
                    id: plantData.id,
                    isInteractive: true
                };

                // Add to scene
                this.scene.add(plantModel);

                // Add to plants array
                this.plants.push(plantModel);

                // Create label for this plant
                this.createPlantLabel(plantData);
            }
        }
    }

    createPlantLabel(plantData) {
        // Create the label
        const label = document.createElement('div');
        label.className = 'plant-label';
        label.innerHTML = `
            <div class="plant-name">${plantData.name}</div>
            <div class="plant-hint">Click to learn more</div>
        `;
        label.style.opacity = '0';
        document.body.appendChild(label);

        // Create the indicator
        const indicator = document.createElement('div');
        indicator.className = 'plant-indicator';
        document.body.appendChild(indicator);

        // Store both label and indicator
        this.plantLabels[plantData.uuid] = {
            label: label,
            indicator: indicator
        };
    }

    updatePlantLabel(plant, labelData) {
        if (!labelData) return;
        const { label, indicator } = labelData;

        // Get 2D screen position from 3D world position
        const position = new THREE.Vector3();
        position.setFromMatrixPosition(plant.matrixWorld);
        position.y += 2.5; // Position label higher above the plant

        // Get position for the indicator (slightly below the label)
        const indicatorPosition = position.clone();
        indicatorPosition.y -= 1;

        // Project to 2D screen coordinates
        position.project(this.camera);
        indicatorPosition.project(this.camera);

        // Convert to pixel coordinates
        const x = (position.x * 0.5 + 0.5) * window.innerWidth;
        const y = (-position.y * 0.5 + 0.5) * window.innerHeight;
        const indicatorX = (indicatorPosition.x * 0.5 + 0.5) * window.innerWidth;
        const indicatorY = (-indicatorPosition.y * 0.5 + 0.5) * window.innerHeight;

        // Check if plant is behind the camera
        const isBehindCamera = position.z > 1;

        // Update label position and visibility
        label.style.transform = `translate(-50%, -100%) translate(${x}px, ${y}px)`;

        // Update indicator position and visibility
        indicator.style.transform = `translate(-50%, -50%) translate(${indicatorX}px, ${indicatorY}px)`;

        // Show/hide label and indicator based on hover and camera position
        if (!isBehindCamera) {
            if (this.hoveredPlant === plant) {
                label.style.opacity = '1';
                indicator.classList.add('visible');
                label.style.transform += ' scale(1.1)';
                label.style.boxShadow = '0 6px 16px rgba(0,0,0,0.2)';
                label.style.borderColor = 'rgba(76, 175, 80, 0.5)';
            } else {
                label.style.opacity = '0.9';
                indicator.classList.add('visible');
                label.style.transform = label.style.transform.replace(' scale(1.1)', '');
                label.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                label.style.borderColor = 'rgba(76, 175, 80, 0.3)';
            }
        } else {
            label.style.opacity = '0';
            indicator.classList.remove('visible');
        }
    }

    async addDecorativeTrees() {
        // Add decorative trees around the perimeter
        const treeCount = 15;
        const treeRadius = 35; // Place trees further out

        // Find the tree model
        const treeModelInfo = this.plantModels.find(m => m.name === 'tree');

        if (treeModelInfo) {
            for (let i = 0; i < treeCount; i++) {
                // Calculate position in a circle
                const angle = (i / treeCount) * Math.PI * 2;
                const x = Math.cos(angle) * treeRadius;
                const z = Math.sin(angle) * treeRadius;

                // Clone the tree model
                const treeModel = treeModelInfo.model.scene.clone();

                // Scale and position the tree
                treeModel.scale.set(3, 3, 3);
                treeModel.position.set(x, 0, z);

                // Random rotation
                treeModel.rotation.y = Math.random() * Math.PI * 2;

                // Enable shadows
                treeModel.traverse(child => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });

                // Add to scene
                this.scene.add(treeModel);
            }
        }

        // Add some bushes and flowers for ground cover
        await this.addGroundCover();
    }

    async addGroundCover() {
        // Add bushes, flowers, and grass for ground cover
        const bushModelInfo = this.plantModels.find(m => m.name === 'bush');
        const flowerModelInfo = this.plantModels.find(m => m.name === 'flower');
        const grassModelInfo = this.plantModels.find(m => m.name === 'grass');

        // Add bushes
        if (bushModelInfo) {
            const bushCount = 25;

            for (let i = 0; i < bushCount; i++) {
                // Random position within the garden
                const angle = Math.random() * Math.PI * 2;
                const radius = 5 + Math.random() * 30;
                const x = Math.cos(angle) * radius;
                const z = Math.sin(angle) * radius;

                // Clone the bush model
                const bushModel = bushModelInfo.model.scene.clone();

                // Scale and position the bush
                const scale = 1 + Math.random() * 0.5;
                bushModel.scale.set(scale, scale, scale);
                bushModel.position.set(x, 0, z);

                // Random rotation
                bushModel.rotation.y = Math.random() * Math.PI * 2;

                // Enable shadows
                bushModel.traverse(child => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });

                // Check if position is clear (not on a path or plant)
                const distanceFromCenter = Math.sqrt(x * x + z * z);

                // Avoid placing on the main circular path
                const mainPathRadius = 20;
                const mainPathWidth = 2;
                const isOnMainPath = Math.abs(distanceFromCenter - mainPathRadius) < mainPathWidth;

                // Avoid placing on the central area
                const centralAreaRadius = 5;
                const isInCentralArea = distanceFromCenter < centralAreaRadius;

                // Avoid placing on radial paths
                let isOnRadialPath = false;
                const radialPathCount = 6;

                for (let j = 0; j < radialPathCount; j++) {
                    const pathAngle = (j / radialPathCount) * Math.PI * 2;
                    const angleDiff = Math.abs(((angle - pathAngle) + Math.PI) % (Math.PI * 2) - Math.PI);

                    if (angleDiff < 0.2 && distanceFromCenter < mainPathRadius) {
                        isOnRadialPath = true;
                        break;
                    }
                }

                // Avoid placing too close to plants
                let isTooCloseToPlant = false;
                for (const plant of this.plants) {
                    const dx = plant.position.x - x;
                    const dz = plant.position.z - z;
                    const distanceToPlant = Math.sqrt(dx * dx + dz * dz);

                    if (distanceToPlant < 3) {
                        isTooCloseToPlant = true;
                        break;
                    }
                }

                if (!isOnMainPath && !isInCentralArea && !isOnRadialPath && !isTooCloseToPlant) {
                    this.scene.add(bushModel);
                }
            }
        }

        // Add flowers
        if (flowerModelInfo) {
            const flowerCount = 40;

            for (let i = 0; i < flowerCount; i++) {
                // Random position within the garden
                const angle = Math.random() * Math.PI * 2;
                const radius = 5 + Math.random() * 30;
                const x = Math.cos(angle) * radius;
                const z = Math.sin(angle) * radius;

                // Clone the flower model
                const flowerModel = flowerModelInfo.model.scene.clone();

                // Scale and position the flower
                const scale = 0.8 + Math.random() * 0.4;
                flowerModel.scale.set(scale, scale, scale);
                flowerModel.position.set(x, 0, z);

                // Random rotation
                flowerModel.rotation.y = Math.random() * Math.PI * 2;

                // Enable shadows
                flowerModel.traverse(child => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });

                // Check if position is clear (not on a path)
                const distanceFromCenter = Math.sqrt(x * x + z * z);

                // Avoid placing on the main circular path
                const mainPathRadius = 20;
                const mainPathWidth = 2;
                const isOnMainPath = Math.abs(distanceFromCenter - mainPathRadius) < mainPathWidth;

                // Avoid placing on the central area
                const centralAreaRadius = 5;
                const isInCentralArea = distanceFromCenter < centralAreaRadius;

                // Avoid placing on radial paths
                let isOnRadialPath = false;
                const radialPathCount = 6;

                for (let j = 0; j < radialPathCount; j++) {
                    const pathAngle = (j / radialPathCount) * Math.PI * 2;
                    const angleDiff = Math.abs(((angle - pathAngle) + Math.PI) % (Math.PI * 2) - Math.PI);

                    if (angleDiff < 0.2 && distanceFromCenter < mainPathRadius) {
                        isOnRadialPath = true;
                        break;
                    }
                }

                if (!isOnMainPath && !isInCentralArea && !isOnRadialPath) {
                    this.scene.add(flowerModel);
                }
            }
        }

        // Add grass patches
        if (grassModelInfo) {
            const grassPatchCount = 60;

            for (let i = 0; i < grassPatchCount; i++) {
                // Random position within the garden
                const angle = Math.random() * Math.PI * 2;
                const radius = 5 + Math.random() * 30;
                const x = Math.cos(angle) * radius;
                const z = Math.sin(angle) * radius;

                // Clone the grass model
                const grassModel = grassModelInfo.model.scene.clone();

                // Scale and position the grass
                const scale = 0.7 + Math.random() * 0.3;
                grassModel.scale.set(scale, scale, scale);
                grassModel.position.set(x, 0, z);

                // Random rotation
                grassModel.rotation.y = Math.random() * Math.PI * 2;

                // Enable shadows
                grassModel.traverse(child => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });

                // Check if position is clear (not on a path)
                const distanceFromCenter = Math.sqrt(x * x + z * z);

                // Avoid placing on the main circular path
                const mainPathRadius = 20;
                const mainPathWidth = 2;
                const isOnMainPath = Math.abs(distanceFromCenter - mainPathRadius) < mainPathWidth;

                // Avoid placing on the central area
                const centralAreaRadius = 5;
                const isInCentralArea = distanceFromCenter < centralAreaRadius;

                // Avoid placing on radial paths
                let isOnRadialPath = false;
                const radialPathCount = 6;

                for (let j = 0; j < radialPathCount; j++) {
                    const pathAngle = (j / radialPathCount) * Math.PI * 2;
                    const angleDiff = Math.abs(((angle - pathAngle) + Math.PI) % (Math.PI * 2) - Math.PI);

                    if (angleDiff < 0.2 && distanceFromCenter < mainPathRadius) {
                        isOnRadialPath = true;
                        break;
                    }
                }

                if (!isOnMainPath && !isInCentralArea && !isOnRadialPath) {
                    this.scene.add(grassModel);
                }
            }
        }
    }

    async addBirds() {
        // Create simple bird models
        const birdCount = 8;

        for (let i = 0; i < birdCount; i++) {
            const bird = this.createBirdModel();

            // Random starting position
            const angle = Math.random() * Math.PI * 2;
            const radius = 10 + Math.random() * 30;
            const height = 10 + Math.random() * 15;

            bird.position.set(
                Math.cos(angle) * radius,
                height,
                Math.sin(angle) * radius
            );

            // Store bird data for animation with reduced speeds
            bird.userData = {
                speed: 0.01 + Math.random() * 0.02, // Reduced from 0.05 + Math.random() * 0.1
                radius: radius,
                height: height,
                angle: angle,
                wobble: Math.random() * Math.PI * 2,
                wobbleSpeed: 0.03 + Math.random() * 0.03 // Reduced from 0.1 + Math.random() * 0.1
            };

            this.scene.add(bird);
            this.birds.push(bird);
        }
    }

    createBirdModel() {
        const birdGroup = new THREE.Group();

        // Bird body
        const bodyGeometry = new THREE.SphereGeometry(0.2, 8, 8);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: new THREE.Color().setHSL(Math.random(), 0.7, 0.5)
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        birdGroup.add(body);

        // Bird head
        const headGeometry = new THREE.SphereGeometry(0.12, 8, 8);
        const head = new THREE.Mesh(headGeometry, bodyMaterial);
        head.position.set(0.15, 0.08, 0);
        birdGroup.add(head);

        // Bird beak
        const beakGeometry = new THREE.ConeGeometry(0.05, 0.2, 8);
        const beakMaterial = new THREE.MeshStandardMaterial({ color: 0xFFA500 });
        const beak = new THREE.Mesh(beakGeometry, beakMaterial);
        beak.rotation.z = -Math.PI / 2;
        beak.position.set(0.3, 0.08, 0);
        birdGroup.add(beak);

        // Bird wings
        const wingGeometry = new THREE.PlaneGeometry(0.3, 0.2);
        const wingMaterial = new THREE.MeshStandardMaterial({
            color: bodyMaterial.color,
            side: THREE.DoubleSide
        });

        // Left wing
        const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
        leftWing.position.set(0, 0.1, -0.2);
        leftWing.rotation.y = Math.PI / 4;
        birdGroup.add(leftWing);

        // Right wing
        const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
        rightWing.position.set(0, 0.1, 0.2);
        rightWing.rotation.y = -Math.PI / 4;
        birdGroup.add(rightWing);

        // Bird tail
        const tailGeometry = new THREE.PlaneGeometry(0.2, 0.15);
        const tail = new THREE.Mesh(tailGeometry, wingMaterial);
        tail.position.set(-0.2, 0, 0);
        tail.rotation.y = Math.PI / 2;
        birdGroup.add(tail);

        return birdGroup;
    }

    onMouseMove(event) {
        // Calculate mouse position in normalized device coordinates
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        // Update raycaster
        this.raycaster.setFromCamera(this.mouse, this.camera);

        // Check for intersections with plants
        const intersects = this.raycaster.intersectObjects(this.scene.children, true);

        // Find the first intersected object that is part of a plant
        let intersectedPlant = null;

        for (const intersect of intersects) {
            // Traverse up to find the parent object with userData
            let parent = intersect.object;
            while (parent && !parent.userData?.isInteractive) {
                parent = parent.parent;
            }

            if (parent && parent.userData?.isInteractive) {
                intersectedPlant = parent;
                document.body.style.cursor = 'pointer';

                // Show plant name in tooltip
                const plantId = parent.userData.id;
                const plantData = this.plantData.find(p => p.id === plantId);
                if (plantData) {
                    this.hoverTooltip.textContent = plantData.name;
                    this.hoverTooltip.style.left = `${event.clientX + 15}px`;
                    this.hoverTooltip.style.top = `${event.clientY + 15}px`;
                    this.hoverTooltip.classList.add('visible');
                }
                break;
            }
        }

        // Update hovered plant
        if (this.hoveredPlant !== intersectedPlant) {
            if (this.hoveredPlant) {
                const labelData = this.plantLabels[this.hoveredPlant.uuid];
                if (labelData) {
                    labelData.label.style.transform = labelData.label.style.transform.replace(' scale(1.1)', '');
                    labelData.label.style.opacity = '0.8';
                }
            }

            this.hoveredPlant = intersectedPlant;

            if (!this.hoveredPlant) {
                document.body.style.cursor = 'default';
                this.hoverTooltip.classList.remove('visible');
            }
        }
    }

    getMedicinalUses(plantName) {
        // Convert plant name to lowercase for case-insensitive matching
        const name = plantName.toLowerCase();

        // Define medicinal uses for different types of plants
        const medicinalUses = {
            'Ashwagandha': [
                "Reduces stress and anxiety",
                "Improves cognitive function",
                "Boosts immunity",
                "Enhances physical performance",
                "Helps with insomnia",
                "Balances thyroid hormones",
                "Reduces inflammation",
                "Supports adrenal function"
            ],
            'Aloe Vera': [
                "Treats burns and wounds",
                "Moisturizes skin",
                "Reduces dental plaque",
                "Lowers blood sugar levels",
                "Aids digestion",
                "Accelerates healing of mouth ulcers",
                "Reduces constipation",
                "Anti-aging properties for skin"
            ],
            'Cardamom': [
                "Aids digestion",
                "Freshens breath",
                "Improves cardiovascular health",
                "Relieves respiratory issues",
                "Anti-inflammatory properties",
                "Helps in detoxification",
                "Improves oral health",
                "Enhances appetite"
            ],
            'Cinnamon': [
                "Lowers blood sugar levels",
                "Reduces inflammation",
                "Improves heart health",
                "Antioxidant properties",
                "Antimicrobial effects",
                "Enhances cognitive function",
                "Helps with weight management",
                "Relieves menstrual discomfort"
            ],
            'Clove': [
                "Relieves toothache",
                "Improves digestion",
                "Anti-inflammatory properties",
                "Antimicrobial effects",
                "Relieves respiratory conditions",
                "Enhances liver function",
                "Regulates blood sugar",
                "Aphrodisiac properties"
            ],
            'Tulsi (Holy Basil)': [
                "Reduces stress and anxiety",
                "Boosts immunity",
                "Lowers blood sugar and cholesterol",
                "Protects against infections",
                "Improves respiratory health",
                "Enhances kidney function",
                "Relieves headaches",
                "Supports liver detoxification"
            ],
            'Turmeric': [
                "Powerful anti-inflammatory",
                "Antioxidant properties",
                "Improves brain function",
                "Reduces risk of heart disease",
                "May prevent cancer",
                "Alleviates arthritis symptoms",
                "Aids in digestion",
                "Enhances wound healing"
            ],
            'tree': [
                "Produces oxygen",
                "Removes air pollution",
                "Reduces stress",
                "Improves mental health",
                "Provides shade and cooling",
                "Supports biodiversity",
                "Prevents soil erosion",
                "Reduces noise pollution"
            ],
            'bush': [
                "Provides habitat for wildlife",
                "Reduces soil erosion",
                "Improves air quality",
                "Offers privacy and screening",
                "Supports pollinators",
                "Reduces noise pollution",
                "Enhances landscape beauty",
                "Provides natural barriers"
            ],
            'flower': [
                "Attracts pollinators",
                "Improves mood",
                "Reduces stress",
                "Enhances garden beauty",
                "Supports biodiversity",
                "Provides natural dyes",
                "Creates natural habitats",
                "Promotes relaxation"
            ],
            'grass': [
                "Prevents soil erosion",
                "Improves air quality",
                "Reduces noise pollution",
                "Provides natural cooling",
                "Supports soil health",
                "Creates natural habitats",
                "Enhances landscape beauty",
                "Promotes relaxation"
            ]
        };

        // Check for partial matches in plant names
        for (const [key, uses] of Object.entries(medicinalUses)) {
            if (name.includes(key.toLocaleLowerCase())) {
                return uses;
            }
        }

        // Default medicinal uses if no match is found
        return [
            "Improves air quality",
            "Reduces stress and anxiety",
            "Enhances mood and well-being",
            "Promotes relaxation",
            "Supports mental health",
            "Creates natural habitat",
            "Boosts productivity",
            "Enhances overall environment"
        ];
    }

    onClick(event) {
        // Check if a plant is being hovered
        if (this.hoveredPlant) {
            // Find the plant data for this plant
            const plantId = this.hoveredPlant.userData.id;
            const plantData = this.plantData.find(p => p.id === plantId);

            if (plantData) {
                // Update info panel with plant data
                this.infoPanel.querySelector('.plant-name').textContent = plantData.name;
                this.infoPanel.querySelector('.plant-description').textContent = plantData.description;
                this.infoPanel.querySelector('.water-info').textContent = plantData.careInfo.water;
                this.infoPanel.querySelector('.sunlight-info').textContent = plantData.careInfo.sunlight;
                this.infoPanel.querySelector('.soil-info').textContent = plantData.careInfo.soil;

                // Get and update medicinal uses based on plant name
                const medicinalUses = this.getMedicinalUses(plantData.name);
                const medicinalList = this.infoPanel.querySelector('.medicinal-list');
                medicinalList.innerHTML = ''; // Clear existing items

                medicinalUses.forEach(use => {
                    const li = document.createElement('li');
                    li.innerHTML = `
                                        <span class="medicinal-icon">🌿</span>
                                        <span class="medicinal-text">${use}</span>
                                    `;
                    medicinalList.appendChild(li);
                });

                // Update image if available
                const imageElement = this.infoPanel.querySelector('.plant-image');
                if (plantData.image) {
                    imageElement.src = plantData.image;
                    imageElement.style.display = 'block';
                } else {
                    imageElement.style.display = 'none';
                }

                // Show the info panel
                this.infoPanel.classList.add('active');
            }
        }
    }

    onWindowResize() {
        // Update camera aspect ratio
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();

        // Update renderer size
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(this.animate);

        // Update controls
        this.controls.update();

        // Update plant labels
        for (const plant of this.plants) {
            const labelData = this.plantLabels[plant.uuid];
            this.updatePlantLabel(plant, labelData);
        }

        // Animate birds
        this.animateBirds();

        // Render scene
        this.renderer.render(this.scene, this.camera);
    }

    animateBirds() {
        // Animate birds flying in circular patterns
        for (const bird of this.birds) {
            const data = bird.userData;

            // Update angle
            data.angle += data.speed;
            data.wobble += data.wobbleSpeed;

            // Calculate new position
            bird.position.x = Math.cos(data.angle) * data.radius;
            bird.position.z = Math.sin(data.angle) * data.radius;
            bird.position.y = data.height + Math.sin(data.wobble) * 2;

            // Make bird face direction of movement
            bird.rotation.y = -data.angle - Math.PI / 2;

            // Animate wings
            const leftWing = bird.children[3]; // Left wing
            const rightWing = bird.children[4]; // Right wing

            leftWing.rotation.z = Math.sin(data.wobble * 5) * 0.3;
            rightWing.rotation.z = -Math.sin(data.wobble * 5) * 0.3;
        }
    }

    toggleDayNight() {
        this.isNightMode = !this.isNightMode;

        if (this.isNightMode) {
            // Night mode settings
            this.scene.background = new THREE.Color(0x0a0a1a); // Dark blue night sky
            this.ambientLight.intensity = 0.2;
            this.directionalLight.intensity = 0.1;

            // Add moon light
            if (!this.moonLight) {
                this.moonLight = new THREE.DirectionalLight(0xd8d8ff, 0.5);
                this.moonLight.position.set(-50, 50, -50);
                this.moonLight.castShadow = true;

                // Configure shadow properties for the moon light
                this.moonLight.shadow.mapSize.width = 1024;
                this.moonLight.shadow.mapSize.height = 1024;
                this.moonLight.shadow.camera.near = 10;
                this.moonLight.shadow.camera.far = 200;
                this.moonLight.shadow.camera.left = -50;
                this.moonLight.shadow.camera.right = 50;
                this.moonLight.shadow.camera.top = 50;
                this.moonLight.shadow.camera.bottom = -50;

                this.scene.add(this.moonLight);
            } else {
                this.moonLight.visible = true;
            }

            // Add stars
            if (!this.stars) {
                this.createStars();
            } else {
                this.stars.visible = true;
            }

            // Update sky texture for night
            if (this.skyDome) {
                this.skyDome.material.map = this.nightSkyTexture;
                this.skyDome.material.needsUpdate = true;
            }
        } else {
            // Day mode settings
            this.scene.background = new THREE.Color(0x87ceeb); // Sky blue
            this.ambientLight.intensity = 0.5;
            this.directionalLight.intensity = 1.0;

            // Hide moon light
            if (this.moonLight) {
                this.moonLight.visible = false;
            }

            // Hide stars
            if (this.stars) {
                this.stars.visible = false;
            }

            // Update sky texture for day
            if (this.skyDome) {
                this.skyDome.material.map = this.daySkyTexture;
                this.skyDome.material.needsUpdate = true;
            }
        }
    }

    createStars() {
        const starsGeometry = new THREE.BufferGeometry();
        const starsMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.1,
            transparent: true,
            opacity: 0.8
        });

        const starsVertices = [];
        const starsCount = 2000;
        const starsRadius = 150;

        for (let i = 0; i < starsCount; i++) {
            // Create stars in a hemisphere above the scene
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI * 0.5;

            const x = starsRadius * Math.sin(phi) * Math.cos(theta);
            const y = starsRadius * Math.cos(phi);
            const z = starsRadius * Math.sin(phi) * Math.sin(theta);

            starsVertices.push(x, y, z);
        }

        starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
        this.stars = new THREE.Points(starsGeometry, starsMaterial);
        this.scene.add(this.stars);
    }

    async createSkyDome() {
        // Load day and night sky textures
        this.daySkyTexture = await this.loadTexture('assets/textures/sky_day.jpg');
        this.nightSkyTexture = await this.loadTexture('assets/textures/sky_night.jpg');

        // Create a large sphere for the sky
        const skyGeometry = new THREE.SphereGeometry(150, 32, 32);
        // Flip the geometry inside out
        skyGeometry.scale(-1, 1, 1);

        const skyMaterial = new THREE.MeshBasicMaterial({
            map: this.daySkyTexture,
            side: THREE.BackSide
        });

        this.skyDome = new THREE.Mesh(skyGeometry, skyMaterial);
        this.scene.add(this.skyDome);
    }

    dispose() {
        // Clean up resources when the garden is destroyed

        // Remove event listeners
        window.removeEventListener('mousemove', this.onMouseMove);
        window.removeEventListener('click', this.onClick);
        window.removeEventListener('resize', this.onWindowResize);

        // Remove labels
        for (const uuid in this.plantLabels) {
            const labelData = this.plantLabels[uuid];
            if (labelData.label && labelData.label.parentNode) {
                labelData.label.parentNode.removeChild(labelData.label);
            }
            if (labelData.indicator && labelData.indicator.parentNode) {
                labelData.indicator.parentNode.removeChild(labelData.indicator);
            }
        }

        // Remove info panel
        if (this.infoPanel && this.infoPanel.parentNode) {
            this.infoPanel.parentNode.removeChild(this.infoPanel);
        }

        // Dispose of Three.js resources
        this.scene.traverse(object => {
            if (object.geometry) {
                object.geometry.dispose();
            }

            if (object.material) {
                if (Array.isArray(object.material)) {
                    for (const material of object.material) {
                        this.disposeMaterial(material);
                    }
                } else {
                    this.disposeMaterial(object.material);
                }
            }
        });

        // Dispose of renderer
        this.renderer.dispose();

        // Remove hover tooltip
        if (this.hoverTooltip && this.hoverTooltip.parentNode) {
            this.hoverTooltip.parentNode.removeChild(this.hoverTooltip);
        }

        // Remove back button
        if (this.backButton && this.backButton.parentNode) {
            this.backButton.parentNode.removeChild(this.backButton);
        }
    }

    disposeMaterial(material) {
        // Dispose of material and its textures
        if (material.map) material.map.dispose();
        if (material.lightMap) material.lightMap.dispose();
        if (material.bumpMap) material.bumpMap.dispose();
        if (material.normalMap) material.normalMap.dispose();
        if (material.displacementMap) material.displacementMap.dispose();
        if (material.specularMap) material.specularMap.dispose();
        if (material.envMap) material.envMap.dispose();

        material.dispose();
    }

    resetCamera() {
        // Create a GSAP timeline for smooth animation
        const duration = 1.5; // Animation duration in seconds

        // Animate camera position
        gsap.to(this.camera.position, {
            x: this.initialCameraPosition.x,
            y: this.initialCameraPosition.y,
            z: this.initialCameraPosition.z,
            duration: duration,
            ease: "power2.inOut"
        });

        // Animate controls target
        gsap.to(this.controls.target, {
            x: this.initialCameraTarget.x,
            y: this.initialCameraTarget.y,
            z: this.initialCameraTarget.z,
            duration: duration,
            ease: "power2.inOut",
            onUpdate: () => {
                // Update controls during animation
                this.controls.update();
            }
        });

        // Reset control parameters
        this.controls.minDistance = 5;
        this.controls.maxDistance = 100;
        this.controls.maxPolarAngle = Math.PI / 2 - 0.1;
    }
}





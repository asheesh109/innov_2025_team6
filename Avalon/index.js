document.addEventListener('DOMContentLoaded', function() {
    // Mobile Menu Toggle
    const burger = document.querySelector('.burger');
    const nav = document.querySelector('.nav-links');
    const navLinks = document.querySelectorAll('.nav-links li');
    
    burger.addEventListener('click', function() {
        // Toggle Nav
        nav.classList.toggle('nav-active');
        
        // Animate Links
        navLinks.forEach((link, index) => {
            if (link.style.animation) {
                link.style.animation = '';
            } else {
                link.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.3}s`;
            }
        });
        
        // Burger Animation
        burger.classList.toggle('toggle');
    });
    
    // Add animation to burger menu when scrolling
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        navbar.classList.toggle('scrolled', window.scrollY > 100);
    });

    // Fetch the plants data from plant.json
    fetch('plant.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Now 'data' is your array of plants
            updateCards(data);
            
            // Set up search functionality with the fetched data
            setupSearchFunctionality(data);
        })
        .catch(error => {
            console.error('Error fetching plant data:', error);
        });

    // Function to update cards with plant data
    function updateCards(plants) {
        const cards = document.querySelectorAll('.card');
        
        cards.forEach((card, index) => {
            if (index < plants.length) {
                const plant = plants[index];
                
                // Update card image
                // const cardImage = card.querySelector('.card-image img');
                // cardImage.src = plant.photo_url;
                // cardImage.alt = plant.common_name;
                
                // Update card content
                const cardTitle = card.querySelector('.card-title');
                cardTitle.textContent = plant.common_name;
                
                // Clear existing paragraphs
                const cardContent = card.querySelector('.card-content');
                const paragraphs = cardContent.querySelectorAll('p');
                paragraphs.forEach(p => p.remove());
                
                // Add scientific name
                const scientificName = document.createElement('p');
                scientificName.innerHTML = `<em>${plant.scientific_name}</em>`;
                cardContent.insertBefore(scientificName, cardContent.querySelector('.read-more-btn'));
                
                // Add native regions
                const nativeRegions = document.createElement('p');
                nativeRegions.innerHTML = `<strong>Native to:</strong> ${plant.native_regions.join(', ')}`;
                cardContent.insertBefore(nativeRegions, cardContent.querySelector('.read-more-btn'));
                
                // Add medicinal uses (first 3)
                const medicinalUses = document.createElement('p');
                medicinalUses.innerHTML = `<strong>Medicinal Uses:</strong>`;
                cardContent.insertBefore(medicinalUses, cardContent.querySelector('.read-more-btn'));
                
                const usesList = document.createElement('ul');
                plant.medicinal_uses.slice(0, 3).forEach(use => {
                    const listItem = document.createElement('li');
                    listItem.textContent = use;
                    usesList.appendChild(listItem);
                });
                cardContent.insertBefore(usesList, cardContent.querySelector('.read-more-btn'));
                
                // Store plant ID for modal
                card.setAttribute('data-plant-id', plant.id);
            }
        });
        
        // Update modal functionality
        updateModalWithPlantData(plants);
    }
    
    // Function to update modal with plant data
    function updateModalWithPlantData(plants) {
        const readMoreButtons = document.querySelectorAll('.read-more-btn');
        
        readMoreButtons.forEach(button => {
            button.addEventListener('click', function() {
                const card = this.closest('.card');
                const plantId = parseInt(card.getAttribute('data-plant-id'));
                const plant = plants.find(p => p.id === plantId);
                
                if (!plant) return;
                
                showPlantModal(plant);
            });
        });
    }
    
    // Function to show plant modal
    function showPlantModal(plant) {
        // Create modal content with all plant information
        const modalHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <div class="modal-body">
                    <div class="modal-image">
                        <img src="${plant.photo_url}" alt="${plant.common_name}">
                    </div>
                    <div class="modal-info">
                        <h2>${plant.common_name}</h2>
                        <p><em>${plant.scientific_name}</em></p>
                        
                        <h3>Description</h3>
                        <p>${plant.description}</p>
                        
                        <h3>Medicinal Uses</h3>
                        <ul>
                            ${plant.medicinal_uses.map(use => `<li>${use}</li>`).join('')}
                        </ul>
                        
                        <h3>Medical Description</h3>
                        <p>${plant.medical_description}</p>
                        
                        <h3>Growing Conditions</h3>
                        <ul>
                            <li><strong>Soil:</strong> ${plant.growing_conditions.soil}</li>
                            <li><strong>Climate:</strong> ${plant.growing_conditions.climate}</li>
                            <li><strong>Temperature:</strong> ${plant.growing_conditions.temperature}</li>
                            <li><strong>Water:</strong> ${plant.growing_conditions.water_requirements}</li>
                            <li><strong>Sunlight:</strong> ${plant.growing_conditions.sunlight}</li>
                        </ul>
                        
                        <h3>How to Grow</h3>
                        <p>${plant.how_to_grow}</p>
                        
                        <h3>Native Regions</h3>
                        <p>${plant.native_regions.join(', ')}</p>
                        
                        <h3>Related Diseases Treated</h3>
                        <ul>
                            ${plant.related_diseases_treated.map(disease => `<li>${disease}</li>`).join('')}
                        </ul>
                        
                        <h3>Active Compounds</h3>
                        <ul>
                            ${plant.active_compounds.map(compound => `<li>${compound}</li>`).join('')}
                        </ul>
                        
                        <h3>Traditional Preparation</h3>
                        <p>${plant.traditional_preparation}</p>
                    </div>
                </div>
            </div>
        `;
        
        // Get or create modal container
        let modalContainer = document.querySelector('.modal-container');
        if (!modalContainer) {
            modalContainer = document.createElement('div');
            modalContainer.className = 'modal-container';
            document.body.appendChild(modalContainer);
        }
        
        // Set modal content and show it
        modalContainer.innerHTML = modalHTML;
        modalContainer.classList.add('active');
        document.body.classList.add('modal-open');
        
        // Add close functionality
        const closeButton = modalContainer.querySelector('.close-modal');
        closeButton.addEventListener('click', function() {
            modalContainer.classList.remove('active');
            document.body.classList.remove('modal-open');
        });
        
        // Close when clicking outside
        modalContainer.addEventListener('click', function(event) {
            if (event.target === modalContainer) {
                modalContainer.classList.remove('active');
                document.body.classList.remove('modal-open');
            }
        });
    }
    
    // Function to set up search functionality
    function setupSearchFunctionality(plants) {
        const searchInput = document.getElementById('search-input');
        const searchButton = document.getElementById('search-button');
        const searchContainer = document.querySelector('.search-container');
        
        // Create search results dropdown
        const searchResults = document.createElement('ul');
        searchResults.className = 'search-results';
        searchContainer.appendChild(searchResults);
        
        // Search input handler
        searchInput.addEventListener('input', function() {
            const query = this.value.toLowerCase().trim();
            
            // Clear and hide results if empty query
            if (!query) {
                searchResults.innerHTML = '';
                searchResults.style.display = 'none';
                return;
            }
            
            // Filter plants by name
            const matches = plants.filter(plant => 
                plant.common_name.toLowerCase().includes(query) 
            );
            
            // Display results
            searchResults.innerHTML = '';
            matches.forEach(plant => {
                const item = document.createElement('li');
                item.className = 'search-result-item';
                item.innerHTML = `<img src="${plant.photo_url}" alt="${plant.common_name}"><span>${plant.common_name}</span>`;
                
                // Show modal on click
                item.addEventListener('click', function() {
                    searchInput.value = plant.common_name;
                    searchResults.style.display = 'none';
                    showPlantModal(plant);
                });
                
                searchResults.appendChild(item);
            });
            
            searchResults.style.display = matches.length ? 'block' : 'none';
        });
        
        // Search button click
        searchButton.addEventListener('click', function() {
            const query = searchInput.value.toLowerCase().trim();
            if (!query) return;
            
            const matches = plants.filter(plant => 
                plant.common_name.toLowerCase().includes(query) || 
                plant.scientific_name.toLowerCase().includes(query)
            );
            
            if (matches.length > 0) {
                // If there's an exact match, show that plant's modal
                const exactMatch = matches.find(plant => 
                    plant.common_name.toLowerCase() === query
                );
                
                if (exactMatch) {
                    showPlantModal(exactMatch);
                    searchResults.style.display = 'none';
                } else {
                    // Otherwise trigger the input event to show dropdown
                    searchInput.dispatchEvent(new Event('input'));
                }
            } else {
                searchResults.innerHTML = '';
                searchResults.style.display = 'none';
                alert(`No plants found matching "${query}"`);
            }
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!searchContainer.contains(e.target)) {
                searchResults.style.display = 'none';
            }
        });
        
        // Enter key handler
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') searchButton.click();
        });
    }
});

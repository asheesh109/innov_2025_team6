// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDPrCZx6yg2snTzfBhn-V_S0znti7VEBWY",
  authDomain: "quickhire-f72f8.firebaseapp.com",
  projectId: "quickhire-f72f8",
  storageBucket: "quickhire-f72f8.firebasestorage.app",
  messagingSenderId: "509107785395",
  appId: "1:509107785395:web:5e5ee2d0de21eadc666ac6",
  measurementId: "G-420LR9CS37"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get a reference to the database service
const database = firebase.database();

const question = document.querySelector("#question");
const options = document.querySelector("#options");
const next = document.querySelector("#next-btn");
const scorebox = document.querySelector("#score");
const quizContainer = document.querySelector("#quiz-container");

var first = true;
var a = [];
var score = 0;
var index = 0;
var userId = null; // We'll generate a unique ID for each user

// Generate a unique ID for the user
function generateUserId() {
  // Check if userId exists in localStorage
  let id = localStorage.getItem('herbIqUserId');
  if (!id) {
    // Generate a new ID if not found
    id = 'user_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('herbIqUserId', id);
  }
  return id;
}

// Function to save score to Firebase
function saveScoreToFirebase(score, totalQuestions, bestScore) {
  if (!userId) {
    userId = generateUserId();
  }

  const userScoreRef = database.ref('scores/' + userId);

  // Update the user's score data
  userScoreRef.update({
    lastScore: score,
    bestScore: bestScore,
    totalQuestions: totalQuestions,
    lastPlayed: new Date().toISOString(),
    percentage: Math.round((score / totalQuestions) * 100)
  })
    .then(() => {
      console.log("Score saved successfully");
    })
    .catch((error) => {
      console.error("Error saving score: ", error);
    });
}

// Create and add home button at the start - moved to bottom and only shown on first question
function addHomeButton() {
  // Create container for the button (for positioning)
  const homeButtonContainer = document.createElement("div");
  homeButtonContainer.style.textAlign = "center";
  homeButtonContainer.style.marginTop = "20px";
  homeButtonContainer.id = "home-button-container";

  // Create the home button
  const homeButton = document.createElement("button");
  homeButton.textContent = "Back to Home";
  homeButton.id = "home-btn";
  homeButton.style.padding = "8px 15px";
  homeButton.style.backgroundColor = "#4caf50";
  homeButton.style.color = "white";
  homeButton.style.border = "none";
  homeButton.style.borderRadius = "5px";
  homeButton.style.cursor = "pointer";
  homeButton.style.fontSize = "14px";
  homeButton.style.transition = "background-color 0.3s ease";

  // Add hover effects
  homeButton.addEventListener("mouseover", () => {
    homeButton.style.backgroundColor = "#3e8e41";
  });

  homeButton.addEventListener("mouseout", () => {
    homeButton.style.backgroundColor = "#4caf50";
  });

  // Add click event to redirect to home page
  homeButton.addEventListener("click", () => {
    window.location.href = "index.html"; // Change this to your home page URL
  });

  // Add the button to its container
  homeButtonContainer.appendChild(homeButton);

  // Add the container to the bottom of the quiz container
  quizContainer.appendChild(homeButtonContainer);
}

async function loadQuestion() {
  try {
    // Initialize userId
    userId = generateUserId();

    // Since you've pasted the JSON data, we'll use that directly instead of fetching
    // If you want to fetch from a file later, you can uncomment the fetch lines
    // var result = await fetch("./quiz.json");
    // a = await result.json();

    // Using the JSON data directly from the pasted content
    a = [

      {
        "id": 1,
        "question": "Which plant is known as 'Holy Basil' and is sacred in India?",
        "answer_options": [
          "Ashwagandha",
          "Tulsi",
          "Neem",
          "Aloe Vera"
        ],
        "correct_option": 1,
        "plant_info": "Tulsi (Holy Basil) is considered sacred in India and is often planted in courtyards and temples. It has antimicrobial, anti-inflammatory, and adaptogenic properties."
      },
      {
        "id": 2,
        "question": "Can you identify this medicinal plant?",
        "image_url": "https://files.nccih.nih.gov/aloe-vera-steven-foster-square.jpg",
        "answer_options": [
          "Aloe Vera",
          "Neem",
          "Tulsi",
          "Turmeric"
        ],
        "correct_option": 0,
        "plant_info": "Aloe Vera is known for its healing properties. It thrives in sandy, arid soil and is drought-tolerant. The gel from its leaves is used to treat burns, skin irritations, and can be consumed for digestive health."
      },
      {
        "id": 3,
        "question": "What is the scientific name of Turmeric?",
        "answer_options": [
          "Curcuma longa",
          "Withania somnifera",
          "Syzygium aromaticum",
          "Ocimum sanctum"
        ],
        "correct_option": 0,
        "plant_info": "Turmeric (Curcuma longa) contains curcumin, a powerful anti-inflammatory compound. It's widely used in Ayurvedic medicine and as a spice in cooking."
      },
      {
        "id": 4,
        "question": "Which plant's root is used to reduce stress and improve sleep?",
        "answer_options": [
          "Cardamom",
          "Ashwagandha",
          "Cinnamon",
          "Clove"
        ],
        "correct_option": 1,
        "plant_info": "Ashwagandha (Withania somnifera) is an adaptogenic herb. Its root is used in Ayurveda to combat stress, improve sleep quality, and boost overall vitality."
      },

      {
        "id": 5,
        "question": "Which of these plants thrives in sandy, arid soil and is drought-tolerant?",
        "answer_options": [
          "Aloe Vera",
          "Tulsi",
          "Pepper",
          "Ginger"
        ],
        "correct_option": 0,
        "plant_info": "Aloe Vera is well-adapted to arid conditions with its thick, water-storing leaves. This makes it an excellent choice for water-wise gardens."
      },
      {
        "id": 6,
        "question": "Which aromatic spice is shown in this image?",
        "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4xAy3BYvpvJ5aVzems4ySVuktW4R5xldRHQ&s",
        "answer_options": [
          "Clove",
          "Cardamom",
          "Cinnamon",
          "Turmeric"
        ],
        "correct_option": 0,
        "plant_info": "Clove (Syzygium aromaticum) contains eugenol, which has antimicrobial properties. It's commonly used to treat tooth pain and as a cooking spice."
      },
      {
        "id": 7,
        "question": "What is the primary active compound in Cinnamon responsible for its antimicrobial properties?",
        "answer_options": [
          "Curcumin",
          "Cinnamaldehyde",
          "Eugenol",
          "Withanolides"
        ],
        "correct_option": 1,
        "plant_info": "Cinnamaldehyde gives cinnamon its distinctive flavor and aroma, while also providing antimicrobial benefits that have been used in traditional medicine for centuries."
      },

      {
        "id": 8,
        "question": "Which plant is commonly used to treat tooth pain and contains eugenol?",
        "answer_options": [
          "Clove",
          "Fenugreek",
          "Amla",
          "Sandalwood"
        ],
        "correct_option": 0,
        "plant_info": "Clove oil is a traditional remedy for toothache due to its natural anesthetic properties from eugenol, which numbs pain and reduces inflammation."
      },
      {
        "id": 9,
        "question": "Identify this green pod spice that requires high humidity:",
        "image_url": "https://www.jiomart.com/images/product/original/rvziuyebic/cloud-farm-hybrid-elam-ancha-elaichi-cardamom-plant-200-mm-cf_o12-product-images-orvziuyebic-p602994104-1-202307071236.jpg?im=Resize=(1000,1000)",
        "answer_options": [
          "Turmeric",
          "Cardamom",
          "Clove",
          "Ashwagandha"
        ],
        "correct_option": 1,
        "plant_info": "Cardamom requires high moisture and a humid climate. It's the third most expensive spice in the world and is used in both sweet and savory dishes, as well as traditional medicine."
      },
      {
        "id": 10,
        "question": "Which plant takes 15-20 years to mature for its fragrant wood harvest?",
        "answer_options": [
          "Neem",
          "Sandalwood",
          "Moringa",
          "Jamun"
        ],
        "correct_option": 1,
        "plant_info": "Sandalwood is slow-growing and highly valued for its aromatic wood, which is used in perfumes, incense, and traditional medicine for its cooling properties."
      },
      {
        "id": 11,
        "question": "Identify this sacred plant used in Indian rituals:",
        "image_url": "https://exoticflora.in/cdn/shop/products/8EXgcOzqVM_1080x.jpg?v=1599196405",
        "answer_options": [
          "Neem",
          "Tulsi",
          "Turmeric",
          "Clove"
        ],
        "correct_option": 1,
        "plant_info": "Tulsi (Holy Basil) is considered sacred in India. It has antimicrobial, anti-inflammatory, and adaptogenic properties. Often grown in homes and temples."
      },
      {
        "id": 12,
        "question": "What is the traditional preparation method for Giloy?",
        "answer_options": [
          "Leaf paste applied topically",
          "Root powder mixed with milk",
          "Stem boiled into a decoction",
          "Fruit juiced"
        ],
        "correct_option": 2,
        "plant_info": "Giloy (Tinospora cordifolia) is known as 'Amrita' or the root of immortality in Ayurveda. Its stems are typically boiled into a decoction to boost immunity."
      },
      {
        "id": 13,
        "question": "Which aromatic bark is shown in this image?",
        "image_url": "https://www.terraorganics.in/image/cache/catalog/Herbals/Cinamon1-900x900.jpg",
        "answer_options": [
          "Neem",
          "Cinnamon",
          "Turmeric",
          "Clove"
        ],
        "correct_option": 1,
        "plant_info": "Cinnamon contains cinnamaldehyde, which is responsible for its antimicrobial properties. It's used to regulate blood sugar and has a warm, sweet flavor used in many cuisines."
      },
      {
        "id": 14,
        "question": "Which plant is known for lowering blood sugar and has the common name 'Bitter Gourd'?",
        "answer_options": [
          "Karela",
          "Shatavari",
          "Punarnava",
          "Brahmi"
        ],
        "correct_option": 0,
        "plant_info": "Karela (Bitter Gourd) contains compounds that act similar to insulin, helping lower blood glucose levels. It's commonly used in diabetes management in traditional medicine."
      },
      {
        "id": 15,
        "question": "Can you identify this adaptogenic medicinal herb?",
        "image_url": "https://files.nccih.nih.gov/ashwagandha-credit-oregon-s-wild-harvest-a-square-medium-res.jpg",
        "answer_options": [
          "Turmeric",
          "Ashwagandha",
          "Cardamom",
          "Neem"
        ],
        "correct_option": 1,
        "plant_info": "Ashwagandha (Withania somnifera) is an adaptogenic herb used to reduce stress and improve sleep. Its root is the most commonly used part in traditional medicine."
      },
      {
        "id": 16,
        "question": "Which of these plants is native to India and used to boost lactation?",
        "answer_options": [
          "Fenugreek",
          "Coriander",
          "Lemongrass",
          "Tamarind"
        ],
        "correct_option": 0,
        "plant_info": "Fenugreek seeds contain compounds that mimic estrogen, helping to increase milk production in nursing mothers. They're often consumed as tea or added to food."
      },
      {
        "id": 17,
        "question": "What is the cultivation period for Turmeric?",
        "answer_options": [
          "60-90 days",
          "8-10 months",
          "2-3 years",
          "15-20 years"
        ],
        "correct_option": 1,
        "plant_info": "Turmeric requires 8-10 months from planting to harvest. The rhizomes are dug up, boiled, and dried to produce the bright yellow powder used in cooking and medicine."
      },
      {
        "id": 18,
        "question": "Which plant's fruit is rich in Vitamin C and known as Indian gooseberry?",
        "answer_options": [
          "Amla",
          "Jamun",
          "Bael",
          "Haritaki"
        ],
        "correct_option": 0,
        "plant_info": "Amla (Indian Gooseberry) contains 20 times more vitamin C than oranges. It's a key ingredient in many Ayurvedic formulations and is known for its immunity-boosting properties."
      }
    ];

    // Add the home button to the quiz container
    addHomeButton();

    // Display the first question
    displayQuestion();
  } catch (error) {
    console.log(error);
  }
}

function displayQuestion() {
  // Clear previous options
  options.innerHTML = "";

  // Display the question text
  question.innerHTML = a[index].question;

  // If there's an image for this question, display it
  if (a[index].image_url) {
    const img = document.createElement("img");
    img.src = a[index].image_url;
    img.alt = "Question Image";
    img.style.maxWidth = "100%";
    img.style.marginBottom = "15px";

    // Insert the image before the options
    question.appendChild(img);
  }

  // Add the answer options
  a[index].answer_options.forEach((current, option_index) => {
    console.log(a[index].answer_options);
    let button = document.createElement("button");
    button.textContent = current;
    button.classList.add("option-btn");
    button.addEventListener("click", () => {
      if (first === true) {
        first = false;
        selectAns(option_index);
      }
    });
    options.appendChild(button);
  });
}

function selectAns(option_index) {
  var correctans = document.createElement("p");
  let buttonsArray = document.querySelectorAll(".option-btn");

  // Hide the home button after selecting an option on the first question
  if (index === 0) {
    const homeButtonContainer = document.getElementById("home-button-container");
    if (homeButtonContainer) {
      homeButtonContainer.style.display = "none";
    }
  }

  buttonsArray.forEach((button, button_index) => {
    button.disabled = true;
    if (button_index === a[index].correct_option) {
      button.style.backgroundColor = "green";
    } else {
      button.style.backgroundColor = "red";
    }
  });

  // Fixed the condition - comparing option_index with correct_option
  if (option_index === a[index].correct_option) {
    score++;
    scorebox.textContent = "Score: " + score;
    correctans.textContent = "Correct Answer";
  } else {
    correctans.textContent = "Wrong Answer";
  }

  // Display plant information
  if (a[index].plant_info) {
    const plantInfo = document.createElement("p");
    plantInfo.textContent = a[index].plant_info;
    plantInfo.style.fontStyle = "italic";
    plantInfo.style.marginTop = "10px";
    options.appendChild(plantInfo);
  }

  options.appendChild(correctans);
}

// Function to determine grade and message based on score
function getGradeAndMessage(score, totalQuestions) {
  const percentage = (score / totalQuestions) * 100;
  let grade, message;

  if (percentage >= 80) {
    grade = "Excellent";
    message = "Congratulations! You have exceptional knowledge of medicinal plants. Your understanding of these healing plants is impressive!";
  } else if (percentage >= 60) {
    grade = "Good";
    message = "Well done! You have a solid understanding of medicinal plants. Keep exploring to expand your knowledge even further.";
  } else if (percentage >= 40) {
    grade = "Fair";
    message = "You have a basic understanding of medicinal plants. With a bit more study, you can become quite knowledgeable!";
  } else {
    grade = "Needs Improvement";
    message = "This is a great start to your journey in learning about medicinal plants. Don't be discouraged - keep learning and try again!";
  }

  return { grade, message };
}

// Function to display results with the current score and best score
function displayResults(grade, message, score, totalQuestions, bestScore, isNewHighScore) {
  // Create a results container
  const resultsContainer = document.createElement("div");
  resultsContainer.style.textAlign = "center";
  resultsContainer.style.padding = "20px";
  resultsContainer.style.backgroundColor = "#f9f9f9";
  resultsContainer.style.borderRadius = "10px";
  resultsContainer.style.margin = "20px 0";

  // Create and style the grade element
  const gradeElement = document.createElement("h2");
  gradeElement.textContent = `Grade: ${grade}`;
  gradeElement.style.color = grade === "Excellent" ? "#1e8e3e" :
    grade === "Good" ? "#188038" :
      grade === "Fair" ? "#f9ab00" : "#d93025";
  gradeElement.style.marginBottom = "10px";

  // Create the score element
  const scoreElement = document.createElement("h3");
  scoreElement.textContent = `Final Score: ${score} / ${totalQuestions} (${Math.round((score / totalQuestions) * 100)}%)`;
  scoreElement.style.marginTop = "10px";

  // Add best score element
  const bestScoreElement = document.createElement("p");
  bestScoreElement.textContent = `Your Best Score: ${bestScore} / ${totalQuestions} (${Math.round((bestScore / totalQuestions) * 100)}%)`;
  bestScoreElement.style.fontWeight = "bold";
  bestScoreElement.style.color = "#1e5631";
  bestScoreElement.style.marginTop = "10px";

  // If this is a new high score, add a congratulatory message
  if (isNewHighScore && score > 0) {
    const newHighScoreElement = document.createElement("p");
    newHighScoreElement.textContent = "🎉 NEW HIGH SCORE! 🎉";
    newHighScoreElement.style.color = "#ff6700";
    newHighScoreElement.style.fontWeight = "bold";
    newHighScoreElement.style.fontSize = "18px";
    newHighScoreElement.style.marginTop = "5px";
    resultsContainer.appendChild(newHighScoreElement);
  }

  // Create the message element
  const messageElement = document.createElement("p");
  messageElement.textContent = message;
  messageElement.style.fontSize = "16px";
  messageElement.style.marginBottom = "15px";
  messageElement.style.marginTop = "15px";

  // Create buttons container for better alignment
  const buttonsContainer = document.createElement("div");
  buttonsContainer.style.display = "flex";
  buttonsContainer.style.justifyContent = "center";
  buttonsContainer.style.gap = "15px";
  buttonsContainer.style.marginTop = "20px";

  // Create a restart button
  const restartButton = document.createElement("button");
  restartButton.textContent = "Try Again";
  restartButton.classList.add("restart-btn");
  restartButton.style.padding = "10px 20px";
  restartButton.style.backgroundColor = "#4caf50";
  restartButton.style.color = "white";
  restartButton.style.border = "none";
  restartButton.style.borderRadius = "5px";
  restartButton.style.cursor = "pointer";
  restartButton.style.fontWeight = "bold";
  restartButton.style.transition = "background-color 0.3s ease";

  // Add hover effect for restart button
  restartButton.addEventListener("mouseover", () => {
    restartButton.style.backgroundColor = "#3e8e41";
  });

  restartButton.addEventListener("mouseout", () => {
    restartButton.style.backgroundColor = "#4caf50";
  });

  // Add click event to restart the quiz
  restartButton.addEventListener("click", restartQuiz);

  // Create a home button
  const homeButton = document.createElement("button");
  homeButton.textContent = "Back to Home";
  homeButton.classList.add("home-btn");
  homeButton.style.padding = "10px 20px";
  homeButton.style.backgroundColor = "#fdd835";
  homeButton.style.color = "#333";
  homeButton.style.border = "none";
  homeButton.style.borderRadius = "5px";
  homeButton.style.cursor = "pointer";
  homeButton.style.fontWeight = "bold";
  homeButton.style.transition = "background-color 0.3s ease";

  // Add hover effect for home button
  homeButton.addEventListener("mouseover", () => {
    homeButton.style.backgroundColor = "#fbc02d";
  });

  homeButton.addEventListener("mouseout", () => {
    homeButton.style.backgroundColor = "#fdd835";
  });

  // Add click event to go back to home page
  homeButton.addEventListener("click", () => {
    window.location.href = "index.html"; // Change this to your home page URL
  });

  // Add buttons to the container
  buttonsContainer.appendChild(restartButton);
  buttonsContainer.appendChild(homeButton);

  // Add all elements to the results container
  resultsContainer.appendChild(gradeElement);
  resultsContainer.appendChild(scoreElement);
  resultsContainer.appendChild(bestScoreElement);
  resultsContainer.appendChild(messageElement);
  resultsContainer.appendChild(buttonsContainer);

  // Clear the quiz area and add the results
  question.textContent = "Quiz Completed!";
  options.innerHTML = "";
  options.appendChild(resultsContainer);

  // Hide the next button
  next.style.display = "none";

  // Update the scorebox as well
  scorebox.textContent = `Score: ${score} / ${totalQuestions}`;
}

// Function to restart the quiz
function restartQuiz() {
  // Reset quiz variables
  score = 0;
  index = 0;
  first = true;

  // Reset the score display
  scorebox.textContent = "Score: 0";

  // Show the next button again
  next.style.display = "inline-block";

  // Load the first question
  displayQuestion();

  // Show the home button again for the first question
  const homeButtonContainer = document.getElementById("home-button-container");
  if (homeButtonContainer) {
    homeButtonContainer.style.display = "block";
  }
}

// Initialize the quiz
loadQuestion();

// Event listener for the next button
next.addEventListener("click", () => {
  if (!first) {
    // Check if the quiz has ended before incrementing the index
    if (index === a.length - 1) {
      // Quiz ended - first check if we have a new high score
      if (!userId) {
        userId = generateUserId();
      }

      const userScoreRef = database.ref('scores/' + userId);
      userScoreRef.once('value')
        .then((snapshot) => {
          const userData = snapshot.val() || {};
          const currentBestScore = userData.bestScore || 0;
          const isNewHighScore = score > currentBestScore;
          const newBestScore = Math.max(currentBestScore, score);

          // Save score to Firebase with the new best score
          saveScoreToFirebase(score, a.length, newBestScore);

          // Display final score, grade, and motivational message
          const { grade, message } = getGradeAndMessage(score, a.length);

          // Create and show results with the correct best score
          displayResults(grade, message, score, a.length, newBestScore, isNewHighScore);
        })
        .catch((error) => {
          console.error("Error retrieving best score: ", error);

          // Still display results even if there's an error
          const { grade, message } = getGradeAndMessage(score, a.length);
          displayResults(grade, message, score, a.length, score, true);
        });

      // Hide the next button
      next.style.display = "none";
    } else {
      // Move to the next question
      first = true;
      index++;
      options.innerHTML = "";

      // Hide the home button after the first question
      if (index > 0) {
        const homeButtonContainer = document.getElementById("home-button-container");
        if (homeButtonContainer) {
          homeButtonContainer.style.display = "none";
        }
      }

      // Display the next question
      displayQuestion();
    }
  } else {
    alert("Select an option");
  }
});
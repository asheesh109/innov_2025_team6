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
const auth = firebase.auth();

// DOM elements
const tabButtons = document.querySelectorAll('.tab-btn');
const switchForms = document.querySelectorAll('.switch-form');
const formPanels = document.querySelectorAll('.form-panel');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const resetPasswordForm = document.getElementById('reset-password-form');
const forgotPasswordLink = document.getElementById('forgot-password-link');
const backToLoginBtn = document.querySelector('.back-to-login');
const toast = document.getElementById('toast');
const toastMessage = document.querySelector('.toast-message');
const toastClose = document.querySelector('.toast-close');
const rememberMeCheckbox = document.getElementById('remember-me');
const passwordInput = document.getElementById('signup-password');
const passwordMeter = document.getElementById('password-meter');
const passwordStrengthText = document.getElementById('password-strength-text');
// const guestLoginBtn = document.getElementById('guest-login-button');
// const guestLoginBtnSignup = document.getElementById('guest-login-button-signup');

// Check if user was remembered
const rememberedEmail = localStorage.getItem('rememberedEmail');
if (rememberedEmail) {
  document.getElementById('login-email').value = rememberedEmail;
  rememberMeCheckbox.checked = true;
}

// Tab switching functionality
tabButtons.forEach(button => {
  button.addEventListener('click', () => {
    const tabId = button.getAttribute('data-tab');
    switchTab(tabId);
  });
});

switchForms.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const tabId = link.getAttribute('data-tab');
    switchTab(tabId);
  });
});

forgotPasswordLink.addEventListener('click', (e) => {
  e.preventDefault();
  switchTab('reset-password');
  // Pre-fill email from login form if available
  const loginEmail = document.getElementById('login-email').value;
  if (loginEmail) {
    document.getElementById('reset-email').value = loginEmail;
  }
});

backToLoginBtn.addEventListener('click', () => {
  switchTab('login');
});

function switchTab(tabId) {
  // Only update tabs for login/signup, not for reset password
  if (tabId === 'login' || tabId === 'signup') {
    // Update active tab
    tabButtons.forEach(btn => {
      if (btn.getAttribute('data-tab') === tabId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  // Show active panel
  formPanels.forEach(panel => {
    if (panel.id === `${tabId}-panel`) {
      panel.classList.add('active');
    } else {
      panel.classList.remove('active');
    }
  });
}

// Toast notification
function showToast(message, type = 'success') {
  toastMessage.textContent = message;
  toast.className = `toast show ${type}`;

  setTimeout(() => {
    toast.classList.remove('show');
  }, 5000);
}

toastClose.addEventListener('click', () => {
  toast.classList.remove('show');
});

// Set loading state
function setLoading(button, isLoading) {
  if (isLoading) {
    button.classList.add('loading');
    button.disabled = true;
  } else {
    button.classList.remove('loading');
    button.disabled = false;
  }
}

// Password strength meter
passwordInput.addEventListener('input', function () {
  const password = this.value;
  const strength = calculatePasswordStrength(password);

  // Reset classes
  passwordMeter.className = 'password-strength-meter';

  if (password.length === 0) {
    passwordMeter.style.width = '0';
    passwordStrengthText.textContent = 'Password strength';
  } else if (strength < 30) {
    passwordMeter.classList.add('password-strength-weak');
    passwordStrengthText.textContent = 'Weak';
  } else if (strength < 60) {
    passwordMeter.classList.add('password-strength-fair');
    passwordStrengthText.textContent = 'Fair';
  } else if (strength < 80) {
    passwordMeter.classList.add('password-strength-good');
    passwordStrengthText.textContent = 'Good';
  } else {
    passwordMeter.classList.add('password-strength-strong');
    passwordStrengthText.textContent = 'Strong';
  }
});

function calculatePasswordStrength(password) {
  let strength = 0;

  // Length contribution (up to 40%)
  if (password.length > 0) {
    strength += Math.min(40, password.length * 4);
  }

  // Complexity contribution
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
    strength += 15; // Has both upper and lowercase
  }
  if (/\d/.test(password)) {
    strength += 15; // Has numbers
  }
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    strength += 15; // Has special characters
  }
  if (password.length > 8 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /\d/.test(password) &&
    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    strength += 15; // Bonus for having everything
  }

  return Math.min(100, strength);
}

// Guest login functionality
function handleGuestLogin() {
  setLoading(this, true);

  auth.signInAnonymously()
    .then(() => {
      showToast('Logged in as guest', 'info');
      // Redirect or update UI as needed
      console.log('User logged in as guest');
      window.location.href = 'index.html';
    })
    .catch((error) => {
      showToast(error.message, 'error');
    })
    .finally(() => {
      setLoading(this, false);
    });
}

// guestLoginBtn.addEventListener('click', ()=>{
//   this.querySelector('.spinner').style.display = 'inline-block';
    
//     // Navigate to index.html
//     window.location.href = 'index.html';
// });
// guestLoginBtnSignup.addEventListener('click', ()=>{
//   this.querySelector('.spinner').style.display = 'inline-block';
    
//     // Navigate to index.html
//     window.location.href = 'index.html';
//   });

// Firebase Email/Password Login
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  const loginButton = document.getElementById('login-button');

  // Handle "Remember me" functionality
  if (rememberMeCheckbox.checked) {
    localStorage.setItem('rememberedEmail', email);
  } else {
    localStorage.removeItem('rememberedEmail');
  }

  setLoading(loginButton, true);

  // Set persistence based on "Remember me"
  const persistence = rememberMeCheckbox.checked
    ? firebase.auth.Auth.Persistence.LOCAL  // Remembered even after browser close
    : firebase.auth.Auth.Persistence.SESSION;  // Forgotten when browser closes

  auth.setPersistence(persistence)
    .then(() => {
      return auth.signInWithEmailAndPassword(email, password);
    })
    .then((userCredential) => {
      showToast('Successfully logged in!');
      // Redirect or update UI as needed
      console.log('User logged in:', userCredential.user.email);
      window.location.href = 'index.html';
    })
    .catch((error) => {
      showToast(error.message, 'error');
    })
    .finally(() => {
      setLoading(loginButton, false);
    });
});

// Firebase Email/Password Signup
signupForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;
  const confirmPassword = document.getElementById('signup-confirm').value;
  const signupButton = document.getElementById('signup-button');

  if (password !== confirmPassword) {
    showToast('Passwords do not match', 'error');
    return;
  }

  // Check if password is strong enough
  const passwordStrength = calculatePasswordStrength(password);
  if (passwordStrength < 50) {
    showToast('Please use a stronger password', 'error');
    return;
  }

  setLoading(signupButton, true);

  auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      showToast('Account created successfully!');
      // Send email verification
      return userCredential.user.sendEmailVerification()
        .then(() => {
          // Switch to login tab
          switchTab('login');
          showToast('Verification email sent. Please check your inbox.', 'success');

          // Clear signup form
          signupForm.reset();

          return userCredential;
        });
    })
    .catch((error) => {
      showToast(error.message, 'error');
    })
    .finally(() => {
      setLoading(signupButton, false);
    });
});

// Password Reset
resetPasswordForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const email = document.getElementById('reset-email').value;
  const resetButton = document.getElementById('reset-button');

  setLoading(resetButton, true);

  auth.sendPasswordResetEmail(email)
    .then(() => {
      showToast('Password reset email sent!', 'success');
      switchTab('login');
      resetPasswordForm.reset();
    })
    .catch((error) => {
      showToast(error.message, 'error');
    })
    .finally(() => {
      setLoading(resetButton, false);
    });
});


// Auth state changes
auth.onAuthStateChanged((user) => {
  if (user) {
    // User is signed in
    console.log('User is signed in:', user.email || 'Guest user (anonymous)');

    // Check if anonymous
    if (user.isAnonymous) {
      console.log('This is a guest session');
      // You could set guest-specific UI elements or restrictions here
    }
    // Check if email is verified (for non-anonymous users)
    else if (!user.emailVerified) {
      console.log('Email not verified');
      // You could show a verification reminder here
    }

    // Update UI or redirect as needed
    // window.location.href = 'dashboard.html';
  } else {
    // User is signed out
    console.log('User is signed out');
  }
});
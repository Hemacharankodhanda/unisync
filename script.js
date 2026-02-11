// DOM Elements
const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');
const loginModal = document.getElementById('login-modal');
const signupModal = document.getElementById('signup-modal');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const closeButtons = document.querySelectorAll('.close-modal');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mainNav = document.getElementById('main-nav');
const header = document.getElementById('header');

// Application State
window.currentUser = null;
let collectionsInitialized = false;

// Campus Feed State
let campusFeedState = {
    allItems: [],
    filteredItems: [],
    displayedItems: [],
    currentFilter: 'all',
    currentSearch: '',
    itemsPerPage: 12,
    currentPage: 1
};

// Initialize the application
function initApp() {
    // Wait for Firebase to be available
    if (typeof auth === 'undefined') {
        setTimeout(initApp, 100);
        return;
    }
    
    setupEventListeners();
    setupCampusFeed();
    enhanceCollectionListeners();
    addDemoDataButton();
    console.log('UniSync app initialized');
}

// Setup all event listeners
function setupEventListeners() {
    // Modal event listeners
    if (loginBtn) loginBtn.addEventListener('click', () => openModal(loginModal));
    if (signupBtn) signupBtn.addEventListener('click', () => openModal(signupModal));
    
    // Close modal buttons
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            closeModal(modal);
        });
    });
    
    // Mobile menu
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    }
    
    // Header scroll effect
    window.addEventListener('scroll', handleHeaderScroll);
    
    // Form submissions
    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    if (signupForm) signupForm.addEventListener('submit', handleSignup);
    
    // Feature buttons
    setupFeatureButtons();
    
    // Section action buttons
    setupSectionButtons();
    
    // Hero buttons
    setupHeroButtons();
    
    // Spotify integration
    setupSpotifyIntegration();
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target);
        }
    });
    
    // Setup auth state listener
    setupAuthListener();
}

// Setup auth state listener
function setupAuthListener() {
    if (window.auth && window.onAuthStateChanged) {
        onAuthStateChanged(auth, (user) => {
            window.currentUser = user;
            if (user) {
                // User is signed in
                updateAuthUI(user);
                initializeCollections();
            } else {
                // User is signed out
                updateAuthUI(null);
            }
        });
    }
}

// Setup feature card buttons
function setupFeatureButtons() {
    const featureButtons = document.querySelectorAll('.feature-action-btn');
    
    featureButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const feature = this.getAttribute('data-feature');
            handleFeatureClick(feature, this);
        });
    });
}

// Setup section action buttons
function setupSectionButtons() {
    // Lost & Found buttons
    const addLostItemBtn = document.getElementById('add-lost-item-btn');
    if (addLostItemBtn) {
        addLostItemBtn.addEventListener('click', () => {
            if (!window.currentUser) {
                showNotification('Please log in to report lost items', 'info');
                openModal(loginModal);
                return;
            }
            showCollectionModal('lostItems', 'Report Lost Item');
        });
    }
    
    // Food Tracker buttons
    const addFoodItemBtn = document.getElementById('add-food-item-btn');
    if (addFoodItemBtn) {
        addFoodItemBtn.addEventListener('click', () => {
            if (!window.currentUser) {
                showNotification('Please log in to add food items', 'info');
                openModal(loginModal);
                return;
            }
            showCollectionModal('foodItems', 'Add Food Item');
        });
    }
    
    // Study Groups buttons
    const addStudyGroupBtn = document.getElementById('add-study-group-btn');
    if (addStudyGroupBtn) {
        addStudyGroupBtn.addEventListener('click', () => {
            if (!window.currentUser) {
                showNotification('Please log in to create study groups', 'info');
                openModal(loginModal);
                return;
            }
            showCollectionModal('studyGroups', 'Create Study Group');
        });
    }
}

// Setup hero section buttons
function setupHeroButtons() {
    const getStartedBtn = document.getElementById('get-started-btn');
    if (getStartedBtn) {
        getStartedBtn.addEventListener('click', () => {
            showNotification('Welcome to UniSync! Get started by exploring our features.', 'info');
        });
    }
}

// Handle feature button clicks
function handleFeatureClick(feature, button) {
    if (!window.currentUser) {
        const featureName = button.closest('.feature-card').querySelector('h3').textContent;
        showNotification(`Please log in to use ${featureName}`, 'info');
        openModal(loginModal);
        return;
    }
    
    switch(feature) {
        case 'lostItems':
            showCollectionModal('lostItems', 'Report Lost Item');
            break;
        case 'foodItems':
            showCollectionModal('foodItems', 'Add Food Item');
            break;
        case 'studyGroups':
            showCollectionModal('studyGroups', 'Create Study Group');
            break;
        case 'brainbrew':
            handleBrainBrewSession();
            break;
        default:
            showNotification('Feature coming soon!', 'info');
    }
}

// Modal Functions
function openModal(modal) {
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modal) {
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Mobile menu toggle
function toggleMobileMenu() {
    mainNav.classList.toggle('active');
    const icon = mobileMenuBtn.querySelector('i');
    if (mainNav.classList.contains('active')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
    } else {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    }
}

// Header scroll effect
function handleHeaderScroll() {
    if (window.scrollY > 50) {
        header.classList.add('header-scrolled');
    } else {
        header.classList.remove('header-scrolled');
    }
}

// Login handler
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        window.currentUser = userCredential.user;
        
        closeModal(loginModal);
        loginForm.reset();
        showNotification('Successfully logged in!', 'success');
        
        // Initialize collections after login
        initializeCollections();
    } catch (error) {
        console.error('Login error:', error);
        showNotification(`Login error: ${error.message}`, 'error');
    }
}

// Signup handler
async function handleSignup(e) {
    e.preventDefault();
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm').value;
    const university = document.getElementById('signup-university')?.value || '';
    
    if (password !== confirmPassword) {
        showNotification("Passwords don't match!", 'error');
        return;
    }
    
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        window.currentUser = userCredential.user;
        
        // Update user profile with display name
        await updateProfile(window.currentUser, {
            displayName: name
        });
        
        // Create user profile in Firestore
        if (window.collectionOperations) {
            await window.collectionOperations.createUserProfile(window.currentUser.uid, {
                displayName: name,
                email: email,
                university: university,
                major: ''
            });
        }
        
        closeModal(signupModal);
        signupForm.reset();
        showNotification('Account created successfully!', 'success');
        
        // Initialize collections after signup
        initializeCollections();
    } catch (error) {
        console.error('Signup error:', error);
        showNotification(`Signup error: ${error.message}`, 'error');
    }
}

// Initialize Collections
function initializeCollections() {
    if (collectionsInitialized) return;
    
    // Set up real-time listeners for collections
    setupCollectionListeners();
    collectionsInitialized = true;
}

// Setup real-time collection listeners
function setupCollectionListeners() {
    if (!window.db || !window.firestoreCollections) return;
    
    const collections = window.firestoreCollections;
    
    // Listen to lost items
    try {
        const lostItemsQuery = query(
            collection(db, collections.lostItems),
            orderBy('createdAt', 'desc')
        );
        
        onSnapshot(lostItemsQuery, (snapshot) => {
            const lostItems = [];
            snapshot.forEach((doc) => {
                lostItems.push({ id: doc.id, ...doc.data() });
            });
            console.log('Lost items updated:', lostItems);
            window.lostItems = lostItems; // Store for campus feed
            updateLostItemsUI(lostItems);
        });
    } catch (error) {
        console.log('Lost items collection not available yet');
    }
    
    // Listen to food items
    try {
        const foodItemsQuery = query(
            collection(db, collections.foodItems),
            orderBy('lastUpdated', 'desc')
        );
        
        onSnapshot(foodItemsQuery, (snapshot) => {
            const foodItems = [];
            snapshot.forEach((doc) => {
                foodItems.push({ id: doc.id, ...doc.data() });
            });
            console.log('Food items updated:', foodItems);
            window.foodItems = foodItems; // Store for campus feed
            updateFoodItemsUI(foodItems);
        });
    } catch (error) {
        console.log('Food items collection not available yet');
    }
    
    // Listen to study groups
    try {
        const studyGroupsQuery = query(
            collection(db, collections.studyGroups),
            orderBy('createdAt', 'desc')
        );
        
        onSnapshot(studyGroupsQuery, (snapshot) => {
            const studyGroups = [];
            snapshot.forEach((doc) => {
                studyGroups.push({ id: doc.id, ...doc.data() });
            });
            console.log('Study groups updated:', studyGroups);
            window.studyGroups = studyGroups; // Store for campus feed
            updateStudyGroupsUI(studyGroups);
        });
    } catch (error) {
        console.log('Study groups collection not available yet');
    }
}

// Update UI functions for collections
function updateLostItemsUI(items) {
    const container = document.getElementById('lost-items-container');
    if (!container) return;
    
    if (items.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <p>No lost items reported yet. Be the first to report one!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = items.map(item => `
        <div class="collection-item-card">
            <div class="collection-item-header">
                <h3 class="collection-item-title">${item.itemName || 'Unknown Item'}</h3>
                <span class="status-badge status-lost">Lost</span>
            </div>
            <div class="collection-item-meta">
                <span><i class="fas fa-map-marker-alt"></i> ${item.location || 'Unknown location'}</span>
                <span><i class="fas fa-calendar"></i> ${item.dateLost || 'Unknown date'}</span>
            </div>
            <div class="collection-item-description">
                ${item.description || 'No description provided.'}
            </div>
            ${item.contactDetails ? `
            <div class="collection-item-meta" style="margin-top: 1rem;">
                <span><i class="fas fa-phone"></i> ${item.contactDetails}</span>
            </div>
            ` : ''}
            <div class="collection-item-actions">
                <button class="btn btn-secondary btn-sm">Contact</button>
            </div>
        </div>
    `).join('');
}

function updateFoodItemsUI(items) {
    const container = document.getElementById('food-items-container');
    if (!container) return;
    
    if (items.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-utensils"></i>
                <p>No food items added yet. Help others by adding what's available!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = items.map(item => {
        const statusClass = item.availability === 'available' ? 'status-available' : 
                           item.availability === 'low' ? 'status-low' : 'status-out';
        const statusText = item.availability === 'available' ? 'Available' : 
                          item.availability === 'low' ? 'Low Stock' : 'Out of Stock';
        
        return `
        <div class="collection-item-card">
            <div class="collection-item-header">
                <h3 class="collection-item-title">${item.name || 'Unknown Food'}</h3>
                <span class="status-badge ${statusClass}">${statusText}</span>
            </div>
            <div class="collection-item-meta">
                <span><i class="fas fa-utensils"></i> ${item.category || 'Uncategorized'}</span>
                <span><i class="fas fa-map-marker-alt"></i> ${item.location || 'Unknown location'}</span>
            </div>
            <div class="collection-item-actions">
                <button class="btn btn-secondary btn-sm">Update</button>
            </div>
        </div>
        `;
    }).join('');
}

function updateStudyGroupsUI(groups) {
    const container = document.getElementById('study-groups-container');
    if (!container) return;
    
    if (groups.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-users"></i>
                <p>No study groups created yet. Start one to connect with classmates!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = groups.map(group => `
        <div class="collection-item-card">
            <div class="collection-item-header">
                <h3 class="collection-item-title">${group.name || 'Unnamed Group'}</h3>
                <span class="status-badge status-available">${group.members ? group.members.length : 1}/${group.maxMembers || 5} members</span>
            </div>
            <div class="collection-item-meta">
                <span><i class="fas fa-book"></i> ${group.course || 'General Studies'}</span>
                <span><i class="fas fa-clock"></i> ${group.meetingTime || 'Flexible'}</span>
            </div>
            <div class="collection-item-description">
                ${group.description || 'No description provided.'}
            </div>
            <div class="collection-item-actions">
                <button class="btn btn-primary btn-sm">Join</button>
                <button class="btn btn-secondary btn-sm">Details</button>
            </div>
        </div>
    `).join('');
}

// Show collection modal
function showCollectionModal(collectionType, title) {
    // Create modal dynamically based on collection type
    const modalHtml = getCollectionModalHtml(collectionType, title);
    
    // Remove existing collection modal if any
    const existingModal = document.getElementById('collection-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Add new modal to page
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modal = document.getElementById('collection-modal');
    
    // Setup modal events
    openModal(modal);
    
    modal.querySelector('.close-modal').addEventListener('click', () => {
        closeModal(modal);
    });
    
    // Handle form submission
    const form = modal.querySelector('form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleCollectionSubmit(collectionType, form);
    });
    
    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal(modal);
        }
    });
}

// Get modal HTML based on collection type
function getCollectionModalHtml(collectionType, title) {
    const baseHtml = `
        <div class="modal" id="collection-modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${title}</h2>
                    <button class="close-modal">&times;</button>
                </div>
                <form id="collection-form">
                    ${getCollectionFormFields(collectionType)}
                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary close-modal">Cancel</button>
                        <button type="submit" class="btn btn-primary">Submit</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    return baseHtml;
}

// Get form fields based on collection type
function getCollectionFormFields(collectionType) {
    const today = new Date().toISOString().split('T')[0];
    
    switch (collectionType) {
        case 'lostItems':
            return `
                <div class="form-group">
                    <label for="item-name">Item Name *</label>
                    <input type="text" id="item-name" class="form-control" placeholder="e.g., Black iPhone 12" required>
                </div>
                <div class="form-group">
                    <label for="item-description">Description *</label>
                    <textarea id="item-description" class="form-control" placeholder="Describe the item in detail..." rows="3" required></textarea>
                </div>
                <div class="form-group">
                    <label for="location">Location Lost *</label>
                    <input type="text" id="location" class="form-control" placeholder="e.g., Library, Room 201" required>
                </div>
                <div class="form-group">
                    <label for="date-lost">Date Lost *</label>
                    <input type="date" id="date-lost" class="form-control" max="${today}" required>
                </div>
                <div class="form-group">
                    <label for="contact-details">Contact Details *</label>
                    <input type="text" id="contact-details" class="form-control" placeholder="e.g., Phone: 123-456-7890 or Email: student@university.edu" required>
                </div>
            `;
            
        case 'foodItems':
            return `
                <div class="form-group">
                    <label for="food-name">Food Name *</label>
                    <input type="text" id="food-name" class="form-control" placeholder="e.g., Pizza, Salad, Pasta" required>
                </div>
                <div class="form-group">
                    <label for="food-category">Category *</label>
                    <select id="food-category" class="form-control" required>
                        <option value="">Select Category</option>
                        <option value="main">Main Course</option>
                        <option value="side">Side Dish</option>
                        <option value="dessert">Dessert</option>
                        <option value="beverage">Beverage</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="availability">Availability *</label>
                    <select id="availability" class="form-control" required>
                        <option value="available">Available</option>
                        <option value="low">Running Low</option>
                        <option value="out">Out of Stock</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="cafeteria-location">Cafeteria Location *</label>
                    <input type="text" id="cafeteria-location" class="form-control" placeholder="e.g., Main Cafeteria, West Wing" required>
                </div>
            `;
            
        case 'studyGroups':
            return `
                <div class="form-group">
                    <label for="group-name">Group Name *</label>
                    <input type="text" id="group-name" class="form-control" placeholder="e.g., Calculus Study Group" required>
                </div>
                <div class="form-group">
                    <label for="course">Course/Subject *</label>
                    <input type="text" id="course" class="form-control" placeholder="e.g., MATH 101, Computer Science" required>
                </div>
                <div class="form-group">
                    <label for="description">Group Description *</label>
                    <textarea id="description" class="form-control" placeholder="Describe what you'll be studying..." rows="3" required></textarea>
                </div>
                <div class="form-group">
                    <label for="max-members">Maximum Members *</label>
                    <input type="number" id="max-members" class="form-control" min="2" max="10" value="5" required>
                </div>
                <div class="form-group">
                    <label for="meeting-time">Preferred Meeting Time *</label>
                    <input type="text" id="meeting-time" class="form-control" placeholder="e.g., Weekdays 2-4 PM" required>
                </div>
            `;
            
        default:
            return '<p>Form not available for this collection.</p>';
    }
}

// Handle collection form submission
async function handleCollectionSubmit(collectionType, form) {
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    
    // Check Firebase connection first
    if (!checkFirebaseConnection()) {
        return;
    }
    
    try {
        // Show loading state
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
        submitButton.disabled = true;
        
        let itemData = {};
        
        switch (collectionType) {
            case 'lostItems':
                itemData = {
                    itemName: document.getElementById('item-name').value,
                    description: document.getElementById('item-description').value,
                    location: document.getElementById('location').value,
                    dateLost: document.getElementById('date-lost').value,
                    contactDetails: document.getElementById('contact-details').value
                };
                break;
                
            case 'foodItems':
                itemData = {
                    name: document.getElementById('food-name').value,
                    category: document.getElementById('food-category').value,
                    availability: document.getElementById('availability').value,
                    location: document.getElementById('cafeteria-location').value
                };
                break;
                
            case 'studyGroups':
                itemData = {
                    name: document.getElementById('group-name').value,
                    course: document.getElementById('course').value,
                    description: document.getElementById('description').value,
                    maxMembers: parseInt(document.getElementById('max-members').value),
                    meetingTime: document.getElementById('meeting-time').value
                };
                break;
        }
        
        let result;
        if (window.collectionOperations) {
            switch (collectionType) {
                case 'lostItems':
                    result = await window.collectionOperations.addLostItem(itemData);
                    break;
                case 'foodItems':
                    result = await window.collectionOperations.addFoodItem(itemData);
                    break;
                case 'studyGroups':
                    result = await window.collectionOperations.createStudyGroup(itemData);
                    break;
            }
            
            showNotification(`${collectionType.replace(/([A-Z])/g, ' $1')} added successfully!`, 'success');
            closeModal(document.getElementById('collection-modal'));
            form.reset();
        } else {
            showNotification('Collection operations not available. Please try again later.', 'error');
        }
        
    } catch (error) {
        console.error('Error adding item:', error);
        
        // Show specific error messages based on error type
        if (error.message.includes('permission-denied') || error.code === 'permission-denied') {
            showNotification('Permission denied. Please check your Firestore security rules.', 'error');
        } else if (error.message.includes('unauthenticated')) {
            showNotification('Please log in to perform this action.', 'error');
            openModal(loginModal);
        } else {
            showNotification(`Error: ${error.message}`, 'error');
        }
    } finally {
        // Reset button state
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
    }
}

// Check Firebase connection
function checkFirebaseConnection() {
    if (typeof auth === 'undefined') {
        console.error('Firebase not loaded properly');
        showNotification('Firebase connection issue. Please refresh the page.', 'error');
        return false;
    }
    return true;
}

// Add demo data button for testing
function addDemoDataButton() {
    const demoButton = document.createElement('button');
    demoButton.className = 'btn btn-secondary';
    demoButton.innerHTML = '<i class="fas fa-vial"></i> Add Demo Data';
    demoButton.style.marginTop = '1rem';
    demoButton.addEventListener('click', () => {
        if (!window.currentUser) {
            showNotification('Please log in to add demo data', 'info');
            openModal(loginModal);
            return;
        }
        window.collectionOperations.addDemoData();
    });
    
    // Add to features section or somewhere visible
    const featuresSection = document.querySelector('.features');
    if (featuresSection) {
        featuresSection.appendChild(demoButton);
    }
}

// Update authentication UI
function updateAuthUI(user) {
    const authButtons = document.querySelector('.auth-buttons');
    if (!authButtons) return;
    
    if (user) {
        // User is signed in
        const displayName = user.displayName || user.email.split('@')[0];
        const userInitial = displayName.charAt(0).toUpperCase();
        
        authButtons.innerHTML = `
            <div class="user-info">
                <div class="user-avatar">${userInitial}</div>
                <span style="color: var(--dark); font-weight: 500;">${displayName}</span>
                <button class="btn btn-secondary" id="logout-btn">
                    <i class="fas fa-sign-out-alt"></i> Logout
                </button>
            </div>
        `;
        
        document.getElementById('logout-btn').addEventListener('click', async () => {
            try {
                await signOut(auth);
                showNotification('Successfully logged out!', 'success');
            } catch (error) {
                console.error('Logout error:', error);
                showNotification('Error logging out', 'error');
            }
        });
        
        // Update feature buttons for logged-in users
        updateFeatureButtonsForUser(true);
        
    } else {
        // User is signed out
        authButtons.innerHTML = `
            <button class="btn btn-secondary" id="login-btn">
                <i class="fas fa-sign-in-alt"></i> Login
            </button>
            <button class="btn btn-primary" id="signup-btn">
                <i class="fas fa-user-plus"></i> Sign Up
            </button>
        `;
        
        // Reattach event listeners to the new buttons
        document.getElementById('login-btn').addEventListener('click', () => openModal(loginModal));
        document.getElementById('signup-btn').addEventListener('click', () => openModal(signupModal));
        
        // Update feature buttons for logged-out users
        updateFeatureButtonsForUser(false);
    }
}

// Update feature buttons based on auth state
function updateFeatureButtonsForUser(isLoggedIn) {
    const featureButtons = document.querySelectorAll('.feature-action-btn');
    
    featureButtons.forEach(button => {
        const feature = button.getAttribute('data-feature');
        const icon = isLoggedIn ? 'fa-plus' : 'fa-search';
        const text = isLoggedIn ? 'Add' : 'Explore';
        
        button.innerHTML = `<i class="fas ${icon}"></i> ${text}`;
    });
}

// Smooth scrolling for navigation links
document.querySelectorAll('nav a').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            // Close mobile menu if open
            if (mainNav.classList.contains('active')) {
                toggleMobileMenu();
            }
            
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// Notification system
function showNotification(message, type = 'info') {
    // Remove any existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button class="notification-close">&times;</button>
    `;
    
    // Add styles for notification
    Object.assign(notification.style, {
        position: 'fixed',
        top: '100px',
        right: '20px',
        background: type === 'success' ? 'var(--success)' : 
                   type === 'error' ? 'var(--danger)' : 
                   type === 'warning' ? 'var(--warning)' : 'var(--primary)',
        color: 'white',
        padding: '1rem 1.5rem',
        borderRadius: '8px',
        boxShadow: 'var(--card-shadow)',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        zIndex: '1001',
        maxWidth: '400px',
        animation: 'slideInRight 0.3s ease'
    });
    
    // Add close button styles
    const closeBtn = notification.querySelector('.notification-close');
    Object.assign(closeBtn.style, {
        background: 'none',
        border: 'none',
        color: 'white',
        fontSize: '1.2rem',
        cursor: 'pointer',
        padding: '0',
        width: '24px',
        height: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    });
    
    // Add animation keyframes if not already added
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Add to page
    document.body.appendChild(notification);
    
    // Close notification on button click
    closeBtn.addEventListener('click', () => {
        notification.remove();
    });
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Campus Feed Functionality
function setupCampusFeed() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const searchInput = document.getElementById('feed-search');
    const loadMoreBtn = document.getElementById('load-more-btn');

    // Filter buttons
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Update active state
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Filter items
            const filter = this.getAttribute('data-filter');
            filterFeedItems(filter);
        });
    });

    // Search functionality
    if (searchInput) {
        searchInput.addEventListener('input', debounce(function(e) {
            searchFeedItems(e.target.value);
        }, 300));
    }

    // Load more functionality
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', loadMoreItems);
    }

    // Event delegation for view details buttons
    const feedContainer = document.getElementById('feed-items-container');
    if (feedContainer) {
        feedContainer.addEventListener('click', function(e) {
            if (e.target.closest('.view-details-btn')) {
                const button = e.target.closest('.view-details-btn');
                const itemId = button.getAttribute('data-item-id');
                const itemType = button.getAttribute('data-item-type');
                
                // Find the item in the campus feed
                const allItems = campusFeedState.allItems;
                const item = allItems.find(i => i.id === itemId && i.type === itemType);
                
                if (!item) {
                    showNotification('Item not found', 'error');
                    return;
                }
                
                // Show details modal
                showItemDetailsModal(item);
            }
        });
    }

    // Initialize feed
    initializeCampusFeed();
}

// Debounce function for search
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Initialize campus feed
function initializeCampusFeed() {
    // Show loading state
    showFeedLoading(true);
    
    // The feed will be populated by the existing collection listeners
    // We'll combine data from all collections when they load
    setTimeout(() => {
        showFeedLoading(false);
        updateFeedStats();
    }, 1000);
}

// Enhance collection listeners to also update the campus feed
function enhanceCollectionListeners() {
    // Store collection data globally for the feed
    window.lostItems = [];
    window.foodItems = [];
    window.studyGroups = [];
    
    // Enhanced lost items listener
    if (window.db && window.firestoreCollections) {
        const { collection, onSnapshot, query, orderBy } = window.firestoreFunctions;
        const collections = window.firestoreCollections;
        
        // Enhanced lost items listener
        const lostItemsQuery = query(
            collection(window.db, collections.lostItems),
            orderBy('createdAt', 'desc')
        );
        
        onSnapshot(lostItemsQuery, (snapshot) => {
            const lostItems = [];
            snapshot.forEach((doc) => {
                lostItems.push({ id: doc.id, ...doc.data() });
            });
            window.lostItems = lostItems;
            updateCampusFeed();
        });
        
        // Enhanced food items listener
        const foodItemsQuery = query(
            collection(window.db, collections.foodItems),
            orderBy('lastUpdated', 'desc')
        );
        
        onSnapshot(foodItemsQuery, (snapshot) => {
            const foodItems = [];
            snapshot.forEach((doc) => {
                foodItems.push({ id: doc.id, ...doc.data() });
            });
            window.foodItems = foodItems;
            updateCampusFeed();
        });
        
        // Enhanced study groups listener
        const studyGroupsQuery = query(
            collection(window.db, collections.studyGroups),
            orderBy('createdAt', 'desc')
        );
        
        onSnapshot(studyGroupsQuery, (snapshot) => {
            const studyGroups = [];
            snapshot.forEach((doc) => {
                studyGroups.push({ id: doc.id, ...doc.data() });
            });
            window.studyGroups = studyGroups;
            updateCampusFeed();
        });
    }
}

// Combine items from all collections
function updateCampusFeed() {
    const allItems = [];
    
    // Get items from each collection (these would be populated by your existing listeners)
    const lostItems = window.lostItems || [];
    const foodItems = window.foodItems || [];
    const studyGroups = window.studyGroups || [];
    
    // Add lost items to feed
    lostItems.forEach(item => {
        allItems.push({
            ...item,
            type: 'lostItems',
            displayType: 'Lost Item',
            icon: 'fa-search',
            timestamp: item.createdAt,
            searchableText: `${item.itemName} ${item.description} ${item.location} ${item.contactDetails || ''}`.toLowerCase()
        });
    });
    
    // Add food items to feed
    foodItems.forEach(item => {
        allItems.push({
            ...item,
            type: 'foodItems',
            displayType: 'Food Item',
            icon: 'fa-utensils',
            timestamp: item.lastUpdated,
            searchableText: `${item.name} ${item.category} ${item.location} ${item.availability}`.toLowerCase()
        });
    });
    
    // Add study groups to feed
    studyGroups.forEach(item => {
        allItems.push({
            ...item,
            type: 'studyGroups',
            displayType: 'Study Group',
            icon: 'fa-users',
            timestamp: item.createdAt,
            searchableText: `${item.name} ${item.course} ${item.description} ${item.meetingTime}`.toLowerCase()
        });
    });
    
    // Sort by timestamp (newest first)
    allItems.sort((a, b) => {
        const timeA = a.timestamp ? a.timestamp.toDate().getTime() : 0;
        const timeB = b.timestamp ? b.timestamp.toDate().getTime() : 0;
        return timeB - timeA;
    });
    
    campusFeedState.allItems = allItems;
    campusFeedState.filteredItems = allItems;
    
    // Update stats
    updateFeedStats();
    
    // Display items
    displayFeedItems();
}

// Update feed statistics
function updateFeedStats() {
    const lostCount = campusFeedState.allItems.filter(item => item.type === 'lostItems').length;
    const foodCount = campusFeedState.allItems.filter(item => item.type === 'foodItems').length;
    const groupsCount = campusFeedState.allItems.filter(item => item.type === 'studyGroups').length;
    const totalCount = campusFeedState.allItems.length;
    
    document.getElementById('lost-count').textContent = lostCount;
    document.getElementById('food-count').textContent = foodCount;
    document.getElementById('groups-count').textContent = groupsCount;
    document.getElementById('total-count').textContent = totalCount;
}

// Filter feed items
function filterFeedItems(filter) {
    campusFeedState.currentFilter = filter;
    campusFeedState.currentPage = 1;
    
    if (filter === 'all') {
        campusFeedState.filteredItems = campusFeedState.allItems;
    } else {
        campusFeedState.filteredItems = campusFeedState.allItems.filter(item => item.type === filter);
    }
    
    // Apply search filter if any
    if (campusFeedState.currentSearch) {
        campusFeedState.filteredItems = campusFeedState.filteredItems.filter(item => 
            item.searchableText.includes(campusFeedState.currentSearch.toLowerCase())
        );
    }
    
    displayFeedItems();
}

// Search feed items
function searchFeedItems(searchTerm) {
    campusFeedState.currentSearch = searchTerm.toLowerCase();
    campusFeedState.currentPage = 1;
    
    if (!searchTerm) {
        // If no search term, just apply current filter
        filterFeedItems(campusFeedState.currentFilter);
        return;
    }
    
    campusFeedState.filteredItems = campusFeedState.allItems.filter(item => 
        item.searchableText.includes(campusFeedState.currentSearch)
    );
    
    // Apply type filter if not "all"
    if (campusFeedState.currentFilter !== 'all') {
        campusFeedState.filteredItems = campusFeedState.filteredItems.filter(item => 
            item.type === campusFeedState.currentFilter
        );
    }
    
    displayFeedItems();
}

// Display feed items
function displayFeedItems() {
    const container = document.getElementById('feed-items-container');
    const loadMoreContainer = document.getElementById('load-more-container');
    
    if (!container) return;
    
    // Calculate items to display
    const startIndex = 0;
    const endIndex = campusFeedState.currentPage * campusFeedState.itemsPerPage;
    campusFeedState.displayedItems = campusFeedState.filteredItems.slice(startIndex, endIndex);
    
    if (campusFeedState.displayedItems.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-stream"></i>
                <h3>No items found</h3>
                <p>${campusFeedState.currentSearch ? 'Try adjusting your search terms' : 'Be the first to add something to the campus feed!'}</p>
            </div>
        `;
        loadMoreContainer.style.display = 'none';
        return;
    }
    
    // Generate feed items HTML
    container.innerHTML = campusFeedState.displayedItems.map(item => createFeedItemHTML(item)).join('');
    
    // Show/hide load more button
    if (endIndex < campusFeedState.filteredItems.length) {
        loadMoreContainer.style.display = 'block';
    } else {
        loadMoreContainer.style.display = 'none';
    }
}

// Create feed item HTML
function createFeedItemHTML(item) {
    const timestamp = item.timestamp ? formatTimestamp(item.timestamp) : 'Recently';
    const userName = item.userName || item.creatorName || 'Anonymous';
    const userInitial = userName.charAt(0).toUpperCase();
    
    let specificContent = '';
    
    switch(item.type) {
        case 'lostItems':
            specificContent = `
                <div class="feed-item-meta">
                    <span><i class="fas fa-map-marker-alt"></i> ${item.location || 'Unknown location'}</span>
                    <span><i class="fas fa-calendar"></i> ${item.dateLost || 'Unknown date'}</span>
                </div>
                <div class="feed-item-description">
                    ${item.description || 'No description provided.'}
                </div>
                ${item.contactDetails ? `
                <div class="feed-item-meta" style="margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid var(--gray-light);">
                    <span><i class="fas fa-phone"></i> Contact: ${item.contactDetails}</span>
                </div>
                ` : ''}
            `;
            break;
            
        case 'foodItems':
            const statusClass = item.availability === 'available' ? 'status-available' : 
                              item.availability === 'low' ? 'status-low' : 'status-out';
            const statusText = item.availability === 'available' ? 'Available' : 
                             item.availability === 'low' ? 'Low Stock' : 'Out of Stock';
            
            specificContent = `
                <div class="feed-item-meta">
                    <span><i class="fas fa-utensils"></i> ${item.category || 'Uncategorized'}</span>
                    <span><i class="fas fa-map-marker-alt"></i> ${item.location || 'Unknown location'}</span>
                </div>
                <div class="feed-item-description">
                    <span class="status-badge ${statusClass}">${statusText}</span>
                </div>
            `;
            break;
            
        case 'studyGroups':
            specificContent = `
                <div class="feed-item-meta">
                    <span><i class="fas fa-book"></i> ${item.course || 'General Studies'}</span>
                    <span><i class="fas fa-clock"></i> ${item.meetingTime || 'Flexible'}</span>
                </div>
                <div class="feed-item-description">
                    ${item.description || 'No description provided.'}
                </div>
                <div class="feed-item-meta">
                    <span><i class="fas fa-users"></i> ${item.memberCount || 1}/${item.maxMembers || 5} members</span>
                </div>
            `;
            break;
    }
    
    return `
        <div class="feed-item-card" data-type="${item.type}">
            <div class="feed-item-header">
                <span class="feed-item-type type-${item.type.replace('Items', '').replace('Groups', 'group')}">
                    <i class="fas ${item.icon}"></i> ${item.displayType}
                </span>
                <span class="timestamp">${timestamp}</span>
            </div>
            
            <h3 class="feed-item-title">${item.itemName || item.name || 'Untitled'}</h3>
            
            ${specificContent}
            
            <div class="feed-item-user">
                <div class="user-avatar-small">${userInitial}</div>
                <div class="user-info-small">Posted by ${userName}</div>
            </div>
            
            <div class="feed-item-actions">
                <button class="btn btn-secondary btn-sm view-details-btn" data-item-id="${item.id}" data-item-type="${item.type}">
                    <i class="fas fa-eye"></i> View Details
                </button>
            </div>
        </div>
    `;
}

// Format timestamp
function formatTimestamp(timestamp) {
    if (!timestamp) return 'Recently';
    
    try {
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        
        return date.toLocaleDateString();
    } catch (error) {
        return 'Recently';
    }
}

// Handle feed item actions
function handleFeedItemAction(type, itemId) {
    // Find the item in the campus feed
    const allItems = campusFeedState.allItems;
    const item = allItems.find(i => i.id === itemId && i.type === type);
    
    if (!item) {
        showNotification('Item not found', 'error');
        return;
    }
    
    // Show details modal
    showItemDetailsModal(item);
}

// Show item details modal
function showItemDetailsModal(item) {
    // Remove existing details modal if any
    const existingModal = document.getElementById('item-details-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    let modalContent = '';
    const timestamp = item.timestamp ? formatTimestamp(item.timestamp) : 'Recently';
    const userName = item.userName || item.creatorName || 'Anonymous';
    
    // Generate content based on item type
    switch(item.type) {
        case 'lostItems':
            modalContent = `
                <div class="modal-header">
                    <h2><i class="fas fa-search"></i> Lost Item Details</h2>
                    <button class="close-modal" onclick="closeItemDetailsModal()">&times;</button>
                </div>
                <div class="modal-body" style="padding: 0 2.5rem 2.5rem;">
                    <h3 style="margin-bottom: 1rem; color: var(--dark);">${item.itemName || 'Unknown Item'}</h3>
                    
                    <div style="background: var(--light); padding: 1.5rem; border-radius: 12px; margin-bottom: 1.5rem;">
                        <p style="margin-bottom: 1.5rem; color: var(--gray);"><strong>Description:</strong></p>
                        <p style="color: var(--dark); line-height: 1.6;">${item.description || 'No description provided'}</p>
                    </div>
                    
                    <div class="details-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
                        <div style="background: white; padding: 1rem; border-radius: 8px; border-left: 4px solid var(--primary);">
                            <i class="fas fa-map-marker-alt" style="color: var(--primary); margin-bottom: 0.5rem;"></i>
                            <p style="font-weight: 500; margin-bottom: 0.25rem;">Location</p>
                            <p style="color: var(--gray);">${item.location || 'Unknown location'}</p>
                        </div>
                        <div style="background: white; padding: 1rem; border-radius: 8px; border-left: 4px solid var(--accent);">
                            <i class="fas fa-calendar" style="color: var(--accent); margin-bottom: 0.5rem;"></i>
                            <p style="font-weight: 500; margin-bottom: 0.25rem;">Date Lost</p>
                            <p style="color: var(--gray);">${item.dateLost || 'Unknown date'}</p>
                        </div>
                    </div>
                    
                    ${item.contactDetails ? `
                    <div style="background: linear-gradient(135deg, rgba(108, 99, 255, 0.1), rgba(54, 209, 220, 0.1)); padding: 1.5rem; border-radius: 12px; margin-bottom: 1.5rem; border-left: 4px solid var(--primary);">
                        <p style="font-weight: 600; margin-bottom: 0.75rem; color: var(--primary);">
                            <i class="fas fa-phone"></i> Contact Information
                        </p>
                        <p style="font-size: 1.1rem; color: var(--dark);">${item.contactDetails}</p>
                    </div>
                    ` : ''}
                    
                    <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 1.5rem; border-top: 1px solid var(--gray-light);">
                        <div>
                            <p style="font-size: 0.9rem; color: var(--gray);">Posted ${timestamp}</p>
                            <p style="font-size: 0.9rem; color: var(--gray);">By ${userName}</p>
                        </div>
                        <span class="status-badge status-lost">Lost</span>
                    </div>
                </div>
            `;
            break;
            
        case 'foodItems':
            const statusClass = item.availability === 'available' ? 'status-available' : 
                              item.availability === 'low' ? 'status-low' : 'status-out';
            const statusText = item.availability === 'available' ? 'Available' : 
                             item.availability === 'low' ? 'Low Stock' : 'Out of Stock';
            
            modalContent = `
                <div class="modal-header">
                    <h2><i class="fas fa-utensils"></i> Food Item Details</h2>
                    <button class="close-modal" onclick="closeItemDetailsModal()">&times;</button>
                </div>
                <div class="modal-body" style="padding: 0 2.5rem 2.5rem;">
                    <h3 style="margin-bottom: 1rem; color: var(--dark);">${item.name || 'Unknown Food'}</h3>
                    
                    <div class="details-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
                        <div style="background: white; padding: 1rem; border-radius: 8px; border-left: 4px solid var(--primary);">
                            <i class="fas fa-utensils" style="color: var(--primary); margin-bottom: 0.5rem;"></i>
                            <p style="font-weight: 500; margin-bottom: 0.25rem;">Category</p>
                            <p style="color: var(--gray);">${item.category || 'Uncategorized'}</p>
                        </div>
                        <div style="background: white; padding: 1rem; border-radius: 8px; border-left: 4px solid var(--accent);">
                            <i class="fas fa-map-marker-alt" style="color: var(--accent); margin-bottom: 0.5rem;"></i>
                            <p style="font-weight: 500; margin-bottom: 0.25rem;">Location</p>
                            <p style="color: var(--gray);">${item.location || 'Unknown location'}</p>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 1.5rem; display: flex; justify-content: center;">
                        <span class="status-badge ${statusClass}" style="font-size: 1rem; padding: 0.5rem 1.5rem;">${statusText}</span>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 1.5rem; border-top: 1px solid var(--gray-light);">
                        <div>
                            <p style="font-size: 0.9rem; color: var(--gray);">Last updated ${timestamp}</p>
                            <p style="font-size: 0.9rem; color: var(--gray);">By ${userName}</p>
                        </div>
                    </div>
                </div>
            `;
            break;
            
        case 'studyGroups':
            modalContent = `
                <div class="modal-header">
                    <h2><i class="fas fa-users"></i> Study Group Details</h2>
                    <button class="close-modal" onclick="closeItemDetailsModal()">&times;</button>
                </div>
                <div class="modal-body" style="padding: 0 2.5rem 2.5rem;">
                    <h3 style="margin-bottom: 1rem; color: var(--dark);">${item.name || 'Unnamed Group'}</h3>
                    
                    <div style="background: var(--light); padding: 1.5rem; border-radius: 12px; margin-bottom: 1.5rem;">
                        <p style="margin-bottom: 1rem; color: var(--gray);"><strong>Description:</strong></p>
                        <p style="color: var(--dark); line-height: 1.6;">${item.description || 'No description provided'}</p>
                    </div>
                    
                    <div class="details-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
                        <div style="background: white; padding: 1rem; border-radius: 8px; border-left: 4px solid var(--primary);">
                            <i class="fas fa-book" style="color: var(--primary); margin-bottom: 0.5rem;"></i>
                            <p style="font-weight: 500; margin-bottom: 0.25rem;">Course</p>
                            <p style="color: var(--gray);">${item.course || 'General Studies'}</p>
                        </div>
                        <div style="background: white; padding: 1rem; border-radius: 8px; border-left: 4px solid var(--accent);">
                            <i class="fas fa-clock" style="color: var(--accent); margin-bottom: 0.5rem;"></i>
                            <p style="font-weight: 500; margin-bottom: 0.25rem;">Meeting Time</p>
                            <p style="color: var(--gray);">${item.meetingTime || 'Flexible'}</p>
                        </div>
                    </div>
                    
                    <div style="background: white; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; border-left: 4px solid var(--success);">
                        <i class="fas fa-users" style="color: var(--success); margin-bottom: 0.5rem;"></i>
                        <p style="font-weight: 500; margin-bottom: 0.25rem;">Members</p>
                        <p style="color: var(--gray);">${item.memberCount || 1}/${item.maxMembers || 5} members</p>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 1.5rem; border-top: 1px solid var(--gray-light);">
                        <div>
                            <p style="font-size: 0.9rem; color: var(--gray);">Created ${timestamp}</p>
                            <p style="font-size: 0.9rem; color: var(--gray);">By ${userName}</p>
                        </div>
                        <span class="status-badge status-available">Open</span>
                    </div>
                </div>
            `;
            break;
            
        default:
            modalContent = `
                <div class="modal-header">
                    <h2>Item Details</h2>
                    <button class="close-modal" onclick="closeItemDetailsModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <p>Details not available</p>
                </div>
            `;
    }
    
    // Create modal HTML
    const modalHtml = `
        <div class="modal" id="item-details-modal" style="display: flex;">
            <div class="modal-content" style="max-width: 700px; width: 90%;">
                ${modalContent}
            </div>
        </div>
    `;
    
    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modal = document.getElementById('item-details-modal');
    
    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeItemDetailsModal();
        }
    });
    
    // Close modal on close button
    modal.querySelector('.close-modal').addEventListener('click', () => {
        closeItemDetailsModal();
    });
    
    // Prevent body scrolling
    document.body.style.overflow = 'hidden';
}

// Close item details modal
function closeItemDetailsModal() {
    const modal = document.getElementById('item-details-modal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = '';
    }
}

// Load more items
function loadMoreItems() {
    campusFeedState.currentPage++;
    displayFeedItems();
}

// Show/hide feed loading
function showFeedLoading(show) {
    const loadingElement = document.getElementById('feed-loading');
    const itemsContainer = document.getElementById('feed-items-container');
    
    if (loadingElement) {
        loadingElement.style.display = show ? 'block' : 'none';
    }
    if (itemsContainer && show) {
        itemsContainer.style.display = 'none';
    } else if (itemsContainer) {
        itemsContainer.style.display = 'grid';
    }
}

// Spotify Integration
function setupSpotifyIntegration() {
    const connectBtn = document.getElementById('connect-spotify-btn');
    const generateSessionBtn = document.getElementById('generate-session-btn');
    const energyLevelSelect = document.getElementById('energy-level');
    const playlistSelect = document.getElementById('playlist-select');

    // Connect Spotify button
    if (connectBtn) {
        connectBtn.addEventListener('click', () => {
            showNotification('Spotify integration requires a Spotify Premium account and proper API setup.', 'info');
        });
    }

    // Generate session button
    if (generateSessionBtn) {
        generateSessionBtn.addEventListener('click', handleBrainBrewSession);
    }

    // Energy level change
    if (energyLevelSelect) {
        energyLevelSelect.addEventListener('change', () => {
            // In a real implementation, this would load different playlists
            showNotification('Energy level updated. Playlists would refresh in a full implementation.', 'info');
        });
    }
}

// Handle BrainBrew session generation
function handleBrainBrewSession() {
    if (!window.currentUser) {
        showNotification('Please log in to generate focus sessions', 'info');
        openModal(loginModal);
        return;
    }

    const energyLevel = document.getElementById('energy-level')?.value || 'medium';
    const studyDuration = document.getElementById('study-duration')?.value || '25';

    // Generate session based on energy level
    const sessions = {
        high: {
            message: "Perfect! Let's tackle challenging material with high-energy focus.",
            duration: studyDuration,
            break: Math.floor(parseInt(studyDuration) * 0.2)
        },
        medium: {
            message: "Good energy level! Let's maintain steady focus with balanced breaks.",
            duration: studyDuration,
            break: Math.floor(parseInt(studyDuration) * 0.25)
        },
        low: {
            message: "Let's start with shorter sessions and build momentum gradually.",
            duration: Math.min(parseInt(studyDuration), 25),
            break: Math.floor(parseInt(studyDuration) * 0.3)
        }
    };

    const session = sessions[energyLevel];
    
    showNotification(
        `🎧 Focus Session Generated! ${session.message} Session: ${session.duration}min, Break: ${session.break}min`,
        'success'
    );

    // Start Pomodoro timer (simplified)
    startPomodoroTimer(parseInt(session.duration), parseInt(session.break));
}

function startPomodoroTimer(duration, breakDuration) {
    // Simplified timer - in a real app, you'd build a full timer UI
    showNotification(`Timer started: ${duration} minutes of focused work`, 'info');
    
    setTimeout(() => {
        showNotification(`Time for a ${breakDuration} minute break!`, 'success');
        
        setTimeout(() => {
            showNotification('Break over! Ready for another session?', 'info');
        }, breakDuration * 60 * 1000);
    }, duration * 60 * 1000);
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);

console.log('UniSync website with Campus Feed loaded successfully!');
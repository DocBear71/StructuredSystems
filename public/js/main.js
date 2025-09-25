// Community Resource Support System - Main JavaScript

// Global app configuration
const AppConfig = {
  version: '1.0.0',
  environment: 'development',
  apiBaseUrl: '/api', // Would be a real API in production
  debug: true
};

// Utility functions
const Utils = {
  // Log debug messages
  debug: function(message, data = null) {
    if (AppConfig.debug) {
      console.log(`[DEBUG] ${message}`, data);
    }
  },

  // Format date for display
  formatDate: function(date) {
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(date).toLocaleDateString('en-US', options);
  },

  // Sanitize HTML to prevent XSS
  sanitizeHtml: function(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  // Show loading spinner
  showLoading: function(element) {
    if (element) {
      element.innerHTML = '<div class="loading">Loading...</div>';
    }
  },

  // Hide loading spinner
  hideLoading: function(element) {
    if (element) {
      const loadingElement = element.querySelector('.loading');
      if (loadingElement) {
        loadingElement.remove();
      }
    }
  }
};

// Quick Access management based on user preferences and usage patterns
const QuickAccess = {
  // Available service categories
  availableServices: [
    {
      id: 'food-pantry',
      name: 'Food & Pantry',
      description: 'Find local food banks and meal programs',
      url: 'pages/services/walkin-services.html?category=food',
      count: 17
    },
    {
      id: 'housing-shelter',
      name: 'Housing & Shelter',
      description: 'Emergency and transitional housing options',
      url: 'pages/services/emergency-shelter.html',
      count: 12
    },
    {
      id: 'healthcare',
      name: 'Healthcare',
      description: 'Medical, dental, and mental health services',
      url: 'pages/services/appointment-services.html?category=health',
      count: 8
    },
    {
      id: 'education',
      name: 'Education',
      description: 'Classes, tutoring, and skill development',
      url: 'pages/services/education-classes.html',
      count: 5
    },
    {
      id: 'legal-services',
      name: 'Legal Services',
      description: 'Free legal consultation and assistance',
      url: 'pages/services/appointment-services.html?category=legal',
      count: 3
    },
    {
      id: 'support-groups',
      name: 'Support Groups',
      description: 'AA, counseling, and peer support meetings',
      url: 'pages/services/group-meetings.html',
      count: 11
    }
  ],

  // User preferences and usage data
  userPreferences: {
    favorites: [], // User-set favorites
    visitCounts: {}, // Track page visits
    lastVisited: {}, // Track last visit dates
    showQuickAccess: false // Whether to show the section
  },

  // Initialize Quick Access system
  init: function() {
    this.loadUserPreferences();
    this.trackPageVisit();
    this.updateQuickAccessDisplay();

    Utils.debug('Quick Access system initialized', this.userPreferences);
  },

  // Load user preferences from localStorage
  loadUserPreferences: function() {
    try {
      const saved = localStorage.getItem('quickAccessPreferences');
      if (saved) {
        this.userPreferences = { ...this.userPreferences, ...JSON.parse(saved) };
      }
    } catch (error) {
      Utils.debug('Error loading Quick Access preferences:', error);
    }
  },

  // Save user preferences to localStorage
  saveUserPreferences: function() {
    try {
      localStorage.setItem('quickAccessPreferences', JSON.stringify(this.userPreferences));
      Utils.debug('Quick Access preferences saved');
    } catch (error) {
      Utils.debug('Error saving Quick Access preferences:', error);
    }
  },

  // Track current page visit
  trackPageVisit: function() {
    const currentPage = window.location.pathname;
    const pageKey = this.getPageKey(currentPage);

    if (pageKey) {
      // Increment visit count
      this.userPreferences.visitCounts[pageKey] = (this.userPreferences.visitCounts[pageKey] || 0) + 1;

      // Update last visited
      this.userPreferences.lastVisited[pageKey] = new Date().toISOString();

      // Auto-enable Quick Access if user has visited multiple pages
      if (Object.keys(this.userPreferences.visitCounts).length >= 3) {
        this.userPreferences.showQuickAccess = true;
      }

      this.saveUserPreferences();
      Utils.debug('Page visit tracked:', pageKey, this.userPreferences.visitCounts[pageKey]);
    }
  },

  // Get page key from URL
  getPageKey: function(url) {
    if (url.includes('appointment-services')) return 'appointment-services';
    if (url.includes('walkin-services')) return 'walkin-services';
    if (url.includes('emergency-shelter')) return 'emergency-shelter';
    if (url.includes('group-meetings')) return 'group-meetings';
    if (url.includes('education-classes')) return 'education-classes';
    if (url.includes('service-detail')) return 'service-detail';
    return null;
  },

  // Update Quick Access display
  updateQuickAccessDisplay: function() {
    const quickAccessSection = document.getElementById('quickAccessSection');
    if (!quickAccessSection) return;

    if (this.userPreferences.showQuickAccess && this.shouldShowQuickAccess()) {
      quickAccessSection.style.display = 'block';
      this.renderQuickAccessItems();
    } else {
      quickAccessSection.style.display = 'none';
    }
  },

  // Determine if Quick Access should be shown
  shouldShowQuickAccess: function() {
    // Show if user has favorites or frequently visited pages
    return this.userPreferences.favorites.length > 0 ||
      Object.keys(this.userPreferences.visitCounts).length > 0;
  },

  // Render Quick Access items
  renderQuickAccessItems: function() {
    const container = document.getElementById('quickAccessCategories');
    if (!container) return;

    const itemsToShow = this.getQuickAccessItems();

    container.innerHTML = itemsToShow.map(item => {
      const isFavorite = this.userPreferences.favorites.includes(item.id);
      const visitCount = this.userPreferences.visitCounts[this.getServicePageKey(item.id)] || 0;
      const isFrequent = visitCount >= 3;

      let cardClass = 'category-card';
      if (isFavorite) cardClass += ' user-favorite';
      else if (isFrequent) cardClass += ' frequent-visit';

      return `
                <div class="${cardClass}" data-count="${item.count}" onclick="QuickAccess.navigateToService('${item.url}')">
                    ${isFavorite ? '<div class="favorite-indicator">★</div>' : ''}
                    ${visitCount > 0 ? `<div class="visit-count">${visitCount} visits</div>` : ''}
                    <h3>${item.name}</h3>
                    <p>${item.description}</p>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem;">
                        <a href="${item.url}" class="category-link" onclick="event.stopPropagation()">Browse →</a>
                        <button class="btn-secondary" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;"
                                onclick="event.stopPropagation(); QuickAccess.toggleFavorite('${item.id}')">
                            ${isFavorite ? '★ Favorited' : '☆ Favorite'}
                        </button>
                    </div>
                </div>
            `;
    }).join('');
  },

  // Get items to show in Quick Access
  getQuickAccessItems: function() {
    const favorites = this.availableServices.filter(service =>
      this.userPreferences.favorites.includes(service.id)
    );

    const frequent = this.availableServices.filter(service => {
      const pageKey = this.getServicePageKey(service.id);
      const visitCount = this.userPreferences.visitCounts[pageKey] || 0;
      return visitCount >= 2 && !this.userPreferences.favorites.includes(service.id);
    }).sort((a, b) => {
      const aVisits = this.userPreferences.visitCounts[this.getServicePageKey(a.id)] || 0;
      const bVisits = this.userPreferences.visitCounts[this.getServicePageKey(b.id)] || 0;
      return bVisits - aVisits;
    });

    // Combine favorites and frequent, limit to 6 items
    return [...favorites, ...frequent].slice(0, 6);
  },

  // Get service page key from service ID
  getServicePageKey: function(serviceId) {
    const mapping = {
      'food-pantry': 'walkin-services',
      'housing-shelter': 'emergency-shelter',
      'healthcare': 'appointment-services',
      'education': 'education-classes',
      'legal-services': 'appointment-services',
      'support-groups': 'group-meetings'
    };
    return mapping[serviceId] || serviceId;
  },

  // Navigate to service and track usage
  navigateToService: function(url) {
    this.trackServiceClick(url);
    window.location.href = url;
  },

  // Track service click
  trackServiceClick: function(url) {
    Utils.debug('Service clicked from Quick Access:', url);
    // This could send analytics data in a real system
  },

  // Toggle favorite status
  toggleFavorite: function(serviceId) {
    const index = this.userPreferences.favorites.indexOf(serviceId);

    if (index > -1) {
      this.userPreferences.favorites.splice(index, 1);
      NotificationManager.add('Removed from favorites', 'info', 2000);
    } else {
      this.userPreferences.favorites.push(serviceId);
      NotificationManager.add('Added to favorites', 'success', 2000);
    }

    this.saveUserPreferences();
    this.renderQuickAccessItems();
  },

  // Show Quick Access section
  show: function() {
    this.userPreferences.showQuickAccess = true;
    this.saveUserPreferences();
    this.updateQuickAccessDisplay();
  },

  // Hide Quick Access section
  hide: function() {
    const quickAccessSection = document.getElementById('quickAccessSection');
    if (quickAccessSection) {
      quickAccessSection.style.display = 'none';
    }

    // Ask if user wants to disable permanently
    if (confirm('Hide Quick Access permanently? You can re-enable it in Settings.')) {
      this.userPreferences.showQuickAccess = false;
      this.saveUserPreferences();
    }
  },

  // Open management interface
  manage: function() {
    this.showManagementModal();
  },

  // Show management modal (simplified for demo)
  showManagementModal: function() {
    const modal = this.createManagementModal();
    document.body.appendChild(modal);
  },

  // Create management modal
  createManagementModal: function() {
    const modal = document.createElement('div');
    modal.className = 'quick-access-modal';
    modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;

    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
            background: white;
            padding: 2rem;
            border-radius: 10px;
            max-width: 600px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
        `;

    modalContent.innerHTML = `
            <h2 style="margin-bottom: 1rem; color: #2c3e50;">Manage Quick Access</h2>
            <p style="margin-bottom: 1.5rem; color: #666;">Choose which services appear in your Quick Access section:</p>

            <div style="margin-bottom: 2rem;">
                <h3 style="margin-bottom: 1rem; color: #2c3e50;">Available Services</h3>
                ${this.availableServices.map(service => {
      const isFavorite = this.userPreferences.favorites.includes(service.id);
      const visitCount = this.userPreferences.visitCounts[this.getServicePageKey(service.id)] || 0;

      return `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; border-bottom: 1px solid #eee;">
                            <div>
                                <strong>${service.name}</strong>
                                <div style="font-size: 0.9rem; color: #666;">${service.description}</div>
                                ${visitCount > 0 ? `<div style="font-size: 0.8rem; color: #95a5a6;">Visited ${visitCount} times</div>` : ''}
                            </div>
                            <button class="btn-secondary" style="padding: 0.5rem 1rem;"
                                    onclick="QuickAccess.toggleFavoriteFromModal('${service.id}', this)">
                                ${isFavorite ? '★ Favorited' : '☆ Add to Favorites'}
                            </button>
                        </div>
                    `;
    }).join('')}
            </div>

            <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                <button class="btn-secondary" onclick="QuickAccess.closeModal()">Close</button>
                <button class="btn-primary" onclick="QuickAccess.resetQuickAccess()">Reset All</button>
            </div>
        `;

    modal.appendChild(modalContent);

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.closeModal();
      }
    });

    return modal;
  },

  // Toggle favorite from modal
  toggleFavoriteFromModal: function(serviceId, button) {
    this.toggleFavorite(serviceId);

    // Update button text
    const isFavorite = this.userPreferences.favorites.includes(serviceId);
    button.textContent = isFavorite ? '★ Favorited' : '☆ Add to Favorites';
  },

  // Close management modal
  closeModal: function() {
    const modal = document.querySelector('.quick-access-modal');
    if (modal) {
      modal.remove();
      this.renderQuickAccessItems(); // Refresh the display
    }
  },

  // Reset all Quick Access preferences
  resetQuickAccess: function() {
    if (confirm('Reset all Quick Access preferences? This will clear your favorites and visit history.')) {
      this.userPreferences = {
        favorites: [],
        visitCounts: {},
        lastVisited: {},
        showQuickAccess: false
      };
      this.saveUserPreferences();
      this.updateQuickAccessDisplay();
      this.closeModal();
      NotificationManager.add('Quick Access preferences reset', 'info', 3000);
    }
  }
};
const DataService = {
  // Mock service data
  services: {
    'appointment': [
      {
        id: 'legal-001',
        name: 'Free Legal Consultation',
        provider: 'Cedar Rapids Legal Aid Society',
        category: 'legal',
        availability: 'this-week',
        description: 'Free legal advice for housing, benefits, and family law issues.',
        nextAvailable: 'Tuesday, Sept 24th at 2:00 PM',
        location: 'Downtown Legal Center',
        duration: '60 minutes'
      },
      {
        id: 'health-001',
        name: 'Community Health Clinic',
        provider: 'Mercy Medical Center',
        category: 'health',
        availability: 'today',
        description: 'Primary care and preventive services for uninsured patients.',
        nextAvailable: 'Available Today: 10:00 AM - 4:00 PM',
        location: 'Community Health Center',
        duration: '30-45 minutes'
      }
    ],
    'walkin': [
      {
        id: 'food-001',
        name: 'Community Food Bank',
        provider: 'Cedar Rapids Food Bank',
        category: 'food',
        availability: 'today',
        description: 'Free groceries and meals for families in need.',
        hours: 'Mon-Fri 9 AM-3 PM',
        location: 'Food Distribution Center',
        capacity: 'Walk-in, no appointment needed'
      }
    ],
    'emergency': [
      {
        id: 'shelter-001',
        name: 'Emergency Family Shelter',
        provider: 'Willis Dady Homeless Services',
        category: 'housing',
        availability: 'emergency',
        description: '24/7 emergency shelter for individuals and families.',
        contact: '(319) 366-7999',
        location: 'Multiple Locations',
        capacity: 'Based on availability'
      }
    ]
  },

  // Get services by type
  getServices: function(type = 'appointment') {
    return new Promise((resolve) => {
      // Simulate API delay
      setTimeout(() => {
        resolve(this.services[type] || []);
      }, 500);
    });
  },

  // Get single service by ID
  getService: function(id) {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Search through all service types
        for (let type in this.services) {
          const service = this.services[type].find(s => s.id === id);
          if (service) {
            resolve(service);
            return;
          }
        }
        resolve(null);
      }, 300);
    });
  }
};

// User session management
const UserSession = {
  currentUser: null,
  userPreferences: {
    theme: 'light',
    language: 'en',
    accessibility: {
      highContrast: false,
      largeText: false,
      screenReader: false
    }
  },

  // Check if user is logged in
  isLoggedIn: function() {
    return this.currentUser !== null;
  },

  // Set user data
  setUser: function(userData) {
    this.currentUser = userData;
    this.updateUserInterface();
    Utils.debug('User logged in:', userData);
  },

  // Update UI based on user state
  updateUserInterface: function() {
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
      if (this.isLoggedIn()) {
        loginBtn.textContent = `Welcome, ${this.currentUser.name}`;
      } else {
        loginBtn.textContent = 'Login / Settings';
      }
    }

    // Update dynamic menu based on user type
    this.updateDynamicMenu();
  },

  // Update menu based on user persona
  updateDynamicMenu: function() {
    const menu = document.getElementById('dynamicMenu');
    if (!menu) return;

    // This would be more complex in a real system
    if (this.isLoggedIn()) {
      const userType = this.currentUser.type;
      Utils.debug('Updating menu for user type:', userType);

      // Different menu items based on user persona
      // Implementation would vary based on user stories
    }
  },

  // Apply accessibility preferences
  applyAccessibilitySettings: function() {
    const body = document.body;

    if (this.userPreferences.accessibility.highContrast) {
      body.classList.add('high-contrast');
    }

    if (this.userPreferences.accessibility.largeText) {
      body.classList.add('large-text');
    }

    Utils.debug('Applied accessibility settings:', this.userPreferences.accessibility);
  }
};

// Search functionality
const SearchManager = {
  currentQuery: '',
  searchResults: [],

  // Initialize search functionality
  init: function() {
    const searchInput = document.querySelector('.search-input');
    const searchBtn = document.querySelector('.search-btn');

    if (searchInput && searchBtn) {
      searchInput.addEventListener('input', this.handleSearchInput.bind(this));
      searchBtn.addEventListener('click', this.performSearch.bind(this));

      // Search on Enter key
      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.performSearch();
        }
      });
    }
  },

  // Handle search input changes
  handleSearchInput: function(event) {
    this.currentQuery = event.target.value;

    // Show search suggestions if query is long enough
    if (this.currentQuery.length >= 2) {
      this.showSearchSuggestions();
    } else {
      this.hideSearchSuggestions();
    }
  },

  // Perform search
  performSearch: function() {
    if (this.currentQuery.trim() === '') return;

    Utils.debug('Performing search for:', this.currentQuery);

    // In a real system, this would query the backend
    // For now, redirect to search results page
    window.location.href = `../public/pages/search/search-results.html?q=${encodeURIComponent(
      this.currentQuery)}`;
  },

  // Show search suggestions (placeholder)
  showSearchSuggestions: function() {
    // This would show a dropdown with suggestions
    Utils.debug('Would show search suggestions for:', this.currentQuery);
  },

  // Hide search suggestions
  hideSearchSuggestions: function() {
    // Remove suggestions dropdown
  }
};

// Notification system
const NotificationManager = {
  notifications: [],

  // Add a notification
  add: function(message, type = 'info', duration = 5000) {
    const notification = {
      id: Date.now(),
      message: message,
      type: type, // 'info', 'success', 'warning', 'error'
      timestamp: new Date(),
      duration: duration
    };

    this.notifications.push(notification);
    this.display(notification);

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        this.remove(notification.id);
      }, duration);
    }

    Utils.debug('Added notification:', notification);
  },

  // Display notification
  display: function(notification) {
    // Create notification element
    const notificationEl = document.createElement('div');
    notificationEl.className = `notification notification-${notification.type}`;
    notificationEl.id = `notification-${notification.id}`;
    notificationEl.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${Utils.sanitizeHtml(notification.message)}</span>
                <button class="notification-close" onclick="NotificationManager.remove(${notification.id})">&times;</button>
            </div>
        `;

    // Add to notification container
    let container = document.getElementById('notification-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'notification-container';
      document.body.appendChild(container);
    }

    container.appendChild(notificationEl);
  },

  // Remove notification
  remove: function(id) {
    const notificationEl = document.getElementById(`notification-${id}`);
    if (notificationEl) {
      notificationEl.remove();
    }

    this.notifications = this.notifications.filter(n => n.id !== id);
  }
};

// Initialize application
const App = {
  // Initialize the application
  init: function() {
    Utils.debug('Initializing Community Resource Support System', AppConfig);

    // Initialize core components
    SearchManager.init();
    UserSession.applyAccessibilitySettings();
    QuickAccess.init();

    // Set up global event listeners
    this.setupEventListeners();

    // Load user session if exists
    this.loadUserSession();

    Utils.debug('Application initialized successfully');
  },

  // Set up global event listeners
  setupEventListeners: function() {
    // Handle navigation clicks
    document.addEventListener('click', (e) => {
      if (e.target.matches('a[href="#"]')) {
        e.preventDefault();
        Utils.debug('Prevented default link behavior');
      }
    });

    // Handle form submissions
    document.addEventListener('submit', (e) => {
      if (e.target.matches('form')) {
        Utils.debug('Form submitted:', e.target);
      }
    });

    // Handle window resize for responsive features
    window.addEventListener('resize', this.handleResize.bind(this));
  },

  // Handle window resize
  handleResize: function() {
    // Responsive behavior adjustments
    Utils.debug('Window resized to:', window.innerWidth, 'x', window.innerHeight);
  },

  // Load user session from localStorage
  loadUserSession: function() {
    try {
      const savedSession = localStorage.getItem('userSession');
      if (savedSession) {
        const sessionData = JSON.parse(savedSession);
        UserSession.currentUser = sessionData.user;
        UserSession.userPreferences = { ...UserSession.userPreferences, ...sessionData.preferences };
        UserSession.updateUserInterface();
        Utils.debug('Loaded user session from localStorage');
      }
    } catch (error) {
      Utils.debug('Error loading user session:', error);
    }
  },

  // Save user session to localStorage
  saveUserSession: function() {
    try {
      const sessionData = {
        user: UserSession.currentUser,
        preferences: UserSession.userPreferences
      };
      localStorage.setItem('userSession', JSON.stringify(sessionData));
      Utils.debug('Saved user session to localStorage');
    } catch (error) {
      Utils.debug('Error saving user session:', error);
    }
  }
};

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  App.init();
});

// Global error handling
window.addEventListener('error', function(e) {
  Utils.debug('Global error:', e.error);
  NotificationManager.add('An error occurred. Please try again.', 'error');
});

// Expose utilities globally for debugging
if (AppConfig.debug) {
  window.CommunityApp = {
    Utils,
    DataService,
    UserSession,
    SearchManager,
    NotificationManager,
    App
  };
}

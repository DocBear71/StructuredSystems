// Navigation and Menu Management for Community Resource Support System

const NavigationManager = {
  // Current page information
  currentPage: '',
  breadcrumbs: [],

  // Initialize navigation
  init: function() {
    this.setCurrentPage();
    this.setupMenuInteractions();
    this.setupMobileMenuToggle();
    this.setupBreadcrumbs();

    Utils.debug('Navigation initialized for page:', this.currentPage);
  },

  // Determine current page from URL
  setCurrentPage: function() {
    const path = window.location.pathname;
    const filename = path.split('/').pop() || 'index.html';
    this.currentPage = filename.replace('.html', '');

    // Set active navigation item
    this.setActiveNavItem();
  },

  // Set active navigation item based on current page
  setActiveNavItem: function() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.classList.remove('active');

      // Check if this link matches current page
      const href = link.getAttribute('href');
      if (href && href.includes(this.currentPage)) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      }
    });
  },

  // Setup menu interactions
  setupMenuInteractions: function() {
    // Dropdown menu interactions
    const dropdowns = document.querySelectorAll('.dropdown');
    dropdowns.forEach(dropdown => {
      const button = dropdown.querySelector('.dropdown-btn');
      const content = dropdown.querySelector('.dropdown-content');

      if (button && content) {
        // Click to toggle dropdown
        button.addEventListener('click', (e) => {
          e.stopPropagation();
          this.toggleDropdown(dropdown);
        });

        // Keyboard accessibility
        button.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.toggleDropdown(dropdown);
          }
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
          this.closeDropdown(dropdown);
        });
      }
    });

    // Navigation menu interactions
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      const link = item.querySelector('.nav-link');
      const dropdownMenu = item.querySelector('.dropdown-menu');

      if (link && dropdownMenu) {
        // Handle keyboard navigation
        link.addEventListener('keydown', (e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            const firstMenuItem = dropdownMenu.querySelector('a');
            if (firstMenuItem) firstMenuItem.focus();
          }
        });

        // Handle dropdown menu keyboard navigation
        const menuItems = dropdownMenu.querySelectorAll('a');
        menuItems.forEach((menuItem, index) => {
          menuItem.addEventListener('keydown', (e) => {
            switch(e.key) {
              case 'ArrowDown':
                e.preventDefault();
                const nextItem = menuItems[index + 1];
                if (nextItem) nextItem.focus();
                break;
              case 'ArrowUp':
                e.preventDefault();
                const prevItem = menuItems[index - 1] || link;
                prevItem.focus();
                break;
              case 'Escape':
                e.preventDefault();
                link.focus();
                break;
            }
          });
        });
      }
    });
  },

  // Toggle dropdown menu
  toggleDropdown: function(dropdown) {
    const content = dropdown.querySelector('.dropdown-content');
    const button = dropdown.querySelector('.dropdown-btn');

    if (content) {
      const isOpen = content.style.display === 'block';

      // Close all other dropdowns
      this.closeAllDropdowns();

      if (!isOpen) {
        content.style.display = 'block';
        button.setAttribute('aria-expanded', 'true');
        dropdown.classList.add('active');
      }
    }
  },

  // Close specific dropdown
  closeDropdown: function(dropdown) {
    const content = dropdown.querySelector('.dropdown-content');
    const button = dropdown.querySelector('.dropdown-btn');

    if (content) {
      content.style.display = 'none';
      button.setAttribute('aria-expanded', 'false');
      dropdown.classList.remove('active');
    }
  },

  // Close all dropdowns
  closeAllDropdowns: function() {
    const dropdowns = document.querySelectorAll('.dropdown');
    dropdowns.forEach(dropdown => {
      this.closeDropdown(dropdown);
    });
  },

  // Setup mobile menu toggle (if needed)
  setupMobileMenuToggle: function() {
    // Check if we need a mobile menu toggle
    const nav = document.querySelector('.main-nav');
    if (nav && window.innerWidth <= 768) {
      this.createMobileMenuToggle();
    }

    // Handle window resize
    window.addEventListener('resize', () => {
      if (window.innerWidth <= 768) {
        this.createMobileMenuToggle();
      } else {
        this.removeMobileMenuToggle();
      }
    });
  },

  // Create mobile menu toggle button
  createMobileMenuToggle: function() {
    const nav = document.querySelector('.main-nav');
    if (!nav || nav.querySelector('.mobile-menu-toggle')) return;

    const toggleButton = document.createElement('button');
    toggleButton.className = 'mobile-menu-toggle';
    toggleButton.innerHTML = '☰ Menu';
    toggleButton.setAttribute('aria-label', 'Toggle navigation menu');
    toggleButton.setAttribute('aria-expanded', 'false');

    toggleButton.addEventListener('click', () => {
      this.toggleMobileMenu();
    });

    nav.insertBefore(toggleButton, nav.firstChild);

    // Hide menu by default on mobile
    const navMenu = nav.querySelector('.nav-menu');
    if (navMenu) {
      navMenu.style.display = 'none';
    }
  },

  // Remove mobile menu toggle
  removeMobileMenuToggle: function() {
    const toggle = document.querySelector('.mobile-menu-toggle');
    if (toggle) {
      toggle.remove();
    }

    // Show menu on desktop
    const navMenu = document.querySelector('.nav-menu');
    if (navMenu) {
      navMenu.style.display = 'flex';
    }
  },

  // Toggle mobile menu
  toggleMobileMenu: function() {
    const navMenu = document.querySelector('.nav-menu');
    const toggle = document.querySelector('.mobile-menu-toggle');

    if (navMenu && toggle) {
      const isOpen = navMenu.style.display !== 'none';

      navMenu.style.display = isOpen ? 'none' : 'flex';
      toggle.setAttribute('aria-expanded', !isOpen);
      toggle.innerHTML = isOpen ? '☰ Menu' : '✕ Close';
    }
  },

  // Setup breadcrumb navigation
  setupBreadcrumbs: function() {
    const breadcrumb = document.querySelector('.breadcrumb');
    if (!breadcrumb) return;

    // Generate breadcrumbs based on current path
    this.generateBreadcrumbs();
  },

  // Generate breadcrumbs from current URL
  generateBreadcrumbs: function() {
    const path = window.location.pathname;
    const segments = path.split('/').filter(segment => segment && segment !== 'index.html');

    this.breadcrumbs = [
      { name: 'Home', url: this.getRelativeRoot() + 'index.html' }
    ];

    let currentPath = this.getRelativeRoot();
    segments.forEach((segment, index) => {
      currentPath += segment + '/';

      // Convert segment to readable name
      const name = this.segmentToName(segment);

      if (index === segments.length - 1) {
        // Last segment is current page
        this.breadcrumbs.push({ name, url: null });
      } else {
        this.breadcrumbs.push({ name, url: currentPath });
      }
    });

    this.renderBreadcrumbs();
  },

  // Convert URL segment to readable name
  segmentToName: function(segment) {
    const nameMap = {
      'services': 'Services',
      'appointment-services': 'Appointment Services',
      'walkin-services': 'Walk-in Services',
      'emergency-shelter': 'Emergency Shelter',
      'group-meetings': 'Group Meetings',
      'education-classes': 'Education Classes',
      'service-detail': 'Service Detail',
      'search': 'Search',
      'pages': 'Pages'
    };

    return nameMap[segment] || segment.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  },

  // Get relative root path
  getRelativeRoot: function() {
    const path = window.location.pathname;
    const depth = path.split('/').length - 2; // Subtract 2 for empty first element and filename
    return depth > 0 ? '../'.repeat(depth) : './';
  },

  // Render breadcrumbs
  renderBreadcrumbs: function() {
    const breadcrumb = document.querySelector('.breadcrumb');
    if (!breadcrumb) return;

    breadcrumb.innerHTML = this.breadcrumbs.map((crumb, index) => {
      if (crumb.url) {
        return `<a href="${crumb.url}">${crumb.name}</a>`;
      } else {
        return `<span>${crumb.name}</span>`;
      }
    }).join(' > ');

    // Add structured data for SEO
    this.addBreadcrumbStructuredData();
  },

  // Add breadcrumb structured data for SEO
  addBreadcrumbStructuredData: function() {
    const existingScript = document.querySelector('script[type="application/ld+json"]');
    if (existingScript) existingScript.remove();

    const structuredData = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": this.breadcrumbs.map((crumb, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": crumb.name,
        "item": crumb.url ? window.location.origin + '/' + crumb.url : window.location.href
      }))
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);
  }
};

// Page-specific navigation enhancements
const PageNavigationEnhancer = {
  // Initialize page-specific navigation features
  init: function() {
    this.handleServiceNavigation();
    this.setupQuickNavigation();
    this.setupSearchNavigation();
  },

  // Handle service page navigation
  handleServiceNavigation: function() {
    if (NavigationManager.currentPage.includes('services')) {
      this.setupServiceFilters();
      this.setupServicePagination();
    }
  },

  // Setup service filters navigation
  setupServiceFilters: function() {
    const filters = document.querySelectorAll('#categoryFilter, #availabilityFilter');
    filters.forEach(filter => {
      filter.addEventListener('change', () => {
        // Update URL with filter parameters
        this.updateURLParams();
      });
    });
  },

  // Setup service pagination
  setupServicePagination: function() {
    const paginationButtons = document.querySelectorAll('.page-btn');
    paginationButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        if (!button.disabled) {
          // Handle pagination navigation
          this.handlePagination(e);
        }
      });
    });
  },

  // Handle pagination clicks
  handlePagination: function(event) {
    const button = event.target;
    const isNext = button.textContent.includes('Next');

    // In a real system, this would load new page data
    NotificationManager.add(
      isNext ? 'Loading next page...' : 'Loading previous page...',
      'info',
      2000
    );

    // Scroll to top of results
    const resultsHeader = document.querySelector('.results-header');
    if (resultsHeader) {
      resultsHeader.scrollIntoView({ behavior: 'smooth' });
    }
  },

  // Setup quick navigation shortcuts
  setupQuickNavigation: function() {
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Alt+H for home
      if (e.altKey && e.key === 'h') {
        e.preventDefault();
        window.location.href = NavigationManager.getRelativeRoot() + 'index.html';
      }

      // Alt+S for search
      if (e.altKey && e.key === 's') {
        e.preventDefault();
        const searchInput = document.querySelector('.search-input');
        if (searchInput) searchInput.focus();
      }

      // Escape to close dropdowns
      if (e.key === 'Escape') {
        NavigationManager.closeAllDropdowns();
      }
    });
  },

  // Setup search navigation
  setupSearchNavigation: function() {
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
      // Add search history functionality
      searchInput.addEventListener('focus', () => {
        // Could show recent searches
        Utils.debug('Search input focused - could show history');
      });
    }
  },

  // Update URL parameters without page reload
  updateURLParams: function() {
    const categoryFilter = document.getElementById('categoryFilter');
    const availabilityFilter = document.getElementById('availabilityFilter');

    if (categoryFilter && availabilityFilter) {
      const params = new URLSearchParams();

      if (categoryFilter.value !== 'all') {
        params.set('category', categoryFilter.value);
      }

      if (availabilityFilter.value !== 'all') {
        params.set('availability', availabilityFilter.value);
      }

      // Update URL without refresh
      const newURL = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
      window.history.pushState({}, '', newURL);
    }
  }
};

// Initialize navigation when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  NavigationManager.init();
  PageNavigationEnhancer.init();
});

// Handle back/forward navigation
window.addEventListener('popstate', function(event) {
  Utils.debug('Navigation state changed:', event.state);
  // Could reload filters or page state based on URL
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { NavigationManager, PageNavigationEnhancer };
}

// Search functionality using Fuse.js
document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('recipe-search');
  const recipesList = document.getElementById('recipes-main');
  
  if (!searchInput || !recipesList) {
    console.warn('Search elements not found on page');
    return;
  }
  
  // Get all recipe items
  const recipeItems = Array.from(recipesList.querySelectorAll('li'));
  const recipeData = recipeItems.map(item => {
    const link = item.querySelector('a');
    return {
      title: link ? link.textContent : '',
      element: item,
      url: link ? link.getAttribute('href') : ''
    };
  });
  
  // Initialize Fuse with recipe data
  const fuse = new Fuse(recipeData, {
    keys: ['title'],
    threshold: 0.4,
    ignoreLocation: true
  });
  
  // Search function
  function performSearch() {
    const query = searchInput.value.trim();
    
    // If empty query, show all recipes
    if (!query) {
      recipeItems.forEach(item => {
        item.style.display = '';
      });
      return;
    }
    
    // Perform search and get results
    const results = fuse.search(query);
    const matchedIds = results.map(result => result.item.element.id);
    
    // Hide/show recipes based on search results
    recipeItems.forEach(item => {
      if (query === '' || results.some(result => result.item.element === item)) {
        item.style.display = '';
      } else {
        item.style.display = 'none';
      }
    });
  }
  
  // Add event listener for search input
  searchInput.addEventListener('input', performSearch);
  
  // Initialize search if URL has search parameter
  const urlParams = new URLSearchParams(window.location.search);
  const initialQuery = urlParams.get('q');
  if (initialQuery) {
    searchInput.value = initialQuery;
    performSearch();
  }
}); 
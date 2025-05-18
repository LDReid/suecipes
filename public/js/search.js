// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    // Check if search elements exist
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');
    const searchForm = document.getElementById('search-form');
    
    if (!searchInput || !searchResults || !searchForm) return;
    
    // Prevent form submission
    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
    });
    
    // Initialize variables
    let searchIndex = [];
    let fuseInstance = null;
    
    // Fetch the search index
    fetch('/index.json')
        .then(response => response.json())
        .then(data => {
            searchIndex = data.items;
            initFuse(searchIndex);
        })
        .catch(error => console.error('Error fetching search index:', error));
    
    // Initialize Fuse.js
    function initFuse(searchData) {
        const options = {
            includeScore: true,
            keys: [
                { name: 'title', weight: 0.8 },
                { name: 'tags', weight: 0.6 },
                { name: 'content_html', weight: 0.4 }
            ],
            threshold: 0.3
        };
        fuseInstance = new Fuse(searchData, options);
        
        // Now that Fuse is ready, add the input event listener
        searchInput.addEventListener('input', debounce(performSearch, 350));
    }
    
    // Perform search
    function performSearch() {
        if (!fuseInstance) return;
        
        const query = searchInput.value.trim();
        searchResults.innerHTML = '';
        
        if (query === '') {
            searchResults.style.display = 'none';
            return;
        }
        
        const results = fuseInstance.search(query).slice(0, 10);
        
        if (results.length === 0) {
            searchResults.innerHTML = '<p class="no-results">No recipes found</p>';
            searchResults.style.display = 'block';
            return;
        }
        
        // Display results
        searchResults.style.display = 'block';
        const resultsList = document.createElement('ul');
        
        results.forEach(result => {
            const item = result.item;
            const listItem = document.createElement('li');
            
            const link = document.createElement('a');
            link.href = item.url;
            link.textContent = item.title;
            
            const author = document.createElement('span');
            author.className = 'result-author';
            author.textContent = item.author ? ` by ${item.author}` : '';
            
            listItem.appendChild(link);
            listItem.appendChild(author);
            resultsList.appendChild(listItem);
        });
        
        searchResults.appendChild(resultsList);
    }
    
    // Simple debounce function to limit how often the search runs
    function debounce(func, wait) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                func.apply(context, args);
            }, wait);
        };
    }
    
    // Close search results when clicking outside
    document.addEventListener('click', function(e) {
        if (e.target !== searchInput && e.target !== searchResults && !searchResults.contains(e.target)) {
            searchResults.style.display = 'none';
        }
    });
}); 
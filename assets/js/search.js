/**
 * @file
 * A JavaScript file for flexsearch.
 */

/* eslint-disable */
import * as params from '@params';
/* eslint-enable */

/* eslint-disable no-undef, guard-for-in */
(function () {

  'use strict';

  const index = new FlexSearch.Document({
    document: {
      id: 'id',
      index: ['title', 'tags', 'content', 'date'],
      store: ['title', 'summary', 'date', 'permalink']
    },
    tokenize: 'forward'
  });

  function showResults(items) {
    const template = document.querySelector('template').content;
    const fragment = document.createDocumentFragment();
    const results = document.querySelector('.search-results');
    results.textContent = '';

    for (const id in items) {
      const item = items[id];
      const result = template.cloneNode(true);
      const a = result.querySelector('a');
      const time = result.querySelector('time');
      const content = result.querySelector('.content');
      a.innerHTML = item.title;
      a.href = item.permalink;
      /*time.innerText = item.date;*/
      /*content.innerHTML = item.summary;*/
      fragment.appendChild(result);
    }
    results.appendChild(fragment);
  }

  function doSearch() {
    const query = document.querySelector('.search-text').value.trim();
    const resultsContainer = document.querySelector('.search-results');
    
    // Perform the search
    const results = index.search({
      query: query,
      enrich: true,
      limit: params.searchLimit
    });
    
    const items = {};
    results.forEach(function (result) {
      result.result.forEach(function (r) {
        items[r.id] = r.doc;
      });
    });
    
    // Toggle display based on search input and results
    if (query.length > 0 && Object.keys(items).length > 0) {
      resultsContainer.style.display = 'block';  // Show results if there is input and results
    } else {
      resultsContainer.style.display = 'none';   // Hide if no input or no results
    }
  
    // Render results
    showResults(items);
  }
  

  function enableUI() {
    const searchform = document.querySelector('.search-form');
    const searchInput = document.querySelector('.search-text');
    const resultsContainer = document.querySelector('.search-results');
  
    // Search on form submit
    searchform.addEventListener('submit', function (e) {
      e.preventDefault();
      doSearch();
    });
  
    // Search on input
    searchform.addEventListener('input', function () {
      doSearch();
    });
  
    // Hide results on Escape key press
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        resultsContainer.style.display = 'none';  // Hide results on Escape
      }
    });
  
    /*// Hide results when clicking outside of input
    document.addEventListener('click', function (e) {
      if (!searchform.contains(e.target)) {
        resultsContainer.style.display = 'none';  // Hide results when clicking outside
      }
    });*/
  
    /*// Show the search UI
    document.querySelector('.search-loading').classList.add('hidden');
    document.querySelector('.search-input').classList.remove('hidden');
    searchInput.focus();*/
  }
  

  function buildIndex() {
    const searchindex = 'searchindex.json';
    console.log("Fetching search index from:", searchindex);
    fetch(searchindex)
      .then(function (response) {
        if (!response.ok) throw new Error("Network response was not ok");
        return response.json();
      })
      .then(function (data) {
        console.log("Index data:", data);
        data.forEach(function (item) {
          index.add(item);
        });
      })
      .catch(function (error) {
        console.error("Fetch error:", error);
      });
  }

  buildIndex();
  enableUI();
})();

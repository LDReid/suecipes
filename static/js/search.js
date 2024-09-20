// Define the summary include length and Fuse.js options
var summaryInclude = 180;
var fuseOptions = {
    shouldSort: true,
    includeMatches: true,
    includeScore: true,
    tokenize: true,
    location: 0,
    distance: 100,
    minMatchCharLength: 1,
    keys: [
        {name: "title", weight: 0.45},
        {name: "contents", weight: 0.4},
        {name: "tags", weight: 0.1},
        {name: "categories", weight: 0.05}
    ]
};

// Search functionality
document.addEventListener('DOMContentLoaded', function() {
    var inputBox = document.getElementById('search-query');
    if (inputBox !== null) {
        var searchQuery = param("q");
        if (searchQuery) {
            inputBox.value = searchQuery || "";
            executeSearch(searchQuery);
        } else {
            document.getElementById('search-results').innerHTML = '<p class="search-results-empty">Search or see <a href="/tags/">all tags</a> instead.</p>';
        }
    }
});

function executeSearch(searchQuery) {
    show(document.querySelector('.search-loading'));

    fetch('/index.json').then(function (response) {
        if (response.status !== 200) {
            console.log('Looks like there was a problem. Status Code: ' + response.status);
            return;
        }
        response.json().then(function (pages) {
            var fuse = new Fuse(pages, fuseOptions);
            var result = fuse.search(searchQuery);
            if (result.length > 0) {
                populateResults(result);
            } else {
                document.getElementById('search-results').innerHTML = '<p class="search-results-empty">No matches found</p>';
            }
            hide(document.querySelector('.search-loading'));
        })
        .catch(function (err) {
            console.log('Fetch Error :-S', err);
        });
    });
}

function populateResults(results) {
    var searchQuery = document.getElementById("search-query").value;
    var searchResults = document.getElementById("search-results");
    var templateDefinition = document.getElementById("search-result-template").innerHTML;

    searchResults.innerHTML = ''; // Clear previous results

    results.forEach(function (value, key) {
        var contents = value.item.contents;
        var snippet = contents.substring(0, summaryInclude * 0.5) + '&hellip;';
        var tags = value.item.tags ? value.item.tags.map(tag => `<a href='/tags/${tag}'>#${tag}</a>`).join(' ') : '';

        var output = render(templateDefinition, {
            key: key,
            title: value.item.title,
            link: value.item.permalink,
            tags: tags,
            categories: value.item.categories,
            snippet: snippet
        });
        searchResults.innerHTML += output;

        var instance = new Mark(document.getElementById('summary-' + key));
        instance.mark(searchQuery);
    });
}

function render(templateString, data) {
    var conditionalPattern = /\$\{\s*isset ([a-zA-Z]*) \s*\}(.*)\$\{\s*end\s*}/g;
    var copy = templateString;
    while ((conditionalMatches = conditionalPattern.exec(templateString)) !== null) {
        copy = data[conditionalMatches[1]]
            ? copy.replace(conditionalMatches[0], conditionalMatches[2])
            : copy.replace(conditionalMatches[0], '');
    }
    templateString = copy;
    for (var key in data) {
        var find = '\\$\\{\\s*' + key + '\\s*\\}';
        var re = new RegExp(find, 'g');
        templateString = templateString.replace(re, data[key]);
    }
    return templateString;
}

// Helper Functions
function show(elem) { elem.style.display = 'block'; }
function hide(elem) { elem.style.display = 'none'; }
function param(name) {
    return decodeURIComponent((location.search.split(name + '=')[1] || '').split('&')[0]).replace(/\+/g, ' ');
}
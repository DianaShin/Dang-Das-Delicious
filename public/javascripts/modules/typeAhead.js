const axios = require('axios'); //webpack converts this to commonJS
// could have done ```import axios from 'axios';````
const dompurify = require('dompurify');

function searchResultsHTML(stores) {
  return stores.map(store => {
    return `
      <a href="/store/${store.slug}" class="search__result">
        <strong>${store.name}</strong>
      </a>
    `;
  }).join('') // because we want a string, not an array
}

function typeAhead(search) {
  if (!search) return;
  const searchInput = search.querySelector('input[name="search"]');
  const searchResults = search.querySelector('.search__results');

  //on is a shortcut from bling.js for .addEventListener
  // - here we are listening for 'input' event
  searchInput.on('input', function() {
    // if there is no value, quit it!
    if (!this.value) {
      searchResults.style.display = 'none';
      return; //stop!
    }

    // show the search results!
    searchResults.style.display = 'block';

    axios
      .get(`/api/search?q=${this.value}`)
      .then(res => {
        if (res.data.length) {
          searchResults.innerHTML = dompurify.sanitize(
            searchResultsHTML(res.data));
          return;
        }
        // tell the user nothing came back
        searchResults.innerHTML = dompurify.sanitize(`<div class="search__result"> No results
        for ${this.value} found!</div>`);
      })
      .catch(err => {
        console.error(err);
      });
  });

  // handle keyboard inputs
  searchInput.on('keyup', (e) => {
    console.log(e.keyCode);
    // if they aren't pressing 'up', 'down', or 'enter', who gives a f?
    if (![38, 40, 13].includes(e.keyCode)) {
      return; //skip it!
    }
    const activeClass = 'search__result--active';
    const current = search.querySelector(`.${activeClass}`);
    const items = search.querySelectorAll('.search__result');
    let next;
    // 40 keyCode is down
    if (e.keyCode === 40 && current) {
      next = current.nextElementSibling || items[0]; // or first one on row.. because if you are on last element, there is no nextElementSibling
    } else if (e.keyCode === 40) {
      next = items[0];
    //38 keyCode is up
    } else if (e.keyCode === 38 && current) {
      next = current.previousElementSibling || items[items.length - 1]
    } else if (e.keyCode === 38) {
      next = items[items.length -1];
    // 13 keyCode is 'enter'; redirect the user to the store page
    } else if (e.keyCode === 13 && current.href) {
      window.location = current.href;
      return;
    }
    if (current) {
      current.classList.remove(activeClass);
    }
    next.classList.add(activeClass);
  })
}

export default typeAhead;

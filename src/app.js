/* eslint-disable */
import "bootstrap";
import "./style.css";

document.addEventListener("DOMContentLoaded", () => {
  const pronounsInput = document.getElementById("pronouns-input");
  const adjectivesInput = document.getElementById("adjectives-input");
  const nounsInput = document.getElementById("nouns-input");

  const pronounsList = document.getElementById("pronouns-list");
  const adjectivesList = document.getElementById("adjectives-list");
  const nounsList = document.getElementById("nouns-list");

  const resultsList = document.getElementById("results-list");
  const generateButton = document.getElementById("generate-button");
  const addRandomButton = document.getElementById("add-random-button");
  const resultsContainer = document.getElementById("results-container");

  const alertPlaceholder = document.getElementById("liveAlertPlaceholder");

  let selectedPronouns = new Set();
  let isGenerateClicked = false;

  let pronouns = [];
  let adjectives = [];
  let nouns = [];

  const commonExtensions = [
    "com",
    "net",
    "org",
    "info",
    "biz",
    "co",
    "us",
    "uk",
    "ca",
    "de",
    "fr",
    "es",
    "it",
    "nl",
    "se",
    "no",
    "fi",
    "dk",
    "au",
    "nz",
    "mx",
    "br",
    "ar",
    "uy",
    "jp",
    "cn",
    "in",
    "kr",
    "ru",
    "za"
  ];

  Promise.all([
    fetch("src/assets/Lists/pronouns.json").then(response => response.json()),
    fetch("src/assets/Lists/adjectives.json").then(response => response.json()),
    fetch("src/assets/Lists/nouns.json").then(response => response.json())
  ]).then(data => {
    pronouns = data[0];
    adjectives = data[1];
    nouns = data[2];
  });

  function addToList(input, list) {
    const value = input.value.trim();
    if (
      value &&
      !Array.from(list.children).some(
        item =>
          item.childNodes[0].nodeValue.trim().toLowerCase() ===
          value.toLowerCase()
      )
    ) {
      const listItem = document.createElement("li");
      listItem.className = "list-group-item";
      listItem.innerHTML = `${value} <i class="fas fa-trash-alt delete-icon"></i>`;

      if (list === pronounsList) {
        listItem.addEventListener("click", e => {
          if (isGenerateClicked && e.target.tagName !== "I") {
            if (selectedPronouns.has(value.toLowerCase())) {
              listItem.classList.remove("selected");
              selectedPronouns.delete(value.toLowerCase());
            } else {
              listItem.classList.add("selected");
              selectedPronouns.add(value.toLowerCase());
            }
            filterResults();
          }
        });
      }

      listItem.querySelector(".delete-icon").addEventListener("click", () => {
        list.removeChild(listItem);
        selectedPronouns.delete(value.toLowerCase());
        removeGeneratedDomainsWith(value.toLowerCase());
        filterResults();
      });

      list.appendChild(listItem);
      input.value = "";
    }
  }

  function getRandomItems(arr, num) {
    const shuffled = arr.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, num);
  }

  function addRandomItems() {
    const randomPronouns = getRandomItems(pronouns, 6);
    const randomAdjectives = getRandomItems(adjectives, 6);
    const randomNouns = getRandomItems(nouns, 6);

    replaceListItems(pronounsList, randomPronouns);
    replaceListItems(adjectivesList, randomAdjectives);
    replaceListItems(nounsList, randomNouns);
  }

  function replaceListItems(list, items) {
    list.innerHTML = "";
    items.forEach(item => {
      const input = { value: item };
      addToList(input, list);
    });
  }

  function removeGeneratedDomainsWith(value) {
    Array.from(resultsList.children).forEach(item => {
      if (item.textContent.toLowerCase().includes(value)) {
        resultsList.removeChild(item);
      }
    });
  }

  pronounsInput.addEventListener("keypress", e => {
    if (e.key === "Enter") {
      addToList(pronounsInput, pronounsList);
    }
  });

  adjectivesInput.addEventListener("keypress", e => {
    if (e.key === "Enter") {
      addToList(adjectivesInput, adjectivesList);
    }
  });

  nounsInput.addEventListener("keypress", e => {
    if (e.key === "Enter") {
      addToList(nounsInput, nounsList);
    }
  });

  function generateDomains() {
    selectedPronouns.clear();
    Array.from(pronounsList.children).forEach(item =>
      item.classList.remove("selected")
    );

    const pronouns = Array.from(pronounsList.children).map(item =>
      item.childNodes[0].nodeValue.trim().toLowerCase()
    );
    const adjectives = Array.from(adjectivesList.children).map(item =>
      item.childNodes[0].nodeValue.trim().toLowerCase()
    );
    const nouns = Array.from(nounsList.children).map(item =>
      item.childNodes[0].nodeValue.trim().toLowerCase()
    );

    resultsList.innerHTML = "";

    pronouns.forEach(pronoun => {
      adjectives.forEach(adjective => {
        nouns.forEach(noun => {
          let domain = `${pronoun}${adjective}${noun}.com`;
          commonExtensions.forEach(extension => {
            if (noun.endsWith(extension)) {
              domain = `${pronoun}${adjective}${noun.slice(
                0,
                -extension.length
              )}.${extension}`;
            }
          });
          const listItem = document.createElement("li");
          listItem.className = "list-group-item result-item";
          listItem.textContent = domain;
          resultsList.appendChild(listItem);
        });
      });
    });

    resultsContainer.style.display = "block";
    isGenerateClicked = true;
    filterResults();
    showAlert(
      "Click on the items added to the pronouns list to filter by those only.",
      "info"
    );
  }

  function filterResults() {
    const filters = Array.from(selectedPronouns);
    Array.from(resultsList.children).forEach(item => {
      if (
        filters.length > 0 &&
        !filters.some(filter => item.textContent.startsWith(filter))
      ) {
        item.style.display = "none";
      } else {
        item.style.display = "list-item";
      }
    });
  }

  function showAlert(message, type) {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = `
      <div class="alert alert-${type} alert-dismissible fade show" role="alert">
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>
    `;

    alertPlaceholder.append(wrapper);

    setTimeout(() => {
      wrapper.remove();
    }, 5000);
  }

  generateButton.addEventListener("click", generateDomains);
  addRandomButton.addEventListener("click", addRandomItems);
});

// Your NASA API key. DEMO_KEY works for testing but has strict limits,
// so replace it with your own free key from https://api.nasa.gov
const API_KEY = 'DEMO_KEY';
const API_URL = 'https://api.nasa.gov/planetary/apod';

// Sample APOD entries saved with this app. We use them if NASA's API is having problems.
const BACKUP_URL = 'data/backup-entries.json';

// Give up on a request if there's no answer after 20 seconds
const REQUEST_TIMEOUT_MS = 20000;

// Everything the fact box can show. Each item has a label and some text.
// It starts with a random "Did You Know?" fact, then rotates through the rest.
const spaceFacts = [
  { label: 'Did You Know?', text: 'A day on Venus is longer than its year: it takes about 243 Earth days to spin once, but only 225 to orbit the Sun.' },
  { label: 'Did You Know?', text: 'Sunlight takes about 8 minutes and 20 seconds to reach Earth.' },
  { label: 'Did You Know?', text: 'Olympus Mons on Mars is the tallest volcano in the solar system, about 2.5 times the height of Mount Everest.' },
  { label: 'Did You Know?', text: 'Saturn is less dense than water. Its average density is only about 70% of water\'s.' },
  { label: 'Did You Know?', text: 'A teaspoon of neutron star material would weigh billions of tons.' },
  { label: 'Did You Know?', text: 'Astronauts on the International Space Station can see about 16 sunrises every day, because they orbit Earth every 90 minutes.' },
  { label: 'Did You Know?', text: 'Voyager 1, launched in 1977, is the most distant human-made object and is now in interstellar space.' },
  { label: 'Did You Know?', text: 'The light you see from the Andromeda Galaxy left it about 2.5 million years ago.' },
  { label: 'Did You Know?', text: 'The footprints left on the Moon could last for millions of years, because there is no wind or water to erase them.' },
  { label: 'Did You Know?', text: 'Jupiter\'s Great Red Spot is a giant storm wider than the entire Earth.' },
  { label: 'Did You Know?', text: 'NASA has shared an Astronomy Picture of the Day since June 16, 1995.' },
  { label: 'NASA Milestone', text: '1958: NASA officially opened for business on October 1.' },
  { label: 'NASA Milestone', text: '1969: Apollo 11 landed the first humans on the Moon on July 20.' },
  { label: 'NASA Milestone', text: '1990: The Hubble Space Telescope launched on April 24.' },
  { label: 'NASA Milestone', text: '2021: NASA\'s Ingenuity helicopter made the first powered flight on another planet, on Mars.' },
  { label: 'NASA Milestone', text: '2021: The James Webb Space Telescope launched on December 25.' },
  { label: 'NASA Milestone', text: '2022: Artemis I flew an uncrewed Orion spacecraft around the Moon and back.' },
  { label: 'By the Numbers', text: '13.8 billion years: the approximate age of the universe.' },
  { label: 'By the Numbers', text: '4.6 billion years: the approximate age of our Sun.' },
  { label: 'By the Numbers', text: '238,855 miles: the average distance from Earth to the Moon.' },
  { label: 'By the Numbers', text: '93 million miles: the average distance from Earth to the Sun.' },
  { label: 'By the Numbers', text: '17,500 mph: about how fast the International Space Station travels.' },
  { label: 'Look Up Tonight', text: 'Five planets can be seen without a telescope: Mercury, Venus, Mars, Jupiter, and Saturn.' },
  { label: 'Look Up Tonight', text: 'The International Space Station looks like a bright, fast-moving dot. NASA\'s Spot the Station site shows when it passes over you.' },
  { label: 'Look Up Tonight', text: 'From a dark spot away from city lights, you can see the Milky Way with just your eyes.' },
  { label: 'Look Up Tonight', text: 'The Andromeda Galaxy is the farthest thing most people can see without a telescope.' }
];

// How long each item stays on screen, and how long its fade takes (match style.css)
const FACT_DISPLAY_MS = 7000;
const FACT_FADE_MS = 400;

// Find the elements we need on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
const dateForm = document.getElementById('dateForm');
const getImagesButton = document.getElementById('getImagesButton');
const gallery = document.getElementById('gallery');
const spaceFact = document.getElementById('spaceFact');
const factHeading = document.getElementById('factHeading');
const factText = document.getElementById('factText');
const factPause = document.getElementById('factPause');
const modal = document.getElementById('modal');
const modalClose = document.getElementById('modalClose');
const modalMedia = document.getElementById('modalMedia');
const modalDate = document.getElementById('modalDate');
const modalTitle = document.getElementById('modalTitle');
const modalCredit = document.getElementById('modalCredit');
const modalExplanation = document.getElementById('modalExplanation');
const modalLink = document.getElementById('modalLink');

// Holds the entries currently in the gallery, so a click can find its entry
let currentEntries = [];

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);

// Mix up a list so the items come in a random order
function shuffle(list) {
  const mixed = [...list];
  for (let i = mixed.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [mixed[i], mixed[j]] = [mixed[j], mixed[i]];
  }
  return mixed;
}

// Put the items in a random order, with a "Did You Know?" fact first
const factOrder = shuffle(spaceFacts);
const firstFact = factOrder.findIndex((fact) => fact.label === 'Did You Know?');
[factOrder[0], factOrder[firstFact]] = [factOrder[firstFact], factOrder[0]];

let factIndex = 0;
let isFactPaused = false;
let isFactHovered = false;

// Put an item in the fact box
function showFact(fact) {
  factHeading.textContent = fact.label;
  factText.textContent = fact.text;
}

// Fade out the current item, swap in the next one, and fade back in
function showNextFact() {
  if (isFactPaused || isFactHovered) {
    return;
  }
  spaceFact.classList.add('fading');
  setTimeout(() => {
    factIndex = (factIndex + 1) % factOrder.length;
    showFact(factOrder[factIndex]);
    spaceFact.classList.remove('fading');
  }, FACT_FADE_MS);
}

// Update the pause button to match the current state
function setFactPaused(paused) {
  isFactPaused = paused;
  factPause.textContent = paused ? '▶ Play' : '❚❚ Pause';
  factPause.setAttribute('aria-label', paused ? 'Play rotating facts' : 'Pause rotating facts');
}

showFact(factOrder[0]);

// Start paused for people who've asked their device to reduce motion
setFactPaused(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
setInterval(showNextFact, FACT_DISPLAY_MS);

factPause.addEventListener('click', () => {
  setFactPaused(!isFactPaused);
});

// Hold the current item while someone is reading it with the mouse over it.
// We only check for a real mouse, because a tap on a phone can count as hovering
// and would stop the rotation until the person tapped somewhere else.
spaceFact.addEventListener('pointerenter', (event) => {
  isFactHovered = event.pointerType === 'mouse';
});
spaceFact.addEventListener('pointerleave', () => {
  isFactHovered = false;
});

// Make text from the API safe to put inside a template literal of HTML
function escapeHtml(text) {
  const element = document.createElement('div');
  element.textContent = text;
  return element.innerHTML.replaceAll('"', '&quot;');
}

// Show a message (loading, error, or no results) in place of the gallery
function showMessage(icon, message) {
  gallery.innerHTML = `
    <div class="placeholder" role="status">
      <div class="placeholder-icon">${icon}</div>
      <p>${message}</p>
    </div>
  `;
}

// Turn "2026-11-02" into "November 2, 2026"
function formatDate(dateString) {
  // Adding T00:00:00 keeps the date from shifting because of time zones
  const date = new Date(`${dateString}T00:00:00`);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

// Get the date one day before a YYYY-MM-DD date
function getPreviousDay(dateString) {
  const date = new Date(`${dateString}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().split('T')[0];
}

// Build the link to an entry's page on NASA's APOD site, like .../ap261102.html
function getApodPageUrl(dateString) {
  const shortDate = dateString.slice(2).replaceAll('-', '');
  return `https://apod.nasa.gov/apod/ap${shortDate}.html`;
}

// Some older entries have links starting with // instead of https://
function fixUrl(url) {
  return url && url.startsWith('//') ? `https:${url}` : url;
}

// Find the video ID in a YouTube link (returns null if it's not a YouTube link)
function getYouTubeId(url) {
  const match = url && url.match(/(?:youtube(?:-nocookie)?\.com\/(?:embed\/|watch\?v=)|youtu\.be\/)([\w-]+)/);
  return match ? match[1] : null;
}

// Choose the picture to show on a gallery card
function getThumbnailUrl(entry) {
  if (entry.media_type === 'image') {
    return fixUrl(entry.url);
  }
  if (entry.thumbnail_url) {
    return fixUrl(entry.thumbnail_url);
  }
  const youTubeId = getYouTubeId(entry.url);
  return youTubeId ? `https://img.youtube.com/vi/${youTubeId}/hqdefault.jpg` : null;
}

// Ask NASA for the entries between two dates
async function fetchEntries(startDate, endDate) {
  const url = `${API_URL}?api_key=${API_KEY}&start_date=${startDate}&end_date=${endDate}&thumbs=true`;
  const response = await fetch(url, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });

  // Today's date can be ahead of NASA's: it's based on UTC, and the newest photo may
  // not be posted yet. NASA rejects that end date, so try again one day earlier.
  if ((response.status === 400 || response.status === 404) && endDate === today && startDate < endDate) {
    return fetchEntries(startDate, getPreviousDay(endDate));
  }

  if (!response.ok) {
    throw new Error(`NASA API error ${response.status}`, { cause: response.status });
  }

  return response.json();
}

// Sometimes NASA's API answers with its website logo in place of every photo
function isPlaceholderData(entries) {
  return entries.every((entry) => entry.url && entry.url.includes('nasa-logo'));
}

// Get the sample entries from the backup file
async function fetchBackupEntries() {
  const response = await fetch(BACKUP_URL, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
  if (!response.ok) {
    throw new Error(`Backup data error ${response.status}`);
  }
  return response.json();
}

// Try NASA's API first, and use the backup if it's down, over its limit, or sending placeholders
async function getEntries(startDate, endDate) {
  try {
    const entries = await fetchEntries(startDate, endDate);
    if (!isPlaceholderData(entries)) {
      return { entries, usedBackup: false };
    }
  } catch (error) {
    // A 400 or 404 means NASA has nothing for those dates, so the user should pick new ones
    if (error.cause === 400 || error.cause === 404) {
      throw error;
    }
    console.error(error);
  }

  const entries = await fetchBackupEntries();
  return { entries, usedBackup: true };
}

// Pick a helpful message for whatever went wrong
function getErrorMessage(error) {
  if (error.cause === 400 || error.cause === 404) {
    return 'NASA couldn\'t find images for those dates. Please try a different range.';
  }
  return 'We couldn\'t reach NASA. Please check your connection and try again in a few minutes.';
}

// Build the HTML for one gallery card
function createCard(entry, index) {
  const thumbnailUrl = getThumbnailUrl(entry);
  const isVideo = entry.media_type !== 'image';
  const badgeText = entry.media_type === 'video' ? '▶ Video' : '↗ Interactive';

  return `
    <button type="button" class="gallery-item" data-index="${index}">
      <span class="media-frame">
        ${thumbnailUrl
          ? `<img src="${escapeHtml(thumbnailUrl)}" alt="${escapeHtml(entry.title)}" loading="lazy" />`
          : '<span class="no-thumbnail" aria-hidden="true">🔭</span>'}
        ${isVideo ? `<span class="video-badge">${badgeText}</span>` : ''}
      </span>
      <span class="item-title">${escapeHtml(entry.title)}</span>
      <span class="date">${formatDate(entry.date)}</span>
    </button>
  `;
}

// Replace whatever is in the gallery with cards for these entries
function renderGallery(entries, usedBackup) {
  // Show the newest entries first
  currentEntries = [...entries].sort((a, b) => b.date.localeCompare(a.date));

  // If these are sample entries, say so, because they won't match the chosen dates
  const notice = usedBackup
    ? '<p class="backup-notice" role="status">NASA\'s live API isn\'t sending photos right now, so these are sample entries and may not match your dates.</p>'
    : '';
  gallery.innerHTML = notice + currentEntries.map(createCard).join('');

  // If a picture fails to load, show the telescope icon instead of a broken image
  gallery.querySelectorAll('img').forEach((image) => {
    image.addEventListener('error', () => {
      image.outerHTML = '<span class="no-thumbnail" aria-hidden="true">🔭</span>';
    });
  });
}

// Get the entries and show them in the gallery
async function loadGallery() {
  const startDate = startInput.value;
  const endDate = endInput.value;

  if (startDate > endDate) {
    showMessage('📅', 'The start date needs to be before the end date.');
    return;
  }

  // Show the loading message, and stop extra clicks while we wait
  showMessage('🔄', 'Loading space photos…');
  getImagesButton.disabled = true;

  try {
    const { entries, usedBackup } = await getEntries(startDate, endDate);
    if (entries.length === 0) {
      showMessage('🌌', 'No entries found for those dates. Please try a different range.');
    } else {
      renderGallery(entries, usedBackup);
    }
  } catch (error) {
    console.error(error);
    showMessage('🛰️', getErrorMessage(error));
  } finally {
    getImagesButton.disabled = false;
  }
}

// Build the modal's main content: an image, an embedded video, or a telescope icon
function createModalMedia(entry) {
  const url = fixUrl(entry.url);

  if (entry.media_type === 'image') {
    return `<img src="${escapeHtml(url)}" alt="${escapeHtml(entry.title)}" />`;
  }

  // YouTube and Vimeo links from the API are ready to embed
  if (entry.media_type === 'video' && url && /youtube|youtu\.be|vimeo/.test(url)) {
    return `
      <iframe
        src="${escapeHtml(url)}"
        title="${escapeHtml(entry.title)}"
        allow="fullscreen; picture-in-picture"
        referrerpolicy="strict-origin-when-cross-origin"
      ></iframe>
    `;
  }

  // Video files that NASA hosts itself
  if (entry.media_type === 'video' && url && /\.(mp4|webm)$/i.test(url)) {
    return `<video src="${escapeHtml(url)}" controls></video>`;
  }

  return '<span class="no-thumbnail" aria-hidden="true">🔭</span>';
}

// Build the link under the explanation, so people can always reach the original
function createModalLink(entry) {
  const url = fixUrl(entry.url);
  const youTubeId = getYouTubeId(url);

  if (entry.media_type === 'image') {
    const fullSizeUrl = fixUrl(entry.hdurl) || url;
    return `<a href="${escapeHtml(fullSizeUrl)}" target="_blank" rel="noopener">View full resolution image ↗</a>`;
  }
  if (youTubeId) {
    return `<a href="https://www.youtube.com/watch?v=${youTubeId}" target="_blank" rel="noopener">▶ Watch on YouTube ↗</a>`;
  }
  if (entry.media_type === 'video' && url) {
    return `<a href="${escapeHtml(url)}" target="_blank" rel="noopener">▶ Watch the video ↗</a>`;
  }
  return `<a href="${getApodPageUrl(entry.date)}" target="_blank" rel="noopener">View this entry on NASA's APOD site ↗</a>`;
}

// Fill the modal with one entry and open it
function openModal(entry) {
  modalMedia.innerHTML = createModalMedia(entry);
  modalDate.textContent = formatDate(entry.date);
  modalTitle.textContent = entry.title;
  modalCredit.textContent = entry.copyright ? `Credit: ${entry.copyright.trim()}` : '';
  modalExplanation.textContent = entry.explanation;
  modalLink.innerHTML = createModalLink(entry);
  modal.showModal();
  modal.scrollTop = 0;
}

// Load the gallery when the form is submitted
dateForm.addEventListener('submit', (event) => {
  event.preventDefault();
  loadGallery();
});

// Open the modal when a card is clicked. We listen on the gallery itself
// because the cards are replaced every time new dates are loaded.
gallery.addEventListener('click', (event) => {
  const card = event.target.closest('.gallery-item');
  if (card) {
    openModal(currentEntries[Number(card.dataset.index)]);
  }
});

// Close the modal with the X button
modalClose.addEventListener('click', () => {
  modal.close();
});

// Close the modal by clicking the dark area around it
modal.addEventListener('click', (event) => {
  if (event.target === modal) {
    modal.close();
  }
});

// Clear the modal when it closes, so a video stops playing
modal.addEventListener('close', () => {
  // Skip this if another card was opened in the meantime
  if (!modal.open) {
    modalMedia.innerHTML = '';
  }
});

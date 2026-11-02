// Your NASA API key. DEMO_KEY works for testing but has strict limits,
// so replace it with your own free key from https://api.nasa.gov
const API_KEY = 'DEMO_KEY';
const API_URL = 'https://api.nasa.gov/planetary/apod';

// Sample APOD entries saved with this app. We use them if NASA's API is having problems.
const BACKUP_URL = 'data/backup-entries.json';

// Give up on a request if there's no answer after 20 seconds
const REQUEST_TIMEOUT_MS = 20000;

// Facts for the "Did You Know?" section. One is picked at random on each page load.
const spaceFacts = [
  'A day on Venus is longer than its year: it takes about 243 Earth days to spin once, but only 225 to orbit the Sun.',
  'Sunlight takes about 8 minutes and 20 seconds to reach Earth.',
  'Olympus Mons on Mars is the tallest volcano in the solar system, about 2.5 times the height of Mount Everest.',
  'Saturn is less dense than water. Its average density is only about 70% of water\'s.',
  'A teaspoon of neutron star material would weigh billions of tons.',
  'Astronauts on the International Space Station can see about 16 sunrises every day, because they orbit Earth every 90 minutes.',
  'Voyager 1, launched in 1977, is the most distant human-made object and is now in interstellar space.',
  'The light you see from the Andromeda Galaxy left it about 2.5 million years ago.',
  'The footprints left on the Moon could last for millions of years, because there is no wind or water to erase them.',
  'Jupiter\'s Great Red Spot is a giant storm wider than the entire Earth.',
  'NASA has shared an Astronomy Picture of the Day since June 16, 1995.'
];

// Find the elements we need on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
const dateForm = document.getElementById('dateForm');
const getImagesButton = document.getElementById('getImagesButton');
const gallery = document.getElementById('gallery');
const factText = document.getElementById('factText');
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

// Show a random space fact
factText.textContent = spaceFacts[Math.floor(Math.random() * spaceFacts.length)];

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

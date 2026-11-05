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

// ----- Animated space background -----

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// --- The nebula ---
// This is a small program (a "shader") that runs on the graphics card and works out
// the color of every pixel. It layers random noise to make wispy, flowing shapes:
// cyan threads along a wavy band, crimson clouds under it, and dark red haze above.
const NEBULA_SHADER = `
  #ifdef GL_FRAGMENT_PRECISION_HIGH
  precision highp float;
  #else
  precision mediump float;
  #endif

  uniform vec2 uResolution;
  uniform float uTime;

  // A random number for each point on a grid
  float random(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  // Smooth random values between the grid points
  float noise(vec2 p) {
    vec2 cell = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(random(cell), random(cell + vec2(1.0, 0.0)), f.x),
      mix(random(cell + vec2(0.0, 1.0)), random(cell + vec2(1.0, 1.0)), f.x),
      f.y
    );
  }

  const mat2 TURN = mat2(0.8, 0.6, -0.6, 0.8);

  // Soft clouds: noise stacked at finer and finer sizes
  float clouds(vec2 p) {
    float value = 0.0;
    float strength = 0.5;
    for (int i = 0; i < 4; i++) {
      value += strength * noise(p);
      p = TURN * p * 2.02;
      strength *= 0.5;
    }
    return value;
  }

  // Thin threads: the same idea, but keeping only the ridges of the noise
  float threads(vec2 p) {
    float value = 0.0;
    float strength = 0.5;
    for (int i = 0; i < 4; i++) {
      value += strength * (1.0 - abs(2.0 * noise(p) - 1.0));
      p = TURN * p * 2.1;
      strength *= 0.5;
    }
    return value;
  }

  void main() {
    vec2 screen = gl_FragCoord.xy / uResolution;
    vec2 p = screen * vec2(uResolution.x / uResolution.y, 1.0) * 1.6;
    float t = uTime * 0.025;

    // Bend the space with clouds so the shapes look like flowing gas
    vec2 q = vec2(clouds(p * 1.2 + vec2(0.0, t)), clouds(p * 1.2 + vec2(5.2, 1.3 - t)));
    vec2 r = vec2(
      clouds(p * 1.8 + 3.0 * q + vec2(1.7 + t * 0.7, 9.2)),
      clouds(p * 1.8 + 3.0 * q + vec2(8.3, 2.8 - t * 0.5))
    );

    // How far each pixel is above (+) or below (-) the wavy band across the screen
    float bandCenter = 0.62 - 0.20 * screen.x + 0.05 * sin(screen.x * 4.0 + t * 2.0) + (q.x - 0.5) * 0.16;
    float d = screen.y - bandCenter;

    // The bright cyan ribbon: fine threads over a soft glow, strongest along the band
    float thin = pow(threads(p * 4.0 + r * 3.5), 6.0);
    float hair = pow(threads(p * 11.0 + r * 5.0 + q * 3.0), 5.0);
    float ribbon = exp(-d * d / 0.005);
    float cyan = ribbon * (0.16 + thin * 2.6 + hair * 1.5);

    // The crimson curtain: tangled threads hanging below the band
    float below = (1.0 - smoothstep(-0.04, 0.02, d)) * smoothstep(-0.62, -0.06, d);
    float fine = pow(threads(p * 7.0 + q * 5.0), 4.0);
    float patches = smoothstep(0.28, 0.62, clouds(p * 2.5 + r * 2.5));
    float crimson = below * patches * (0.14 + fine * 2.6 + hair * 1.0);

    // Above the band: dark red haze with a few faint, stray threads
    float above = smoothstep(0.0, 0.08, d);
    float haze = above * (1.0 - smoothstep(0.1, 0.7, d)) * q.y;
    float strays = above * pow(threads(p * 2.5 + r * 4.0 + 7.0), 9.0);

    vec3 color = vec3(0.012, 0.01, 0.028);
    color += vec3(0.26, 0.015, 0.06) * haze;
    color += vec3(0.75, 0.10, 0.32) * strays * 2.0;
    color += vec3(0.10, 0.45, 0.75) * strays * thin * 2.0;
    color += vec3(0.95, 0.06, 0.24) * crimson;
    color += vec3(0.08, 0.72, 0.95) * cyan;
    color += vec3(0.7, 0.95, 1.0) * cyan * cyan * 0.22;

    // Where the ribbon meets the curtain, the colors mix into a pink glow
    color += vec3(0.85, 0.30, 0.55) * ribbon * below * (thin + fine) * 0.8;

    gl_FragColor = vec4(color, 1.0);
  }
`;

// The graphics card also needs this tiny program, which just covers the screen with a rectangle
const COVER_SCREEN_SHADER = `
  attribute vec2 position;
  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const NEBULA_FRAME_MS = 33; // Redraw the slow-moving nebula about 30 times a second
const SLOW_FRAME_MS = 50;
const SLOW_FRAME_LIMIT = 40;

const nebulaCanvas = document.getElementById('nebulaCanvas');
let nebula = null;

// Draw the nebula at lower resolution than the screen, since this is the demanding part
let nebulaScale = 0.85;
let lastNebulaTime = -NEBULA_FRAME_MS;
let slowFrames = 0;

// Set up the graphics card. Returns null on browsers that can't do this,
// which leaves the plain .nebula background showing instead.
function setupNebula() {
  const gl = nebulaCanvas.getContext('webgl', { alpha: false, antialias: false });
  if (!gl) {
    nebulaCanvas.hidden = true;
    return null;
  }

  const program = gl.createProgram();
  [[gl.VERTEX_SHADER, COVER_SCREEN_SHADER], [gl.FRAGMENT_SHADER, NEBULA_SHADER]].forEach(([type, source]) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    gl.attachShader(program, shader);
  });
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program));
    nebulaCanvas.hidden = true;
    return null;
  }
  gl.useProgram(program);

  // Two triangles that together cover the whole canvas
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  return {
    gl,
    resolution: gl.getUniformLocation(program, 'uResolution'),
    time: gl.getUniformLocation(program, 'uTime')
  };
}

// Match the nebula canvas to the window size
function sizeNebula() {
  if (nebula) {
    nebulaCanvas.width = Math.round(window.innerWidth * nebulaScale);
    nebulaCanvas.height = Math.round(window.innerHeight * nebulaScale);
    nebula.gl.viewport(0, 0, nebulaCanvas.width, nebulaCanvas.height);
    nebula.gl.uniform2f(nebula.resolution, nebulaCanvas.width, nebulaCanvas.height);
  }
}

function drawNebula(time) {
  if (nebula) {
    nebula.gl.uniform1f(nebula.time, time / 1000);
    nebula.gl.drawArrays(nebula.gl.TRIANGLES, 0, 6);
  }
}

// --- The stars ---

const starCanvas = document.getElementById('starfield');
const starContext = starCanvas.getContext('2d');

// Three layers of stars. Bigger stars look closer, so they move faster.
const STAR_LAYERS = [
  { share: 0.72, size: 0.6, speed: 1.5 },
  { share: 0.23, size: 1, speed: 3.5 },
  { share: 0.05, size: 1.6, speed: 6 }
];
const STAR_COLORS = ['255, 255, 255', '255, 255, 255', '170, 200, 255', '255, 214, 170', '255, 170, 190'];
const FLARE_COLORS = ['255, 225, 170', '120, 175, 255', '120, 175, 255', '255, 190, 130'];

let stars = [];
let flareStars = [];
let starWidth = 0;
let starHeight = 0;
let shootingStar = null;
let nextShootingStarTime = 3000;
let lastFrameTime = 0;

// Pick a random number between two values
function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

// Pick a random item from a list
function randomItem(list) {
  return list[Math.floor(Math.random() * list.length)];
}

// Size the canvas to the window and scatter the stars across it
function setupStars() {
  starWidth = window.innerWidth;
  starHeight = window.innerHeight;

  // Sharper stars on high-resolution screens
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  starCanvas.width = starWidth * pixelRatio;
  starCanvas.height = starHeight * pixelRatio;
  starCanvas.style.width = `${starWidth}px`;
  starCanvas.style.height = `${starHeight}px`;
  starContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

  // Bigger windows get more stars, up to a limit
  const starCount = Math.min(1100, Math.round((starWidth * starHeight) / 1100));
  stars = [];
  STAR_LAYERS.forEach((layer) => {
    for (let i = 0; i < starCount * layer.share; i++) {
      stars.push({
        x: Math.random() * starWidth,
        y: Math.random() * starHeight,
        size: layer.size * randomBetween(0.8, 1.3),
        speed: layer.speed,
        color: randomItem(STAR_COLORS),
        twinkleSpeed: randomBetween(0.0005, 0.002),
        twinkleOffset: Math.random() * Math.PI * 2
      });
    }
  });

  // A few big, bright stars with glowing crosses of light
  const flareCount = Math.max(3, Math.min(9, Math.round(starWidth / 180)));
  flareStars = [];
  for (let i = 0; i < flareCount; i++) {
    flareStars.push({
      x: Math.random() * starWidth,
      y: Math.random() * starHeight,
      // The first one is the big star of the scene
      size: i === 0 ? 46 : randomBetween(12, 24),
      color: randomItem(FLARE_COLORS),
      speed: 1,
      twinkleSpeed: randomBetween(0.0006, 0.0014),
      twinkleOffset: Math.random() * Math.PI * 2
    });
  }
}

// Draw every small star, gently changing its brightness over time so it twinkles
function drawStars(time) {
  stars.forEach((star) => {
    const brightness = 0.7 + 0.3 * Math.sin(time * star.twinkleSpeed + star.twinkleOffset);
    starContext.fillStyle = `rgba(${star.color}, ${brightness})`;
    starContext.beginPath();
    starContext.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    starContext.fill();
  });
}

// Draw one thin beam of light from a flare star, fading out toward its tip
function drawFlareBeam(star, endX, endY, brightness) {
  const beam = starContext.createLinearGradient(star.x, star.y, endX, endY);
  beam.addColorStop(0, `rgba(${star.color}, ${brightness})`);
  beam.addColorStop(1, `rgba(${star.color}, 0)`);
  starContext.strokeStyle = beam;
  starContext.beginPath();
  starContext.moveTo(star.x, star.y);
  starContext.lineTo(endX, endY);
  starContext.stroke();
}

// Draw the big stars: a soft glow, a bright center, and a slowly pulsing cross of light
function drawFlareStars(time) {
  starContext.lineWidth = 1;
  flareStars.forEach((star) => {
    const pulse = 0.8 + 0.2 * Math.sin(time * star.twinkleSpeed + star.twinkleOffset);
    const length = star.size * 1.6 * pulse;

    const glow = starContext.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.size * 0.7);
    glow.addColorStop(0, `rgba(255, 255, 255, ${pulse})`);
    glow.addColorStop(0.12, `rgba(255, 255, 255, ${0.9 * pulse})`);
    glow.addColorStop(0.3, `rgba(${star.color}, ${0.5 * pulse})`);
    glow.addColorStop(1, `rgba(${star.color}, 0)`);
    starContext.fillStyle = glow;
    starContext.beginPath();
    starContext.arc(star.x, star.y, star.size * 0.7, 0, Math.PI * 2);
    starContext.fill();

    drawFlareBeam(star, star.x + length, star.y - length * 0.25, pulse);
    drawFlareBeam(star, star.x - length, star.y + length * 0.25, pulse);
    drawFlareBeam(star, star.x + length * 0.25, star.y + length, pulse);
    drawFlareBeam(star, star.x - length * 0.25, star.y - length, pulse);
  });
}

// Move the stars slowly down the screen, wrapping back to the top at the bottom
function moveStars(list, seconds) {
  list.forEach((star) => {
    star.y += star.speed * seconds;
    if (star.y > starHeight) {
      star.y = 0;
      star.x = Math.random() * starWidth;
    }
  });
}

// Start a shooting star near the top of the screen, heading down and to one side
function launchShootingStar() {
  const direction = Math.random() < 0.5 ? 1 : -1;
  const speed = randomBetween(600, 900);
  shootingStar = {
    x: randomBetween(starWidth * 0.1, starWidth * 0.9),
    y: randomBetween(0, starHeight * 0.4),
    speedX: direction * speed * 0.85,
    speedY: speed * 0.5,
    age: 0,
    lifetime: randomBetween(0.6, 1.1)
  };
}

// Move and draw the shooting star, with a tail that fades out behind it
function drawShootingStar(seconds) {
  shootingStar.x += shootingStar.speedX * seconds;
  shootingStar.y += shootingStar.speedY * seconds;
  shootingStar.age += seconds;

  if (shootingStar.age >= shootingStar.lifetime) {
    shootingStar = null;
    return;
  }

  const fade = 1 - shootingStar.age / shootingStar.lifetime;
  const tailX = shootingStar.x - shootingStar.speedX * 0.18;
  const tailY = shootingStar.y - shootingStar.speedY * 0.18;
  const tail = starContext.createLinearGradient(shootingStar.x, shootingStar.y, tailX, tailY);
  tail.addColorStop(0, `rgba(255, 255, 255, ${fade})`);
  tail.addColorStop(1, 'rgba(255, 255, 255, 0)');

  starContext.strokeStyle = tail;
  starContext.lineWidth = 2;
  starContext.beginPath();
  starContext.moveTo(shootingStar.x, shootingStar.y);
  starContext.lineTo(tailX, tailY);
  starContext.stroke();
}

// --- Running the animation ---

// If this device is struggling, draw the nebula at a lower resolution to keep things smooth
function checkSpeed(frameTime) {
  if (frameTime > SLOW_FRAME_MS && frameTime < 1000) {
    slowFrames++;
  }
  if (slowFrames > SLOW_FRAME_LIMIT && nebulaScale > 0.4) {
    nebulaScale = 0.4;
    sizeNebula();
  }
}

// Draw one frame of the animation, then ask the browser for the next one
function animateBackground(time) {
  checkSpeed(time - lastFrameTime);

  // Limit the time step so nothing jumps after switching back from another tab
  const seconds = Math.min((time - lastFrameTime) / 1000, 0.1);
  lastFrameTime = time;

  if (time - lastNebulaTime >= NEBULA_FRAME_MS) {
    drawNebula(time);
    lastNebulaTime = time;
  }

  starContext.clearRect(0, 0, starWidth, starHeight);
  moveStars(stars, seconds);
  moveStars(flareStars, seconds);
  drawStars(time);
  drawFlareStars(time);

  if (!shootingStar && time > nextShootingStarTime) {
    launchShootingStar();
    nextShootingStarTime = time + randomBetween(5000, 14000);
  }
  if (shootingStar) {
    drawShootingStar(seconds);
  }

  requestAnimationFrame(animateBackground);
}

// Draw a single still picture, for people who've asked their device to reduce motion
function drawStillBackground() {
  drawNebula(0);
  drawStars(0);
  drawFlareStars(0);
}

nebula = setupNebula();
sizeNebula();
setupStars();

if (prefersReducedMotion) {
  drawStillBackground();
} else {
  requestAnimationFrame(animateBackground);
}

// Redo the background if the window gets wider or taller. Phones change height a little
// while scrolling, as the address bar hides, and that shouldn't reshuffle the stars.
window.addEventListener('resize', () => {
  if (window.innerWidth !== starWidth || window.innerHeight > starHeight) {
    sizeNebula();
    setupStars();
    if (prefersReducedMotion) {
      drawStillBackground();
    }
  }
});

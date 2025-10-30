import './style.css';
import { Capacitor } from '@capacitor/core';
import { CapacitorShareTarget } from '@capgo/capacitor-share-target';

const statusDiv = document.getElementById('plugin-status');
const sharedContentDiv = document.getElementById('shared-content');
const shareHistoryDiv = document.getElementById('share-history');
const clearButton = document.getElementById('clear-history');

let shareHistory = [];

// Initialize plugin
async function initializePlugin() {
  try {
    if (!Capacitor.isNativePlatform()) {
      statusDiv.textContent = 'Web platform detected. This plugin requires a native platform (Android/iOS) to work.';
      statusDiv.className = 'error';
      return;
    }

    // Get plugin version
    const { version } = await CapacitorShareTarget.getPluginVersion();
    statusDiv.textContent = `Plugin loaded successfully. Version: ${version}`;
    statusDiv.className = 'success';

    // Add listener for shared content
    await CapacitorShareTarget.addListener('shareReceived', handleShareReceived);
    console.log('Share listener registered');
  } catch (error) {
    statusDiv.textContent = `Error initializing plugin: ${error.message}`;
    statusDiv.className = 'error';
    console.error('Plugin initialization error:', error);
  }
}

function handleShareReceived(event) {
  console.log('Share received:', event);

  // Add to history
  shareHistory.unshift({
    timestamp: new Date(),
    data: event
  });

  // Update UI
  displaySharedContent(event);
  updateHistoryDisplay();
}

function displaySharedContent(event) {
  sharedContentDiv.classList.remove('empty');

  const itemDiv = document.createElement('div');
  itemDiv.className = 'shared-item';

  // Title
  if (event.title) {
    const titleElement = document.createElement('h3');
    titleElement.textContent = event.title;
    itemDiv.appendChild(titleElement);
  }

  // Texts
  if (event.texts && event.texts.length > 0) {
    const textsDiv = document.createElement('div');
    textsDiv.className = 'texts';

    const label = document.createElement('div');
    label.className = 'label';
    label.textContent = 'Shared Text:';
    textsDiv.appendChild(label);

    event.texts.forEach(text => {
      const textItem = document.createElement('div');
      textItem.className = 'text-item';
      textItem.textContent = text;
      textsDiv.appendChild(textItem);
    });

    itemDiv.appendChild(textsDiv);
  }

  // Files
  if (event.files && event.files.length > 0) {
    const filesDiv = document.createElement('div');
    filesDiv.className = 'files';

    const label = document.createElement('div');
    label.className = 'label';
    label.textContent = `Shared Files (${event.files.length}):`;
    filesDiv.appendChild(label);

    event.files.forEach(file => {
      const fileItem = document.createElement('div');
      fileItem.className = 'file-item';

      const fileName = document.createElement('div');
      fileName.innerHTML = `<span class="label">Name:</span> <span class="value">${file.name}</span>`;

      const fileType = document.createElement('div');
      fileType.innerHTML = `<span class="label">Type:</span> <span class="value">${file.mimeType}</span>`;

      const fileUri = document.createElement('div');
      fileUri.innerHTML = `<span class="label">URI:</span> <span class="value">${file.uri}</span>`;

      fileItem.appendChild(fileName);
      fileItem.appendChild(fileType);
      fileItem.appendChild(fileUri);

      filesDiv.appendChild(fileItem);
    });

    itemDiv.appendChild(filesDiv);
  }

  sharedContentDiv.innerHTML = '';
  sharedContentDiv.appendChild(itemDiv);
}

function updateHistoryDisplay() {
  if (shareHistory.length === 0) {
    shareHistoryDiv.classList.add('empty');
    shareHistoryDiv.innerHTML = 'No share history yet.';
    return;
  }

  shareHistoryDiv.classList.remove('empty');
  shareHistoryDiv.innerHTML = '';

  shareHistory.forEach((entry, index) => {
    const historyItem = document.createElement('div');
    historyItem.className = 'history-item';

    const timestamp = document.createElement('div');
    timestamp.className = 'timestamp';
    timestamp.textContent = entry.timestamp.toLocaleString();

    const summary = document.createElement('div');
    const textCount = entry.data.texts?.length || 0;
    const fileCount = entry.data.files?.length || 0;
    summary.textContent = `${entry.data.title || 'No title'} - ${textCount} text(s), ${fileCount} file(s)`;

    historyItem.appendChild(timestamp);
    historyItem.appendChild(summary);
    shareHistoryDiv.appendChild(historyItem);
  });
}

function clearHistory() {
  shareHistory = [];
  sharedContentDiv.classList.add('empty');
  sharedContentDiv.innerHTML = 'No content has been shared yet. Share something from another app to see it appear here.';
  updateHistoryDisplay();
}

// Event listeners
clearButton.addEventListener('click', clearHistory);

// Initialize on load
initializePlugin();

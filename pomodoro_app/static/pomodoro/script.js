// D:\artimes-hyperion\pomodoro_app\static\pomodoro\script.js

// Console logs are for debugging your implementation.
// You can remove or reduce these once everything is working smoothly.
console.log("Pomodoro script.js started loading.");

// Load YouTube IFrame Player API script dynamically
function loadYouTubeAPI() {
    console.log("Loading YouTube IFrame Player API.");
    if (document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
        console.log("YouTube IFrame Player API script already exists.");
        return;
    }
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    console.log("YouTube IFrame Player API script tag added.");
}

// This function is called by the YouTube API when it's ready
let player; // Global YouTube player variable
function onYouTubeIframeAPIReady() {
    console.log("YouTube IFrame Player API is ready.");
}

// This function is called if the API fails to load (optional handler)
function onYouTubeIframeAPIFailedToLoad(event) {
    console.error("YouTube IFrame Player API failed to load.", event);
    const musicModeSection = document.getElementById('musicModeSection');
    if (musicModeSection) {
        musicModeSection.innerHTML = '<p class="text-danger small">Error loading Music feature. YouTube API failed to load.</p>';
        console.warn("Music mode section content replaced due to API load failure.");
    } else console.warn("Music mode section element (#musicModeSection) not found to display API load error.");
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOMContentLoaded event fired. Pomodoro script running.");

    // --- DOM Elements ---
    const pomodoroSidebar = document.getElementById('pomodoroSidebar');
    const openSidebarBtn = document.getElementById('openPomodoroSidebarBtn');
    const closeSidebarBtn = document.getElementById('closeSidebarBtn');

    console.log("Sidebar element found:", !!pomodoroSidebar);
    console.log("Open button element found:", !!openSidebarBtn);
    console.log("Close button element found:", !!closeSidebarBtn);

    const displayTime = document.getElementById('displayTime');
    const startPauseBtn = document.getElementById('startPauseBtn');
    const resetTimerBtn = document.getElementById('resetTimerBtn');
    const focusRegainToggle = document.getElementById('focusRegainToggle');

    console.log("Timer display found:", !!displayTime);
    console.log("Start/Pause button found:", !!startPauseBtn);
    console.log("Reset button found:", !!resetTimerBtn);
    console.log("Focus Regain toggle found:", !!focusRegainToggle);

    // Bootstrap Modal elements
    const focusRegainModalElement = document.getElementById('focusRegainModal');
    const confirmationModalElement = document.getElementById('confirmationModal');

    console.log("Focus Regain Modal element found:", !!focusRegainModalElement);
    console.log("Confirmation Modal element found:", !!confirmationModalElement);

    const focusRegainModalBody = document.getElementById('focusRegainModalBody');

    let focusRegainModal = null;
    let confirmationModal = null;

    // Initialize Bootstrap Modals
    if (typeof bootstrap !== 'undefined' && typeof bootstrap.Modal !== 'undefined') {
        if (focusRegainModalElement) {
            try {
                focusRegainModal = new bootstrap.Modal(focusRegainModalElement);
                console.log("Focus Regain Modal instance created successfully.");
                focusRegainModalElement.addEventListener('hidden.bs.modal', () => {
                    console.log("Focus Regain Modal hidden.");
                    if (currentTimerState === 'paused-work' && pausedDuration > 0) {
                        console.log("Modal hidden manually while paused with pending duration. Auto-discarding time.");
                        handleFocusRegainAction('discard');
                    }
                });
            } catch (error) {
                console.error("Error creating Focus Regain Modal instance:", error);
            }
        } else console.warn("Focus Regain Modal element (#focusRegainModalElement) not found. Cannot create instance.");

        if (confirmationModalElement) {
            try {
                confirmationModal = new bootstrap.Modal(confirmationModalElement);
                console.log("Confirmation Modal instance created successfully.");
                confirmationModalElement.addEventListener('hidden.bs.modal', () => {
                    console.log("Confirmation Modal hidden.");
                    pendingConfig = null;
                    console.log("Pending config cleared due to manual modal close.");
                    resetConfirmationModalText();
                });
            } catch (error) {
                console.error("Error creating Confirmation Modal instance:", error);
            }
        } else console.warn("Confirmation Modal element (#confirmationModalElement) not found. Cannot create instance.");
    } else {
        console.warn("Bootstrap or Bootstrap.Modal is not available. Modal instances cannot be created.");
    }

    const pausedDurationDisplay = document.getElementById('pausedDurationDisplay');
    const addPausedTimeBtn = document.getElementById('addPausedTimeBtn');
    const discardPausedTimeBtn = document.getElementById('discardPausedTimeBtn');

    // Confirmation modal buttons
    const confirmProceedBtn = document.getElementById('confirmProceedBtn');
    const confirmCancelBtn = document.getElementById('confirmCancelBtn');

    // Music Mode Elements
    const youtubeLinkInput = document.getElementById('youtubeLinkInput');
    const loadMusicBtn = document.getElementById('loadMusicBtn');
    const youtubePlayerDiv = document.getElementById('youtube-player');
    const musicControls = document.querySelector('.music-controls');
    const playPauseMusicBtn = document.getElementById('playPauseMusicBtn');
    const currentTrackInfo = document.getElementById('currentTrackInfo');
    const trackTitleSpan = document.getElementById('trackTitle');

    console.log("Music mode elements found:", {youtubeLinkInput: !!youtubeLinkInput, loadMusicBtn: !!loadMusicBtn, youtubePlayerDiv: !!youtubePlayerDiv, musicControls: !!musicControls, playPauseMusicBtn: !!playPauseMusicBtn, currentTrackInfo: !!currentTrackInfo, trackTitleSpan: !!trackTitleSpan});

    const defaultConfigsContainer = document.getElementById('defaultConfigs');
    const savedCustomConfigsContainer = document.getElementById('savedCustomConfigs');
    const addCustomConfigBtn = document.getElementById('addCustomConfigBtn');
    const customWorkTimeInput = document.getElementById('customWorkTime');
    const customBreakTimeInput = document.getElementById('customBreakTime');
    const customConfigNameInput = document.getElementById('customConfigName');

    const editConfigForm = document.getElementById('editConfigForm');
    const editingConfigIdInput = document.getElementById('editingConfigId');
    const editWorkTimeInput = document.getElementById('editWorkTime');
    const editBreakTimeInput = document.getElementById('editBreakTime');
    const editConfigNameInput = document.getElementById('editConfigName');
    const saveConfigBtn = document.getElementById('saveConfigBtn');
    const cancelEditBtn = document.getElementById('cancelEditBtn');

    // --- State Variables ---
    let currentTimerState = 'stopped'; // 'stopped', 'running-work', 'paused-work', 'running-break', 'paused-break'
    let currentSessionType = 'work'; // 'work' or 'break'
    let timeRemaining = 25 * 60; // Default to 25 minutes in seconds
    let intervalTimer = null;
    let isFocusRegainEnabled = focusRegainToggle ? focusRegainToggle.checked : false;
    let pausedDuration = 0;
    let focusRegainInterval = null;

    let activeConfig = { work: 25, break: 5 };
    let pendingConfig = null;

    const originalDocumentTitle = document.title;

    // Default configurations with Dante-themed names
    const defaultConfigs = {
        'default-25': { name: 'QuickDraw', work: 25, break: 5, quote: "(Easy Mode)" },
        'default-50': { name: 'Stylish Grind', work: 50, break: 10, quote: "(Hunter Mode)" },
        'default-120': { name: 'Legendary Hunt', work: 120, break: 30, quote: "(Heaven or Hell)" }
    };

    let customConfigs = loadCustomConfigs();

    // Focus Regain Messages (Sarcastic Dante Humor)
    const regainMessages = [
        "Look who's back. Needed a break already?",
        "Thought you could slip away, huh?",
        "Don't tell me you're losing your groove.",
        "You call that focus? Try again.",
        "Still got it? Let's see.",
        "Back in the game?",
        "Didn't think you'd last this long.",
    ];

    function getRandomRegainMessage() {
        return regainMessages[Math.floor(Math.random() * regainMessages.length)];
    }

    // --- Functions ---

    function formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;

        const formattedMinutes = String(minutes).padStart(2, '0');
        const formattedSeconds = String(remainingSeconds).padStart(2, '0');

        if (hours > 0) {
            return `${hours}:${formattedMinutes}:${formattedSeconds}`;
        } else {
            return `${formattedMinutes}:${formattedSeconds}`;
        }
    }

    function updateDisplay() {
        if (displayTime) displayTime.textContent = formatTime(timeRemaining);
        else console.warn("Timer display element (#displayTime) not found in updateDisplay.");
    }

    function startTimer() {
        console.log("startTimer called. Current state:", currentTimerState);

        if (currentTimerState.startsWith('running')) {
            console.log("Timer already running. Doing nothing.");
            return;
        }

        clearInterval(intervalTimer);
        intervalTimer = null;
        console.log("Cleared existing intervalTimer.");

        if (currentSessionType === 'work') {
            currentTimerState = 'running-work';
            if (startPauseBtn) {
                startPauseBtn.textContent = 'Pause';
                startPauseBtn.classList.remove('btn-primary', 'btn-secondary', 'btn-info');
                startPauseBtn.classList.add('btn-warning');
            } else console.warn("Start/Pause button (#startPauseBtn) not found in startTimer (work state).");
        } else {
            currentTimerState = 'running-break';
            if (startPauseBtn) {
                startPauseBtn.textContent = 'Pause Break';
                startPauseBtn.classList.remove('btn-primary', 'btn-secondary', 'btn-warning');
                startPauseBtn.classList.add('btn-info');
            } else console.warn("Start/Pause button (#startPauseBtn) not found in startTimer (break state).");
        }

        intervalTimer = setInterval(() => {
            if (timeRemaining > 0) {
                timeRemaining--;
                updateDisplay();
                document.title = formatTime(timeRemaining) + " | Hyperion";
            } else {
                clearInterval(intervalTimer);
                intervalTimer = null;
                console.log("Interval timer cleared because time ran out.");
                handleSessionEnd();
            }
        }, 1000);

        console.log(`Interval timer started. Current state: ${currentTimerState}. Time remaining: ${timeRemaining}`);
    }

    function pauseTimer() {
        console.log("pauseTimer called. Current state:", currentTimerState);
        if (currentTimerState.startsWith('running')) {
            clearInterval(intervalTimer);
            intervalTimer = null;
            console.log("Cleared main intervalTimer when pausing.");

            document.title = "Paused | " + originalDocumentTitle;

            currentTimerState = currentSessionType === 'work' ? 'paused-work' : 'paused-break';
            if (startPauseBtn) {
                startPauseBtn.textContent = 'Resume';
                startPauseBtn.classList.remove('btn-warning', 'btn-info', 'btn-primary');
                startPauseBtn.classList.add('btn-secondary');
            } else console.warn("Start/Pause button (#startPauseBtn) not found in pauseTimer.");

            if (currentSessionType === 'work' && isFocusRegainEnabled) {
                console.log("Work session paused, focus regain enabled. Starting regain timer and showing modal prompt.");
                startFocusRegainTimer();
                if (focusRegainModalElement && focusRegainModal && focusRegainModalBody) {
                    focusRegainModalBody.innerHTML = `You were paused for <strong id="pausedDurationDisplay">${formatTime(pausedDuration)}</strong>. <br> ${getRandomRegainMessage()} <br> Should I add this time to your current session?`;
                    console.log("Showing Focus Regain modal.");
                    focusRegainModal.show();
                } else {
                    console.warn("Focus Regain Modal elements or instance not found. Cannot show modal.");
                }
            } else {
                console.log("Session paused, but not work, or regain disabled. No regain timer or modal shown.");
            }
        }
    }

    function stopTimer() {
        console.log("stopTimer called.");
        clearInterval(intervalTimer);
        intervalTimer = null;
        clearInterval(focusRegainInterval);
        focusRegainInterval = null;

        currentTimerState = 'stopped';
        currentSessionType = 'work';
        pausedDuration = 0;

        if (startPauseBtn) {
            startPauseBtn.textContent = 'Start';
            startPauseBtn.classList.remove('btn-warning', 'btn-secondary', 'btn-info');
            startPauseBtn.classList.add('btn-primary');
        } else console.warn("Start/Pause button (#startPauseBtn) not found in stopTimer.");

        if (focusRegainModal) focusRegainModal.hide();
        else console.warn("Focus Regain Modal instance not found in stopTimer. Cannot hide.");
        if (confirmationModal) confirmationModal.hide();
        else console.warn("Confirmation Modal instance not found in stopTimer. Cannot hide.");

        timeRemaining = activeConfig.work * 60;
        updateDisplay();

        document.title = originalDocumentTitle;
        console.log("Timer stopped and reset.");
    }

    function resetTimer() {
        console.log("resetTimer called. Current state:", currentTimerState);
        if (currentTimerState !== 'stopped' && confirmationModal) {
            pendingConfig = activeConfig;
            const modalBodyElement = confirmationModalElement.querySelector('.modal-body');
            if (modalBodyElement) modalBodyElement.innerHTML = "Are you sure you want to reset the timer? This will end the current session.";

            const confirmProceedBtn = document.getElementById('confirmProceedBtn');
            if (confirmProceedBtn) confirmProceedBtn.textContent = "Yes, Reset";
            else console.warn("Confirm Proceed button (#confirmProceedBtn) not found for reset modal.");

            const confirmCancelBtn = document.getElementById('confirmCancelBtn');
            if (confirmCancelBtn) confirmCancelBtn.textContent = "No, Cancel";
            else console.warn("Confirm Cancel button (#confirmCancelBtn) not found for reset modal.");

            const localHandleResetConfirm = () => {
                console.log("Reset confirmed via modal (Local Handler).");
                stopTimer();
                console.log("Timer reset by user via modal (Local Handler).");
            };
            const localHandleResetCancel = () => {
                console.log("Reset cancelled via modal (Local Handler).");
                pendingConfig = null;
                console.log("Pending config cleared due to cancellation (Local Handler).");
                resetConfirmationModalText();
            };

            if (confirmProceedBtn) confirmProceedBtn.addEventListener('click', localHandleResetConfirm, { once: true });
            if (confirmCancelBtn) confirmCancelBtn.addEventListener('click', localHandleResetCancel, { once: true });
            if (confirmationModalElement) confirmationModalElement.addEventListener('hidden.bs.modal', localHandleResetCancel, { once: true });

            confirmationModal.show();
        } else if (currentTimerState === 'stopped') {
            stopTimer();
            console.log("Timer already stopped, ensuring reset state.");
        }
    }

    function handleSessionEnd() {
        console.log(`${currentSessionType} session ended.`);

        if (currentSessionType === 'work') {
            console.log("Work session ended. Automatically switching to break.");
            currentSessionType = 'break';
            timeRemaining = activeConfig.break * 60;
        } else {
            console.log("Break session ended. Automatically switching to work.");
            currentSessionType = 'work';
            timeRemaining = activeConfig.work * 60;
        }

        if (startPauseBtn) {
            startPauseBtn.textContent = 'Start';
            startPauseBtn.classList.remove('btn-warning', 'btn-secondary', 'btn-info');
            startPauseBtn.classList.add('btn-primary');
        } else console.warn("Start/Pause button (#startPauseBtn) not found in handleSessionEnd.");
        currentTimerState = 'stopped';

        updateDisplay();

        document.title = originalDocumentTitle;

        console.log(`Waiting 1 second before auto-starting next session (${currentSessionType}).`);
        setTimeout(() => {
            startTimer();
        }, 1000);
    }

    // --- Focus Regain Functions ---

    function startFocusRegainTimer() {
        console.log("startFocusRegainTimer called.");
        clearInterval(focusRegainInterval);
        focusRegainInterval = null;
        pausedDuration = 0;
        console.log("Focus regain timer started...");

        focusRegainInterval = setInterval(() => {
            pausedDuration++;
            const pausedDurationDisplayElement = document.getElementById('pausedDurationDisplay');
            if (pausedDurationDisplayElement) pausedDurationDisplayElement.textContent = formatTime(pausedDuration);
        }, 1000);
    }

    function handleFocusRegainAction(action) {
        console.log(`handleFocusRegainAction called with action: ${action}`);

        clearInterval(focusRegainInterval);
        focusRegainInterval = null;
        console.log("Focus regain timer stopped. Paused duration:", pausedDuration);

        if (action === 'add') {
            timeRemaining += pausedDuration;
            console.log(`Added ${pausedDuration} seconds back. New time remaining: ${timeRemaining}`);
            updateDisplay();
        } else {
            console.log("Discarding paused time.");
        }
        pausedDuration = 0;

        startTimer();
    }

    // --- Sidebar Toggle Functions ---

    function openSidebar() {
        console.log("openSidebar called.");
        if (pomodoroSidebar) {
            pomodoroSidebar.classList.add('visible');
            console.log("Sidebar class 'visible' added.");
        } else {
            console.warn("Pomodoro Sidebar element (#pomodoroSidebar) not found for opening.");
        }
    }

    function closeSidebar() {
        console.log("closeSidebar called.");
        if (pomodoroSidebar) {
            pomodoroSidebar.classList.remove('visible');
            console.log("Sidebar class 'visible' removed.");
        } else {
            console.warn("Pomodoro Sidebar element (#pomodoroSidebar) not found for closing.");
        }
    }

    // --- Configuration Management ---

   // --- Configuration Management ---

   function renderConfigs() {
    console.log("renderConfigs called.");
    if (!defaultConfigsContainer) console.warn("Default Configs container (#defaultConfigs) not found.");
    if (!savedCustomConfigsContainer) {
        console.warn("Saved Custom Configs container (#savedCustomConfigs) not found. Cannot render custom configs.");
        return;
    }

    // Render Default Configs (Matches HTML structure from your sidebar template)
    if (defaultConfigsContainer) {
        defaultConfigsContainer.innerHTML = ''; // Clear existing default configs
        Object.keys(defaultConfigs).forEach(key => {
            const config = defaultConfigs[key];
            // Note: data-config-id is on the list item div as per your provided HTML
            const configElement = `
                <div class="list-group-item list-group-item-dark d-flex justify-content-between align-items-center" data-config-id="${key}">
                    <div>
                        <h6 class="mb-1">${config.name || `Default ${config.work}`}</h6>
                        ${config.quote ? `<p class="mb-0 text-muted small fst-italic">${config.quote}</p>` : ''}
                        <small>${config.work} min work / ${config.break} min break</small>
                    </div>
                    <button class="btn btn-outline-secondary btn-sm edit-config-btn" data-config-id="${key}">Edit</button>
                </div>
            `;
            defaultConfigsContainer.innerHTML += configElement;
        });
    }

    // Render Saved Custom Configs
    savedCustomConfigsContainer.innerHTML = ''; // Clear existing saved custom list

    if (customConfigs.length === 0) {
         // Use generic text if no custom configs saved
         savedCustomConfigsContainer.innerHTML = '<p class="text-muted small">No custom configurations saved yet.</p>';
    } else {
        customConfigs.forEach((config, index) => {
            const configId = `custom-${index}`;
            // Note: data-config-id is on the list item div as per your provided HTML
            const configElement = `
                <div class="list-group-item list-group-item-dark d-flex justify-content-between align-items-center" data-config-id="${configId}">
                    <div>
                        <h6 class="mb-1">${config.name || `Custom ${index + 1}`}</h6>
                        <small>${config.work} min work / ${config.break} min break</small>
                    </div>
                     <div>
                        <button class="btn btn-outline-secondary btn-sm me-1 edit-config-btn" data-config-id="${configId}">Edit</button>
                        <button class="btn btn-outline-danger btn-sm delete-config-btn" data-config-id="${configId}">Delete</button>
                     </div>
                </div>
            `;
            savedCustomConfigsContainer.innerHTML += configElement;
        });
    }
     console.log("Rendered custom configs with indices:", customConfigs.map((_, i) => `custom-${i}`));
}

 function loadCustomConfigs() {
    try {
         const saved = localStorage.getItem('customPomodoroConfigs');
         return saved ? JSON.parse(saved) : [];
    } catch (e) {
         console.error("Could not load custom configs from localStorage", e);
         return [];
    }
 }

function saveCustomConfigs() {
    try {
        localStorage.setItem('customPomodoroConfigs', JSON.stringify(customConfigs));
    } catch (e) {
        console.error("Could not save custom configs to localStorage", e);
        // Optional: Show a user-friendly error message (using a modal or temporary div)
    }
}

function addCustomConfig() {
    console.log("addCustomConfig called.");
    if (!customWorkTimeInput || !customBreakTimeInput || !customConfigNameInput) {
         console.warn("Missing custom config input elements.");
         // Optional: Show error in UI
         alert("Error: Missing input fields for custom configuration."); // Use modal later
         return;
    }

    const work = parseInt(customWorkTimeInput.value);
    const breakTime = parseInt(customBreakTimeInput.value);
    const name = customConfigNameInput.value.trim();

    // Basic validation for input values
    if (isNaN(work) || work <= 0 || isNaN(breakTime) || breakTime <= 0) {
        alert("Please enter valid positive numbers for work and break times."); // Use Bootstrap modal later
        return;
    }

    // Check for duplicate config (same work, break, and name)
    if (customConfigs.some(config => config.work === work && config.break === breakTime && config.name === name)) {
        alert("A configuration with these exact values and name already exists."); // Use Bootstrap modal later
        return;
    }

    // Add the new config to the customConfigs array
    customConfigs.push({ name: name, work: work, break: breakTime });
    saveCustomConfigs(); // Save updated custom configs to localStorage
    renderConfigs(); // Re-render the list to show the new config
    // Reset inputs after adding
    customWorkTimeInput.value = 30; // Reset to a default or empty
    customBreakTimeInput.value = 5; // Reset to a default or empty
    customConfigNameInput.value = ''; // Clear the name input
     console.log("Custom config added:", { name, work, breakTime });
}

 function deleteCustomConfig(index) {
    console.log("deleteCustomConfig called for index:", index);
     if (!savedCustomConfigsContainer) {
         console.warn("Saved Custom Configs container (#savedCustomConfigs) not found. Cannot delete.");
         alert("Error: Cannot delete custom configs - list container not found."); // Use modal later
         return;
     }
     // --- Added check for customConfigs array existing and index validity ---
     if (customConfigs && index >= 0 && index < customConfigs.length) {
     // --- End Added check ---
        if (confirm("Are you sure you want to delete this configuration?")) { // Could use confirmation modal here too
            // Remove the config from the array
            customConfigs.splice(index, 1);
            saveCustomConfigs(); // Save updated custom configs to localStorage
            renderConfigs(); // Re-render the list to reflect the deletion
             console.log("Custom config deleted at index:", index);
             // TODO: If the deleted config was the active one, reset timer to default or first config
        } else {
             console.log("Config deletion cancelled by user.");
        }
    } else {
         console.error("Attempted to delete config with invalid index:", index);
         alert("Error: Invalid config index for deletion."); // Use modal later
    }
 }

 // Function to set the active configuration
 function setActiveConfig(config) {
     console.log("setActiveConfig called with config:", config);

     // Check if timer is running and confirmation is needed, AND confirmation modal is initialized
     if (currentTimerState !== 'stopped' && confirmationModal) { // <-- Check if confirmationModal instance exists
         // Store the selected config temporarily
         pendingConfig = config;
          console.log("Timer running, showing confirmation modal for config change.");

         // Set modal body message for config change - USING GENERIC TEXT
         const modalBodyElement = confirmationModalElement.querySelector('.modal-body');
         if(modalBodyElement) modalBodyElement.innerHTML = "Change configuration? This will reset the current timer.";

         const confirmProceedBtn = document.getElementById('confirmProceedBtn');
         if(confirmProceedBtn) confirmProceedBtn.textContent = "OK"; // Default button text
         else console.warn("Confirm Proceed button (#confirmProceedBtn) not found for config change modal.");

         const confirmCancelBtn = document.getElementById('confirmCancelBtn');
         if(confirmCancelBtn) confirmCancelBtn.textContent = "Cancel"; // Default button text
         else console.warn("Confirm Cancel button (#confirmCancelBtn) not found for config change modal.");

         // Attach local listeners for this specific confirmation scenario
           const localHandleConfigConfirm = () => {
               console.log("Config change confirmed via modal (Local Handler).");
               if (confirmationModal) confirmationModal.hide();
               // --- Added check for pendingConfig existing ---
               if (pendingConfig) {
                  applyConfig(pendingConfig); // Apply config if it was a config change confirmation
                  console.log("Config applied by user via modal (Local Handler).");
               } else {
                   console.warn("Config change confirmed but no pending config found.");
               }
               // --- End Added check ---
               // Note: Listeners attached with 'once: true' don't need explicit removal here.
           };
           const localHandleConfigCancel = () => {
                console.log("Config change cancelled via modal (Local Handler).");
                if (confirmationModal) confirmationModal.hide();
                pendingConfig = null; // Clear pending config if cancelled
                console.log("Pending config cleared due to cancellation (Local Handler).");
                resetConfirmationModalText(); // Restore default text on cancel
               // Note: Listeners attached with 'once: true' don't need explicit removal here.
           };

         // Ensure no duplicate listeners by adding the specific handler function with 'once: true'
         // This is the standard and safest approach for single-action confirmations.
         if(confirmProceedBtn) confirmProceedBtn.addEventListener('click', localHandleConfigConfirm, { once: true });
         if(confirmCancelBtn) confirmCancelBtn.addEventListener('click', localHandleConfigCancel, { once: true });
         // Handle manual close of the modal while config change is pending
         if(confirmationModalElement) confirmationModalElement.addEventListener('hidden.bs.modal', localHandleConfigCancel, { once: true });


         confirmationModal.show(); // Show the modal AFTER attaching listeners


     } else {
         // Timer is stopped or no modal needed/initialized, apply config directly
         console.log("Timer stopped or no modal needed. Applying config directly.");
         applyConfig(config);
     }
 }

 // Function to apply the selected configuration
 function applyConfig(config) {
     console.log("applyConfig called with config:", config);
     // TODO: Add visual indication of the active config in the list (Add 'active-config' class)
     activeConfig = { work: config.work, break: config.break };
     stopTimer(); // Stop and reset the timer based on the NEW active config
     timeRemaining = activeConfig.work * 60;
     updateDisplay();
     pendingConfig = null; // Clear pending config after applying
     console.log("Configuration applied:", activeConfig);

      // If edit form is open, close it after applying a config
     if (editConfigForm && editConfigForm.style.display !== 'none') {
          cancelEditingConfig();
     }
     // Reset confirmation modal text back to default config change message/buttons
     resetConfirmationModalText();
 }

// Functionality for editing configs
function startEditingConfig(configId) {
     console.log("startEditingConfig called for configId:", configId);
     if (!editConfigForm || !editingConfigIdInput || !editWorkTimeInput || !editBreakTimeInput || !editConfigNameInput || !saveConfigBtn || !cancelEditBtn) {
         console.warn("Missing edit config form elements.");
         alert("Error: Missing edit form fields."); // Use modal later
         return;
     }

     let configToEdit = null;
     let isDefault = false;

     if (configId.startsWith('default-')) {
         configToEdit = defaultConfigs[configId];
         isDefault = true;
         // Default configs cannot be saved directly, hide save button
         if(saveConfigBtn) saveConfigBtn.style.display = 'none';
         // Default config names cannot be edited
         if(editConfigNameInput) editConfigNameInput.disabled = true;
         // Disable work/break time inputs for default configs too
         if(editWorkTimeInput) editWorkTimeInput.disabled = true;
         if(editBreakTimeInput) editBreakTimeInput.disabled = true;

     } else if (configId.startsWith('custom-')) {
         const index = parseInt(configId.replace('custom-', ''));
          // --- Added check for customConfigs array existing ---
          if (customConfigs && index >= 0 && index < customConfigs.length) {
          // --- End Added check ---
             configToEdit = customConfigs[index];
             isDefault = false;
             // Custom configs can be saved
             if(saveConfigBtn) saveConfigBtn.style.display = '';
             // Custom config names can be edited
             if(editConfigNameInput) editConfigNameInput.disabled = false;
             // Enable work/break time inputs for custom configs
             if(editWorkTimeInput) editWorkTimeInput.disabled = false;
             if(editBreakTimeInput) editBreakTimeInput.disabled = false;
          } else {
             console.error("Custom config not found in array for editing:", index);
             alert("Error: Custom config not found."); // Use modal later
             return; // Exit if custom config not found
          }
     } else {
          console.warn("Invalid config ID format for editing:", configId);
          alert("Error: Invalid configuration selected for editing."); // Use modal later
          return; // Exit if ID format is wrong
     }


     // If configToEdit was found (either default or custom)
     if (configToEdit) {
         if(editingConfigIdInput) editingConfigIdInput.value = configId;
         if(editWorkTimeInput) editWorkTimeInput.value = configToEdit.work;
         if(editBreakTimeInput) editBreakTimeInput.value = configToEdit.break;
         if(editConfigNameInput) editConfigNameInput.value = configToEdit.name || ''; // Use || '' to handle undefined name

         // Show the edit form
         if(editConfigForm) editConfigForm.style.display = 'block';
         console.log("Edit form shown for config:", configToEdit);
     } else {
         // This else block should ideally not be reached if the checks above are correct
         console.error("ConfigToEdit is null after lookup, despite ID check.");
     }
 }


 function saveEditedConfig() {
    console.log("saveEditedConfig called.");
     // Check if necessary form elements exist
    if (!editConfigForm || !editingConfigIdInput || !editWorkTimeInput || !editBreakTimeInput || !editConfigNameInput) {
        console.warn("Missing edit config form elements for saving.");
        alert("Error: Missing edit form fields."); // Use modal later
        return;
    }

    const configId = editingConfigIdInput.value;
    const work = parseInt(editWorkTimeInput.value);
    const breakTime = parseInt(editBreakTimeInput.value);
    const name = editConfigNameInput.value.trim();

     // Basic validation for input values
     if (isNaN(work) || work <= 0 || isNaN(breakTime) || breakTime <= 0) {
        alert("Please enter valid positive numbers for work and break times."); // Use Bootstrap modal later
        return;
    }

    // Only allow saving for custom configs
    if (configId.startsWith('custom-')) {
         const index = parseInt(configId.replace('custom-', ''));
         // --- Added check for customConfigs array existing and index validity ---
         if (customConfigs && index >= 0 && index < customConfigs.length) {
         // --- End Added check ---
             // Check if updated config duplicates an existing one (excluding itself)
             const isDuplicate = customConfigs.some((config, i) =>
                 i !== index && config.work === work && config.break === breakTime && config.name === name
             );

             if (isDuplicate) {
                 alert("A custom configuration with these values and name already exists."); // Use modal
                 return;
             }

             // Update the config in the customConfigs array
             customConfigs[index].work = work;
             customConfigs[index].break = breakTime;
             customConfigs[index].name = name;

             saveCustomConfigs(); // Save updated custom configs to localStorage
             renderConfigs(); // Re-render the list to show updated config
             console.log("Custom config updated:", customConfigs[index]);
             // TODO: If the updated config was the active one, update the timer display? Or ask to apply?
             // If active config matches the updated one, apply the changes visually/functionally
              if (activeConfig && typeof activeConfig === 'object' && activeConfig.work === customConfigs[index].work && activeConfig.break === customConfigs[index].break && activeConfig.name === customConfigs[index].name) {
                   console.log("Updated custom config is the active one. Applying changes.");
                   // Stop timer and re-apply the updated config values
                   stopTimer(); // Stop and reset based on old config
                   activeConfig = { ...customConfigs[index] }; // Update active config object
                   timeRemaining = activeConfig.work * 60; // Set time based on updated work time
                   updateDisplay(); // Update display
                   console.log("Active config updated to:", activeConfig);
                   // Note: If timer was running, this stops it. Could ask user if they want to apply/restart.
               }
         } else {
              console.error("Custom config not found for saving:", index);
              alert("Error: Config to edit not found."); // Use modal later
         }
    } else if (configId.startsWith('default-')) {
        console.warn("Attempted to save a default config edit. This action is not allowed.");
        alert("Cannot save default configurations."); // Use modal later
    } else {
         console.warn("Save attempted with invalid config ID format:", configId);
         alert("Error: Invalid configuration ID for saving."); // Use modal later
    }
     cancelEditingConfig(); // Close the edit form after saving
 }

 function cancelEditingConfig() {
     console.log("cancelEditingConfig called.");
     // Reset input values in case user edited but cancelled? Optional.
     // if(editWorkTimeInput) editWorkTimeInput.value = '';
     // if(editBreakTimeInput) editBreakTimeInput.value = '';
     // if(editConfigNameInput) editConfigNameInput.value = '';
     if (editConfigForm) editConfigForm.style.display = 'none'; // Hide the edit form
 }

    // --- Music Mode Functions ---

    function getYouTubeIdAndType(url) {
        console.log("Attempting to extract YouTube ID and Type from:", url);
        let id = null;
        let type = null;
        let match;

        const videoRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be|music\.youtube\.com)\/(?:watch\?v=|embed\/|v\/|shorts\/|track\/)?([a-zA-Z0-9_-]+)(?:&.*)?(?:#t=\d+)?/;
        match = url.match(videoRegex);
        if (match && match[1]) {
            id = match[1];
            type = 'video';
            console.log(`Extracted video ID: ${id} from URL: ${url}`);
            return { type: type, id: id };
        }

        const playlistRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be|music\.youtube\.com)\/(?:playlist\?list=)([\w-]+)(?:&.*)?/;
        match = url.match(playlistRegex);
        if (match && match[1]) {
            id = match[1];
            type = 'playlist';
            console.log(`Extracted playlist ID: ${id} from URL: ${url}`);
            return { type: type, id: id };
        }

        console.warn("Could not extract valid YouTube video or playlist ID from URL:", url);
        return { type: null, id: null };
    }

    function loadYouTubeContent(id, type) {
        console.log(`Loading YouTube content. Type: ${type}, ID: ${id}`);
        if (typeof YT === 'undefined' || typeof YT.Player === 'undefined' || !youtubePlayerDiv) {
            console.warn("YouTube API or player div not ready. Cannot load content.");
            if (trackTitleSpan) trackTitleSpan.textContent = 'Music Player Unavailable';
            if (musicControls) musicControls.style.display = 'none';
            return;
        }

        if (player) {
            console.log("Existing player found. Destroying old player.");
            player.destroy();
            player = null;
        }

        player = new YT.Player('youtube-player', {
            height: '0',
            width: '0',
            videoId: type === 'video' ? id : undefined,
            list: type === 'playlist' ? id : undefined,
            listType: type === 'playlist' ? 'playlist' : undefined,
            playerVars: {
                'autoplay': 1,
                'controls': 0,
                'disablekb': 1,
                'fs': 0,
                'iv_load_policy': 3,
                'modestbranding': 1,
                'rel': 0,
                'showinfo': 0
            },
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange,
                'onError': onPlayerError
            }
        });
        console.log("New YouTube Player instance creation requested.");

        if (musicControls) musicControls.style.display = 'flex';
        if (currentTrackInfo) currentTrackInfo.style.display = 'block';
        if (trackTitleSpan) trackTitleSpan.textContent = `Loading ${type || 'content'} info...`;
    }

    function onPlayerReady(event) {
        console.log("YouTube Player is ready.");
        event.target.playVideo().catch(error => {
            console.warn("Autoplay prevented:", error);
            if (trackTitleSpan) trackTitleSpan.textContent = 'Ready to play (click play button)';
            if (playPauseMusicBtn) playPauseMusicBtn.innerHTML = '<i class="bi bi-play-fill"></i>';
        });

        if (player && player.getVideoData && trackTitleSpan) {
            const videoData = player.getVideoData();
            const isPlaylist = player.getPlaylistId && player.getPlaylistId();
            if (videoData && videoData.title) {
                trackTitleSpan.textContent = isPlaylist ? `${videoData.title} (Playlist)` : videoData.title;
                console.log("Set track title:", trackTitleSpan.textContent);
            } else {
                trackTitleSpan.textContent = isPlaylist ? 'Playlist Track' : 'Unknown Title';
                console.warn("Could not get video data or title on player ready.");
            }
        } else console.warn("Player or track title span not available on ready.");
    }

    function onPlayerStateChange(event) {
        console.log("YouTube Player state changed:", event.data);
        if (playPauseMusicBtn) {
            if (event.data === YT.PlayerState.PLAYING) {
                playPauseMusicBtn.innerHTML = '<i class="bi bi-pause-fill"></i>';
            } else {
                playPauseMusicBtn.innerHTML = '<i class="bi bi-play-fill"></i>';
            }
        }

        if (event.data === YT.PlayerState.PLAYING || event.data === YT.PlayerState.BUFFERING) {
            if (player && player.getVideoData && trackTitleSpan) {
                const videoData = player.getVideoData();
                const isPlaylist = player.getPlaylistId && player.getPlaylistId();
                if (videoData && videoData.title) {
                    trackTitleSpan.textContent = isPlaylist ? `${videoData.title} (Playlist)` : videoData.title;
                    console.log("Updated track title on state change:", trackTitleSpan.textContent);
                } else {
                    trackTitleSpan.textContent = isPlaylist ? 'Playlist Track (Playing)' : 'Unknown Title (Playing)';
                    console.warn("Could not get video data or title on playing/buffering state change.");
                }
            } else console.warn("Player or track title span not available on state change.");
        }

        if (event.data === YT.PlayerState.ENDED) {
            console.log("Content ended.");
            const isPlaylist = player.getPlaylistId && player.getPlaylistId();
            if (!isPlaylist) {
                player.seekTo(0);
                player.playVideo().catch(error => console.error("Failed to loop video:", error));
                console.log("Looping single video.");
            }
        }
    }

    function onPlayerError(event) {
        console.error("YouTube Player error:", event.data);
        let errorMessage = `Error: ${event.data}`;
        switch(event.data) {
            case 2:
                errorMessage = "Invalid video ID or URL.";
                break;
            case 100:
                errorMessage = "Video not found.";
                break;
            case 101:
            case 150:
                errorMessage = "Video cannot be played (embedding disabled or restricted).";
                const isPlaylist = player.getPlaylistId && player.getPlaylistId();
                if (isPlaylist) {
                    console.log("Error in playlist video. Attempting to play next track.");
                    player.nextVideo();
                    return;
                }
                break;
            default:
                errorMessage = `YouTube Error: ${event.data}`;
                break;
        }
        if (trackTitleSpan) trackTitleSpan.textContent = errorMessage;
        if (musicControls) musicControls.style.display = 'none';
        if (playPauseMusicBtn) playPauseMusicBtn.innerHTML = '<i class="bi bi-play-fill"></i>';
        if (player) {
            player.destroy();
            player = null;
        }
        console.warn("YouTube Player destroyed due to error.");
    }

    function togglePlayPauseMusic() {
        console.log("Toggle Music Play/Pause clicked.");
        if (player && player.getPlayerState) {
            const state = player.getPlayerState();
            if (state === YT.PlayerState.PLAYING) {
                console.log("Pausing content.");
                player.pauseVideo();
            } else if (state === YT.PlayerState.PAUSED || state === YT.PlayerState.ENDED || state === YT.PlayerState.BUFFERING) {
                console.log("Playing content.");
                player.playVideo().catch(error => console.error("Failed to play content:", error));
            } else {
                console.warn("YouTube Player is not in a playable state.");
                if (state === -1 && youtubeLinkInput && youtubeLinkInput.value.trim()) {
                    console.log("Player state is unstarted, attempting to reload content on play click.");
                    handleLoadMusic();
                }
            }
        } else {
            console.warn("YouTube Player is not ready or not found.");
            if (youtubeLinkInput && youtubeLinkInput.value.trim()) {
                console.log("Player not found/ready, attempting to load content on play click.");
                handleLoadMusic();
            } else {
                console.warn("Cannot toggle playback: Player not ready and no link available.");
            }
        }
    }

    function handleLoadMusic() {
        console.log("Load Music button clicked.");
        if (youtubeLinkInput) {
            const url = youtubeLinkInput.value.trim();
            if (url) {
                const youtubeContent = getYouTubeIdAndType(url);
                if (youtubeContent && youtubeContent.id && youtubeContent.type) {
                    loadYouTubeContent(youtubeContent.id, youtubeContent.type);
                    console.log(`Attempting to load YouTube content with Type: ${youtubeContent.type}, ID: ${youtubeContent.id}`);
                } else {
                    alert("Invalid YouTube video or playlist link. Please enter a valid URL.");
                    console.warn("Invalid YouTube link entered.");
                }
            } else {
                alert("Please enter a YouTube link.");
                console.warn("No YouTube link entered.");
            }
        } else console.warn("YouTube link input (#youtubeLinkInput) not found.");
    }

    // --- Event Listeners ---

    if (startPauseBtn) {
        startPauseBtn.addEventListener('click', () => {
            console.log("Start/Pause button clicked.");
            if (currentTimerState === 'stopped' || currentTimerState.startsWith('paused')) {
                if (currentSessionType === 'work' && currentTimerState === 'paused-work' && isFocusRegainEnabled && pausedDuration > 0 && focusRegainModal) {
                    console.log("Paused work session, regain enabled, duration > 0. Showing regain modal.");
                } else {
                    console.log("Starting timer directly.");
                    startTimer();
                }
            } else if (currentTimerState.startsWith('running')) {
                pauseTimer();
            }
        });
    } else {
        console.warn("Start/Pause button (#startPauseBtn) not found.");
    }

    if (resetTimerBtn) {
        resetTimerBtn.addEventListener('click', resetTimer);
        console.log("Reset Timer button event listener attached.");
    } else {
        console.warn("Reset Timer button (#resetTimerBtn) not found.");
    }

    if (focusRegainToggle) {
        focusRegainToggle.addEventListener('change', (event) => {
            console.log("Focus Regain toggle changed.", event.target.checked);
            isFocusRegainEnabled = event.target.checked;
            console.log("Focus Regain Enabled:", isFocusRegainEnabled);
        });
    } else {
        console.warn("Focus Regain Toggle not found.");
    }

    if (focusRegainModalElement && addPausedTimeBtn) {
        addPausedTimeBtn.addEventListener('click', () => {
            console.log("Add Paused Time button clicked in modal.");
            handleFocusRegainAction('add');
        });
        console.log("Add Paused Time button event listener attached.");
    } else {
        console.warn("Add Paused Time button (#addPausedTimeBtn) not found or modal element not initialized. Cannot attach click listener.");
    }

    if (focusRegainModalElement && discardPausedTimeBtn) {
        discardPausedTimeBtn.addEventListener('click', () => {
            console.log("Discard Paused Time button clicked in modal.");
            handleFocusRegainAction('discard');
        });
        console.log("Discard Paused Time button event listener attached.");
    } else {
        console.warn("Discard Paused Time button (#discardPausedTimeBtn) not found or modal element not initialized. Cannot attach click listener.");
    }

    function resetConfirmationModalText() {
        const modalBodyElement = confirmationModalElement.querySelector('.modal-body');
        if (modalBodyElement) modalBodyElement.innerHTML = "Change configuration? This will reset the current timer.";
        const confirmProceedBtn = document.getElementById('confirmProceedBtn');
        if (confirmProceedBtn) confirmProceedBtn.textContent = "OK";
        const confirmCancelBtn = document.getElementById('confirmCancelBtn');
        if (confirmCancelBtn) confirmCancelBtn.textContent = "Cancel";
        console.log("Confirmation modal text reset to default.");
    }

    // --- Sidebar Toggle Event Listeners ---
    if (openSidebarBtn) {
        openSidebarBtn.addEventListener('click', openSidebar);
        console.log("Open Sidebar button event listener attached.");
    } else {
        console.warn("Open Sidebar button (id='openPomodoroSidebarBtn') not found.");
    }

    if (closeSidebarBtn) {
        closeSidebarBtn.addEventListener('click', closeSidebar);
        console.log("Close Sidebar button (#closeSidebarBtn) event listener attached.");
    } else {
        console.warn("Close Sidebar button (#closeSidebarBtn) not found.");
    }

    // Event Delegation for Config List Clicks
    const sidebarContent = document.querySelector('.sidebar-content');
    if (sidebarContent) {
        console.log("Sidebar content container found. Attaching event delegation listener.");
        sidebarContent.addEventListener('click', (event) => {
            const target = event.target;
            console.log("Click event triggered on sidebar content. Target:", target);

            const configItem = target.closest('.list-group-item-dark');
            if (configItem && !target.classList.contains('btn') && !target.closest('.btn')) {
                const configId = configItem.dataset.configId;
                console.log("List item clicked. Config ID found:", configId);

                if (!configId) {
                    console.warn("No data-config-id found on list item. Check renderConfigs HTML structure.");
                    return;
                }

                let selectedConfig = null;
                if (configId.startsWith('default-')) {
                    selectedConfig = defaultConfigs[configId];
                    console.log("Identified as Default Config:", selectedConfig);
                } else if (configId.startsWith('custom-')) {
                    const index = parseInt(configId.replace('custom-', ''));
                    if (index >= 0 && index < customConfigs.length) {
                        selectedConfig = customConfigs[index];
                        console.log("Identified as Custom Config:", selectedConfig);
                    } else {
                        console.error(`Invalid index for custom config: ${index}. customConfigs length: ${customConfigs.length}.`);
                    }
                }

                if (selectedConfig) {
                    console.log("Calling setActiveConfig with:", selectedConfig);
                    setActiveConfig(selectedConfig);
                } else {
                    console.warn("Selected config not found for ID:", configId);
                }
            } else if (target.classList.contains('edit-config-btn')) {
                const configId = target.dataset.configId;
                console.log("Edit button clicked for config ID:", configId);
                if (currentTimerState !== 'stopped') {
                    alert("Please stop the timer before editing configurations.");
                    console.warn("Attempted to edit config while timer is running.");
                } else {
                    if (configId.startsWith('custom-') || configId.startsWith('default-')) {
                        startEditingConfig(configId);
                    } else {
                        console.warn("Edit clicked on item without a valid config ID pattern.");
                    }
                }
            } else if (target.classList.contains('delete-config-btn')) {
                const configId = target.dataset.configId;
                console.log("Delete button clicked for config ID:", configId);
                if (configId.startsWith('custom-')) {
                    if (currentTimerState === 'stopped') {
                        const index = parseInt(configId.replace('custom-', ''));
                        if (index >= 0 && index < customConfigs.length) {
                            deleteCustomConfig(index);
                        } else {
                            console.error(`Invalid index for custom config deletion: ${index}. customConfigs length: ${customConfigs.length}.`);
                        }
                    } else {
                        alert("Please stop the timer before deleting configurations.");
                        console.warn("Attempted to delete config while timer is running.");
                    }
                } else {
                    alert("Cannot delete default configurations.");
                    console.warn("Attempted to delete a default config.");
                }
            }
        });
        console.log("Event delegation listener attached to sidebar content.");
    } else {
        console.warn("Sidebar content container (.sidebar-content) not found for event delegation.");
    }

    // Config Edit Form Event Listeners
    if (saveConfigBtn) {
        saveConfigBtn.addEventListener('click', saveEditedConfig);
        console.log("Save Config button event listener attached.");
    } else console.warn("Save Config button (#saveConfigBtn) not found.");

    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', cancelEditingConfig);
        console.log("Cancel Edit button event listener attached.");
    } else console.warn("Cancel Edit button (#cancelEditBtn) not found.");

    // Music Mode Event Listeners
    if (loadMusicBtn) {
        loadMusicBtn.addEventListener('click', handleLoadMusic);
        console.log("Load Music button event listener attached.");
    } else console.warn("Load Music button (#loadMusicBtn) not found.");

    if (playPauseMusicBtn) {
        playPauseMusicBtn.addEventListener('click', togglePlayPauseMusic);
        console.log("Play/Pause Music button event listener attached.");
    } else console.warn("Play/Pause Music button (#playPauseMusicBtn) not found.");

    if (youtubeLinkInput && loadMusicBtn) {
        youtubeLinkInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                handleLoadMusic();
            }
        });
        console.log("YouTube link input keypress listener attached.");
    }

    // Initialize Bootstrap Tooltips
    const tooltipTriggerList = [].slice.call(pomodoroSidebar ? pomodoroSidebar.querySelectorAll('[data-bs-toggle="tooltip"]') : []);
    if (tooltipTriggerList.length > 0) {
        console.log(`Found ${tooltipTriggerList.length} elements with data-bs-toggle="tooltip" inside sidebar. Initializing tooltips.`);
    } else {
        console.log("No elements with data-bs-toggle='tooltip' found inside sidebar.");
    }

    tooltipTriggerList.map(function (tooltipTriggerEl) {
        if (typeof bootstrap !== 'undefined' && typeof bootstrap.Tooltip !== 'undefined') {
            const existingTooltip = bootstrap.Tooltip.getInstance(tooltipTriggerEl);
            if (existingTooltip) {
                existingTooltip.dispose();
            }
            return new bootstrap.Tooltip(tooltipTriggerEl);
        } else {
            console.warn("Bootstrap or Tooltip not available. Skipping tooltip initialization for an element.");
            return null;
        }
    }).filter(tooltip => tooltip !== null);

    console.log("Bootstrap Tooltips initialization attempted.");

    // --- Initial Setup ---
    renderConfigs();
    setActiveConfig(defaultConfigs['default-25']);
    loadYouTubeAPI();

    console.log("Initial setup complete.");
});

window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
window.onYouTubeIframeAPIFailedToLoad = onYouTubeIframeAPIFailedToLoad;
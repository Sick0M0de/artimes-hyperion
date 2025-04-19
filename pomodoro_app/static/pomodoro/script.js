// D:\artimes-hyperion\pomodoro_app\static\pomodoro\script.js

// Console logs are for debugging your implementation.
// You can remove or reduce these once everything is working smoothly.
console.log("Pomodoro script.js started loading.");

// Load YouTube IFrame Player API script dynamically
function loadYouTubeAPI() {
    console.log("Loading YouTube IFrame Player API.");
    // Corrected script source URL based on YouTube API documentation
    const youtubeApiScriptSrc = "https://www.youtube.com/iframe_api"; // CORRECT Standard API URL
    if (document.querySelector(`script[src="${youtubeApiScriptSrc}"]`)) {
        console.log("YouTube IFrame Player API script already exists.");
        return;
    }
    const tag = document.createElement('script');
    tag.src = youtubeApiScriptSrc;
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    console.log("YouTube IFrame Player API script tag added.");
}

// This function is called by the YouTube API when it's ready
let player; // Global YouTube player variable
function onYouTubeIframeAPIReady() {
    console.log("YouTube IFrame Player API is ready.");
    // You can optionally load a default video or show the music input section here
    // Ensure the music input section is visible initially if no music is playing
    const musicInputSectionContainer = document.getElementById('youtubeLinkInput')?.parentElement?.closest('div');
    const loadButtonAndOldControlsContainer = document.getElementById('loadMusicBtn')?.parentElement;
    const musicPlayerDisplay = document.getElementById('musicPlayerDisplay');

    if (musicInputSectionContainer) musicInputSectionContainer.style.display = 'block';
    // Assuming loadButtonAndOldControlsContainer's default display is flex or block
    if (loadButtonAndOldControlsContainer) loadButtonAndOldControlsContainer.style.display = ''; // Reset to default display
    if (musicPlayerDisplay) musicPlayerDisplay.style.display = 'none';

}

// This function is called if the API fails to load (optional handler)
function onYouTubeIframeAPIFailedToLoad(event) {
    console.error("YouTube IFrame Player API failed to load.", event);
    const musicModeSection = document.getElementById('musicModeSection');
    const musicInputSectionContainer = document.getElementById('youtubeLinkInput')?.parentElement?.closest('div');
    const loadButtonAndOldControlsContainer = document.getElementById('loadMusicBtn')?.parentElement;
    const musicPlayerDisplay = document.getElementById('musicPlayerDisplay');

    if (musicModeSection) {
        console.warn("YouTube API failed to load. Music functionality may not work.");
        // Hide music-related inputs/buttons and the new player display
        if (musicInputSectionContainer) musicInputSectionContainer.style.display = 'none';
        if (loadButtonAndOldControlsContainer) loadButtonAndOldControlsContainer.style.display = 'none';
        if (musicPlayerDisplay) musicPlayerDisplay.style.display = 'none';
        // Add an error message element if you have one in your HTML (e.g., <p id="musicErrorDisplay"></p>)
        const musicErrorDisplay = document.getElementById('musicErrorDisplay'); // Assuming you add this ID
        if (musicErrorDisplay) {
             musicErrorDisplay.textContent = 'Error loading Music feature. YouTube API failed.';
             musicErrorDisplay.style.display = 'block'; // Ensure it's visible
        }
    } else console.warn("Music mode section element (#musicModeSection) not found to display API load error.");
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOMContentLoaded event fired. Pomodoro script running.");

    // --- DOM Elements ---
    const pomodoroSidebar = document.getElementById('pomodoroSidebar');
    const openSidebarBtn = document.getElementById('openPomodoroSidebarBtn'); // Ensure this element exists in HTML
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
                    // Auto-discard paused time if modal is closed manually while timer is paused work session with duration
                    if (currentTimerState === 'paused-work' && pausedDuration > 0) {
                         console.log("Modal hidden manually while paused with pending duration. Auto-discarding time.");
                         handleFocusRegainAction('discard'); // Discard the time on modal close
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
                    pendingConfig = null; // Always clear pending config on confirmation modal close
                    console.log("Pending config cleared due to manual modal close.");
                    resetConfirmationModalText(); // Restore default text on close
                });
            } catch (error) {
                console.error("Error creating Confirmation Modal instance:", error);
            }
        } else console.warn("Confirmation Modal element (#confirmationModalElement) not found. Cannot create instance.");
    } else {
        console.warn("Bootstrap or Bootstrap.Modal is not available. Modal instances cannot be created.");
    }

    const pausedDurationDisplay = document.getElementById('pausedDurationDisplay'); // Element inside focus regain modal
    const addPausedTimeBtn = document.getElementById('addPausedTimeBtn'); // Button inside focus regain modal
    const discardPausedTimeBtn = document.getElementById('discardPausedTimeBtn'); // Button inside focus regain modal

    // Confirmation modal buttons
    const confirmProceedBtn = document.getElementById('confirmProceedBtn');
    const confirmCancelBtn = document.getElementById('confirmCancelBtn');

    // Music Mode Elements (Existing in original HTML/Structure)
    const youtubeLinkInput = document.getElementById('youtubeLinkInput');
    const loadMusicBtn = document.getElementById('loadMusicBtn');
    const youtubePlayerDiv = document.getElementById('youtube-player');
    // const musicControls = document.querySelector('.music-controls'); // Old controls container - no longer directly used for display
    // const playPauseMusicBtn = document.getElementById('playPauseMusicBtn'); // This ID is now on the button inside the new music player display

    // --- Music Mode Elements (New Player Display - from your new HTML structure) ---
    const musicPlayerDisplay = document.getElementById('musicPlayerDisplay');
    // Get elements inside the new player display using querySelector on the display element
    const albumArt = musicPlayerDisplay ? musicPlayerDisplay.querySelector('#albumArt') : null;
    const trackTitleNew = musicPlayerDisplay ? musicPlayerDisplay.querySelector('#trackTitle') : null; // New track title element
    const trackArtist = musicPlayerDisplay ? musicPlayerDisplay.querySelector('#trackArtist') : null; // New track artist element
    const playPauseMusicBtn = musicPlayerDisplay ? musicPlayerDisplay.querySelector('#playPauseMusicBtn') : null; // Get the button by ID inside the new display
    // Select skip/add/options buttons using classes/icons within the new display
    const skipPrevMusicBtn = musicPlayerDisplay ? musicPlayerDisplay.querySelector('.bi-skip-start-fill')?.closest('button') : null;
    const skipNextMusicBtn = musicPlayerDisplay ? musicPlayerDisplay.querySelector('.bi-skip-end-fill')?.closest('button') : null;
    const addMusicBtnNew = musicPlayerDisplay ? musicPlayerDisplay.querySelector('.bi-plus-circle')?.closest('button') : null; // Assuming you added this button
    const optionsMusicBtn = musicPlayerDisplay ? musicPlayerDisplay.querySelector('.bi-three-dots')?.closest('button') : null; // Assuming you added this button


    // Get containers for hiding/showing input vs player display
    // Based on HTML structure (Turn 135), the input/label is in a div.mb-3
    const musicInputSectionContainer = youtubeLinkInput ? youtubeLinkInput.parentElement?.closest('div') : null;
     // The Load button, youtube-player, and the old music controls div are all siblings
     // in the div with classes 'd-flex justify-content-between align-items-center mb-3'
     const loadButtonAndOldControlsContainer = loadMusicBtn ? loadMusicBtn.parentElement : null; // This should be the div above


    console.log("Music mode elements found:", {
        youtubeLinkInput: !!youtubeLinkInput,
        loadMusicBtn: !!loadMusicBtn,
        youtubePlayerDiv: !!youtubePlayerDiv,
        playPauseMusicBtn: !!playPauseMusicBtn, // Refers to the new button inside the new display
        // oldCurrentTrackInfo: !!currentTrackInfo, // Old "Now playing" paragraph (keeping visible)
        // oldTrackTitleSpan: !!trackTitleSpan, // Old span inside currentTrackInfo (keeping visible but not updated by music)
        musicPlayerDisplay: !!musicPlayerDisplay, // New player display container
        albumArt: !!albumArt, // New album art
        trackTitleNew: !!trackTitleNew, // New track title element
        trackArtist: !!trackArtist, // New track artist element
        skipPrevMusicBtn: !!skipPrevMusicBtn,
        skipNextMusicBtn: !!skipNextMusicBtn,
        addMusicBtnNew: !!addMusicBtnNew,
        optionsMusicBtn: !!optionsMusicBtn,
        musicInputSectionContainer: !!musicInputSectionContainer, // Container for input field
        loadButtonAndOldControlsContainer: !!loadButtonAndOldControlsContainer // Container for load button, old controls, iframe
    });


    const defaultConfigsContainer = document.getElementById('defaultConfigs'); // Container for default configs list
    const savedCustomConfigsContainer = document.getElementById('savedCustomConfigs'); // Container for saved custom configs list
    const addCustomConfigBtn = document.getElementById('addCustomConfigBtn'); // Button to trigger adding a custom config
    const customWorkTimeInput = document.getElementById('customWorkTime'); // Input for new custom work time
    const customBreakTimeInput = document.getElementById('customBreakTime'); // Input for new custom break time
    const customConfigNameInput = document.getElementById('customConfigName'); // Input for new custom config name

    const editConfigForm = document.getElementById('editConfigForm'); // The form for editing configs
    const editingConfigIdInput = document.getElementById('editingConfigId'); // Hidden input for the ID of the config being edited
    const editWorkTimeInput = document.getElementById('editWorkTime'); // Input for editing work time
    const editBreakTimeInput = document.getElementById('editBreakTime'); // Input for editing break time
    const editConfigNameInput = document.getElementById('editConfigName'); // Input for editing config name
    const saveConfigBtn = document.getElementById('saveConfigBtn'); // Button to save edited config
    const cancelEditBtn = document.getElementById('cancelEditBtn'); // Button to cancel editing


    // --- State Variables ---
    let currentTimerState = 'stopped'; // 'stopped', 'running-work', 'paused-work', 'running-break', 'paused-break'
    let currentSessionType = 'work'; // 'work' or 'break'
    let timeRemaining = 25 * 60; // Default to 25 minutes in seconds
    let intervalTimer = null;
    // Initialize isFocusRegainEnabled from the toggle's initial state
    let isFocusRegainEnabled = focusRegainToggle ? focusRegainToggle.checked : false;
    let pausedDuration = 0;
    let focusRegainInterval = null;

    // Default active config on load
    let activeConfig = { name: 'QuickDraw', work: 25, break: 5 }; // Initialize with default values
    let pendingConfig = null; // Stores config selected from sidebar when timer is running

    // Store original document title to restore it after timer ends
    const originalDocumentTitle = document.title;

    // Default configurations with Dante-themed names
    // These objects contain the data for the default config options
    const defaultConfigs = {
        'default-25': { name: 'QuickDraw', work: 25, break: 5, quote: "(Easy Mode)" },
        'default-50': { name: 'Stylish Grind', work: 50, break: 10, quote: "(Hunter Mode)" },
        'default-120': { name: 'Legendary Hunt', work: 120, break: 30, quote: "(Heaven or Hell)" }
    };

    // Load custom configurations from localStorage or initialize empty array
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

    // --- Helper Functions ---

    // Formats seconds into MM:SS or H:MM:SS format
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

    // Updates the main timer display element
    function updateDisplay() {
        if (displayTime) displayTime.textContent = formatTime(timeRemaining);
        else console.warn("Timer display element (#displayTime) not found in updateDisplay.");
    }

    // --- Timer Functions ---

    // Starts or Resumes the timer interval
    function startTimer() {
        console.log("startTimer called. Current state:", currentTimerState);

        // Prevent starting if already running
        if (currentTimerState.startsWith('running')) {
            console.log("Timer already running. Doing nothing.");
            return;
        }

        // Clear any existing timer interval
        clearInterval(intervalTimer);
        intervalTimer = null;
        console.log("Cleared existing intervalTimer.");

        // Set the timer state and button text based on session type
        if (currentSessionType === 'work') {
            currentTimerState = 'running-work';
            if (startPauseBtn) {
                startPauseBtn.textContent = 'Pause';
                startPauseBtn.classList.remove('btn-primary', 'btn-secondary', 'btn-info');
                startPauseBtn.classList.add('btn-warning'); // Yellow/Warning for Pause
            } else console.warn("Start/Pause button (#startPauseBtn) not found in startTimer (work state).");
        } else { // currentSessionType === 'break'
            currentTimerState = 'running-break';
            if (startPauseBtn) {
                startPauseBtn.textContent = 'Pause Break';
                startPauseBtn.classList.remove('btn-primary', 'btn-secondary', 'btn-warning');
                startPauseBtn.classList.add('btn-info'); // Cyan/Info for Pause Break
            } else console.warn("Start/Pause button (#startPauseBtn) not found in startTimer (break state).");
        }

        // Start the interval to decrement timeRemaining every second
        intervalTimer = setInterval(() => {
            if (timeRemaining > 0) {
                timeRemaining--;
                updateDisplay(); // Update the display
                // Update document title for visual cue
                document.title = formatTime(timeRemaining) + " | Hyperion";
            } else {
                // Timer reached zero
                clearInterval(intervalTimer);
                intervalTimer = null;
                console.log("Interval timer cleared because time ran out.");
                handleSessionEnd(); // Handle the end of the session
            }
        }, 1000); // Interval runs every 1000ms (1 second)

        console.log(`Interval timer started. Current state: ${currentTimerState}. Time remaining: ${timeRemaining}`);
    }

    // Pauses the currently running timer
    function pauseTimer() {
        console.log("pauseTimer called. Current state:", currentTimerState);
        // Only pause if the timer is currently running
        if (currentTimerState.startsWith('running')) {
            // Clear the main timer interval
            clearInterval(intervalTimer);
            intervalTimer = null;
            console.log("Cleared main intervalTimer when pausing.");

            // Update document title to indicate paused state
            document.title = "Paused | " + originalDocumentTitle;

            // Update timer state and button text
            currentTimerState = currentSessionType === 'work' ? 'paused-work' : 'paused-break';
            if (startPauseBtn) {
                startPauseBtn.textContent = 'Resume';
                startPauseBtn.classList.remove('btn-warning', 'btn-info', 'btn-primary');
                startPauseBtn.classList.add('btn-secondary'); // Gray/Secondary for Resume
            } else console.warn("Start/Pause button (#startPauseBtn) not found in pauseTimer.");

            // If it's a work session and focus regain is enabled, start the regain timer and show the modal
            if (currentSessionType === 'work' && isFocusRegainEnabled) {
                console.log("Work session paused, focus regain enabled. Starting regain timer and showing modal prompt.");
                startFocusRegainTimer(); // Start tracking paused duration
                // Check if modal elements and instance exist before trying to show
                if (focusRegainModalElement && focusRegainModal && focusRegainModalBody) {
                    // Update modal body with the current paused duration
                    focusRegainModalBody.innerHTML = `You were paused for <strong id="pausedDurationDisplay">${formatTime(pausedDuration)}</strong>. <br> ${getRandomRegainMessage()} <br> Should I add this time to your current session?`;
                    console.log("Showing Focus Regain modal.");
                    focusRegainModal.show(); // Show the modal
                } else {
                    console.warn("Focus Regain Modal elements or instance not found. Cannot show modal.");
                }
            } else {
                console.log("Session paused, but not work, or regain disabled. No regain timer or modal shown.");
            }
        }
    }

    // Stops the timer and resets it to the active config's work time
    function stopTimer() {
        console.log("stopTimer called.");
        // Clear both main timer and focus regain timer intervals
        clearInterval(intervalTimer);
        intervalTimer = null;
        clearInterval(focusRegainInterval);
        focusRegainInterval = null;

        // Reset state variables
        currentTimerState = 'stopped';
        currentSessionType = 'work'; // Always reset to work session
        pausedDuration = 0; // Reset paused duration

        // Reset button text and style
        if (startPauseBtn) {
            startPauseBtn.textContent = 'Start';
            startPauseBtn.classList.remove('btn-warning', 'btn-secondary', 'btn-info');
            startPauseBtn.classList.add('btn-primary'); // Blue/Primary for Start
        } else console.warn("Start/Pause button (#startPauseBtn) not found in stopTimer.");

        // Hide any open modals (regain or confirmation)
        if (focusRegainModal) focusRegainModal.hide();
        else console.warn("Focus Regain Modal instance not found in stopTimer. Cannot hide.");
        if (confirmationModal) confirmationModal.hide();
        else console.warn("Confirmation Modal instance not found in stopTimer. Cannot hide.");
        // Reset confirmation modal text just in case
        resetConfirmationModalText();


        // Reset time remaining to the active config's work time and update display
        timeRemaining = activeConfig.work * 60;
        updateDisplay();

        // Restore original document title
        document.title = originalDocumentTitle;
        console.log("Timer stopped and reset.");
    }

    // Prompts the user to confirm resetting the timer if it's running, then stops it
    function resetTimer() {
        console.log("resetTimer called. Current state:", currentTimerState);
        // If timer is running (work or break, running or paused) and confirmation modal is available, show confirmation
        // Also check if the confirmation modal instance was successfully initialized
        if (currentTimerState !== 'stopped' && confirmationModal) {
            // Store the active config temporarily in case they confirm (though not strictly needed for reset)
            pendingConfig = activeConfig;
            const modalBodyElement = confirmationModalElement.querySelector('.modal-body');
            // Set the specific message for reset confirmation
            if (modalBodyElement) modalBodyElement.innerHTML = "Are you sure you want to reset the timer? This will end the current session.";

            const confirmProceedBtn = document.getElementById('confirmProceedBtn');
            // Customize button text for reset confirmation
            if (confirmProceedBtn) confirmProceedBtn.textContent = "Yes, Reset";
            else console.warn("Confirm Proceed button (#confirmProceedBtn) not found for reset modal.");

            const confirmCancelBtn = document.getElementById('confirmCancelBtn');
            // Customize button text for reset cancellation
            if (confirmCancelBtn) confirmCancelBtn.textContent = "No, Cancel";
            else console.warn("Confirm Cancel button (#confirmCancelBtn) not found for reset modal.");

            // Define local handlers for the confirmation modal buttons specific to reset
            const localHandleResetConfirm = () => {
                console.log("Reset confirmed via modal (Local Handler).");
                // Call stopTimer to perform the reset
                stopTimer();
                console.log("Timer reset by user via modal (Local Handler).");
                // No need to manually hide modal or remove listeners due to 'once: true' and stopTimer
            };
            const localHandleResetCancel = () => {
                console.log("Reset cancelled via modal (Local Handler).");
                // Clear pending config as action was cancelled
                pendingConfig = null;
                console.log("Pending config cleared due to cancellation (Local Handler).");
                // Reset modal text back to default config change message
                resetConfirmationModalText();
                // No need to manually hide modal or remove listeners due to 'once: true'
            };

            // Attach these specific handlers using { once: true } to ensure they are removed after one click
            if (confirmProceedBtn) confirmProceedBtn.addEventListener('click', localHandleResetConfirm, { once: true });
            if (confirmCancelBtn) confirmCancelBtn.addEventListener('click', localHandleResetCancel, { once: true });
            // Also handle the modal being closed manually (e.g., clicking outside or pressing Esc)
            // Attach this using { once: true } as well, linked to the cancel action
            if (confirmationModalElement) confirmationModalElement.addEventListener('hidden.bs.modal', localHandleResetCancel, { once: true });

            // Show the confirmation modal
            confirmationModal.show();

        } else if (currentTimerState === 'stopped') {
            // If timer is already stopped, just ensure it's in the default reset state
            stopTimer();
            console.log("Timer already stopped, ensuring reset state.");
        }
    }

    // Handles the transition when a work or break session ends
    function handleSessionEnd() {
        console.log(`${currentSessionType} session ended.`);

        // Switch session type and set time remaining for the next session
        if (currentSessionType === 'work') {
            console.log("Work session ended. Automatically switching to break.");
            currentSessionType = 'break';
            timeRemaining = activeConfig.break * 60;
        } else { // currentSessionType === 'break'
            console.log("Break session ended. Automatically switching to work.");
            currentSessionType = 'work';
            timeRemaining = activeConfig.work * 60;
        }

        // Reset button text and state to 'Start' for the next session
        if (startPauseBtn) {
            startPauseBtn.textContent = 'Start';
            startPauseBtn.classList.remove('btn-warning', 'btn-secondary', 'btn-info');
            startPauseBtn.classList.add('btn-primary');
        } else console.warn("Start/Pause button (#startPauseBtn) not found in handleSessionEnd.");
        currentTimerState = 'stopped'; // Timer is stopped briefly between sessions

        // Update the display with the new session time
        updateDisplay();

        // Restore original document title
        document.title = originalDocumentTitle;

        // Automatically start the next session after a brief delay
        console.log(`Waiting 1 second before auto-starting next session (${currentSessionType}).`);
        setTimeout(() => {
            startTimer();
        }, 1000); // 1 second delay before auto-starting
    }

    // --- Focus Regain Functions ---

    // Starts the interval to track how long the timer is paused during a work session
    function startFocusRegainTimer() {
        console.log("startFocusRegainTimer called.");
        // Clear any existing regain interval
        clearInterval(focusRegainInterval);
        focusRegainInterval = null;
        // Reset paused duration counter
        pausedDuration = 0;
        console.log("Focus regain timer started...");

        // Start the interval to increment pausedDuration every second
        focusRegainInterval = setInterval(() => {
            pausedDuration++;
            // Update the display element within the modal if it exists
            const pausedDurationDisplayElement = document.getElementById('pausedDurationDisplay');
            if (pausedDurationDisplayElement) pausedDurationDisplayElement.textContent = formatTime(pausedDuration);
        }, 1000);
    }

    // Handles the user's choice in the Focus Regain modal (add time or discard)
    function handleFocusRegainAction(action) {
        console.log(`handleFocusRegainAction called with action: ${action}`);

        // Stop the focus regain timer immediately
        clearInterval(focusRegainInterval);
        focusRegainInterval = null;
        console.log("Focus regain timer stopped. Paused duration:", pausedDuration);

        // Perform action based on user choice
        if (action === 'add') {
            // Add the tracked paused duration back to the main timer
            timeRemaining += pausedDuration;
            console.log(`Added ${pausedDuration} seconds back. New time remaining: ${timeRemaining}`);
            updateDisplay(); // Update the main timer display
        } else { // action === 'discard' or modal closed manually
            console.log("Discarding paused time.");
        }
        pausedDuration = 0; // Reset paused duration counter

        // Hide the focus regain modal
        if (focusRegainModal) focusRegainModal.hide();
        else console.warn("Focus Regain Modal instance not found in handleFocusRegainAction. Cannot hide.");

        // Resume the main timer
        startTimer();
    }

    // --- Sidebar Toggle Functions ---

    // Opens the sidebar by adding the 'visible' class
    function openSidebar() {
        console.log("openSidebar called.");
        if (pomodoroSidebar) {
            pomodoroSidebar.classList.add('visible');
            console.log("Sidebar class 'visible' added.");
        } else {
            console.warn("Pomodoro Sidebar element (#pomodoroSidebar) not found for opening.");
        }
    }

    // Closes the sidebar by removing the 'visible' class
    function closeSidebar() {
        console.log("closeSidebar called.");
        if (pomodoroSidebar) {
            pomodoroSidebar.classList.remove('visible');
            console.log("Sidebar class 'visible' removed.");
        } else {
            console.warn("Pomodoro Sidebar element (#pomodoroSidebar) not found for closing.");
        }
    }

    // Function to reset confirmation modal text back to the default config change message/button texts
    function resetConfirmationModalText() {
        const modalBodyElement = confirmationModalElement.querySelector('.modal-body');
        // Set the default message for config change confirmation
        if (modalBodyElement) modalBodyElement.innerHTML = "Change configuration? This will reset the current timer.";
        const confirmProceedBtn = document.getElementById('confirmProceedBtn');
        // Set the default button text for config change confirmation
        if (confirmProceedBtn) confirmProceedBtn.textContent = "OK";
        const confirmCancelBtn = document.getElementById('confirmCancelBtn');
        // Set the default button text for config change cancellation
        if (confirmCancelBtn) confirmCancelBtn.textContent = "Cancel";
        console.log("Confirmation modal text reset to default.");
    }
// --- Configuration Management Functions ---

    // Renders the list of default and custom configurations in the sidebar
    function renderConfigs() {
        console.log("renderConfigs called.");
        // Check if the containers for the lists exist
        if (!defaultConfigsContainer) console.warn("Default Configs container (#defaultConfigs) not found.");
        if (!savedCustomConfigsContainer) {
            console.warn("Saved Custom Configs container (#savedCustomConfigs) not found. Cannot render custom configs.");
            return; // Cannot proceed if the custom container is missing
        }

        // Render Default Configs
        if (defaultConfigsContainer) {
            defaultConfigsContainer.innerHTML = ''; // Clear any existing content
            // Iterate through default configs and create HTML elements for each
            Object.keys(defaultConfigs).forEach(key => {
                const config = defaultConfigs[key];
                // Create a list item element using template literals
                // Removed the Edit button from Default Configs as requested
                const configElement = `
                    <div class="list-group-item list-group-item-dark d-flex justify-content-between align-items-center" data-config-id="${key}">
                        <div>
                            <h6 class="mb-1">${config.name || `Default ${config.work}`}</h6>
                            ${config.quote ? `<p class="mb-0 text-muted small fst-italic">${config.quote}</p>` : ''}
                            <small>${config.work} min work / ${config.break} min break</small>
                       
                `;
                // Add the created element to the default configs container
                defaultConfigsContainer.innerHTML += configElement;
            });
             console.log("Default configs rendered without edit buttons.");
        }

        // Render Saved Custom Configs
        savedCustomConfigsContainer.innerHTML = ''; // Clear any existing content

        // If there are no custom configs saved, display a message
        if (customConfigs.length === 0) {
             savedCustomConfigsContainer.innerHTML = '<p class="text-muted small">No custom configurations saved yet.</p>';
             console.log("No custom configs to render.");
        } else {
            // Iterate through custom configs and create HTML elements for each
            customConfigs.forEach((config, index) => {
                const configId = `custom-${index}`; // Create a unique ID for each custom config
                // Create a list item element with edit and delete buttons
                const configElement = `
                    <div class="list-group-item list-group-item-dark d-flex justify-content-between align-items-center" data-config-id="${configId}">
                        <div>
                            <h6 class="mb-1">${config.name || `Custom ${index + 1}`}</h6>
                            <small>${config.work} min work / ${config.break} min break</small>
                        </div>
                         <div>
                            // Edit button for custom configs
                            <button class="btn btn-outline-secondary btn-sm me-1 edit-config-btn" data-config-id="${configId}">Edit</button>
                            // Delete button for custom configs
                            <button class="btn btn-outline-danger btn-sm delete-config-btn" data-config-id="${configId}">Delete</button>
                         </div>
                    </div>
                `;
                // Add the created element to the custom configs container
                savedCustomConfigsContainer.innerHTML += configElement;
            });
             console.log("Custom configs rendered with indices:", customConfigs.map((_, i) => `custom-${i}`));
        }
    }

    // Loads custom configurations from localStorage
    function loadCustomConfigs() {
        console.log("loadCustomConfigs called.");
        try {
             // Get item from localStorage and parse it as JSON
             const saved = localStorage.getItem('customPomodoroConfigs');
             // Return parsed array or an empty array if nothing is saved
             const loadedConfigs = saved ? JSON.parse(saved) : [];
             console.log("Loaded custom configs:", loadedConfigs);
             return loadedConfigs;
        } catch (e) {
             console.error("Could not load custom configs from localStorage", e);
             // Return empty array on error to prevent script breaking
             return [];
        }
    }

    // Saves the current custom configurations array to localStorage
    function saveCustomConfigs() {
        console.log("saveCustomConfigs called.");
        try {
            // Convert the customConfigs array to a JSON string and save to localStorage
            localStorage.setItem('customPomodoroConfigs', JSON.stringify(customConfigs));
            console.log("Custom configs saved to localStorage.");
        } catch (e) {
            console.error("Could not save custom configs to localStorage", e);
            // Optional: Show a user-friendly error message (using a modal or temporary div)
            // alert("Error saving configurations. Please check browser settings."); // Example user feedback
        }
    }

    // Adds a new custom configuration based on input field values
    function addCustomConfig() {
        console.log("addCustomConfig called.");
        // Check if necessary input elements exist
        if (!customWorkTimeInput || !customBreakTimeInput || !customConfigNameInput) {
             console.warn("Missing custom config input elements.");
             alert("Error: Missing input fields for custom configuration."); // Use modal later for better UX
             return;
        }

        // Get values from input fields and parse numbers
        const work = parseInt(customWorkTimeInput.value);
        const breakTime = parseInt(customBreakTimeInput.value);
        const name = customConfigNameInput.value.trim(); // Trim whitespace from name

        // Basic validation for input values
        if (isNaN(work) || work <= 0 || isNaN(breakTime) || breakTime <= 0) {
            alert("Please enter valid positive numbers for work and break times."); // Use Bootstrap modal later
            console.warn("Invalid input values for adding custom config.");
            return;
        }

        // Check for duplicate config (same work, break, and name) before adding
        if (customConfigs.some(config => config.work === work && config.break === breakTime && config.name === name)) {
            alert("A configuration with these exact values and name already exists."); // Use Bootstrap modal later
            console.warn("Attempted to add a duplicate custom config.");
            return;
        }

        // Add the new config object to the customConfigs array
        customConfigs.push({ name: name, work: work, break: breakTime });
        saveCustomConfigs(); // Save the updated array to localStorage
        renderConfigs(); // Re-render the list in the sidebar to show the new config
        // Reset input fields after successful addition
        customWorkTimeInput.value = 30; // Reset to a default or empty string ''
        customBreakTimeInput.value = 5; // Reset to a default or empty string ''
        customConfigNameInput.value = ''; // Clear the name input
         console.log("Custom config added successfully:", { name, work, breakTime });
    }

    // Deletes a custom configuration by index
    function deleteCustomConfig(index) {
        console.log("deleteCustomConfig called for index:", index);
        // Check if the custom configs container exists
         if (!savedCustomConfigsContainer) {
             console.warn("Saved Custom Configs container (#savedCustomConfigs) not found. Cannot delete.");
             alert("Error: Cannot delete custom configs - list container not found."); // Use modal later
             return;
         }
         // Check for customConfigs array existing and index validity
         if (customConfigs && index >= 0 && index < customConfigs.length) {
             // Ask for user confirmation before deleting
             if (confirm("Are you sure you want to delete this configuration?")) { // Could use confirmation modal here too for consistency
                 // Remove the config from the array using splice
                 const deletedConfig = customConfigs.splice(index, 1);
                 saveCustomConfigs(); // Save the updated array to localStorage
                 renderConfigs(); // Re-render the list to reflect the deletion
                  console.log("Custom config deleted successfully at index:", index, deletedConfig);

                  // Handle case if the deleted config was the currently active one
                  // If active config matches the deleted one, reset to a default or first available
                  if (activeConfig && typeof activeConfig === 'object' && activeConfig.work === deletedConfig[0].work && activeConfig.break === deletedConfig[0].break && activeConfig.name === deletedConfig[0].name) {
                      console.log("Deleted config was the active one. Resetting to default.");
                      // Use a small delay to ensure renderConfigs has finished updating the DOM
                      setTimeout(() => {
                           // Set active config to a default after deletion if the active one was removed
                           // Check if 'default-25' exists as a fallback
                           const fallbackConfig = defaultConfigs['default-25'] || (customConfigs.length > 0 ? customConfigs[0] : { name: 'Default', work: 25, break: 5 });
                           setActiveConfig(fallbackConfig); // Reset to a default or first custom config
                      }, 50); // Short delay
                  }

             } else {
                  console.log("Config deletion cancelled by user.");
             }
         } else {
              console.error("Attempted to delete config with invalid index:", index, "Custom configs length:", customConfigs ? customConfigs.length : 'N/A');
              alert("Error: Invalid config selected for deletion."); // Use modal later
         }
    }

    // Function to set the active configuration and handle timer state transitions
    function setActiveConfig(config) {
        console.log("setActiveConfig called with config:", config);

        // Check if the selected config is already the active one
        if (activeConfig && typeof activeConfig === 'object' && activeConfig.work === config.work && activeConfig.break === config.break && activeConfig.name === config.name) {
            console.log("Selected config is already the active one. Doing nothing.");
            // Close the sidebar if it's open after selection (optional)
            // closeSidebar(); // Removed closing sidebar for active config click as requested
            return;
        }

        // Determine if the selected config is a default config by checking if its ID starts with 'default-'
        // This requires the click handler to pass the config ID or a flag.
        // A simpler way is to check if the config object exists in the defaultConfigs map.
        const isDefaultConfig = Object.values(defaultConfigs).some(defaultCfg =>
             // Compare relevant properties to find a match in default configs
             defaultCfg.work === config.work && defaultCfg.break === config.break && defaultCfg.name === config.name
        );


        // If the timer is running (work or break, running or paused), show confirmation modal
        // Also check if the confirmation modal instance was successfully initialized
        if (currentTimerState !== 'stopped' && confirmationModal) {
            // Store the selected config temporarily until user confirms
            pendingConfig = config;
             console.log("Timer running, showing confirmation modal for config change.");

            // Set the specific message for config change confirmation
            const modalBodyElement = confirmationModalElement.querySelector('.modal-body');
            if(modalBodyElement) modalBodyElement.innerHTML = `Change configuration to "${config.name || (config.work + '/' + config.break)}"? This will reset the current timer.`; // Include config name in message

            const confirmProceedBtn = document.getElementById('confirmProceedBtn');
            // Customize button text for config change confirmation
            if(confirmProceedBtn) confirmProceedBtn.textContent = "OK"; // Default button text
            else console.warn("Confirm Proceed button (#confirmProceedBtn) not found for config change modal.");

            const confirmCancelBtn = document.getElementById('confirmCancelBtn');
            // Customize button text for config change cancellation
            if(confirmCancelBtn) confirmCancelBtn.textContent = "Cancel"; // Default button text
            else console.warn("Confirm Cancel button (#confirmCancelBtn) not found for config change modal.");

            // Define local handlers for the confirmation modal buttons specific to config change
            const localHandleConfigConfirm = () => {
                console.log("Config change confirmed via modal (Local Handler).");
                // Hide the modal (also handled by 'once: true' listener below, but explicit is fine)
                if (confirmationModal) confirmationModal.hide();
                // Check for pendingConfig existing
                if (pendingConfig) {
                    // Apply the temporarily stored pending config
                    applyConfig(pendingConfig);
                    console.log("Config applied by user via modal (Local Handler).");
                } else {
                   console.warn("Config change confirmed but no pending config found.");
                }
                // Note: Listeners attached with 'once: true' don't need explicit removal here.
            };

            const localHandleConfigCancel = () => {
                 console.log("Config change cancelled via modal (Local Handler).");
                 // Hide the modal (also handled by 'once: true' listener below, but explicit is fine)
                 if (confirmationModal) confirmationModal.hide();
                 // Clear the pending config as the action was cancelled
                 pendingConfig = null;
                 console.log("Pending config cleared due to cancellation (Local Handler).");
                 // Reset modal text back to the default config change message/buttons
                 resetConfirmationModalText();
                 // Note: Listeners attached with 'once: true' don't need explicit removal here.
            };

            // Attach these specific handlers using { once: true } to ensure they are removed after one click
            if(confirmProceedBtn) confirmProceedBtn.addEventListener('click', localHandleConfigConfirm, { once: true });
            if(confirmCancelBtn) confirmCancelBtn.addEventListener('click', localHandleConfigCancel, { once: true });
            // Handle manual close of the modal (e.g., clicking outside or pressing Esc) while config change is pending
            // Attach this using { once: true } as well, linked to the cancel action
            if(confirmationModalElement) confirmationModalElement.addEventListener('hidden.bs.modal', localHandleConfigCancel, { once: true });


            // Show the confirmation modal
            confirmationModal.show(); // Show the modal AFTER attaching listeners

        } else {
            // If the timer is stopped or modal isn't initialized, apply the config directly without confirmation
            console.log("Timer stopped or no modal needed. Applying config directly.");
            applyConfig(config);
             // Only close the sidebar if it's NOT a default config being applied
             // This addresses issue 5: sidebar closing on default preset click
             if (!isDefaultConfig) {
                 closeSidebar();
             } else {
                 console.log("Selected config is a default preset, sidebar will not close.");
             }
        }
         // Sidebar closing for custom config selection or after confirmation for running timer is handled within the if/else blocks now.
    }

    // Function to apply the selected configuration to the timer
    function applyConfig(config) {
        console.log("applyConfig called with config:", config);
        // TODO: Add visual indication of the active config in the list (Add 'active-config' class)
        // This would involve finding the list item with the matching data-config-id and adding a CSS class to it.

        // Update the activeConfig state variable
        activeConfig = { name: config.name, work: config.work, break: config.break }; // Store full config object

        // Stop and reset the timer based on the NEW active config
        stopTimer(); // stopTimer handles resetting timeRemaining and display based on activeConfig.work
        // timeRemaining is set inside stopTimer() based on activeConfig.work
        // updateDisplay() is called inside stopTimer()
        console.log("Configuration applied:", activeConfig);

        // Clear the pending config variable after applying
        pendingConfig = null;

        // If the edit form is open, close it after applying a config (in case someone applied a config while editing another)
        if (editConfigForm && editConfigForm.style.display !== 'none') {
            cancelEditingConfig();
        }
        // Reset confirmation modal text back to its default message/button texts
        resetConfirmationModalText();
    }

    // Functionality for editing configurations

    // Shows the edit config form and populates it with the selected config's details
    function startEditingConfig(configId) {
        console.log("startEditingConfig called for configId:", configId);
        // Check if all necessary edit form elements are available
        if (!editConfigForm || !editingConfigIdInput || !editWorkTimeInput || !editBreakTimeInput || !editConfigNameInput || !saveConfigBtn || !cancelEditBtn) {
             console.warn("Missing edit config form elements. Cannot start editing.");
             alert("Error: Missing edit form fields."); // Use modal later for better UX
             return; // Exit if elements are missing
        }

        let configToEdit = null; // Variable to hold the config object being edited
        let isDefault = false; // Flag to indicate if it's a default config


        // Find the config to edit based on the configId
        if (configId.startsWith('default-')) {
            // If it's a default config
             configToEdit = defaultConfigs[configId];
             isDefault = true;
             // Default configs cannot be saved, so hide the save button
             if(saveConfigBtn) saveConfigBtn.style.display = 'none';
             // Default config names and times cannot be edited directly via this form
             if(editConfigNameInput) editConfigNameInput.disabled = true;
             if(editWorkTimeInput) editWorkTimeInput.disabled = true;
             if(editBreakTimeInput) editBreakTimeInput.disabled = true;
             console.log("Editing Default Config:", configId, configToEdit);

             // Hide the edit form for default configs as they are not editable
             if(editConfigForm) editConfigForm.style.display = 'none';
             console.warn("Attempted to open edit form for a default config. Form is hidden.");
             alert("Default configurations cannot be edited."); // Inform user
             return; // Exit the function as default configs are not editable


        } else if (configId.startsWith('custom-')) {
            // If it's a custom config
             const index = parseInt(configId.replace('custom-', '')); // Extract index from ID
             // Check if customConfigs array exists and the index is valid
             if (customConfigs && index >= 0 && index < customConfigs.length) {
                configToEdit = customConfigs[index]; // Get the config object from the array
                isDefault = false; // It's a custom config
                // Custom configs CAN be saved, show the save button
                if(saveConfigBtn) saveConfigBtn.style.display = ''; // Use empty string to reset to default display (block or inline-block)
                // Custom config names and times CAN be edited
                if(editConfigNameInput) editConfigNameInput.disabled = false;
                if(editWorkTimeInput) editWorkTimeInput.disabled = false;
                if(editBreakTimeInput) editBreakTimeInput.disabled = false;
                console.log("Editing Custom Config:", configId, configToEdit);

             } else {
                console.error("Custom config not found in array for editing:", index);
                alert("Error: Custom config not found."); // Use modal later
                return; // Exit if custom config not found or index is invalid
             }
        } else {
             // Handle invalid config ID format
             console.warn("Invalid config ID format for editing:", configId);
             alert("Error: Invalid configuration selected for editing."); // Use modal later
             return; // Exit if ID format is wrong
        }


        // If a configToEdit was found (only custom configs reach here now)
        if (configToEdit) {
            // Populate the edit form fields with the config's data
             if(editingConfigIdInput) editingConfigIdInput.value = configId; // Store the ID for saving
             if(editWorkTimeInput) editWorkTimeInput.value = configToEdit.work;
             if(editBreakTimeInput) editBreakTimeInput.value = configToEdit.break;
             // Use || '' to ensure the name input is cleared if the config name is undefined/null
             if(editConfigNameInput) editConfigNameInput.value = configToEdit.name || '';

            // Show the edit form by changing its display style
            if(editConfigForm) editConfigForm.style.display = 'block'; // Set to 'block' to make it visible
            console.log("Edit form shown for config:", configToEdit);

             // TODO: Add visual indication that editing is active (e.g., highlight the list item)

        } else {
             // This else block should ideally not be reached if the checks above are correct,
             // but including it as a fallback.
             console.error("ConfigToEdit is null after lookup, despite ID check.");
        }
    }

    // Saves the changes made in the edit config form to the customConfigs array
    function saveEditedConfig() {
       console.log("saveEditedConfig called.");
        // Check if necessary edit form elements exist for saving
       if (!editConfigForm || !editingConfigIdInput || !editWorkTimeInput || !editBreakTimeInput || !editConfigNameInput) {
            console.warn("Missing edit config form elements for saving. Cannot save.");
            alert("Error: Missing edit form fields."); // Use modal later
            return; // Exit if elements are missing
       }

       // Get the config ID and values from the edit form inputs
       const configId = editingConfigIdInput.value;
       const work = parseInt(editWorkTimeInput.value);
       const breakTime = parseInt(editBreakTimeInput.value);
       const name = editConfigNameInput.value.trim(); // Trim whitespace from name


        // Basic validation for input values (must be positive numbers)
        if (isNaN(work) || work <= 0 || isNaN(breakTime) || breakTime <= 0) {
            alert("Please enter valid positive numbers for work and break times."); // Use Bootstrap modal later
            console.warn("Invalid input values for saving config.");
            return; // Exit if validation fails
        }

       // Only allow saving for custom configurations
       if (configId.startsWith('custom-')) {
            const index = parseInt(configId.replace('custom-', '')); // Extract index from ID
             // Check if customConfigs array exists and the index is valid
             if (customConfigs && index >= 0 && index < customConfigs.length) {
                 // Check if the updated config duplicates an *existing* custom config (excluding the one being edited)
                 const isDuplicate = customConfigs.some((config, i) =>
                     i !== index && config.work === work && config.break === breakTime && config.name === name
                 );

                 if (isDuplicate) {
                     alert("A custom configuration with these values and name already exists."); // Use modal
                     console.warn("Attempted to save a duplicate custom config.");
                     return; // Exit if it's a duplicate
                 }

                 // Update the config object in the customConfigs array with the new values
                 customConfigs[index].work = work;
                 customConfigs[index].break = breakTime;
                 customConfigs[index].name = name;

                 saveCustomConfigs(); // Save the updated array to localStorage
                 renderConfigs(); // Re-render the list to show the updated config details
                 console.log("Custom config updated successfully:", customConfigs[index]);

                 // If the updated config was the currently active one, update the timer display
                 // This applies the visual and functional changes immediately without resetting the timer entirely
                 // unless the user clicks 'Start' again.
                  if (activeConfig && typeof activeConfig === 'object' && activeConfig.work === customConfigs[index].work && activeConfig.break === customConfigs[index].break && activeConfig.name === customConfigs[index].name) {
                       console.log("Updated custom config is the active one. Applying changes.");
                       // Update the active config object with the new values
                       activeConfig = { ...customConfigs[index] }; // Create a new object to ensure reactivity if needed elsewhere
                       // Re-set the time remaining based on the potentially new work time
                       // Note: This will reset the current session duration if it was running
                       timeRemaining = activeConfig.work * 60;
                       updateDisplay(); // Update the timer display
                       console.log("Active config updated to:", activeConfig);
                       // If the timer was running, you might need to decide if it should stop or continue with the new duration.
                       // Current logic in applyConfig stops and resets. Here we just update display.
                       // A more complex approach might ask the user.
                   }


            } else {
                 console.error("Custom config not found for saving:", index);
                 alert("Error: Config to edit not found."); // Use modal later
            }
       } else if (configId.startsWith('default-')) {
           // Prevent saving if it's a default config (should have been disabled in UI but good to check)
           console.warn("Attempted to save a default config edit. This action is not allowed.");
           alert("Cannot save default configurations."); // Use modal later
       } else {
            // Handle attempt to save with an invalid config ID format
            console.warn("Save attempted with invalid config ID format:", configId);
            alert("Error: Invalid configuration ID for saving."); // Use modal later
       }
        // Close the edit form after attempting to save
        cancelEditingConfig();
    }

    // Hides the edit config form
    function cancelEditingConfig() {
        console.log("cancelEditingConfig called.");
        // Optional: You might want to reset the input values here in case the user cancels after editing
        // if(editWorkTimeInput) editWorkTimeInput.value = '';
        // if(editBreakTimeInput) editBreakTimeInput.value = '';
        // if(editConfigNameInput) editConfigNameInput.value = '';

        // Hide the edit form by setting its display style to 'none'
        if (editConfigForm) editConfigForm.style.display = 'none';
         console.log("Edit form hidden.");
    }
    // --- Music Mode Functions ---

    // Extracts YouTube video or playlist ID and type from a given URL
    function getYouTubeIdAndType(url) {
        console.log("Attempting to extract YouTube ID and Type from:", url);
        let id = null;
        let type = null;
        let match;

        // Regex for standard YouTube video URLs (watch?v=, embed/, v/, shorts/, track/)
        const videoRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be|music\.youtube\.com)\/(?:watch\?v=|embed\/|v\/|shorts\/|track\/)?([a-zA-Z0-9_-]+)(?:&.*)?(?:#t=\d+)?/;
        match = url.match(videoRegex);
        if (match && match[1]) {
            id = match[1];
            type = 'video';
            console.log(`Extracted video ID: ${id} from URL: ${url}`);
            return { type: type, id: id };
        }

        // Regex for YouTube playlist URLs (playlist?list=)
        const playlistRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be|music\.youtube\.com)\/(?:playlist\?list=)([\w-]+)(?:&.*)?/;
        match = url.match(playlistRegex);
        if (match && match[1]) {
            id = match[1];
            type = 'playlist';
            console.log(`Extracted playlist ID: ${id} from URL: ${url}`);
            return { type: type, id: id };
        }

        // If no match is found for video or playlist
        console.warn("Could not extract valid YouTube video or playlist ID from URL:", url);
        return { type: null, id: null };
    }

    // Loads YouTube content (video or playlist) into the player
    function loadYouTubeContent(id, type) {
        console.log(`Loading YouTube content. Type: ${type}, ID: ${id}`);
        // Get necessary elements inside this function scope as well, or pass them
        const youtubePlayerDiv = document.getElementById('youtube-player');
         const musicInputSectionContainer = document.getElementById('youtubeLinkInput')?.parentElement?.closest('div');
         const loadButtonAndOldControlsContainer = document.getElementById('loadMusicBtn')?.parentElement;
         const musicPlayerDisplay = document.getElementById('musicPlayerDisplay');
         // const currentTrackInfo = document.getElementById('currentTrackInfo'); // The "Now playing" paragraph (keeping visible)


        // Check if the YouTube API and the player div are available
        if (typeof YT === 'undefined' || typeof YT.Player === 'undefined' || !youtubePlayerDiv) {
            console.warn("YouTube API or player div not ready. Cannot load content.");
             // Show input/load button and hide player display on error
             if (musicInputSectionContainer) musicInputSectionContainer.style.display = 'block';
             if (loadButtonAndOldControlsContainer) loadButtonAndOldControlsContainer.style.display = ''; // Reset to default display
             if (musicPlayerDisplay) musicPlayerDisplay.style.display = 'none';
             // if (currentTrackInfo) currentTrackInfo.style.display = 'none'; // Hide "Now playing:" text on error

            // Update the new music player display with an error message
            const trackTitleNew = document.getElementById('musicPlayerDisplay')?.querySelector('#trackTitle');
             if (trackTitleNew) trackTitleNew.textContent = 'Music Player Unavailable';

            // const musicControls = document.querySelector('.music-controls'); // Old controls div
            // if (musicControls) musicControls.style.display = 'none'; // Hide old controls

            return; // Exit the function if requirements are not met
        }

        // If a player instance already exists, destroy it before creating a new one
        if (player) {
            console.log("Existing player found. Destroying old player.");
            player.destroy(); // Destroy the old player instance
            player = null; // Nullify the global player variable
        }

        // Create a new YouTube Player instance
        player = new YT.Player('youtube-player', {
            height: '0', // Keep the iframe hidden
            width: '0', // Keep the iframe hidden
            // Specify content based on type (videoId for video, list/listType for playlist)
            videoId: type === 'video' ? id : undefined,
            list: type === 'playlist' ? id : undefined,
            listType: type === 'playlist' ? 'playlist' : undefined,
            // Player parameters for customization
            playerVars: {
                'autoplay': 1, // Autoplay the content
                'controls': 0, // Hide default controls
                'disablekb': 1, // Disable keyboard controls
                'fs': 0, // Disable fullscreen button
                'iv_load_policy': 3, // Hide video annotations
                'modestbranding': 1, // Hide YouTube logo (partially)
                'rel': 0, // Do not show related videos at the end
                'showinfo': 0, // Hide video title and uploader info (deprecated, but good practice)
                 'origin': window.location.origin // Added origin for potential security reasons
            },
            // Event listeners for player state changes
            events: {
                'onReady': onPlayerReady, // Called when player is ready
                'onStateChange': onPlayerStateChange, // Called when player state changes (playing, paused, etc.)
                'onError': onPlayerError // Called when an error occurs
            }
        });
        console.log("New YouTube Player instance creation requested.");

         // --- Update UI visibility immediately after requesting player creation ---
         // Hide the input and load button section
         if (musicInputSectionContainer) musicInputSectionContainer.style.display = 'none';
         // Hide the container holding the load button, old controls div, and the iframe (which we will keep hidden anyway)
         if (loadButtonAndOldControlsContainer) loadButtonAndOldControlsContainer.style.display = 'none'; // Hides load button and old controls div
         // Keep the "Now playing:" paragraph visible as requested
         // if (currentTrackInfo) currentTrackInfo.style.display = 'block'; // Ensure it's visible if it was hidden initially

         // Show the new music player display container
         if (musicPlayerDisplay) musicPlayerDisplay.style.display = 'flex'; // Set to 'flex' (or 'block') to make it visible

        // Update the new track title element with a loading message while content is buffering/loading
        const trackTitleNew = document.getElementById('musicPlayerDisplay')?.querySelector('#trackTitle');
        const trackArtist = document.getElementById('musicPlayerDisplay')?.querySelector('#trackArtist');
        const albumArt = document.getElementById('musicPlayerDisplay')?.querySelector('#albumArt');


        if (trackTitleNew) trackTitleNew.textContent = `Loading ${type || 'content'} info...`;
         if (trackArtist) trackArtist.textContent = ''; // Clear previous artist while loading
         if (albumArt) albumArt.style.display = 'none'; // Hide album art while loading or until ready


    }

    // Function called when the YouTube player is ready to play
    function onPlayerReady(event) {
        console.log("YouTube Player is ready.");
        // Attempt to play the video/playlist. Use catch for potential autoplay blocking by browsers.
        event.target.playVideo().catch(error => {
            console.warn("Autoplay prevented:", error);
             // Update the new player display to indicate it's ready but needs user interaction
             const musicPlayerDisplay = document.getElementById('musicPlayerDisplay');
             const trackTitleNew = musicPlayerDisplay ? musicPlayerDisplay.querySelector('#trackTitle') : null;
             const trackArtist = musicPlayerDisplay ? musicPlayerDisplay.querySelector('#trackArtist') : null;
             const playPauseMusicBtn = document.getElementById('playPauseMusicBtn'); // Get the new button

             if (trackTitleNew) trackTitleNew.textContent = 'Ready to play (click play)';
             if (trackArtist) trackArtist.textContent = ''; // Clear artist
             // Set the play icon since autoplay failed
             if (playPauseMusicBtn) playPauseMusicBtn.innerHTML = '<i class="bi bi-play-fill"></i>'; // Set play icon

              // Attempt to get and display track info even if autoplay failed
              if (player && player.getVideoData) {
                  const videoData = player.getVideoData();
                  const videoId = videoData.video_id; // Correct way to get video ID after player ready
                  const isPlaylist = player.getPlaylistId && player.getPlaylistId();
                  updateMusicPlayerDisplay(videoData, videoId, isPlaylist); // Update the new display with available data
              } else {
                   console.warn("Player or video data not available immediately after player ready.");
              }
        });

         // Update the new player display with video data immediately on ready
         // This is important to show the correct info even if autoplay succeeds
         if (player && player.getVideoData) {
             const videoData = player.getVideoData(); // Get video data
             const videoId = videoData.video_id; // Get video ID
             const isPlaylist = player.getPlaylistId && player.getPlaylistId(); // Check if it's a playlist

             updateMusicPlayerDisplay(videoData, videoId, isPlaylist); // Update the new player display

         } else console.warn("Player or video data not available on ready.");

    }

    // Function called when the YouTube player's state changes (playing, paused, ended, etc.)
    function onPlayerStateChange(event) {
        console.log("YouTube Player state changed:", event.data);
        const playPauseMusicBtn = document.getElementById('playPauseMusicBtn'); // Get the new play/pause button

        // Update the play/pause button icon based on the player state
        if (playPauseMusicBtn) {
            if (event.data === YT.PlayerState.PLAYING) {
                playPauseMusicBtn.innerHTML = '<i class="bi bi-pause-fill"></i>'; // Show pause icon when playing
            } else {
                playPauseMusicBtn.innerHTML = '<i class="bi bi-play-fill"></i>'; // Show play icon otherwise (paused, ended, buffering, cued, unstarted)
            }
        } else console.warn("Play/Pause Music button (#playPauseMusicBtn) not found on state change.");


        // Update track info on state change if necessary (e.g., playlist changing tracks)
        // This is crucial for playlists to show the currently playing track's info
        if (event.data === YT.PlayerState.PLAYING || event.data === YT.PlayerState.BUFFERING || event.data === YT.PlayerState.CUED) {
            if (player && player.getVideoData) {
                 const videoData = player.getVideoData(); // Get video data
                 const videoId = videoData.video_id; // Get video ID
                 const isPlaylist = player.getPlaylistId && player.getPlaylistId(); // Check if it's a playlist
                 updateMusicPlayerDisplay(videoData, videoId, isPlaylist); // Update the new display with the latest info

            } else console.warn("Player or video data not available on playing/buffering/cued state change.");
        }

        // Handle video or playlist ending
        if (event.data === YT.PlayerState.ENDED) {
            console.log("Content ended.");
             // Check if the currently playing content is part of a playlist
             const isPlaylist = player.getPlaylistId && player.getPlaylistId();
             if (!isPlaylist) {
                 // If it's a single video and not a playlist, loop it
                 console.log("Single video ended. Looping.");
                 player.seekTo(0); // Seek to the beginning
                 player.playVideo().catch(error => console.error("Failed to loop video:", error)); // Play the video again
             } else {
                 // If it's a playlist, the API automatically goes to the next video (if available)
                 console.log("Playlist track ended. YouTube API will handle next track if available.");
                 // You might want to trigger a display update shortly after the track ends,
                 // as the next track starts buffering/playing. The state change listeners above
                 // (`PLAYING`, `BUFFERING`, `CUED`) should also trigger updates, but a small delay
                 // here can act as a fallback or ensure the update happens after the API cues the next video.
                 setTimeout(() => {
                      if (player && player.getVideoData) {
                          const videoData = player.getVideoData();
                          const videoId = videoData.video_id;
                          updateMusicPlayerDisplay(videoData, videoId, true); // Update display for the next track
                      }
                 }, 200); // Small delay to allow API to get next video data
             }
        }
    }

    // Function called when the YouTube player encounters an error
    function onPlayerError(event) {
        console.error("YouTube Player error:", event.data);
        let errorMessage = `Youtubeer Error: ${event.data}`; // Default error message

         // Get necessary elements to update the display
         const musicPlayerDisplay = document.getElementById('musicPlayerDisplay');
         const trackTitleNew = musicPlayerDisplay ? musicPlayerDisplay.querySelector('#trackTitle') : null;
         const trackArtist = musicPlayerDisplay ? musicPlayerDisplay.querySelector('#trackArtist') : null;
         const albumArt = musicPlayerDisplay ? musicPlayerDisplay.querySelector('#albumArt') : null;
         const playPauseMusicBtn = document.getElementById('playPauseMusicBtn'); // Get the new button
         const musicInputSectionContainer = document.getElementById('youtubeLinkInput')?.parentElement?.closest('div');
         const loadButtonAndOldControlsContainer = document.getElementById('loadMusicBtn')?.parentElement;
         // const currentTrackInfo = document.getElementById('currentTrackInfo'); // The "Now playing:" paragraph (keeping visible)


        // Provide more specific error messages based on the error code
        switch(event.data) {
            case 2:
                errorMessage = "Invalid video ID or URL. Please check the link.";
                break;
            case 100:
                errorMessage = "Video not found. It may have been removed.";
                break;
            case 101:
            case 150:
                errorMessage = "Video cannot be played. Embedding is disabled for this content.";
                // If it's a playlist and a video fails, try to skip to the next track
                const isPlaylist = player && player.getPlaylistId && player.getPlaylistId();
                if (isPlaylist) {
                    console.log("Error in playlist video. Attempting to play next track.");
                    if (player && typeof player.nextVideo === 'function') {
                        player.nextVideo(); // Skip the problematic video
                        // The state change listener should update the display for the next track
                        return; // Exit error handling for this case as we're moving to the next
                    } else {
                        console.warn("Cannot skip to next video in playlist: player or nextVideo method not available.");
                    }
                }
                break;
            case 5:
                 errorMessage = "Error playing content. Please try again."; // Generic playback error
                 break;
            default:
                // Use the default error message for unknown errors
                errorMessage = `YouTube Error: ${event.data}`;
                break;
        }

         // Display the error message in the new player display area
         if (trackTitleNew) trackTitleNew.textContent = errorMessage;
         if (trackArtist) trackArtist.textContent = ''; // Clear artist field on error
         if (albumArt) albumArt.style.display = 'none'; // Hide album art on error
         if (playPauseMusicBtn) playPauseMusicBtn.innerHTML = '<i class="bi bi-play-fill"></i>'; // Set play icon on error (as playback failed)

         console.error(`Youtubeer error handled: ${errorMessage}`);

         // Optionally hide the player and show the input again on critical errors
         // This could be done here if you want the user to re-enter a link after certain errors
         // if (musicPlayerDisplay) musicPlayerDisplay.style.display = 'none';
         // if (musicInputSectionContainer) musicInputSectionContainer.style.display = 'block';
         // if (loadButtonAndOldControlsContainer) loadButtonAndOldControlsContainer.style.display = '';
         // if (currentTrackInfo) currentTrackInfo.style.display = 'none'; // Hide "Now playing:" text on error

         // Destroy the player instance on error if it wasn't a skippable playlist error
         // Check if player exists and has a destroy method before calling
         if (player && typeof player.destroy === 'function') {
             try {
                player.destroy();
                player = null; // Nullify the global player variable
                console.warn("YouTube Player destroyed due to error.");
             } catch (e) {
                 console.error("Error destroying player after error:", e);
             }
         }
    }

    // Toggles between playing and pausing the music player
    function togglePlayPauseMusic() {
        console.log("Toggle Music Play/Pause clicked.");
        // Check if the player instance exists and is ready
        if (player && typeof player.getPlayerState === 'function') {
            const state = player.getPlayerState(); // Get the current player state

            // Perform action based on current state
            if (state === YT.PlayerState.PLAYING) {
                console.log("Pausing content.");
                player.pauseVideo(); // Pause the video/playlist
            } else if (state === YT.PlayerState.PAUSED || state === YT.PlayerState.ENDED || state === YT.PlayerState.BUFFERING) {
                console.log("Playing content.");
                player.playVideo().catch(error => console.error("Failed to play content:", error)); // Play the video/playlist, catch potential errors
            } else if (state === YT.PlayerState.CUED) {
                 console.log("Content is cued, attempting to play.");
                 player.playVideo().catch(error => console.error("Failed to play content from cued state:", error)); // Play cued content
            } else if (state === -1) { // Unstarted state
                 console.log("Player state is unstarted, attempting to load/play content.");
                 // If the player is unstarted but there's a link in the input, try loading it again
                 const youtubeLinkInput = document.getElementById('youtubeLinkInput');
                 if (youtubeLinkInput && youtubeLinkInput.value.trim()) {
                      console.log("Input has link, attempting to handleLoadMusic.");
                      handleLoadMusic(); // Try loading the content from the input
                 } else {
                      console.warn("Player unstarted, but no link in input to load.");
                 }
            }
            else {
                // Handle other potential states where playback isn't straightforward
                console.warn("YouTube Player is not in a standard playable state. Current state:", state);
            }
        } else {
            // If the player is not ready or doesn't exist, log a warning
            console.warn("YouTube Player is not ready or not found. Cannot toggle playback.");
             // If player is not ready but input has a link, maybe try loading it on click?
             const youtubeLinkInput = document.getElementById('youtubeLinkInput');
             if (youtubeLinkInput && youtubeLinkInput.value.trim()) {
                 console.log("Player not found/ready, attempting to load content on play click.");
                 handleLoadMusic(); // Try loading the content if a link is available
             } else {
                  console.warn("Cannot toggle playback: Player not ready and no link available.");
             }
        }
    }

    // Handles the click event on the "Load that track!" button or Enter key in the input field
    function handleLoadMusic() {
        console.log("Load Music button clicked.");
        // Get necessary elements within the function scope
        const youtubeLinkInput = document.getElementById('youtubeLinkInput');
        const musicInputSectionContainer = youtubeLinkInput ? youtubeLinkInput.parentElement?.closest('div') : null;
        const loadButtonAndOldControlsContainer = document.getElementById('loadMusicBtn')?.parentElement;
        const musicPlayerDisplay = document.getElementById('musicPlayerDisplay');
        // const currentTrackInfo = document.getElementById('currentTrackInfo'); // The "Now playing:" paragraph (keeping visible)


        // Check if the input field exists
        if (youtubeLinkInput) {
            const url = youtubeLinkInput.value.trim(); // Get the URL from the input, trimming whitespace
            // Check if a URL was entered
            if (url) {
                // Attempt to extract ID and type (video/playlist) from the URL
                const youtubeContent = getYouTubeIdAndType(url);
                // If ID and type were successfully extracted
                if (youtubeContent && youtubeContent.id && youtubeContent.type) {
                    // Load the YouTube content into the player
                    loadYouTubeContent(youtubeContent.id, youtubeContent.type);
                    console.log(`Attempting to load YouTube content with Type: ${youtubeContent.type}, ID: ${youtubeContent.id}`);

                    // --- Update UI visibility after successful extraction and attempting to load ---
                     // Hide the input field and its label container
                     if (musicInputSectionContainer) musicInputSectionContainer.style.display = 'none';
                     // Hide the container holding the load button, old controls, and iframe
                     if (loadButtonAndOldControlsContainer) loadButtonAndOldControlsContainer.style.display = 'none'; // Hides load button and old controls div
                     // Keep the "Now playing:" paragraph visible as requested
                     // if (currentTrackInfo) currentTrackInfo.style.display = 'block'; // Ensure it's visible if it was hidden initially

                     // Show the new music player display container
                     if (musicPlayerDisplay) musicPlayerDisplay.style.display = 'flex'; // Set to 'flex' (or 'block') to make it visible
                     // Clear the input field after loading
                     youtubeLinkInput.value = '';

                } else {
                    // If extraction failed (invalid URL format)
                    alert("Invalid YouTube video or playlist link. Please enter a valid URL."); // Provide feedback to user
                    console.warn("Invalid YouTube link entered:", url);
                     // Ensure input/load is visible and player is hidden on invalid input
                     if (musicInputSectionContainer) musicInputSectionContainer.style.display = 'block'; // Show input again
                     if (loadButtonAndOldControlsContainer) loadButtonAndOldControlsContainer.style.display = ''; // Show load button again
                     if (musicPlayerDisplay) musicPlayerDisplay.style.display = 'none'; // Hide the new player display
                     // if (currentTrackInfo) currentTrackInfo.style.display = 'none'; // Hide "Now playing:" text on invalid input
                }
            } else {
                // If the input field is empty
                alert("Please enter a YouTube link."); // Provide feedback to user
                console.warn("No YouTube link entered.");
                 // Ensure input/load is visible and player is hidden on empty input
                 if (musicInputSectionContainer) musicInputSectionContainer.style.display = 'block'; // Show input again
                 if (loadButtonAndOldControlsContainer) loadButtonAndOldControlsContainer.style.display = ''; // Show load button again
                 if (musicPlayerDisplay) musicPlayerDisplay.style.display = 'none'; // Hide the new player display
                 // if (currentTrackInfo) currentTrackInfo.style.display = 'none'; // Hide "Now playing:" text on empty input
            }
        } else console.warn("YouTube link input (#youtubeLinkInput) not found in handleLoadMusic.");
    }


    // --- Helper functions for updating music player display ---
    // Updates the elements within the new music player display based on video data
    function updateMusicPlayerDisplay(videoData, videoId, isPlaylist) {
        console.log("updateMusicPlayerDisplay called with video data:", videoData);
        // Get references to the display elements
        const musicPlayerDisplay = document.getElementById('musicPlayerDisplay');
        const albumArt = musicPlayerDisplay ? musicPlayerDisplay.querySelector('#albumArt') : null;
        const trackTitleNew = musicPlayerDisplay ? musicPlayerDisplay.querySelector('#trackTitle') : null;
        const trackArtist = musicPlayerDisplay ? musicPlayerDisplay.querySelector('#trackArtist') : null;
        // const playPauseMusicBtn = document.getElementById('playPauseMusicBtn'); // Get the new button (already defined globally or in DOMContentLoaded scope)


        // Check if all necessary display elements were found
        if (!musicPlayerDisplay || !albumArt || !trackTitleNew || !trackArtist) { // Removed playPauseMusicBtn as it's used elsewhere
            console.warn("Music player display elements not found. Cannot update display.");
            return; // Exit if elements are missing
        }

        // Clear previous info or set loading state initially
        if (trackTitleNew) trackTitleNew.textContent = 'Loading...'; // Set a loading text
        if (trackArtist) trackArtist.textContent = ''; // Clear previous artist
        if (albumArt) albumArt.style.display = 'none'; // Hide album art until new art is loaded


        // If video data is available, update the title and artist
        if (videoData && videoData.title) {
            trackTitleNew.textContent = videoData.title; // Set the track title
             // YouTube API doesn't directly provide a clear 'artist'. Often, the author is the channel name.
             // We use author as a proxy for artist, or default to 'Unknown Artist'.
             trackArtist.textContent = videoData.author || 'Unknown Artist'; // Set the track artist/author

            console.log(`Updated new player display: Title="${trackTitleNew.textContent}", Artist="${trackArtist.textContent}"`);

            // Set album art (thumbnail) based on video ID
            if (videoId) {
                // Construct the thumbnail URL using the video ID
                // Using 'hqdefault.jpg' for high quality, or 'maxresdefault.jpg' for highest available (might not exist for all videos)
                const thumbnailUrl = `http://img.youtube.com/vi/${videoId}/hqdefault.jpg`; // Corrected base URL
                 if (albumArt) {
                     albumArt.src = thumbnailUrl; // Set the image source
                     // Add an error handler for the image in case the thumbnail URL is invalid or image is missing
                     albumArt.onerror = () => {
                         // Use your default album art image if the YouTube thumbnail fails to load
                         // Make sure STATIC_URL is accessible here (defined globally in base.html)
                         if (typeof STATIC_URL !== 'undefined') {
                             albumArt.src = STATIC_URL + 'pomodoro/default_album_art.png'; // Path to your default image
                             console.warn("Failed to load YouTube thumbnail, using default.", thumbnailUrl);
                         } else {
                             console.error("STATIC_URL is not defined. Cannot load default album art.");
                             // Optionally hide the image element if default can't load either
                             // albumArt.style.display = 'none';
                         }
                     };
                    albumArt.style.display = 'block'; // Ensure the image element is visible
                    console.log("Set album art src:", thumbnailUrl);
                 }


            } else {
                 // If videoId is not available, use the default album art
                 if (albumArt) {
                    if (typeof STATIC_URL !== 'undefined') {
                       albumArt.src = STATIC_URL + 'pomodoro/default_album_art.png'; // Default image if no video ID
                        albumArt.style.display = 'block'; // Ensure the image element is visible
                    } else {
                        console.error("STATIC_URL is not defined. Cannot load default album art when videoId is missing.");
                         // Optionally hide the image element
                         // albumArt.style.display = 'none';
                    }
                 }
                 console.warn("Could not set album art: videoId not available.");
            }

        } else {
            // If video data or title is not available, set placeholder text
            trackTitleNew.textContent = isPlaylist ? 'Playlist Track' : 'Unknown Title';
             trackArtist.textContent = 'Unknown Artist';
            console.warn("Could not get video data or title to update new player display.");
             // Use the default album art if data is missing
             if (albumArt) {
                if (typeof STATIC_URL !== 'undefined') {
                   albumArt.src = STATIC_URL + 'pomodoro/default_album_art.png'; // Default image
                    albumArt.style.display = 'block'; // Ensure visible
                } else {
                   console.error("STATIC_URL is not defined. Cannot load default album art when video data is missing.");
                    // Optionally hide the image element
                    // albumArt.style.display = 'none';
                }
             }
        }

         // The play/pause icon is updated by the onPlayerStateChange listener,
         // which is triggered when the player state changes (e.g., from loading to playing).
         // No need to explicitly set it here unless setting an initial state (e.g., play icon).

    }
    // --- Event Listeners (Continued from previous parts) ---

    // Timer Control Event Listeners
    if (startPauseBtn) {
        startPauseBtn.addEventListener('click', () => {
            console.log("Start/Pause button clicked.");
            // If the timer is stopped or paused, attempt to start/resume it
            if (currentTimerState === 'stopped' || currentTimerState.startsWith('paused')) {
                // Special case for paused work session with focus regain enabled and recorded duration
                if (currentSessionType === 'work' && currentTimerState === 'paused-work' && isFocusRegainEnabled && pausedDuration > 0 && focusRegainModal) {
                    console.log("Paused work session with pending duration and regain enabled. Showing regain modal prompt.");
                    // If modal instance exists, show it to prompt the user
                    if (focusRegainModal) focusRegainModal.show();
                    else console.warn("Focus Regain Modal instance not found. Cannot show modal on resume click.");

                } else {
                    // Otherwise, just start/resume the timer directly
                    console.log("Starting/resuming timer directly.");
                    startTimer();
                }
            } else if (currentTimerState.startsWith('running')) {
                // If the timer is running, pause it
                pauseTimer();
            }
        });
    } else {
        console.warn("Start/Pause button (#startPauseBtn) not found. Timer controls may not work.");
    }

    // Reset Timer Button Listener
    if (resetTimerBtn) {
        resetTimerBtn.addEventListener('click', resetTimer);
        console.log("Reset Timer button event listener attached.");
    } else {
        console.warn("Reset Timer button (#resetTimerBtn) not found.");
    }

    // Focus Regain Toggle Listener
    if (focusRegainToggle) {
        focusRegainToggle.addEventListener('change', (event) => {
            console.log("Focus Regain toggle changed.", event.target.checked);
            // Update the state variable based on the toggle's checked state
            isFocusRegainEnabled = event.target.checked;
            console.log("Focus Regain Enabled:", isFocusRegainEnabled);
            // You might want to save this preference to localStorage
            // localStorage.setItem('focusRegainEnabled', isFocusRegainEnabled);
        });
         // You might want to load the initial state from localStorage on script load
         // const savedRegainState = localStorage.getItem('focusRegainEnabled');
         // if (savedRegainState !== null) {
         //     isFocusRegainEnabled = JSON.parse(savedRegainState);
         //     focusRegainToggle.checked = isFocusRegainEnabled;
         // }
    } else {
        console.warn("Focus Regain Toggle not found.");
    }

    // Focus Regain Modal Buttons Listeners (inside the modal)
    // Check if modal element and buttons exist before attaching listeners
    if (focusRegainModalElement && addPausedTimeBtn) {
        addPausedTimeBtn.addEventListener('click', () => {
            console.log("Add Paused Time button clicked in modal.");
            handleFocusRegainAction('add'); // Call the handler to add time
        });
        console.log("Add Paused Time button event listener attached.");
    } else {
        console.warn("Add Paused Time button (#addPausedTimeBtn) not found or modal element not initialized. Cannot attach click listener.");
    }

    if (focusRegainModalElement && discardPausedTimeBtn) {
        discardPausedTimeBtn.addEventListener('click', () => {
            console.log("Discard Paused Time button clicked in modal.");
            handleFocusRegainAction('discard'); // Call the handler to discard time
        });
        console.log("Discard Paused Time button event listener attached.");
    } else {
        console.warn("Discard Paused Time button (#discardPausedTimeBtn) not found or modal element not initialized. Cannot attach click listener.");
    }

    // --- Sidebar Toggle Event Listeners ---
    // Check if sidebar button elements exist before attaching listeners
    if (openSidebarBtn) {
        openSidebarBtn.addEventListener('click', openSidebar); // Listener to open sidebar
        console.log("Open Sidebar button event listener attached.");
    } else {
        console.warn("Open Sidebar button (id='openPomodoroSidebarBtn') not found in DOM. Sidebar cannot be opened via button.");
    }

    if (closeSidebarBtn) {
        closeSidebarBtn.addEventListener('click', closeSidebar); // Listener to close sidebar
        console.log("Close Sidebar button (#closeSidebarBtn) event listener attached.");
    } else {
        console.warn("Close Sidebar button (#closeSidebarBtn) not found in DOM. Sidebar cannot be closed via button.");
    }


    // Event Delegation for Config List Clicks (Apply, Edit, Delete)
    // Attaches a single listener to a parent element and handles clicks on children
    const sidebarContent = document.querySelector('.sidebar-content'); // Find the container for config lists
    if (sidebarContent) {
        console.log("Sidebar content container found. Attaching event delegation listener for config items.");
        sidebarContent.addEventListener('click', (event) => {
            const target = event.target; // The element that was clicked
            console.log("Click event triggered on sidebar content. Target:", target);

            // Check if the click target is inside a config list item (div with data-config-id)
            const configItem = target.closest('.list-group-item-dark');
            // Ensure click is on the list item itself, not a button inside it (buttons have their own listeners)
            if (configItem && !target.classList.contains('btn') && !target.closest('.btn')) {
                const configId = configItem.dataset.configId; // Get the config ID from the data attribute
                console.log("List item clicked. Config ID found:", configId);

                // If a config ID is found on the clicked list item
                if (configId) {
                    let selectedConfig = null; // Variable to hold the selected config object
                    // Find the corresponding config object based on ID pattern
                    if (configId.startsWith('default-')) {
                         selectedConfig = defaultConfigs[configId]; // Get default config by key
                         console.log("Identified as Default Config:", selectedConfig);
                    } else if (configId.startsWith('custom-')) {
                         const index = parseInt(configId.replace('custom-', '')); // Extract index for custom config
                         // Check if customConfigs array exists and index is valid
                         if (customConfigs && index >= 0 && index < customConfigs.length) {
                             selectedConfig = customConfigs[index]; // Get custom config by index
                             console.log("Identified as Custom Config:", selectedConfig);
                         } else {
                             console.error(`Invalid index for custom config selection: ${index}. customConfigs length: ${customConfigs ? customConfigs.length : 'N/A'}.`);
                         }
                    } else {
                         console.warn("Clicked item has unrecognized config ID format:", configId);
                    }

                    // If a valid config object was found, set it as the active configuration
                    if (selectedConfig) {
                        console.log("Calling setActiveConfig with:", selectedConfig);
                        setActiveConfig(selectedConfig);
                    } else {
                        console.warn("Selected config not found for ID:", configId);
                    }
                } else {
                    console.warn("No data-config-id found on clicked list item. Check renderConfigs HTML structure.", configItem);
                }

            // Check if the click target is an "Edit" button
            } else if (target.classList.contains('edit-config-btn')) {
                const configId = target.dataset.configId; // Get the config ID from the button's data attribute
                console.log("Edit button clicked for config ID:", configId);
                // Prevent editing if the timer is running
                if (currentTimerState !== 'stopped') {
                    alert("Please stop the timer before editing configurations."); // User feedback
                    console.warn("Attempted to edit config while timer is running.");
                } else {
                    // If timer is stopped, start the editing process for the config ID
                    if (configId.startsWith('custom-') || configId.startsWith('default-')) {
                        startEditingConfig(configId);
                    } else {
                        console.warn("Edit clicked on button without a valid config ID pattern.");
                    }
                }

            // Check if the click target is a "Delete" button
            } else if (target.classList.contains('delete-config-btn')) {
                const configId = target.dataset.configId; // Get the config ID from the button's data attribute
                console.log("Delete button clicked for config ID:", configId);
                // Only allow deleting custom configs
                if (configId.startsWith('custom-')) {
                    // Prevent deleting if the timer is running
                    if (currentTimerState === 'stopped') {
                        const index = parseInt(configId.replace('custom-', '')); // Extract index for custom config
                        // Check if customConfigs array exists and index is valid before attempting deletion
                        if (customConfigs && index >= 0 && index < customConfigs.length) {
                            deleteCustomConfig(index); // Call the delete function
                        } else {
                            console.error(`Invalid index for custom config deletion: ${index}. customConfigs length: ${customConfigs ? customConfigs.length : 'N/A'}.`);
                             alert("Error: Invalid config selected for deletion."); // User feedback
                        }
                    } else {
                        alert("Please stop the timer before deleting configurations."); // User feedback
                        console.warn("Attempted to delete config while timer is running.");
                    }
                } else {
                    // Prevent deleting default configs
                    alert("Cannot delete default configurations."); // User feedback
                    console.warn("Attempted to delete a default config.");
                }
            }
             // Add listener for the add custom config button (not part of event delegation on list items)
             // This check ensures the click target is specifically the add button
             if (addCustomConfigBtn && target === addCustomConfigBtn) {
                 console.log("Add Custom Config button clicked.");
                  // Prevent adding if edit form is open (optional, prevents UI conflict)
                  if (editConfigForm && editConfigForm.style.display !== 'none') {
                       alert("Please save or cancel the current edit before adding a new configuration.");
                       console.warn("Attempted to add new config while edit form is open.");
                  } else {
                     addCustomConfig(); // Call the function to add a new config
                  }

             }

        });
        console.log("Event delegation listener attached to sidebar content.");
    } else {
        console.warn("Sidebar content container (.sidebar-content) not found for event delegation. Config item clicks may not be handled.");
    }


    // Config Edit Form Button Listeners
    // Check if edit form buttons exist before attaching listeners
    if (saveConfigBtn) {
        saveConfigBtn.addEventListener('click', saveEditedConfig); // Listener for save button
        console.log("Save Config button event listener attached.");
    } else console.warn("Save Config button (#saveConfigBtn) not found.");

    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', cancelEditingConfig); // Listener for cancel button
        console.log("Cancel Edit button event listener attached.");
    } else console.warn("Cancel Edit button (#cancelEditBtn) not found.");


    // Music Mode Control Event Listeners
    // Check if music control elements exist before attaching listeners

    // Load Music Button Listener
    if (loadMusicBtn) {
        loadMusicBtn.addEventListener('click', handleLoadMusic); // Listener for the load button
        console.log("Load Music button event listener attached.");
    } else console.warn("Load Music button (#loadMusicBtn) not found.");

    // Play/Pause Music Button Listener (the one inside the new musicPlayerDisplay)
    // Check if the play/pause button element exists before attaching listener
    if (playPauseMusicBtn) {
        playPauseMusicBtn.addEventListener('click', togglePlayPauseMusic); // Listener for play/pause button
        console.log("Play/Pause Music button event listener attached.");
    } else console.warn("Play/Pause Music button (#playPauseMusicBtn) not found (new display). Music playback toggle won't work.");

    // Skip Previous Button Listener (inside the new musicPlayerDisplay)
    // Check if the skip button element exists before attaching listener
    if (skipPrevMusicBtn) {
        // This listener might be more reliable attached AFTER player creation in loadYouTubeContent or onPlayerReady
        // but attaching here during DOMContentLoaded is a start. Need to ensure 'player' is available when clicked.
        skipPrevMusicBtn.addEventListener('click', () => {
            console.log("Skip Previous button clicked.");
            // Check if player exists and has the previousVideo method before calling
            if (player && typeof player.previousVideo === 'function') {
                player.previousVideo(); // Call YouTube API method to go to previous video
                console.log("Attempting to play previous video via API.");
            } else {
                console.warn("YouTube Player not ready or does not support previousVideo (e.g., not a playlist).");
                alert("Skip Previous requires a playlist."); // User feedback
            }
        });
        console.log("Skip Previous button event listener attached (DOMContentLoaded).");
    } else console.warn("Skip Previous button not found (DOMContentLoaded). Skip functionality won't work.");

    // Skip Next Button Listener (inside the new musicPlayerDisplay)
    // Check if the skip button element exists before attaching listener
    if (skipNextMusicBtn) {
        // This listener might be more reliable attached AFTER player creation in loadYouTubeContent or onPlayerReady
        // but attaching here during DOMContentLoaded is a start. Need to ensure 'player' is available when clicked.
        skipNextMusicBtn.addEventListener('click', () => {
            console.log("Skip Next button clicked.");
             // Check if player exists and has the nextVideo method before calling
             if (player && typeof player.nextVideo === 'function') {
                player.nextVideo(); // Call YouTube API method to go to next video
                console.log("Attempting to play next video via API.");
             } else {
                 console.warn("YouTube Player not ready or does not support nextVideo (e.g., not a playlist).");
                  alert("Skip Next requires a playlist."); // User feedback
             }
        });
        console.log("Skip Next button event listener attached (DOMContentLoaded).");
    } else console.warn("Skip Next button not found (DOMContentLoaded). Skip functionality won't work.");


    // Add Music Button Listener (inside the new musicPlayerDisplay)
    // Check if the add music button element exists before attaching listener
    if (addMusicBtnNew) {
         addMusicBtnNew.addEventListener('click', () => {
             console.log("Add Music button clicked (Placeholder - needs implementation).");
             // TODO: Implement add to playlist logic here - potentially needs more complex state/storage
             alert("Add to playlist functionality is not yet implemented."); // Placeholder feedback
         });
         console.log("Add Music button event listener attached (DOMContentLoaded).");
     } else console.warn("Add Music button not found (DOMContentLoaded).");

    // Options Music Button Listener (inside the new musicPlayerDisplay)
    // Check if the options music button element exists before attaching listener
    if (optionsMusicBtn) {
        optionsMusicBtn.addEventListener('click', () => {
             console.log("Options Music button clicked (Placeholder - needs implementation).");
             // TODO: Implement options/share logic here
             alert("Music options functionality is not yet implemented."); // Placeholder feedback
         });
         console.log("Options Music button event listener attached (DOMContentLoaded).");
    } else console.warn("Options Music button not found (DOMContentLoaded).");


    // YouTube Link Input Keypress Listener (for hitting Enter to load)
    // Check if both input and load button exist before attaching listener
    if (youtubeLinkInput && loadMusicBtn) {
        youtubeLinkInput.addEventListener('keypress', (event) => {
            // Check if the pressed key was Enter (key code 13 is also an option but 'key' is preferred)
            if (event.key === 'Enter') {
                event.preventDefault(); // Prevent default form submission if input is in a form
                handleLoadMusic(); // Call the load music function
            }
        });
        console.log("YouTube link input keypress listener attached.");
    } else console.warn("YouTube link input (#youtubeLinkInput) or load music button (#loadMusicBtn) not found. Enter key loading won't work.");


    // --- Bootstrap Tooltip Initialization ---
    // Finds all elements with data-bs-toggle="tooltip" and initializes Bootstrap Tooltips
    // Scoped to pomodoroSidebar if it exists, otherwise checks the whole document body
    const tooltipTriggerList = [].slice.call(pomodoroSidebar ? pomodoroSidebar.querySelectorAll('[data-bs-toggle="tooltip"]') : document.body.querySelectorAll('[data-bs-toggle="tooltip"]'));
    if (tooltipTriggerList.length > 0) {
        console.log(`Found ${tooltipTriggerList.length} elements with data-bs-toggle="tooltip". Initializing tooltips.`);
    } else {
        console.log("No elements with data-bs-toggle='tooltip' found.");
    }

    // Iterate through elements and create a new Tooltip instance for each
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        // Check if Bootstrap and Tooltip component are available
        if (typeof bootstrap !== 'undefined' && typeof bootstrap.Tooltip !== 'undefined') {
            // Optional: Dispose of any existing tooltip instance to prevent duplicates
            const existingTooltip = bootstrap.Tooltip.getInstance(tooltipTriggerEl);
            if (existingTooltip) {
                existingTooltip.dispose();
            }
            // Create and return a new Bootstrap Tooltip instance
            return new bootstrap.Tooltip(tooltipTriggerEl);
        } else {
            console.warn("Bootstrap or Tooltip not available. Skipping tooltip initialization for an element.", tooltipTriggerEl);
            return null; // Return null if Bootstrap is not ready
        }
    }).filter(tooltip => tooltip !== null); // Filter out nulls if Bootstrap wasn't ready

    console.log("Bootstrap Tooltips initialization attempted.");


    // --- Initial Setup Calls ---
    // These functions are called once when the DOM is ready
    renderConfigs(); // Display the default and saved custom configurations
    setActiveConfig(defaultConfigs['default-25']); // Set the default active configuration (QuickDraw 25/5)
    loadYouTubeAPI(); // Dynamically load the YouTube IFrame Player API script

    console.log("Initial setup complete.");

}); // End of DOMContentLoaded event listener


// Assign the API ready/failed functions to the window object.
// The YouTube IFrame Player API script expects these functions to be globally accessible
// to signal when the API is loaded and ready or if it failed.
window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
window.onYouTubeIframeAPIFailedToLoad = onYouTubeIframeAPIFailedToLoad;
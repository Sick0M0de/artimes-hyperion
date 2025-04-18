// D:\artimes-hyperion\pomodoro_app\static\pomodoro\script.js

// Console logs are for debugging your implementation.
// You can remove or reduce these once everything is working smoothly.
console.log("Pomodoro script.js started loading.");

// Load YouTube IFrame Player API script dynamically
// This function is placed outside DOMContentLoaded so it can be called
// by the YouTube API itself when it's ready.
function loadYouTubeAPI() {
    console.log("Loading YouTube IFrame Player API.");
    // Prevent loading if it's already there
    // Use the standard API source URL
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
    // The player instance will be created later when a video or playlist is loaded via loadYouTubeContent.
}

// This function is called if the API fails to load (optional handler)
function onYouTubeIframeAPIFailedToLoad(event) {
     console.error("YouTube IFrame Player API failed to load.", event);
     // Optionally hide music mode features or show an error message in the UI
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

    // Text element within the Focus Regain Modal to update the message
    const focusRegainModalBody = document.getElementById('focusRegainModalBody'); // Ensure this ID exists in your modal HTML

    let focusRegainModal = null;
    let confirmationModal = null;

    // Initialize Bootstrap Modals
    if (typeof bootstrap !== 'undefined' && typeof bootstrap.Modal !== 'undefined') {
        if (focusRegainModalElement) {
             try {
                focusRegainModal = new bootstrap.Modal(focusRegainModalElement);
                console.log("Focus Regain Modal instance created successfully.");
                 // Add event listener for when the regain modal is hidden to ensure state is clean
                 focusRegainModalElement.addEventListener('hidden.bs.modal', () => {
                     console.log("Focus Regain Modal hidden.");
                     // If timer state is paused-work and regain was not acted upon before closing manually
                     // Automatically discard if closed without clicking a button
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
                 // Add event listener for when the confirmation modal is hidden manually
                 confirmationModalElement.addEventListener('hidden.bs.modal', () => {
                     console.log("Confirmation Modal hidden.");
                     // If the modal is hidden manually, cancel the pending config change
                     pendingConfig = null;
                     console.log("Pending config cleared due to manual modal close.");
                     // Ensure confirmation modal text is reset if manually closed while reset options were displayed
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
    const youtubePlayerDiv = document.getElementById('youtube-player'); // The div where the iframe will go
    const musicControls = document.querySelector('.music-controls'); // Container for play/pause etc.
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

    // Audio element for the timer end sound - Removed as requested, so no element to get here.


    // --- State Variables ---
    let currentTimerState = 'stopped'; // 'stopped', 'running-work', 'paused-work', 'running-break', 'paused-break'
    let currentSessionType = 'work'; // 'work' or 'break'
    let timeRemaining = 25 * 60; // Default to 25 minutes in seconds
    let intervalTimer = null; // To hold the setInterval ID for the main timer
    let isFocusRegainEnabled = focusRegainToggle ? focusRegainToggle.checked : false;
    let pausedDuration = 0; // Time in seconds spent in paused state during a work session
    let focusRegainInterval = null; // To hold the focus regain setInterval ID

    // Store the current configuration being used (work and break times)
    let activeConfig = { work: 25, break: 5 };
    let pendingConfig = null; // Store the config selected while timer is running

    // Store the original document title
    const originalDocumentTitle = document.title;


    // Default configurations with Dante-themed names (No demons/devils)
    const defaultConfigs = {
        'default-25': { name: 'QuickDraw', work: 25, break: 5, quote: "(Easy Mode)" }, // Dante flair
        'default-50': { name: 'Stylish Grind', work: 50, break: 10, quote: "" }, // Dante flair
        'default-120': { name: 'Legendary Hunt', work: 120, break: 30, quote: "" } // Dante flair
    };

    // Custom configurations (load from localStorage if exists)
    let customConfigs = loadCustomConfigs();

    // Focus Regain Messages (Sarcastic Dante Humor, No demons/devils)
    const regainMessages = [
        "Look who's back. Needed a break already?",
        "Thought you could slip away, huh?",
        "Don't tell me you're losing your groove.",
        "You call that focus? Try again.",
        "Still got it? Let's see.",
        "Back in the game?",
        "Didn't think you'd last this long.",
    ];

    // Function to get a random sarcastic regain message
    function getRandomRegainMessage() {
        return regainMessages[Math.floor(Math.random() * regainMessages.length)];
    }


    // --- Functions ---

    // Function to format time (MM:SS or H:MM:SS)
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


    // Function to update the timer display
    function updateDisplay() {
        if (displayTime) displayTime.textContent = formatTime(timeRemaining);
        else console.warn("Timer display element (#displayTime) not found in updateDisplay.");
    }

    // Function to start or resume the timer
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
             if(startPauseBtn) {
                   startPauseBtn.textContent = 'Pause'; // Reverted to standard text
                   startPauseBtn.classList.remove('btn-primary', 'btn-secondary', 'btn-info');
                   startPauseBtn.classList.add('btn-warning'); // Work state color (can be restyled in CSS)
              } else console.warn("Start/Pause button (#startPauseBtn) not found in startTimer (work state).");
        } else { // currentSessionType === 'break'
             currentTimerState = 'running-break';
              if(startPauseBtn) {
                 startPauseBtn.textContent = 'Pause Break'; // Reverted to standard text
                 startPauseBtn.classList.remove('btn-primary', 'btn-secondary', 'btn-warning');
                 startPauseBtn.classList.add('btn-info'); // Break state color (can be restyled in CSS)
              } else console.warn("Start/Pause button (#startPauseBtn) not found in startTimer (break state).");
        }


        intervalTimer = setInterval(() => {
            if (timeRemaining > 0) {
                timeRemaining--;
                updateDisplay();
                // === Add this line for browser tab countdown ===
                document.title = formatTime(timeRemaining) + " | Hyperion"; // Update the browser tab title
                // ===============================================
            } else {
                clearInterval(intervalTimer);
                intervalTimer = null;
                console.log("Interval timer cleared because time ran out.");
                handleSessionEnd();
            }
        }, 1000);

         console.log(`Interval timer started. Current state: ${currentTimerState}. Time remaining: ${timeRemaining}`);
    }

    // Function to pause the timer
    function pauseTimer() {
        console.log("pauseTimer called. Current state:", currentTimerState);
        if (currentTimerState.startsWith('running')) {
            clearInterval(intervalTimer);
            intervalTimer = null;
            console.log("Cleared main intervalTimer when pausing.");

            // === Reset browser title when paused ===
            document.title = "Paused | " + originalDocumentTitle; // Indicate paused state in title
            // ========================================


            currentTimerState = currentSessionType === 'work' ? 'paused-work' : 'paused-break';
             if(startPauseBtn) {
                startPauseBtn.textContent = 'Resume'; // Reverted to standard text
                startPauseBtn.classList.remove('btn-warning', 'btn-info', 'btn-primary');
                startPauseBtn.classList.add('btn-secondary'); // Paused color (can be restyled in CSS)
             } else console.warn("Start/Pause button (#startPauseBtn) not found in pauseTimer.");

            // Only start focus regain timer/modal for paused work sessions if enabled
            if (currentSessionType === 'work' && isFocusRegainEnabled) {
                 console.log("Work session paused, focus regain enabled. Starting regain timer and showing modal prompt.");
                 startFocusRegainTimer(); // Start regain timer
                 // Show the modal directly after starting the regain timer
                 if (focusRegainModalElement && focusRegainModal && focusRegainModalBody) {
                      // Set the random sarcastic Dante regain message and paused duration
                      focusRegainModalBody.innerHTML = `You were paused for <strong id="pausedDurationDisplay">${formatTime(pausedDuration)}</strong>. <br> ${getRandomRegainMessage()} <br> Should I add this time to your current session?`;
                       // No need to re-get pausedDurationDisplay after setting innerHTML if it's within the HTML string.
                      console.log("Showing Focus Regain modal.");
                      focusRegainModal.show();
                 } else {
                      console.warn("Focus Regain Modal elements or instance not found. Cannot show modal.");
                      // If modal can't be shown, what should happen? Auto-discard duration and stay paused?
                      // For now, just warn and let the user manually resume. pausedDuration will keep counting.
                 }
            } else {
                 console.log("Session paused, but not work, or regain disabled. No regain timer or modal shown.");
            }
        }
    }

     // Function to stop the timer (reset to initial state of active config)
    function stopTimer() {
        console.log("stopTimer called.");
        clearInterval(intervalTimer);
        intervalTimer = null;
        clearInterval(focusRegainInterval); // Ensure regain timer is also stopped
        focusRegainInterval = null;

        currentTimerState = 'stopped';
        currentSessionType = 'work'; // Reset to work session

         if(startPauseBtn) {
            startPauseBtn.textContent = 'Start'; // Reverted to standard text
            startPauseBtn.classList.remove('btn-warning', 'btn-secondary', 'btn-info');
            startPauseBtn.classList.add('btn-primary'); // Default start color (can be restyled in CSS)
         } else console.warn("Start/Pause button (#startPauseBtn) not found in stopTimer.");

        // timeRemaining is set by applyConfig after stopTimer is called
        pausedDuration = 0; // Reset paused duration

        // Hide modals if they are open when stopping/resetting
        if (focusRegainModal) focusRegainModal.hide();
        else console.warn("Focus Regain Modal instance not found in stopTimer. Cannot hide.");
         if (confirmationModal) confirmationModal.hide();
         else console.warn("Confirmation Modal instance not found in stopTimer. Cannot hide.");

        console.log("Timer stopped and reset.");
        // === Reset browser title when stopped/reset ===
        document.title = originalDocumentTitle; // Restore the original page title
        // ==============================================
    }

     // Function to reset the timer explicitly via the reset button
     function resetTimer() {
         console.log("resetTimer called. Current state:", currentTimerState);
         // Always confirm reset if timer is not stopped
         if (currentTimerState !== 'stopped' && confirmationModal) { // Use the confirmation modal
              pendingConfig = activeConfig; // Store active config to reset to
              // Set modal body message for reset confirmation - USING GENERIC TEXT
              const modalBodyElement = confirmationModalElement.querySelector('.modal-body');
              if(modalBodyElement) modalBodyElement.innerHTML = "Are you sure you want to reset the timer? This will end the current session."; // Use generic text for modal action

              const confirmProceedBtn = document.getElementById('confirmProceedBtn');
               if(confirmProceedBtn) confirmProceedBtn.textContent = "Yes, Reset"; // Change button text
               else console.warn("Confirm Proceed button (#confirmProceedBtn) not found for reset modal.");

              const confirmCancelBtn = document.getElementById('confirmCancelBtn');
               if(confirmCancelBtn) confirmCancelBtn.textContent = "No, Cancel"; // Change button text
               else console.warn("Confirm Cancel button (#confirmCancelBtn) not found for reset modal.");


              confirmationModal.show();

              // Define local handlers for this specific reset confirmation
              const localHandleResetConfirm = () => {
                  console.log("Reset confirmed via modal (Local Handler).");
                  // Modal hides via data-bs-dismiss="modal" or hidden listener
                  stopTimer();
                  console.log("Timer reset by user via modal (Local Handler).");
                  // No need to remove listeners here because 'once: true' is used
                  // No need to reset confirmation text here, stopTimer resets the title
              };
              const localHandleResetCancel = () => {
                   console.log("Reset cancelled via modal (Local Handler).");
                   // Modal hides via data-bs-dismiss="modal" or hidden listener
                   pendingConfig = null; // Clear pending config on cancel
                   console.log("Pending config cleared due to cancellation (Local Handler).");
                   resetConfirmationModalText(); // Restore default text on cancel
                   // No need to remove listeners here because 'once: true' is used
              };


              // Attach local listeners with 'once: true'
              if(confirmProceedBtn) confirmProceedBtn.addEventListener('click', localHandleResetConfirm, { once: true }); // Use once
              if(confirmCancelBtn) confirmCancelBtn.addEventListener('click', localHandleResetCancel, { once: true }); // Use once
              // Use the hidden event listener defined at the top of DOMContentLoaded for manual close during reset
              // This listener calls handleFocusRegainAction('discard') if paused-work, which isn't quite right for reset.
              // Let's add a specific 'hidden.bs.modal' listener here for reset confirmation modal
              if(confirmationModalElement) confirmationModalElement.addEventListener('hidden.bs.modal', localHandleResetCancel, { once: true });


              console.log("Attached local reset modal listeners (using once).");

         } else if (currentTimerState === 'stopped') {
             stopTimer();
              console.log("Timer already stopped, ensuring reset state.");
         }
     }


    // Function to handle the end of a work or break session (Automatic Trigger)
    function handleSessionEnd() {
        console.log(`${currentSessionType} session ended.`);

        // Play the bell sound (Removed as requested)
        // if (timerEndSound) {
        //      timerEndSound.currentTime = 0;
        //      timerEndSound.play().catch(error => { console.error("Failed to play timer end sound:", error); });
        //      console.log("Attempted to play timer end sound.");
        // } else {
        //      console.warn("Timer end sound element (#timerEndSound) not found.");
        // }


        // **Automatic Trigger:** Move to the next session type
        if (currentSessionType === 'work') {
            console.log("Work session ended. Automatically switching to break.");
            currentSessionType = 'break';
            timeRemaining = activeConfig.break * 60;
             // TODO: Increment a session counter here (e.g., Pomodoro count)
             // TODO: Add visual indication of completed Pomodoros (e.g., dots as in StudyWithMe screenshot 145937.png)
        } else { // currentSessionType === 'break'
             console.log("Break session ended. Automatically switching to work.");
            currentSessionType = 'work';
            timeRemaining = activeConfig.work * 60;
             // TODO: Check if the Pomodoro cycle is complete (e.g., after 4 work sessions) - potentially longer break then
        }

        // Reset button state for the start of the new session (it's now stopped)
         if(startPauseBtn) {
            startPauseBtn.textContent = 'Start'; // Reverted to standard text
            startPauseBtn.classList.remove('btn-warning', 'btn-secondary', 'btn-info');
            startPauseBtn.classList.add('btn-primary'); // Default start color (can be restyled in CSS)
         } else console.warn("Start/Pause button (#startPauseBtn) not found in handleSessionEnd.");
        currentTimerState = 'stopped'; // State is stopped after session end

        updateDisplay(); // Update display to show the time for the next session

        // === Restore browser title at the end of a session before auto-starting next ===
         document.title = originalDocumentTitle; // Restore the original page title briefly
        // =============================================================================


        // Auto-start the next session (break or work) as per automatic trigger requirement
        // Add a small delay before auto-starting the next session? Looks better.
        console.log(`Waiting 1 second before auto-starting next session (${currentSessionType}).`);
        setTimeout(() => {
             startTimer();
        }, 1000); // 1 second delay before starting the next session


    }


    // --- Focus Regain Functions ---

    function startFocusRegainTimer() {
         console.log("startFocusRegainTimer called.");
         clearInterval(focusRegainInterval);
         focusRegainInterval = null;
         pausedDuration = 0; // Reset for the *new* pause duration
         console.log("Focus regain timer started...");

         focusRegainInterval = setInterval(() => {
             pausedDuration++;
             // Update the displayed paused duration in the modal body in real-time
             const pausedDurationDisplayElement = document.getElementById('pausedDurationDisplay');
             if (pausedDurationDisplayElement) pausedDurationDisplayElement.textContent = formatTime(pausedDuration);

         }, 1000);
    }

    // This function is now primarily called when the modal buttons are clicked OR when the modal is manually closed
    function handleFocusRegainAction(action) { // action can be 'add' or 'discard'
        console.log(`handleFocusRegainAction called with action: ${action}`);

        // Stop the regain timer immediately
        clearInterval(focusRegainInterval);
        focusRegainInterval = null;
        console.log("Focus regain timer stopped. Paused duration:", pausedDuration);

        if (action === 'add') {
            timeRemaining += pausedDuration;
            console.log(`Added ${pausedDuration} seconds back. New time remaining: ${timeRemaining}`);
            updateDisplay(); // Update display immediately
        } else { // action === 'discard'
            console.log("Discarding paused time.");
        }
        pausedDuration = 0; // Always reset paused duration after action is handled

        // Ensure the modal is hidden - This is handled by data-bs-dismiss on buttons or the hidden listener
        // if (focusRegainModal) focusRegainModal.hide();
        // else console.warn("Focus Regain Modal instance not found in handleFocusRegainAction. Cannot hide.");

        // Resume the main timer ONLY if the action was 'add' or 'discard' explicitly, not manual close?
        // No, resume timer regardless after the modal decision is made or modal is closed.
        startTimer();
    }

    // --- Sidebar Toggle Functions ---

    function openSidebar() {
        console.log("openSidebar called.");
        if (pomodoroSidebar) {
            pomodoroSidebar.classList.add('visible');
            console.log("Sidebar class 'visible' added.");
             // Optional: Add a class to the body or main content to push/overlay
             // document.body.classList.add('sidebar-visible');
        } else {
            console.warn("Pomodoro Sidebar element (#pomodoroSidebar) not found for opening.");
        }
    }

    function closeSidebar() {
         console.log("closeSidebar called.");
         if (pomodoroSidebar) {
            pomodoroSidebar.classList.remove('visible');
            console.log("Sidebar class 'visible' removed.");
             // Optional: Remove the class from the body or main content
             // document.body.classList.remove('sidebar-visible');
         } else {
             console.warn("Pomodoro Sidebar element (#pomodoroSidebar) not found for closing.");
         }
    }


    // --- Configuration Management ---

    function renderConfigs() {
        console.log("renderConfigs called.");
        if (!defaultConfigsContainer) console.warn("Default Configs container (#defaultConfigs) not found.");
        if (!savedCustomConfigsContainer) {
            console.warn("Saved Custom Configs container (#savedCustomConfigs) not found. Cannot render custom configs.");
            return;
        }

        // Render Default Configs (Update text here with Dante flair if needed, matching object)
        if (defaultConfigsContainer) {
             defaultConfigsContainer.innerHTML = ''; // Clear existing default configs
             Object.keys(defaultConfigs).forEach(key => {
                 const config = defaultConfigs[key];
                 const configElement = `
                     <div class="list-group-item list-group-item-dark d-flex justify-content-between align-items-center">
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


        savedCustomConfigsContainer.innerHTML = ''; // Clear existing saved custom list

        if (customConfigs.length === 0) {
             savedCustomConfigsContainer.innerHTML = '<p class="text-muted small">No custom configurations saved yet.</p>'; // Use generic text here
        } else {
            customConfigs.forEach((config, index) => {
                const configElement = `
                    <div class="list-group-item list-group-item-dark d-flex justify-content-between align-items-center">
                        <div>
                            <h6 class="mb-1">${config.name || `Custom ${index + 1}`}</h6>
                            <small>${config.work} min work / ${config.break} min break</small>
                        </div>
                         <div>
                            <button class="btn btn-outline-secondary btn-sm me-1 edit-config-btn" data-config-id="custom-${index}">Edit</button>
                            <button class="btn btn-outline-danger btn-sm delete-config-btn" data-config-id="custom-${index}">Delete</button>
                         </div>
                    </div>
                `;
                savedCustomConfigsContainer.innerHTML += configElement;
            });
        }
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
             return;
        }

        const work = parseInt(customWorkTimeInput.value);
        const breakTime = parseInt(customBreakTimeInput.value);
        const name = customConfigNameInput.value.trim();

        if (isNaN(work) || work <= 0 || isNaN(breakTime) || breakTime <= 0) {
            alert("Please enter valid positive numbers for work and break times."); // Use Bootstrap modal later
            return;
        }

        // Check for duplicate config (same work, break, and name)
        if (customConfigs.some(config => config.work === work && config.break === breakTime && config.name === name)) {
            alert("A configuration with these exact values and name already exists."); // Use Bootstrap modal later
            return;
        }

        customConfigs.push({ name: name, work: work, break: breakTime });
        saveCustomConfigs();
        renderConfigs();
        // Reset inputs after adding
        customWorkTimeInput.value = 30;
        customBreakTimeInput.value = 5;
        customConfigNameInput.value = '';
         console.log("Custom config added:", { name, work, breakTime });
    }

     function deleteCustomConfig(index) {
        console.log("deleteCustomConfig called for index:", index);
         if (!savedCustomConfigsContainer) {
             console.warn("Saved Custom Configs container (#savedCustomConfigs) not found. Cannot delete.");
             return;
         }
        if (index >= 0 && index < customConfigs.length) {
            if (confirm("Are you sure you want to delete this configuration?")) { // Could use confirmation modal here too
                customConfigs.splice(index, 1);
                saveCustomConfigs();
                renderConfigs();
                 console.log("Custom config deleted at index:", index);
                 // TODO: If the deleted config was the active one, reset timer to default or first config
            }
        } else {
             console.error("Attempted to delete config with invalid index:", index);
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
                   applyConfig(pendingConfig);
                   console.log("Config applied by user via modal (Local Handler).");
                   // Clean up local listeners after action
                   removeLocalConfigListeners();
               };
               const localHandleConfigCancel = () => {
                    console.log("Config change cancelled via modal (Local Handler).");
                    if (confirmationModal) confirmationModal.hide();
                    pendingConfig = null; // Clear pending config
                    console.log("Pending config cleared due to cancellation (Local Handler).");
                    resetConfirmationModalText(); // Restore default text
                    // Clean up local listeners after action
                    removeLocalConfigListeners();
               };

               const removeLocalConfigListeners = () => {
                   const cpBtn = document.getElementById('confirmProceedBtn');
                   const ccBtn = document.getElementById('confirmCancelBtn');
                   const confModalEl = document.getElementById('confirmationModal');

                   if(cpBtn) cpBtn.removeEventListener('click', localHandleConfigConfirm);
                   if(ccBtn) ccBtn.removeEventListener('click', localHandleConfigCancel);
                   if(confModalEl) confModalEl.removeEventListener('hidden.bs.modal', localHandleConfigCancel);
                   console.log("Removed local config change modal listeners.");
               };

             // Ensure previous local listeners are removed before attaching new ones
             // This might be necessary if a user clicks quickly multiple times or if 'once' wasn't fully reliable.
             const cpBtn = document.getElementById('confirmProceedBtn');
             const ccBtn = document.getElementById('confirmCancelBtn');
             const confModalEl = document.getElementById('confirmationModal');

             // Attempt to remove prior local handlers (if they somehow persist)
             // This is defensive programming; with proper 'once' or explicit removal, it shouldn't be needed.
             // Given the user's issues, being defensive here might help.
             // Note: We can only remove the *exact same function instance* that was added.
             // If previous handlers were defined *inside* the function call, they are new instances each time.
             // Using named local functions and removing them by reference is the correct approach as done above.
             // Let's re-add the listeners using 'once' for simplicity, as the explicit remove requires capturing function references carefully.
             // Reverting to 'once' as it's standard for single-action confirmations. The hidden listener also uses 'once'.

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
         // TODO: Add visual indication of the active config in the list
         activeConfig = { work: config.work, break: config.break };
         stopTimer(); // Stop and reset the timer based on the NEW active config
         timeRemaining = activeConfig.work * 60;
         updateDisplay();
         pendingConfig = null;
         console.log("Configuration applied:", activeConfig);

          // If edit form is open, close it
         if (editConfigForm && editConfigForm.style.display !== 'none') {
              cancelEditingConfig();
         }
         resetConfirmationModalText(); // Reset confirmation modal text to default config change message
     }

    // Functionality for editing configs
    function startEditingConfig(configId) {
         console.log("startEditingConfig called for configId:", configId);
         if (!editConfigForm || !editingConfigIdInput || !editWorkTimeInput || !editBreakTimeInput || !editConfigNameInput || !saveConfigBtn || !cancelEditBtn) {
             console.warn("Missing edit config form elements.");
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
         } else if (configId.startsWith('custom-')) {
             const index = parseInt(configId.replace('custom-', ''));
             if (customConfigs[index]) {
                 configToEdit = customConfigs[index];
                 isDefault = false;
                 // Custom configs can be saved
                 if(saveConfigBtn) saveConfigBtn.style.display = '';
                 // Custom config names can be edited
                 if(editConfigNameInput) editConfigNameInput.disabled = false;
             }
         }

         if (configToEdit) {
             if(editingConfigIdInput) editingConfigIdInput.value = configId;
             if(editWorkTimeInput) editWorkTimeInput.value = configToEdit.work;
             if(editBreakTimeInput) editBreakTimeInput.value = configToEdit.break;
             if(editConfigNameInput) editConfigNameInput.value = configToEdit.name || '';
             if(editConfigForm) editConfigForm.style.display = 'block'; // Show the edit form
             console.log("Edit form shown for config:", configToEdit);
         } else {
             console.error("Config not found for editing:", configId);
         }
     }

     function saveEditedConfig() {
        console.log("saveEditedConfig called.");
        if (!editConfigForm || !editingConfigIdInput || !editWorkTimeInput || !editBreakTimeInput || !editConfigNameInput) {
            console.warn("Missing edit config form elements for saving.");
            return;
        }

        const configId = editingConfigIdInput.value;
        const work = parseInt(editWorkTimeInput.value);
        const breakTime = parseInt(editBreakTimeInput.value);
        const name = editConfigNameInput.value.trim();

         if (isNaN(work) || work <= 0 || isNaN(breakTime) || breakTime <= 0) {
            alert("Please enter valid positive numbers for work and break times."); // Use Bootstrap modal later
            return;
        }

        if (configId.startsWith('custom-')) {
             const index = parseInt(configId.replace('custom-', ''));
             if (customConfigs[index]) {
                 // Check if updated config duplicates an existing one (excluding itself)
                 const isDuplicate = customConfigs.some((config, i) =>
                     i !== index && config.work === work && config.break === breakTime && config.name === name
                 );

                 if (isDuplicate) {
                     alert("A custom configuration with these values and name already exists."); // Use modal
                     return;
                 }

                 customConfigs[index].work = work;
                 customConfigs[index].break = breakTime;
                 customConfigs[index].name = name;
                 saveCustomConfigs();
                 renderConfigs(); // Re-render the list to show updated config
                 console.log("Custom config updated:", customConfigs[index]);
                 // TODO: If the updated config was the active one, update the timer display? Or ask to apply?
             } else {
                  console.error("Custom config not found for saving:", index);
             }
        } else if (configId.startsWith('default-')) {
            console.log("Attempted to save a default config edit - this should not happen with save button hidden.");
            // This case should ideally be prevented by hiding the save button for default configs.
        }
         cancelEditingConfig(); // Close the edit form after saving
     }

     function cancelEditingConfig() {
         console.log("cancelEditingConfig called.");
         if (editConfigForm) editConfigForm.style.display = 'none'; // Hide the edit form
     }


    // --- Music Mode Functions ---

    // Extract YouTube ID (Video or Playlist) and Type from various YouTube URLs
    function getYouTubeIdAndType(url) {
        console.log("Attempting to extract YouTube ID and Type from:", url);
        let id = null;
        let type = null;
        let match;

        // Regex for standard video IDs (e.g., watch?v=, youtu.be/, embed/, v/, shorts/, track/)
        const videoRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be|music\.youtube\.com)\/(?:watch\?v=|embed\/|v\/|shorts\/|track\/)?([a-zA-Z0-9_-]+)(?:&.*)?(?:#t=\d+)?/;
        match = url.match(videoRegex);
        if (match && match[1]) {
            id = match[1];
            type = 'video';
            console.log(`Extracted video ID: ${id} from URL: ${url}`);
            return { type: type, id: id };
        }

        // Regex for playlist IDs (e.g., list=)
        const playlistRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be|music\.youtube\.com)\/(?:playlist\?list=)([\w-]+)(?:&.*)?/;
         match = url.match(playlistRegex);
         if (match && match[1]) {
             id = match[1];
             type = 'playlist';
             console.log(`Extracted playlist ID: ${id} from URL: ${url}`);
             return { type: type, id: id };
         }

        console.warn("Could not extract valid YouTube video or playlist ID from URL:", url);
        return { type: null, id: null }; // Return null type and id if no match
    }

    // Load and play the YouTube content (Video or Playlist) by ID and Type
    function loadYouTubeContent(id, type) {
         console.log(`Loading YouTube content. Type: ${type}, ID: ${id}`);
         // Check if API is ready before trying to use YT.Player
         if (typeof YT === 'undefined' || typeof YT.Player === 'undefined' || !youtubePlayerDiv) {
             console.warn("YouTube API or player div not ready. Cannot load content.");
             // Optional: Show a user-friendly message that the music player isn't available
             if (trackTitleSpan) trackTitleSpan.textContent = 'Music Player Unavailable';
             // Hide music controls as player won't work
             if (musicControls) musicControls.style.display = 'none';
             return;
         }

         if (player) {
             console.log("Existing player found. Destroying old player.");
             player.destroy(); // Destroy previous player instance
             player = null;
         }

         // Create a new player instance
         player = new YT.Player('youtube-player', { // 'youtube-player' is the ID of the div
             height: '0', // Set height and width to 0 or small value to hide the visual player
             width: '0',
             // Specify videoId or list (playlist ID) here based on type
             videoId: type === 'video' ? id : undefined, // Use videoId for videos
             list: type === 'playlist' ? id : undefined, // Use list for playlists
             listType: type === 'playlist' ? 'playlist' : undefined, // Specify listType as 'playlist' for playlists
             playerVars: {
                 'autoplay': 1, // Auto-play the content
                 'controls': 0, // Hide controls
                 'disablekb': 1, // Disable keyboard controls
                 'fs': 0, // Disable fullscreen button
                 'iv_load_policy': 3, // Hide annotations
                 'modestbranding': 1, // Hide YouTube logo
                 'rel': 0, // Do not show related videos at the end (might not work for playlists)
                 'showinfo': 0 // Hide video information (deprecated, but good practice)
             },
             events: {
                 'onReady': onPlayerReady,
                 'onStateChange': onPlayerStateChange, // Make sure this function exists below
                 'onError': onPlayerError // Make sure this function exists below
             }
         });
          console.log("New YouTube Player instance creation requested.");

         // Show controls and track info after attempting to load
         if (musicControls) musicControls.style.display = 'flex'; // Use flex to match d-flex styling
         if (currentTrackInfo) currentTrackInfo.style.display = 'block';
         // Initial text might say Loading... or depend on type
         if (trackTitleSpan) trackTitleSpan.textContent = `Loading ${type || 'content'} info...`;


    }

    // YouTube API Event Handlers
    // The onPlayerReady function needs to be aware it might be loading a playlist
    function onPlayerReady(event) {
        console.log("YouTube Player is ready.");
        // Attempt to play content - can still be blocked by browser policies
        event.target.playVideo().catch(error => {
            console.warn("Autoplay prevented:", error);
            // Inform user they might need to click play manually
            if (trackTitleSpan) trackTitleSpan.textContent = 'Ready to play (click play button)';
            if (playPauseMusicBtn) playPauseMusicBtn.innerHTML = '<i class="bi bi-play-fill"></i>'; // Show play icon if autoplay fails
        });

        // Get content title once player is ready - This will get the *current video* title even in a playlist
         if (player && player.getVideoData && trackTitleSpan) {
              const videoData = player.getVideoData();
              if (videoData && videoData.title) {
                  trackTitleSpan.textContent = videoData.title;
                  console.log("Set track title:", videoData.title);
              } else {
                   trackTitleSpan.textContent = 'Unknown Title';
                   console.warn("Could not get video data or title on player ready.");
              }
         } else console.warn("Player or track title span not available on ready.");

         // Optional: For playlists, you might want to display the playlist title as well
         // if (player && player.getPlaylistId && trackTitleSpan) {
         //      const playlistId = player.getPlaylistId();
         //      // Getting the playlist title directly from the API can be tricky.
         //      // You might need a separate API call or rely on the video title for now.
         // }
    }

    function onPlayerStateChange(event) {
        console.log("YouTube Player state changed:", event.data);
        // Update play/pause button icon based on state
        if (playPauseMusicBtn) {
            if (event.data === YT.PlayerState.PLAYING) {
                playPauseMusicBtn.innerHTML = '<i class="bi bi-pause-fill"></i>'; // Playing -> Pause icon
            } else {
                 playPauseMusicBtn.innerHTML = '<i class="bi bi-play-fill"></i>'; // Paused, Ended, Buffering -> Play icon
            }
        }

        // When the video changes within a playlist, update the displayed title
        if (event.data === YT.PlayerState.PLAYING || event.data === YT.PlayerState.BUFFERING) {
             if (player && player.getVideoData && trackTitleSpan) {
                 const videoData = player.getVideoData();
                 if (videoData && videoData.title) {
                     trackTitleSpan.textContent = videoData.title;
                     console.log("Updated track title on state change:", videoData.title);
                 } else {
                      trackTitleSpan.textContent = 'Unknown Title (Playing)';
                      console.warn("Could not get video data or title on playing/buffering state change.");
                 }
             } else console.warn("Player or track title span not available on state change.");
        }

        // Handle content ending (Optional: loop, play next in playlist automatically handled by API)
        if (event.data === YT.PlayerState.ENDED) {
             console.log("Content ended.");
             // If it was a single video, it's done. If it was a playlist, API will load the next.
             // If you want to explicitly loop a single video, you could do it here:
             // if (player && player.getPlaylistId() === null) { // Check if it's a single video (no playlist ID)
             //     player.seekTo(0);
             //     player.playVideo().catch(error => console.error("Failed to loop video:", error));
             //     console.log("Looping single video.");
             // }
        }
    }

    function onPlayerError(event) {
         console.error("YouTube Player error:", event.data);
         // Handle specific error codes if needed (e.g., private video, invalid ID)
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
                 break;
             default:
                 errorMessage = `Youtubeer Error: ${event.data}`;
                 break;
         }
         if (trackTitleSpan) trackTitleSpan.textContent = errorMessage; // Show error message
         if (musicControls) musicControls.style.display = 'none'; // Hide controls on error
         if (playPauseMusicBtn) playPauseMusicBtn.innerHTML = '<i class="bi bi-play-fill"></i>'; // Reset icon to play
         // Destroy player on error for cleanup
          if (player) {
              player.destroy();
              player = null;
          }
          console.warn("YouTube Player destroyed due to error.");
    }

    // Toggle playback of the YouTube content
    function togglePlayPauseMusic() {
        console.log("Toggle Music Play/Pause clicked.");
        if (player && player.getPlayerState) {
            const state = player.getPlayerState();
            if (state === YT.PlayerState.PLAYING) {
                console.log("Pausing content.");
                player.pauseVideo();
            } else if (state === YT.PlayerState.PAUSED || state === YT.PlayerState.ENDED || state === YT.PlayerState.BUFFERING) { // Check if paused to resume
                 console.log("Playing content.");
                 player.playVideo().catch(error => console.error("Failed to play content:", error)); // Catch potential play errors
            } else {
                 console.warn("YouTube Player is not in a playable state.");
                 // If player is unstarted (state -1), try to load the content again? Or just warn?
                 // Trying to load again might be useful if autoplay was blocked initially
                 if (state === -1 && youtubeLinkInput && youtubeLinkInput.value.trim()) {
                      console.log("Player state is unstarted, attempting to reload content on play click.");
                      handleLoadMusic(); // Trigger the load logic again
                 }
            }
        } else {
             console.warn("YouTube Player is not ready or not found.");
             // If player is not ready, and there's a link in the input, try to load it
             if (youtubeLinkInput && youtubeLinkInput.value.trim()) {
                 console.log("Player not found/ready, attempting to load content on play click.");
                 handleLoadMusic(); // Trigger the load logic
             } else {
                  console.warn("Cannot toggle playback: Player not ready and no link available.");
             }
        }
    }

     // Helper to get ID/Type and load YouTube content
     function handleLoadMusic() {
         console.log("Load Music button clicked.");
         if (youtubeLinkInput) {
             const url = youtubeLinkInput.value.trim();
             if (url) {
                 // Use the new function to get ID and type
                 const youtubeContent = getYouTubeIdAndType(url);

                 if (youtubeContent && youtubeContent.id && youtubeContent.type) {
                     // Call the updated load function with ID and type
                     loadYouTubeContent(youtubeContent.id, youtubeContent.type);
                     console.log(`Attempting to load YouTube content with Type: ${youtubeContent.type}, ID: ${youtubeContent.id}`);
                 } else {
                     alert("Invalid YouTube video or playlist link. Please enter a valid URL."); // Use Bootstrap modal later
                      console.warn("Invalid YouTube link entered.");
                 }
             } else {
                 alert("Please enter a YouTube link."); // Use Bootstrap modal later
                  console.warn("No YouTube link entered.");
             }
         } else console.warn("YouTube link input (#youtubeLinkInput) not found.");
     }


    // --- Event Listeners ---

    // Main Start/Pause button click
    if (startPauseBtn) {
        startPauseBtn.addEventListener('click', () => {
            console.log("Start/Pause button clicked.");
            // If timer is stopped or paused, attempt to start/resume
            if (currentTimerState === 'stopped' || currentTimerState.startsWith('paused')) {
                 // When resuming a paused WORK session with regain enabled and duration > 0,
                 // show the modal instead of directly starting the timer.
                 if (currentSessionType === 'work' && currentTimerState === 'paused-work' && isFocusRegainEnabled && pausedDuration > 0 && focusRegainModal) { // <-- Check if focusRegainModal instance exists
                     console.log("Paused work session, regain enabled, duration > 0. Showing regain modal.");
                     // The modal is shown in the pauseTimer function now.
                     // This button click triggered the pause which called pauseTimer.
                     // pauseTimer already handles showing the modal in this specific case.
                     // So, no need to call resumeFocusRegainTimer or show modal here again.
                     // The modal buttons will call handleFocusRegainAction which then calls startTimer().
                 } else {
                    // For all other cases (stopped, paused-break, paused-work with regain disabled/no duration)
                    console.log("Starting timer directly.");
                    startTimer();
                 }
            } else if (currentTimerState.startsWith('running')) {
                // If timer is running, pause it
                pauseTimer();
            }
        });
    } else {
        console.warn("Start/Pause button (#startPauseBtn) not found.");
    }

    // Reset Timer button click
    if (resetTimerBtn) {
        resetTimerBtn.addEventListener('click', resetTimer);
        console.log("Reset Timer button event listener attached.");
    } else {
        console.warn("Reset Timer button (#resetTimerBtn) not found.");
    }


    // Focus Regain toggle change
    if (focusRegainToggle) {
        focusRegainToggle.addEventListener('change', (event) => {
            console.log("Focus Regain toggle changed.", event.target.checked);
            isFocusRegainEnabled = event.target.checked;
            console.log("Focus Regain Enabled:", isFocusRegainEnabled);
        });
    } else {
         console.warn("Focus Regain Toggle not found.");
    }


    // Modal Button: Add Paused Time (Focus Regain Modal)
    if (focusRegainModalElement && addPausedTimeBtn) { // <-- Check if both elements exist
        // Use addEventListener with a specific handler function for clarity and potential removal
        addPausedTimeBtn.addEventListener('click', () => {
             console.log("Add Paused Time button clicked in modal.");
             handleFocusRegainAction('add'); // Call the action handler
             // Modal hiding is handled by data-bs-dismiss="modal" on the button
        });
         console.log("Add Paused Time button event listener attached.");
    } else {
        console.warn("Add Paused Time button (#addPausedTimeBtn) not found or modal element not initialized. Cannot attach click listener.");
    }


     // Modal Button: Discard Paused Time (Focus Regain Modal)
     if (focusRegainModalElement && discardPausedTimeBtn) { // <-- Check if both elements exist
         // Use addEventListener with a specific handler function for clarity and potential removal
         // data-bs-dismiss="modal" attribute on the button already handles modal hiding.
         discardPausedTimeBtn.addEventListener('click', () => {
             console.log("Discard Paused Time button clicked in modal.");
             handleFocusRegainAction('discard'); // Call the action handler
             // Modal hiding is handled by data-bs-dismiss="modal" on the button
         });
          console.log("Discard Paused Time button event listener attached.");
     } else {
         console.warn("Discard Paused Time button (#discardPausedTimeBtn) not found or modal element not initialized. Cannot attach click listener.");
     }

     // Listener for when the Focus Regain modal is hidden by clicking outside or pressing Esc
     // This is already handled at the top where the modal instance is created,
     // calling handleFocusRegainAction('discard') if the state is paused-work.


    // Modal Button: Confirmation Modal Proceed
    if (confirmationModalElement && confirmProceedBtn) { // <-- Check if both elements exist
        // Use a named function for clarity and potential removal if needed
        const handleConfirmationProceed = () => {
             console.log("Confirmation Modal Proceed button clicked.");
             // Modal hides via data-bs-dismiss="modal" or hidden listener
              if (confirmationModal) confirmationModal.hide(); // Explicitly hide for safety

             if (pendingConfig) {
                 applyConfig(pendingConfig); // Apply config if it was a config change confirmation
             } else {
                 // This case should be handled by the temporary listeners in resetTimer
                 // if the modal was shown for a reset confirmation.
                  console.warn("Confirmation proceeded but no pending config found (not a config change).");
             }
             // Reset modal text back to default config change message/buttons
             resetConfirmationModalText(); // Call the function to reset text
        };

        // Ensure no duplicate listeners by adding the specific handler function
        // Using 'once: true' for simplicity in this scenario
         confirmProceedBtn.addEventListener('click', handleConfirmationProceed, { once: true });
         console.log("Confirmation Modal Proceed button event listener attached.");
    } else {
         console.warn("Confirmation Modal Proceed button (#confirmProceedBtn) not found or modal element not initialized.");
    }

     // Modal Button: Confirmation Modal Cancel
     if (confirmationModalElement && confirmCancelBtn) { // <-- Check if both elements exist
         // Listener is automatically added by data-bs-dismiss="modal" in HTML
         // Add a handler if needed when the modal is cancelled (e.g., clear pending state)
         const handleConfirmationCancel = () => {
             console.log("Confirmation Modal Cancel button clicked or modal manually closed.");
             pendingConfig = null; // Clear pending config if cancelled
             console.log("Pending config cleared due to cancellation.");
             // Reset modal text back to default config change message/buttons
             resetConfirmationModalText(); // Call the function to reset text
         };

         // Attach listener for the modal's hidden event to catch manual closes
         // Using 'once: true' for simplicity in this scenario
         confirmationModalElement.addEventListener('hidden.bs.modal', handleConfirmationCancel, { once: true });

         console.log("Confirmation Modal Cancel button should work via data-bs-dismiss and hidden listener attached.");
     } else {
         console.warn("Confirmation Modal Cancel button (#confirmCancelBtn) not found or modal element not initialized.");
     }

    // Function to reset confirmation modal text back to default (config change)
    // This is used by both config change and reset logic
    const resetConfirmationModalText = () => {
         const modalBodyElement = confirmationModalElement.querySelector('.modal-body');
         if(modalBodyElement) modalBodyElement.innerHTML = "Change configuration? This will reset the current timer."; // Default text for config change
         const confirmProceedBtn = document.getElementById('confirmProceedBtn');
         if(confirmProceedBtn) confirmProceedBtn.textContent = "OK";
         const confirmCancelBtn = document.getElementById('confirmCancelBtn');
         if(confirmCancelBtn) confirmCancelBtn.textContent = "Cancel";
          console.log("Confirmation modal text reset to default.");
    };


    // Function to reset the timer explicitly via the reset button
    // Using local handlers with 'once: true' for simpler listener management
     function resetTimer() {
         console.log("resetTimer called. Current state:", currentTimerState);
         // Always confirm reset if timer is not stopped AND confirmation modal instance exists
         if (currentTimerState !== 'stopped' && confirmationModal) { // <-- Check if confirmationModal instance exists
              pendingConfig = activeConfig; // Store active config to reset to
              // Set modal body message for reset confirmation - USING GENERIC TEXT
              const modalBodyElement = confirmationModalElement.querySelector('.modal-body');
              if(modalBodyElement) modalBodyElement.innerHTML = "Are you sure you want to reset the timer? This will end the current session."; // Use generic text for modal action

              const confirmProceedBtn = document.getElementById('confirmProceedBtn');
               if(confirmProceedBtn) confirmProceedBtn.textContent = "Yes, Reset"; // Change button text
               else console.warn("Confirm Proceed button (#confirmProceedBtn) not found for reset modal.");

              const confirmCancelBtn = document.getElementById('confirmCancelBtn');
               if(confirmCancelBtn) confirmCancelBtn.textContent = "No, Cancel"; // Change button text
               else console.warn("Confirm Cancel button (#confirmCancelBtn) not found for reset modal.");

               // Define local handlers for this specific reset confirmation
               const localHandleResetConfirm = () => {
                   console.log("Reset confirmed via modal (Local Handler).");
                   // Modal hides via data-bs-dismiss="modal" or hidden listener
                   stopTimer();
                   console.log("Timer reset by user via modal (Local Handler).");
                   // No need to remove listeners here because 'once: true' is used
                   // No need to reset confirmation text here, stopTimer handles title reset
               };
               const localHandleResetCancel = () => {
                    console.log("Reset cancelled via modal (Local Handler).");
                    // Modal hides via data-bs-dismiss="modal" or hidden listener
                    pendingConfig = null; // Clear pending config on cancel
                    console.log("Pending config cleared due to cancellation (Local Handler).");
                    resetConfirmationModalText(); // Restore default text on cancel
                   // No need to remove listeners here because 'once: true' is used
               };


               // Attach local listeners with 'once: true'
               if(confirmProceedBtn) confirmProceedBtn.addEventListener('click', localHandleResetConfirm, { once: true });
               if(confirmCancelBtn) confirmCancelBtn.addEventListener('click', localHandleResetCancel, { once: true });
               // Use the hidden event listener for manual close during reset (also with once)
               if(confirmationModalElement) confirmationModalElement.addEventListener('hidden.bs.modal', localHandleResetCancel, { once: true });


               confirmationModal.show(); // Show the modal AFTER attaching listeners


          } else if (currentTimerState === 'stopped') {
              stopTimer();
               console.log("Timer already stopped, ensuring reset state.");
          }
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

    // Event Delegation for Config List Clicks (Select, Edit, Delete)
    const sidebarContent = document.querySelector('.sidebar-content'); // Ensure this selector is correct
    if (sidebarContent) {
        console.log("Sidebar content container found. Attaching event delegation listener.");
        // The actual event listener block starts here and should NOT be duplicated
        sidebarContent.addEventListener('click', (event) => {
            const target = event.target;
            console.log("Click event triggered on sidebar content. Target:", target); // Log the clicked target

            // Handle clicking on a config item to SELECT it
            // Checks if the clicked target itself is the item OR a child that is NOT a button/inside a button
            const configItem = target.closest('.list-group-item-dark');
            // Check that the clicked target or its parent is a config item, AND the click wasn't on an edit/delete button
            if (configItem && !target.classList.contains('btn') && !target.closest('.btn')) {
                const idElement = configItem.querySelector('.edit-config-btn, .delete-config-btn'); // Get ID from a button within the item
                if (idElement) {
                    const id = idElement.dataset.configId; // Extract data-config-id
                    console.log("List item clicked. Config ID found:", id);

                    let selectedConfig = null;
                    if (id.startsWith('default-')) {
                        selectedConfig = defaultConfigs[id]; // Get config object from defaultConfigs
                        console.log("Identified as Default Config.");
                    } else if (id.startsWith('custom-')) {
                         const index = parseInt(id.replace('custom-', ''));
                         console.log(`Identified as Custom Config. Derived index: ${index}`);
                         // --- Check customConfigs array access here ---
                         if (index >= 0 && index < customConfigs.length) {
                             selectedConfig = customConfigs[index]; // Get config object from customConfigs array
                             console.log("Found custom config in array:", selectedConfig);
                         } else {
                             console.error(`Invalid index derived for custom config: ${index}. customConfigs length: ${customConfigs.length}. Check renderConfigs and data-config-id in HTML.`);
                         }
                         // ------------------------------------------
                    }

                    if (selectedConfig) {
                         console.log("Calling setActiveConfig with:", selectedConfig);
                         // Call setActiveConfig which handles showing the confirmation modal if needed
                         setActiveConfig(selectedConfig); // Call the function to set the config
                    } else {
                         console.warn("Selected config not found for ID:", id);
                    }
                } else {
                     console.warn("Clicked on a list item, but no edit/delete button found to get config ID. Cannot select config.");
                     // This warning indicates a potential HTML structure issue or that the click wasn't on the part with the ID
                }
            }
            // Handle clicking on the Edit button
            else if (target.classList.contains('edit-config-btn')) {
                const configId = target.dataset.configId;
                console.log("Edit button clicked for config ID:", configId);
                 // Check if timer is running and needs confirmation before editing? Or just disallow?
                 // Let's disallow editing while timer is running for simplicity initially.
                 if (currentTimerState !== 'stopped') {
                      alert("Please stop the timer before editing configurations."); // Use modal later
                      console.warn("Attempted to edit config while timer is running.");
                 } else {
                     // Ensure it's a custom config if we plan to allow editing only custom ones
                     if (configId.startsWith('custom-') || configId.startsWith('default-')) { // Allow editing default to view values
                         startEditingConfig(configId); // Call the function to start editing
                     } else {
                         console.warn("Edit clicked on item without a valid config ID pattern.");
                     }
                 }
            }
            // Handle clicking on the Delete button
            else if (target.classList.contains('delete-config-btn')) {
                const configId = target.dataset.configId;
                console.log("Delete button clicked for config ID:", configId);
                 // Only allow deleting custom configs when timer is stopped
                 if (configId.startsWith('custom-')) { // Only allow deleting custom
                     if (currentTimerState === 'stopped') {
                         const index = parseInt(configId.replace('custom-', ''));
                         console.log(`Attempting to delete custom config at index: ${index}`);
                         // --- Check customConfigs array access here ---
                         if (index >= 0 && index < customConfigs.length) {
                             deleteCustomConfig(index); // Call the function to delete
                         } else {
                              console.error(`Invalid index derived for custom config deletion: ${index}. customConfigs length: ${customConfigs.length}. Check renderConfigs and data-config-id in HTML.`);
                         }
                         // -------------------------------------------
                     } else {
                          alert("Please stop the timer before deleting configurations."); // Use modal later
                          console.warn("Attempted to delete config while timer is running.");
                     }
                 } else {
                     alert("Cannot delete default configurations."); // Use modal later
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

    // Optional: Add event listener to input field for pressing Enter to load
     if (youtubeLinkInput && loadMusicBtn) {
         youtubeLinkInput.addEventListener('keypress', (event) => {
             if (event.key === 'Enter') {
                 event.preventDefault(); // Prevent default form submission if input is in a form
                 handleLoadMusic();
             }
         });
         console.log("YouTube link input keypress listener attached.");
     }


    // Initialize Bootstrap Tooltips
    // Select all elements with data-bs-toggle="tooltip" inside the sidebar
    const tooltipTriggerList = [].slice.call(pomodoroSidebar ? pomodoroSidebar.querySelectorAll('[data-bs-toggle="tooltip"]') : []);
    if (tooltipTriggerList.length > 0) {
        console.log(`Found ${tooltipTriggerList.length} elements with data-bs-toggle="tooltip" inside sidebar. Initializing tooltips.`);
    } else {
        console.log("No elements with data-bs-toggle='tooltip' found inside sidebar.");
    }

    tooltipTriggerList.map(function (tooltipTriggerEl) {
        if (typeof bootstrap !== 'undefined' && typeof bootstrap.Tooltip !== 'undefined') {
             // Dispose any existing tooltip instance before creating a new one
            const existingTooltip = bootstrap.Tooltip.getInstance(tooltipTriggerEl);
            if (existingTooltip) {
                existingTooltip.dispose();
            }
            return new bootstrap.Tooltip(tooltipTriggerEl);
        } else {
            console.warn("Bootstrap or Tooltip not available. Skipping tooltip initialization for an element.");
            return null;
        }

    }).filter(tooltip => tooltip !== null); // Filter out elements where tooltip creation failed


    console.log("Bootstrap Tooltips initialization attempted.");


    // --- Initial Setup ---
    renderConfigs(); // Render default and custom configs
    setActiveConfig(defaultConfigs['default-25']); // Set initial active config to default 25/5
    // Load YouTube API script asynchronously
    loadYouTubeAPI();

     console.log("Initial setup complete.");


}); // End DOMContentLoaded

// Make onYouTubeIframeAPIReady and onYouTubeIframeAPIFailedToLoad globally accessible
// The YouTube IFrame Player API will call these functions
window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
window.onYouTubeIframeAPIFailedToLoad = onYouTubeIframeAPIFailedToLoad;
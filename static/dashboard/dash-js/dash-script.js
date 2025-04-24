// --- Chart Initialization ---
let habitChart;
let moodChart;

function initializeCharts() {
    // Check if charts already exist, if so, destroy them before re-initializing
    // This is a safer way if you absolutely need to re-initialize,
    // but ideally, you'd update chart data instead.
    if (habitChart) {
        habitChart.destroy();
    }
    if (moodChart) {
        moodChart.destroy();
    }


    // Dummy Data for Charts (Replace with data fetched from your backend)
    const habitData = {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [{
            label: 'Water Intake (Glasses)',
            data: [20, 25, 28, 30], // Example data
            borderColor: '#4e73df',
            backgroundColor: 'rgba(78, 115, 223, 0.05)',
            pointRadius: 3,
            pointBackgroundColor: '#4e73df',
            pointBorderColor: '#4e73df',
            pointHoverRadius: 3,
            pointHoverBackgroundColor: '#4e73df',
            pointHoverBorderColor: '#4e73df',
            pointHitRadius: 10,
            pointBorderWidth: 2,
        }]
    };

    const moodData = {
        labels: ['Happy', 'Neutral', 'Sad', 'Anxious', 'Productive'],
        datasets: [{
            data: [30, 25, 10, 15, 20], // Example data (percentages or counts)
            backgroundColor: ['#1cc88a', '#f6c23e', '#e74a3b', '#fd7e14', '#36b9cc'], // Example colors
            hoverBackgroundColor: ['#17a673', '#f4b619', '#e02d3c', '#fc5412', '#2c9faf'],
            hoverBorderColor: "rgba(234, 236, 244, 1)",
        }],
    };

    // Habit Tracker Chart (Line Graph)
    const habitCtx = document.getElementById("habitChart").getContext('2d');
    habitChart = new Chart(habitCtx, {
        type: 'line', // Changed to line for a graph
        data: habitData,
        options: {
            maintainAspectRatio: false,
            layout: {
                padding: {
                    left: 10,
                    right: 25,
                    top: 25,
                    bottom: 0
                }
            },
            scales: {
                xAxes: [{
                    gridLines: {
                        display: false,
                        drawBorder: false
                    },
                    ticks: {
                         fontColor: "#e0e0e0" // Dark theme text color
                    },
                }],
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        fontColor: "#e0e0e0" // Dark theme text color
                    },
                    gridLines: {
                        color: "rgba(234, 236, 244, 0.1)", // Dark theme grid lines
                        zeroLineColor: "rgba(234, 236, 244, 0.1)",
                        drawBorder: false,
                        borderDash: [2],
                        zeroLineBorderDash: [2]
                    }
                }],
            },
            legend: {
                display: true, // Show legend
                labels: {
                    fontColor: "#e0e0e0" // Dark theme text color
                }
            },
            tooltips: {
                backgroundColor: "rgb(44,44,44)", // Dark theme tooltip background
                bodyFontColor: "#e0e0e0", // Dark theme tooltip text
                borderColor: '#dddfeb',
                borderWidth: 1,
                xPadding: 15,
                yPadding: 15,
                displayColors: false,
                caretPadding: 10,
            },
        },
    });

    // Mood Distribution Chart (Pie Chart)
    const moodCtx = document.getElementById("moodChart").getContext('2d');
    moodChart = new Chart(moodCtx, {
        type: 'doughnut', // Changed to doughnut for a pie-like chart
        data: moodData,
        options: {
            maintainAspectRatio: false,
            tooltips: {
                backgroundColor: "rgb(44,44,44)", // Dark theme tooltip background
                bodyFontColor: "#e0e0e0", // Dark theme tooltip text
                borderColor: '#dddfeb',
                borderWidth: 1,
                xPadding: 15,
                yPadding: 15,
                displayColors: false,
                caretPadding: 10,
                // callbacks: { // Optional: Customize tooltip to show percentage
                //     label: function(tooltipItem, data) {
                //         const dataset = data.datasets[tooltipItem.datasetIndex];
                //         const total = dataset.data.reduce((sum, value) => sum + value, 0);
                //         const currentValue = dataset.data[tooltipItem.index];
                //         const percentage = Math.round((currentValue / total) * 100);
                //         return data.labels[tooltipItem.index] + ': ' + percentage + '%';
                //     }
                // }
            },
            cutoutPercentage: 70, // Makes it a doughnut chart
            legend: {
                display: true, // Show legend
                 position: 'bottom', // Position legend below chart
                 labels: {
                    fontColor: "#e0e0e0" // Dark theme text color
                 }
            },
        },
    });
}

// --- Document Ready ---
// --- Document Ready ---
$(document).ready(function() {

    // Handle navigation link clicks
    $('.topbar .nav-link').on('click', function(e) {
        e.preventDefault(); // Prevent default link behavior

        // Get the target element ID from the data-target attribute
        const targetId = $(this).data('target');

        // Hide all feature sections and the default content *before* showing the new one
        // Also remove the 'show' class from all sections
        $('.feature-section, #default-content').removeClass('show').hide();


        // Show the target section and add the 'show' class to trigger the fade-in
        const targetSection = $('#' + targetId);
        targetSection.show(); // Make the element display: block first
        // Use a small timeout to allow the display change to register before starting the transition
        setTimeout(function() {
            targetSection.addClass('show');
        }, 10); // A small delay like 10ms is usually sufficient


        // Initialize charts ONLY when the dashboard is shown
        if (targetId === 'default-content'){
             initializeCharts();
        }

        // Optional: Highlight the active navigation link
        $('.topbar .nav-link').removeClass('active'); // Remove active class from all links
        $(this).addClass('active'); // Add active class to the clicked link
    });

    // Trigger click on the Dashboard link to show default content on page load
    // This will also trigger the initialization of charts and fade-in
    $('.topbar .nav-link[data-target="default-content"]').trigger('click');

    const chatButton = $('#chat-toggle-btn');
    const chatWindow = $('#chat-window');
    const closeChatButton = $('.close-chat'); // Get the new close button

    // Function to open the chat window
    function openChat() {
        chatWindow.css('display', 'flex'); // Set display to flex first
        // Use a small timeout to allow display change before transition
        setTimeout(function() {
            chatWindow.addClass('open');
        }, 10);
    }

    // Function to close the chat window
    function closeChat() {
        chatWindow.removeClass('open');
        // Use a timeout to hide the element after the transition ends
        setTimeout(function() {
            chatWindow.css('display', 'none');
        }, 300); // Match the transition duration (0.3s = 300ms)
    }

    // Toggle chat window on button click
    chatButton.on('click', function() {
        if (chatWindow.hasClass('open')) {
            closeChat(); // If open, close it
        } else {
            openChat(); // If closed, open it
        }
    });

    // Close chat window on close button click
    closeChatButton.on('click', function() {
        closeChat();
    });

    // Optional: Close chat window if clicking outside of it
    $(document).on('click', function(e) {
        // Check if the click is outside the chat button and chat window
        if (!chatButton.is(e.target) && chatButton.has(e.target).length === 0 &&
            !chatWindow.is(e.target) && chatWindow.has(e.target).length === 0) {
            if (chatWindow.hasClass('open')) {
                closeChat();
            }
        }
    });

});
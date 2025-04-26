// Personal Finance Fundamentals - Statistics Page JavaScript

// Global chart reference
let progressChart = null;

// Load statistics when the page loads
$(document).ready(function() {
    // Render initial statistics
    renderStatistics();
    
    // Add event listener for reset button
    $('#resetProgressBtn').on('click', function() {
        resetProgress();
    });
});

// Load and render all statistics data
function renderStatistics() {
    // Get progress data from API
    $.ajax({
        url: '/api/progress',
        type: 'GET',
        success: function(response) {
            if (response.success) {
                // Update each lesson's statistics
                const progress = response.progress;
                
                for (let i = 1; i <= 3; i++) {
                    updateLessonDisplay(i, progress[`lesson${i}`]);
                }
                
                // Update total progress indicator
                const totalProgressElement = $('#totalProgressDisplay');
                if (totalProgressElement.length) {
                    const totalPercentage = Math.min(100, Math.round(progress.totalProgress));
                    totalProgressElement.text(`${totalPercentage}%`);
                }
                
                // Render the progress chart
                renderProgressChart(progress.progressHistory);
                
            } else {
                // If not logged in or error, show empty statistics
                renderEmptyStatistics();
            }
        },
        error: function() {
            // Error fetching progress, show empty statistics
            renderEmptyStatistics();
        }
    });
}

// Render empty statistics (all zeros)
function renderEmptyStatistics() {
    // Reset each lesson's display to zeros
    for (let i = 1; i <= 3; i++) {
        const lessonData = {
            completed: false,
            quizCorrect: 0,
            bestScore: 0,
            quizTotal: 5
        };
        updateLessonDisplay(i, lessonData);
    }
    
    // Reset total progress
    const totalProgressElement = $('#totalProgressDisplay');
    if (totalProgressElement.length) {
        totalProgressElement.text('0%');
    }
    
    // Create empty chart
    renderProgressChart([{ date: new Date().toISOString(), value: 0 }]);
}

// Update the display for a specific lesson
function updateLessonDisplay(lessonNumber, lessonData) {
    // Get all the elements we need to update
    const scoreElement = $(`#lesson${lessonNumber}QuizScore`);
    const progressBarElement = $(`#lesson${lessonNumber}Progress`);
    const statusElement = $(`#lesson${lessonNumber}Status`);
    
    // If any element doesn't exist, log error and return
    if (!scoreElement.length || !progressBarElement.length || !statusElement.length) {
        console.error(`Missing UI elements for lesson ${lessonNumber}`);
        return;
    }
    
    // Update score display - only update the number itself, not the format
    const bestScore = lessonData.bestScore || 0;
    scoreElement.text(bestScore); // Just the number, not "bestScore/5"
    
    // Calculate progress percentage
    const quizPercentage = (bestScore / 5) * 80; // Quiz is 80% of lesson display progress
    const lessonCompleted = lessonData.completed ? 20 : 0; // Completion is 20% of lesson display progress
    const totalPercentage = Math.min(100, quizPercentage + lessonCompleted);
    
    // Update progress bar
    progressBarElement.css('width', `${totalPercentage}%`);
    progressBarElement.attr('aria-valuenow', totalPercentage);
    
    // Remove any existing classes and add appropriate ones
    progressBarElement.removeClass('bg-success bg-info bg-warning');
    if (totalPercentage >= 80) {
        progressBarElement.addClass('bg-success');
    } else if (totalPercentage >= 40) {
        progressBarElement.addClass('bg-info');
    } else if (totalPercentage > 0) {
        progressBarElement.addClass('bg-warning');
    }
    
    // Update status text
    let statusText = 'Not started';
    if (lessonData.completed) {
        statusText = 'Completed';
    } else if (bestScore > 0) {
        statusText = 'In progress';
    }
    statusElement.text(`Status: ${statusText}`);
}

// Render the progress chart
function renderProgressChart(progressHistory) {
    const ctx = document.getElementById('progressChart');
    if (!ctx) {
        console.error('Progress chart canvas not found');
        return;
    }
    
    // Destroy existing chart if it exists
    if (progressChart) {
        progressChart.destroy();
    }
    
    // Format dates for display
    const labels = progressHistory.map(entry => {
        const date = new Date(entry.date);
        return `${date.getMonth() + 1}/${date.getDate()}`;
    });
    
    // Get progress values
    const data = progressHistory.map(entry => entry.value);
    
    // Create new chart
    progressChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Knowledge Growth',
                data: data,
                borderColor: '#007bff',
                backgroundColor: 'rgba(0, 123, 255, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#007bff',
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Date'
                    }
                },
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Progress (%)'
                    },
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const index = context.dataIndex;
                            const event = progressHistory[index].event || 'Progress Update';
                            return [`${event}: ${context.parsed.y}%`];
                        }
                    }
                },
                legend: {
                    display: false
                }
            }
        }
    });
} 
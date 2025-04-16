// Stock Basics 101 - Statistics Page JavaScript

// Global chart reference
let progressChart = null;

// Load statistics when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Render initial statistics
    renderStatistics();
    
    // Add event listener for reset button that directly calls our new reset function
    document.getElementById('resetProgressBtn').addEventListener('click', function() {
        // Call our direct reset function that doesn't rely on main.js
        resetAllProgress();
    });
});

// Reset all progress data and immediately update the UI
function resetAllProgress() {
    if (confirm('Are you sure you want to reset all your progress? This cannot be undone.')) {
        // Create fresh initial progress object with zero values
        const initialProgress = {
            lesson1: {
                completed: false,
                quizCorrect: 0,
                bestScore: 0,
                quizTotal: 5
            },
            lesson2: {
                completed: false,
                quizCorrect: 0,
                bestScore: 0,
                quizTotal: 5
            },
            lesson3: {
                completed: false,
                quizCorrect: 0,
                bestScore: 0,
                quizTotal: 5
            },
            totalProgress: 0,
            progressHistory: [{ date: new Date().toISOString(), value: 0 }]
        };
        
        // Clear all session storage
        sessionStorage.clear();
        
        // Remove existing progress data
        localStorage.removeItem('stockBasicsProgress');
        
        // Save the fresh progress data
        localStorage.setItem('stockBasicsProgress', JSON.stringify(initialProgress));
        
        // Immediately update the UI without reloading
        renderStatistics();
        
        // Show reset confirmation
        const alertBox = document.createElement('div');
        alertBox.className = 'alert alert-success';
        alertBox.textContent = 'Progress successfully reset!';
        alertBox.style.position = 'fixed';
        alertBox.style.top = '20px';
        alertBox.style.left = '50%';
        alertBox.style.transform = 'translateX(-50%)';
        alertBox.style.zIndex = '9999';
        document.body.appendChild(alertBox);
        
        // Remove the alert after 3 seconds
        setTimeout(() => {
            alertBox.remove();
        }, 3000);
    }
}

// Load and render all statistics data
function renderStatistics() {
    // Get progress data from localStorage
    const progressData = localStorage.getItem('stockBasicsProgress');
    
    // If no progress data exists, show empty state
    if (!progressData) {
        renderEmptyStatistics();
        return;
    }
    
    const progress = JSON.parse(progressData);
    
    // Update each lesson's statistics
    for (let i = 1; i <= 3; i++) {
        updateLessonDisplay(i, progress[`lesson${i}`]);
    }
    
    // Update total progress indicator if it exists
    const totalProgressElement = document.getElementById('totalProgressDisplay');
    if (totalProgressElement) {
        const totalPercentage = Math.min(100, Math.round(progress.totalProgress));
        totalProgressElement.textContent = `${totalPercentage}%`;
    }
    
    // Render the progress chart
    renderProgressChart(progress.progressHistory);
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
    const totalProgressElement = document.getElementById('totalProgressDisplay');
    if (totalProgressElement) {
        totalProgressElement.textContent = '0%';
    }
    
    // Create empty chart
    renderProgressChart([{ date: new Date().toISOString(), value: 0 }]);
}

// Update the display for a specific lesson
function updateLessonDisplay(lessonNumber, lessonData) {
    // Get all the elements we need to update
    const scoreElement = document.getElementById(`lesson${lessonNumber}QuizScore`);
    const progressBarElement = document.getElementById(`lesson${lessonNumber}Progress`);
    const statusElement = document.getElementById(`lesson${lessonNumber}Status`);
    
    // If any element doesn't exist, log error and return
    if (!scoreElement || !progressBarElement || !statusElement) {
        console.error(`Missing UI elements for lesson ${lessonNumber}`);
        return;
    }
    
    // Update score display - only update the number itself, not the format
    const bestScore = lessonData.bestScore || 0;
    scoreElement.textContent = bestScore; // Just the number, not "bestScore/5"
    
    // Calculate progress percentage
    const quizPercentage = (bestScore / 5) * 80; // Quiz is 80% of total lesson progress
    const lessonCompleted = lessonData.completed ? 20 : 0; // Completion is 20%
    const totalPercentage = Math.min(100, quizPercentage + lessonCompleted);
    
    // Update progress bar
    progressBarElement.style.width = `${totalPercentage}%`;
    progressBarElement.setAttribute('aria-valuenow', totalPercentage);
    
    // Remove any existing classes and add appropriate ones
    progressBarElement.className = 'progress-bar';
    if (totalPercentage >= 80) {
        progressBarElement.classList.add('bg-success');
    } else if (totalPercentage >= 40) {
        progressBarElement.classList.add('bg-info');
    } else if (totalPercentage > 0) {
        progressBarElement.classList.add('bg-warning');
    }
    
    // Update status text
    let statusText = 'Not started';
    if (lessonData.completed) {
        statusText = 'Completed';
    } else if (bestScore > 0) {
        statusText = 'In progress';
    }
    statusElement.textContent = `Status: ${statusText}`;
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
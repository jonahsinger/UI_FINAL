// Stock Basics 101 - Main JavaScript File

// Initialize progress tracking
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in and load progress from the server
    fetchProgress();
    
    // Update UI based on current page
    const currentPage = window.location.pathname.split('/').pop();
    
    // Update active navigation
    updateActiveNavigation(currentPage);
    
    // If on statistics page, load the charts
    if (currentPage === 'statistics.html') {
        loadStatistics();
    }
});

// Fetch progress from the server
function fetchProgress() {
    fetch('/api/progress')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Store progress in localStorage for now (for compatibility)
                localStorage.setItem('stockBasicsProgress', JSON.stringify(data.progress));
            } else {
                console.log('Not logged in or error fetching progress. Using local storage fallback.');
                // Initialize progress in localStorage if it doesn't exist (fallback for non-logged in users)
                if (!localStorage.getItem('stockBasicsProgress')) {
                    initializeLocalProgress();
                } else {
                    // Update existing data structure to include bestScore if it doesn't exist
                    updateExistingProgress();
                }
            }
        })
        .catch(error => {
            console.error('Error fetching progress:', error);
            // Fallback to localStorage
            if (!localStorage.getItem('stockBasicsProgress')) {
                initializeLocalProgress();
            } else {
                updateExistingProgress();
            }
        });
}

// Initialize local progress (fallback)
function initializeLocalProgress() {
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
        totalProgress: 0, // Percentage of total progress
        progressHistory: [{ date: new Date().toISOString(), value: 0 }]
    };
    localStorage.setItem('stockBasicsProgress', JSON.stringify(initialProgress));
}

// Update existing progress data
function updateExistingProgress() {
    const progress = JSON.parse(localStorage.getItem('stockBasicsProgress'));
    let updated = false;
    
    for (let i = 1; i <= 3; i++) {
        if (!('bestScore' in progress[`lesson${i}`])) {
            progress[`lesson${i}`].bestScore = progress[`lesson${i}`].quizCorrect;
            updated = true;
        }
    }
    
    if (updated) {
        localStorage.setItem('stockBasicsProgress', JSON.stringify(progress));
    }
}

// Update active navigation item
function updateActiveNavigation(currentPage) {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });
}

// Mark a lesson as completed
function completeLesson(lessonNumber) {
    // First try to complete the lesson through the API
    fetch('/api/completeLesson', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lessonNumber }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Update localStorage with new progress data
            localStorage.setItem('stockBasicsProgress', JSON.stringify(data.progress));
        } else {
            console.log('API call failed, falling back to localStorage');
            updateLocalProgress();
        }
    })
    .catch(error => {
        console.error('Error completing lesson:', error);
        // Fallback to localStorage method
        updateLocalProgress();
    });
    
    // Fallback function for localStorage
    function updateLocalProgress() {
        const progress = JSON.parse(localStorage.getItem('stockBasicsProgress'));
        
        // Only mark as completed if it wasn't already
        if (!progress[`lesson${lessonNumber}`].completed) {
            progress[`lesson${lessonNumber}`].completed = true;
            
            // Add 20/3 % to total progress for completing a lesson (adjusted to make total 100%)
            progress.totalProgress += 20/3;
            
            // Add to progress history
            progress.progressHistory.push({
                date: new Date().toISOString(),
                value: progress.totalProgress,
                event: `Completed Lesson ${lessonNumber}`
            });
            
            localStorage.setItem('stockBasicsProgress', JSON.stringify(progress));
        }
    }
}

// Calculate total contribution from a specific lesson's quiz
function getQuizProgressContribution(correct) {
    return (correct * 100/15); // Each question is worth 100/15 %
}

// Store current quiz score and update progress if it's a better score
function storeQuizScore(lessonNumber, correctAnswers) {
    // First try to store quiz score through the API
    fetch('/api/storeQuizScore', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lessonNumber, correctAnswers }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Update localStorage with new progress data
            localStorage.setItem('stockBasicsProgress', JSON.stringify(data.progress));
        } else {
            console.log('API call failed, falling back to localStorage');
            updateLocalProgress();
        }
    })
    .catch(error => {
        console.error('Error storing quiz score:', error);
        // Fallback to localStorage method
        updateLocalProgress();
    });
    
    // Fallback function for localStorage
    function updateLocalProgress() {
        const progress = JSON.parse(localStorage.getItem('stockBasicsProgress'));
        const lesson = progress[`lesson${lessonNumber}`];
        
        // Track the current quiz session score
        lesson.quizCorrect = correctAnswers;
        
        // If this is a better score than before, update the best score and total progress
        if (correctAnswers > lesson.bestScore) {
            // Calculate progress difference
            const previousContribution = getQuizProgressContribution(lesson.bestScore);
            const newContribution = getQuizProgressContribution(correctAnswers);
            const progressDifference = newContribution - previousContribution;
            
            // Update best score
            lesson.bestScore = correctAnswers;
            
            // Add the progress difference to total progress
            if (progressDifference > 0) {
                progress.totalProgress += progressDifference;
                
                // Add to progress history
                progress.progressHistory.push({
                    date: new Date().toISOString(),
                    value: progress.totalProgress,
                    event: `New Best Score in Lesson ${lessonNumber} Quiz: ${correctAnswers}/5`
                });
            }
        }
        
        localStorage.setItem('stockBasicsProgress', JSON.stringify(progress));
    }
}

// Record quiz answer - modified to track separate quiz session
function recordQuizAnswer(lessonNumber, isCorrect) {
    // In the updated system, we only update progress at the end of the quiz
    // This function maintains compatibility with any code that might still call it
    // We track correct answers in session storage for the current quiz attempt
    if (isCorrect) {
        // Store temporary quiz progress in sessionStorage instead of affecting localStorage
        const sessionKey = `currentQuiz${lessonNumber}`;
        let currentCorrect = parseInt(sessionStorage.getItem(sessionKey) || '0');
        currentCorrect += 1;
        sessionStorage.setItem(sessionKey, currentCorrect.toString());
    }
}

// Get current progress as percentage
function getCurrentProgress() {
    const progress = JSON.parse(localStorage.getItem('stockBasicsProgress'));
    return progress.totalProgress;
}

// Reset all progress
function resetProgress() {
    // Try to reset progress through the API
    fetch('/api/resetProgress', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Refetch progress data
            fetchProgress();
            // Reload the page to show updated progress
            window.location.reload();
        } else {
            console.log('API call failed, falling back to localStorage reset');
            // If we're on the statistics page, call the function there if available
            if (typeof resetAllProgress === 'function') {
                resetAllProgress();
            } else {
                // Redirect to statistics page if we're not already there
                if (!window.location.pathname.includes('statistics.html')) {
                    window.location.href = 'statistics.html';
                } else {
                    alert('Please reload the page to use the updated reset functionality.');
                }
            }
        }
    })
    .catch(error => {
        console.error('Error resetting progress:', error);
        // Fallback to local reset
        if (typeof resetAllProgress === 'function') {
            resetAllProgress();
        } else {
            // Redirect to statistics page
            if (!window.location.pathname.includes('statistics.html')) {
                window.location.href = 'statistics.html';
            } else {
                alert('Please reload the page to use the updated reset functionality.');
            }
        }
    });
} 
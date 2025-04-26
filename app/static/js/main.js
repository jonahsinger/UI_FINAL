// Personal Finance Fundamentals - Main JavaScript File

$(document).ready(function() {
    // Check if user is logged in
    checkAuthStatus();
    
    // Update UI based on current page
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    updateActiveNavigation(currentPage);
});

// Check if user is logged in and update UI accordingly
function checkAuthStatus() {
    $.ajax({
        url: '/api/progress',
        type: 'GET',
        success: function(response) {
            updateAuthUI(true);
        },
        error: function() {
            updateAuthUI(false);
        }
    });
}

// Update the authentication UI based on login status
function updateAuthUI(isLoggedIn) {
    if (isLoggedIn) {
        // User is logged in, show logout button
        $('#auth-buttons').html('<button id="logout-btn" class="btn btn-outline-light">Logout</button>');
        
        // Add logout event listener
        $('#logout-btn').on('click', function() {
            $.ajax({
                url: '/auth/logout',
                type: 'GET',
                success: function() {
                    window.location.href = '/';
                }
            });
        });
    } else {
        // User is not logged in, show login/register buttons
        $('#auth-buttons').html(
            '<a href="/auth/login" class="btn btn-outline-light me-2">Login</a>' +
            '<a href="/auth/register" class="btn btn-light">Register</a>'
        );
    }
}

// Update active navigation item
function updateActiveNavigation(currentPage) {
    $('.nav-link').removeClass('active');
    $(`.nav-link[href="${currentPage}"]`).addClass('active');
}

// Mark a lesson as completed
function completeLesson(lessonNumber) {
    $.ajax({
        url: '/api/completeLesson',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            lessonNumber: lessonNumber
        }),
        success: function(response) {
            if (response.success) {
                console.log(`Lesson ${lessonNumber} marked as completed`);
            } else {
                console.error('Error completing lesson:', response.message);
            }
        },
        error: function() {
            console.error('Error completing lesson');
        }
    });
}

// Store quiz score
function storeQuizScore(lessonNumber, correctAnswers) {
    $.ajax({
        url: '/api/storeQuizScore',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            lessonNumber: lessonNumber,
            correctAnswers: correctAnswers
        }),
        success: function(response) {
            if (response.success) {
                console.log(`Quiz score for lesson ${lessonNumber} stored: ${correctAnswers}`);
            } else {
                console.error('Error storing quiz score:', response.message);
            }
        },
        error: function() {
            console.error('Error storing quiz score');
        }
    });
}

// Record quiz answer
function recordQuizAnswer(lessonNumber, isCorrect) {
    // This is just for temporary storage during the quiz session
    // We'll use sessionStorage for client-side tracking until the quiz is completed
    if (isCorrect) {
        const sessionKey = `currentQuiz${lessonNumber}`;
        let currentCorrect = parseInt(sessionStorage.getItem(sessionKey) || '0');
        currentCorrect += 1;
        sessionStorage.setItem(sessionKey, currentCorrect.toString());
    }
}

// Reset progress
function resetProgress() {
    if (confirm('Are you sure you want to reset all your progress? This cannot be undone.')) {
        $.ajax({
            url: '/api/resetProgress',
            type: 'POST',
            success: function(response) {
                if (response.success) {
                    alert('Progress has been reset.');
                    // Reload the page to reflect changes
                    window.location.reload();
                } else {
                    alert('Error resetting progress: ' + response.message);
                }
            },
            error: function() {
                alert('Error resetting progress. Please try again later.');
            }
        });
    }
} 
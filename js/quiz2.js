// Stock Basics 101 - Quiz 2: Compounding Returns JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize quiz
    initializeQuiz();
});

// Initialize quiz functionality
function initializeQuiz() {
    const totalQuestions = 5;
    let currentQuestionIndex = 1;
    let correctAnswers = 0;
    let questionAnswered = false;
    
    // Get navigation elements
    const prevButton = document.getElementById('prevButton');
    const nextButton = document.getElementById('nextButton');
    const currentQuestionElement = document.getElementById('currentQuestion');
    const correctCountElement = document.getElementById('correctCount');
    const progressBar = document.getElementById('quizProgressBar');
    
    // Add event listeners to quiz options for all questions
    for (let i = 1; i <= totalQuestions; i++) {
        const options = document.querySelectorAll(`#question${i} .quiz-option`);
        
        options.forEach(option => {
            option.addEventListener('click', function() {
                // Only allow selection if question hasn't been answered yet
                if (!questionAnswered) {
                    questionAnswered = true;
                    
                    // Check if answer is correct
                    const isCorrect = this.getAttribute('data-correct') === 'true';
                    
                    // Update score if correct
                    if (isCorrect) {
                        correctAnswers++;
                        correctCountElement.textContent = correctAnswers;
                    }
                    
                    // Show feedback
                    const correctFeedback = document.querySelector(`#question${currentQuestionIndex} .feedback.correct`);
                    const incorrectFeedback = document.querySelector(`#question${currentQuestionIndex} .feedback.incorrect`);
                    
                    if (isCorrect) {
                        this.classList.add('correct');
                        correctFeedback.style.display = 'block';
                    } else {
                        this.classList.add('incorrect');
                        incorrectFeedback.style.display = 'block';
                        
                        // Highlight the correct answer
                        options.forEach(opt => {
                            if (opt.getAttribute('data-correct') === 'true') {
                                opt.classList.add('correct');
                            }
                        });
                    }
                    
                    // Enable next button
                    nextButton.disabled = false;
                }
            });
        });
    }
    
    // Add event listener for prev button
    prevButton.addEventListener('click', function() {
        // Hide current question
        document.getElementById(`question${currentQuestionIndex}`).style.display = 'none';
        
        // Decrement question index
        currentQuestionIndex--;
        
        // Show previous question
        document.getElementById(`question${currentQuestionIndex}`).style.display = 'block';
        
        // Update navigation
        updateNavigation();
    });
    
    // Add event listener for next button
    nextButton.addEventListener('click', function() {
        // Hide current question
        document.getElementById(`question${currentQuestionIndex}`).style.display = 'none';
        
        // Increment question index
        currentQuestionIndex++;
        
        // If there are more questions, show the next one
        if (currentQuestionIndex <= totalQuestions) {
            document.getElementById(`question${currentQuestionIndex}`).style.display = 'block';
            questionAnswered = false;
            nextButton.disabled = true;
        } else {
            // Show quiz complete screen
            document.getElementById('quizComplete').style.display = 'block';
            document.getElementById('quizNavigation').style.display = 'none';
            document.getElementById('finalScore').textContent = Math.min(correctAnswers, 5);
            
            // Mark lesson as completed in progress tracking (from main.js)
            completeLesson(2);
            
            // Store the quiz score and update progress if it's a better score
            storeQuizScore(2, correctAnswers);
        }
        
        // Update navigation
        updateNavigation();
    });
    
    // Update navigation buttons and progress
    function updateNavigation() {
        // Update current question display - cap at totalQuestions
        currentQuestionElement.textContent = Math.min(currentQuestionIndex, totalQuestions);
        
        // Update progress bar
        const progressPercentage = ((currentQuestionIndex - 1) / totalQuestions) * 100;
        progressBar.style.width = `${progressPercentage}%`;
        
        // Enable/disable prev button
        prevButton.disabled = currentQuestionIndex === 1;
        
        // Set next button text on final question
        if (currentQuestionIndex === totalQuestions) {
            nextButton.textContent = 'Finish';
        } else {
            nextButton.textContent = 'Next';
        }
    }
    
    // Initialize navigation
    updateNavigation();
} 
// Stock Basics 101 - Lesson 2: Compounding Returns JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Mark this page as visited in progress tracking
    markLessonVisited(2);
    
    // Set up compound interest calculator
    setupCompoundCalculator();
});

// Mark the lesson as visited in progress tracking
function markLessonVisited(lessonNumber) {
    // This function just marks that the user has viewed the lesson
    // We'll mark it as completed once they finish the quiz
    console.log(`Lesson ${lessonNumber} visited`);
}

// Set up the compound interest calculator
function setupCompoundCalculator() {
    // Get input elements
    const initialInvestment = document.getElementById('initialInvestment');
    const annualRate = document.getElementById('annualRate');
    const timeYears = document.getElementById('timeYears');
    const timeValue = document.getElementById('timeValue');
    const compoundFrequency = document.getElementById('compoundFrequency');
    
    // Get result display elements
    const finalValue = document.getElementById('finalValue');
    const principalAmount = document.getElementById('principalAmount');
    const interestEarned = document.getElementById('interestEarned');
    const principalBar = document.getElementById('principalBar');
    const interestBar = document.getElementById('interestBar');
    
    // Add event listeners to inputs
    initialInvestment.addEventListener('input', calculateCompoundInterest);
    annualRate.addEventListener('input', calculateCompoundInterest);
    timeYears.addEventListener('input', function() {
        timeValue.textContent = timeYears.value;
        calculateCompoundInterest();
    });
    compoundFrequency.addEventListener('change', calculateCompoundInterest);
    
    // Initial calculation
    calculateCompoundInterest();
    
    // Calculate compound interest based on inputs
    function calculateCompoundInterest() {
        // Get input values
        const principal = parseFloat(initialInvestment.value);
        const rate = parseFloat(annualRate.value) / 100;
        const time = parseInt(timeYears.value);
        const frequency = parseInt(compoundFrequency.value);
        
        // Validate inputs
        if (isNaN(principal) || isNaN(rate) || isNaN(time) || isNaN(frequency) || principal <= 0 || rate <= 0 || time <= 0 || frequency <= 0) {
            finalValue.textContent = "Invalid Input";
            return;
        }
        
        // Calculate compound interest
        const final = principal * Math.pow(1 + (rate / frequency), frequency * time);
        const interest = final - principal;
        
        // Update result displays
        finalValue.textContent = formatCurrency(final);
        principalAmount.textContent = formatCurrency(principal);
        interestEarned.textContent = formatCurrency(interest);
        
        // Update progress bars
        const principalPercent = (principal / final) * 100;
        const interestPercent = (interest / final) * 100;
        
        principalBar.style.width = `${principalPercent}%`;
        interestBar.style.width = `${interestPercent}%`;
    }
    
    // Format number as currency
    function formatCurrency(value) {
        return value.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }
} 
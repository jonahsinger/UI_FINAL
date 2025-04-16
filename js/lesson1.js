// Personal Finance Fundamentals - Lesson 1: Budgeting Basics JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Mark this page as visited in progress tracking
    markLessonVisited(1);
    
    // Set up budget calculator
    setupBudgetCalculator();
});

// Mark the lesson as visited in progress tracking
function markLessonVisited(lessonNumber) {
    // This function just marks that the user has viewed the lesson
    // We'll mark it as completed once they finish the quiz
    console.log(`Lesson ${lessonNumber} visited`);
}

// Set up the budget calculator
function setupBudgetCalculator() {
    // Get DOM elements
    const calculateButton = document.getElementById('calculateBudget');
    if (!calculateButton) return; // Exit if we're not on the page with the calculator
    
    const incomeInput = document.getElementById('monthlyIncome');
    const needsInputs = document.querySelectorAll('.needs-expense');
    const wantsInputs = document.querySelectorAll('.wants-expense');
    const savingsInputs = document.querySelectorAll('.savings-expense');
    const budgetResults = document.getElementById('budgetResults');
    
    // Add event listener to calculate button
    calculateButton.addEventListener('click', calculateBudget);
    
    // Calculate and display budget results
    function calculateBudget() {
        // Get the monthly income
        const monthlyIncome = parseFloat(incomeInput.value) || 0;
        
        if (monthlyIncome <= 0) {
            alert('Please enter your monthly income to calculate your budget.');
            return;
        }
        
        // Calculate total expenses for each category
        const needsTotal = calculateCategoryTotal(needsInputs);
        const wantsTotal = calculateCategoryTotal(wantsInputs);
        const savingsTotal = calculateCategoryTotal(savingsInputs);
        
        // Calculate total expenses
        const totalExpenses = needsTotal + wantsTotal + savingsTotal;
        
        // Calculate balance
        const monthlyBalance = monthlyIncome - totalExpenses;
        
        // Calculate percentages
        const needsPercentage = (needsTotal / monthlyIncome) * 100;
        const wantsPercentage = (wantsTotal / monthlyIncome) * 100;
        const savingsPercentage = (savingsTotal / monthlyIncome) * 100;
        
        // Update the UI
        document.getElementById('needsTotal').textContent = formatCurrency(needsTotal);
        document.getElementById('wantsTotal').textContent = formatCurrency(wantsTotal);
        document.getElementById('savingsTotal').textContent = formatCurrency(savingsTotal);
        
        document.getElementById('needsPercentage').textContent = formatPercentage(needsPercentage);
        document.getElementById('wantsPercentage').textContent = formatPercentage(wantsPercentage);
        document.getElementById('savingsPercentage').textContent = formatPercentage(savingsPercentage);
        
        // Update progress bars
        updateProgressBar('needsProgress', needsPercentage, 50);
        updateProgressBar('wantsProgress', wantsPercentage, 30);
        updateProgressBar('savingsProgress', savingsPercentage, 20);
        
        // Update monthly balance
        document.getElementById('monthlyBalance').textContent = formatCurrency(monthlyBalance);
        
        // Add appropriate class to balance card based on balance
        const balanceCard = document.getElementById('balanceCard');
        balanceCard.classList.remove('positive', 'negative', 'neutral');
        
        if (monthlyBalance > 0) {
            balanceCard.classList.add('positive');
            document.getElementById('balanceMessage').textContent = 'Great job! You have money left over.';
        } else if (monthlyBalance < 0) {
            balanceCard.classList.add('negative');
            document.getElementById('balanceMessage').textContent = 'Warning: Your expenses exceed your income.';
        } else {
            balanceCard.classList.add('neutral');
            document.getElementById('balanceMessage').textContent = 'Your income equals your expenses.';
        }
        
        // Show results
        budgetResults.style.display = 'block';
        
        // Scroll to results
        budgetResults.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Helper function to calculate the total for a category
    function calculateCategoryTotal(inputs) {
        let total = 0;
        inputs.forEach(input => {
            total += parseFloat(input.value) || 0;
        });
        return total;
    }
    
    // Helper function to update a progress bar
    function updateProgressBar(id, percentage, target) {
        const progressBar = document.getElementById(id);
        progressBar.style.width = `${percentage}%`;
        
        // Change color based on comparison to target
        progressBar.classList.remove('bg-success', 'bg-warning', 'bg-danger');
        
        if (percentage <= target * 1.1) {
            progressBar.classList.add('bg-success'); // Within 10% of target
        } else if (percentage <= target * 1.25) {
            progressBar.classList.add('bg-warning'); // Within 25% of target
        } else {
            progressBar.classList.add('bg-danger'); // More than 25% over target
        }
        
        // Special case for savings - higher is better
        if (id === 'savingsProgress' && percentage >= target) {
            progressBar.classList.add('bg-success');
        }
    }
    
    // Helper function to format currency
    function formatCurrency(amount) {
        return '$' + amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
    }
    
    // Helper function to format percentage
    function formatPercentage(percent) {
        return percent.toFixed(1) + '%';
    }
} 
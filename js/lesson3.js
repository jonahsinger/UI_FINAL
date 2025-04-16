// Stock Basics 101 - Lesson 3: Tax Implications JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Mark this page as visited in progress tracking
    markLessonVisited(3);
    
    // Set up tax strategy calculator
    setupTaxCalculator();
});

// Mark the lesson as visited in progress tracking
function markLessonVisited(lessonNumber) {
    // This function just marks that the user has viewed the lesson
    // We'll mark it as completed once they finish the quiz
    console.log(`Lesson ${lessonNumber} visited`);
}

// Set up the tax strategy calculator
function setupTaxCalculator() {
    // Get form elements
    const annualContribution = document.getElementById('annualContribution');
    const investmentYears = document.getElementById('investmentYears');
    const expectedReturn = document.getElementById('expectedReturn');
    const currentTaxRate = document.getElementById('currentTaxRate');
    const retirementTaxRate = document.getElementById('retirementTaxRate');
    const calculateButton = document.getElementById('calculateButton');
    
    // Get result display elements
    const rothFinalValue = document.getElementById('rothFinalValue');
    const rothTotalContributions = document.getElementById('rothTotalContributions');
    const rothTotalTax = document.getElementById('rothTotalTax');
    const k401FinalValue = document.getElementById('401kFinalValue');
    const k401TotalContributions = document.getElementById('401kTotalContributions');
    const k401TotalTax = document.getElementById('401kTotalTax');
    const winnerBox = document.getElementById('winnerBox');
    const winnerText = document.getElementById('winnerText');
    
    // Add event listener to calculate button
    calculateButton.addEventListener('click', calculateTaxStrategy);
    
    // Calculate tax strategy comparison
    function calculateTaxStrategy() {
        // Get input values
        const contribution = parseFloat(annualContribution.value);
        const years = parseInt(investmentYears.value);
        const returnRate = parseFloat(expectedReturn.value) / 100;
        const currentTax = parseFloat(currentTaxRate.value) / 100;
        const retirementTax = parseFloat(retirementTaxRate.value) / 100;
        
        // Validate inputs
        if (isNaN(contribution) || isNaN(years) || isNaN(returnRate) || isNaN(currentTax) || isNaN(retirementTax) ||
            contribution <= 0 || years <= 0 || returnRate <= 0 || currentTax <= 0 || retirementTax <= 0) {
            alert('Please enter valid positive numbers for all fields.');
            return;
        }
        
        // Calculate Roth IRA
        const rothContributionAfterTax = contribution; // Already taxed
        const rothTaxPaid = contribution * currentTax; // Tax paid on contributions
        const rothGrowth = calculateCompoundGrowth(rothContributionAfterTax, years, returnRate);
        const rothFinal = rothGrowth; // No tax on withdrawal
        
        // Calculate Traditional 401(k)
        const traditionalContribution = contribution; // Pre-tax
        const traditionalGrowth = calculateCompoundGrowth(traditionalContribution, years, returnRate);
        const traditionalTaxPaid = traditionalGrowth * retirementTax; // Tax paid on withdrawal
        const traditionalFinal = traditionalGrowth - traditionalTaxPaid;
        
        // Calculate totals
        const totalRothContributions = rothContributionAfterTax * years;
        const totalRothTax = rothTaxPaid * years;
        const total401kContributions = traditionalContribution * years;
        const total401kTax = traditionalTaxPaid;
        
        // Update result displays
        rothFinalValue.textContent = formatCurrency(rothFinal);
        rothTotalContributions.textContent = formatCurrency(totalRothContributions);
        rothTotalTax.textContent = formatCurrency(totalRothTax);
        k401FinalValue.textContent = formatCurrency(traditionalFinal);
        k401TotalContributions.textContent = formatCurrency(total401kContributions);
        k401TotalTax.textContent = formatCurrency(total401kTax);
        
        // Determine winner
        winnerBox.className = 'text-center p-2 rounded mt-2';
        if (rothFinal > traditionalFinal) {
            winnerBox.classList.add('bg-info', 'text-white');
            winnerText.textContent = 'Roth IRA wins by ' + formatCurrency(rothFinal - traditionalFinal);
        } else if (traditionalFinal > rothFinal) {
            winnerBox.classList.add('bg-primary', 'text-white');
            winnerText.textContent = 'Traditional 401(k) wins by ' + formatCurrency(traditionalFinal - rothFinal);
        } else {
            winnerBox.classList.add('bg-secondary', 'text-white');
            winnerText.textContent = 'It\'s a tie!';
        }
    }
    
    // Calculate compound growth over time
    function calculateCompoundGrowth(principal, years, rate) {
        return principal * ((Math.pow(1 + rate, years) - 1) / rate) * (1 + rate);
    }
    
    // Format number as currency
    function formatCurrency(value) {
        return value.toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
    }
} 
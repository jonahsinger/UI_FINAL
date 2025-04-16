// Personal Finance Fundamentals - Lesson 2: Take-Home Pay JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Mark this page as visited in progress tracking
    markLessonVisited(2);
    
    // Set up take-home pay calculator
    setupTakeHomePayCalculator();
});

// Mark the lesson as visited in progress tracking
function markLessonVisited(lessonNumber) {
    // This function just marks that the user has viewed the lesson
    // We'll mark it as completed once they finish the quiz
    console.log(`Lesson ${lessonNumber} visited`);
}

// Set up the take-home pay calculator
function setupTakeHomePayCalculator() {
    // Get DOM elements
    const calculateButton = document.getElementById('calculateTakeHomePay');
    if (!calculateButton) return; // Exit if we're not on the page with the calculator
    
    const salaryInput = document.getElementById('annualSalary');
    const payFrequencySelect = document.getElementById('payFrequency');
    const filingStatusSelect = document.getElementById('filingStatus');
    const stateSelect = document.getElementById('state');
    const retirementInput = document.getElementById('retirement401k');
    const healthInsuranceInput = document.getElementById('healthInsurance');
    const otherPreTaxInput = document.getElementById('otherPreTax');
    const otherPostTaxInput = document.getElementById('otherPostTax');
    const resultsContainer = document.getElementById('payResults');
    
    // Add event listener to calculate button
    calculateButton.addEventListener('click', calculateTakeHomePay);
    
    // Calculate and display take-home pay results
    function calculateTakeHomePay() {
        // Get annual salary
        const annualSalary = parseFloat(salaryInput.value) || 0;
        
        if (annualSalary <= 0) {
            alert('Please enter your annual salary to calculate your take-home pay.');
            return;
        }
        
        // Get other inputs
        const payFrequency = payFrequencySelect.value;
        const filingStatus = filingStatusSelect.value;
        const state = stateSelect.value;
        const retirement401k = parseFloat(retirementInput.value) || 0;
        const healthInsurance = parseFloat(healthInsuranceInput.value) || 0;
        const otherPreTax = parseFloat(otherPreTaxInput.value) || 0;
        const otherPostTax = parseFloat(otherPostTaxInput.value) || 0;
        
        // Calculate the number of pay periods
        const payPeriods = getPayPeriods(payFrequency);
        
        // Calculate pre-tax deductions
        const retirementAmount = (annualSalary * (retirement401k / 100)) / payPeriods;
        const totalPreTaxDeductions = retirementAmount + healthInsurance + otherPreTax;
        
        // Calculate taxable income per pay period
        const taxableIncomePerPeriod = (annualSalary / payPeriods) - totalPreTaxDeductions;
        const taxableIncomeAnnual = annualSalary - (totalPreTaxDeductions * payPeriods);
        
        // Calculate federal income tax
        const federalTax = calculateFederalTax(taxableIncomeAnnual, filingStatus) / payPeriods;
        
        // Calculate FICA taxes
        const socialSecurityTax = calculateSocialSecurityTax(taxableIncomePerPeriod);
        const medicareTax = calculateMedicareTax(taxableIncomePerPeriod);
        
        // Calculate state tax (simplified)
        const stateTax = calculateStateTax(taxableIncomePerPeriod, state);
        
        // Calculate total taxes
        const totalTaxes = federalTax + socialSecurityTax + medicareTax + stateTax;
        
        // Calculate post-tax deductions
        const totalPostTaxDeductions = otherPostTax;
        
        // Calculate take-home pay
        const takeHomePayPerPeriod = taxableIncomePerPeriod - totalTaxes - totalPostTaxDeductions;
        const takeHomePayAnnual = takeHomePayPerPeriod * payPeriods;
        
        // Display results
        document.getElementById('grossPayPeriod').textContent = formatCurrency(annualSalary / payPeriods);
        document.getElementById('preTaxDeductions').textContent = formatCurrency(totalPreTaxDeductions);
        document.getElementById('taxableIncome').textContent = formatCurrency(taxableIncomePerPeriod);
        document.getElementById('federalTax').textContent = formatCurrency(federalTax);
        document.getElementById('socialSecurityTax').textContent = formatCurrency(socialSecurityTax);
        document.getElementById('medicareTax').textContent = formatCurrency(medicareTax);
        document.getElementById('stateTax').textContent = formatCurrency(stateTax);
        document.getElementById('totalTaxes').textContent = formatCurrency(totalTaxes);
        document.getElementById('postTaxDeductions').textContent = formatCurrency(totalPostTaxDeductions);
        document.getElementById('takeHomePayPeriod').textContent = formatCurrency(takeHomePayPerPeriod);
        document.getElementById('takeHomePayAnnual').textContent = formatCurrency(takeHomePayAnnual);
        document.getElementById('takeHomePercent').textContent = ((takeHomePayAnnual / annualSalary) * 100).toFixed(1) + '%';
        
        // Update charts
        updateDeductionsChart(totalPreTaxDeductions, totalTaxes, totalPostTaxDeductions, takeHomePayPerPeriod);
        updateTaxesChart(federalTax, socialSecurityTax, medicareTax, stateTax);
        
        // Show results
        resultsContainer.style.display = 'block';
        
        // Scroll to results
        resultsContainer.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Get number of pay periods based on frequency
    function getPayPeriods(frequency) {
        switch(frequency) {
            case 'weekly': return 52;
            case 'biweekly': return 26;
            case 'semimonthly': return 24;
            case 'monthly': return 12;
            default: return 26; // Default to biweekly
        }
    }
    
    // Calculate federal income tax (simplified 2023 brackets)
    function calculateFederalTax(annualIncome, filingStatus) {
        // Tax brackets for 2023 (simplified)
        const singleBrackets = [
            { threshold: 0, rate: 0.10 },
            { threshold: 11000, rate: 0.12 },
            { threshold: 44725, rate: 0.22 },
            { threshold: 95375, rate: 0.24 },
            { threshold: 182100, rate: 0.32 },
            { threshold: 231250, rate: 0.35 },
            { threshold: 578125, rate: 0.37 }
        ];
        
        const marriedBrackets = [
            { threshold: 0, rate: 0.10 },
            { threshold: 22000, rate: 0.12 },
            { threshold: 89450, rate: 0.22 },
            { threshold: 190750, rate: 0.24 },
            { threshold: 364200, rate: 0.32 },
            { threshold: 462500, rate: 0.35 },
            { threshold: 693750, rate: 0.37 }
        ];
        
        // Select appropriate tax brackets based on filing status
        const brackets = filingStatus === 'single' ? singleBrackets : marriedBrackets;
        
        // Calculate tax
        let tax = 0;
        let previousThreshold = 0;
        
        for (let i = 0; i < brackets.length; i++) {
            const currentBracket = brackets[i];
            const nextThreshold = brackets[i + 1] ? brackets[i + 1].threshold : Infinity;
            
            if (annualIncome > currentBracket.threshold) {
                const taxableInThisBracket = Math.min(annualIncome, nextThreshold) - currentBracket.threshold;
                tax += taxableInThisBracket * currentBracket.rate;
            }
            
            if (annualIncome <= nextThreshold) break;
            previousThreshold = currentBracket.threshold;
        }
        
        return tax;
    }
    
    // Calculate Social Security tax (6.2% up to wage base limit)
    function calculateSocialSecurityTax(income) {
        const rate = 0.062;
        const wageBaseLimit = 160200 / getPayPeriods('biweekly'); // 2023 wage base limit per pay period (approximate)
        return Math.min(income, wageBaseLimit) * rate;
    }
    
    // Calculate Medicare tax (1.45% + 0.9% for high earners)
    function calculateMedicareTax(income) {
        const baseRate = 0.0145;
        const additionalRate = 0.009;
        
        // Threshold for additional Medicare tax (approximate per pay period)
        const additionalMedicareThreshold = 200000 / getPayPeriods('biweekly');
        
        let tax = income * baseRate;
        
        // Add additional Medicare tax for high earners
        if (income > additionalMedicareThreshold) {
            tax += (income - additionalMedicareThreshold) * additionalRate;
        }
        
        return tax;
    }
    
    // Calculate state tax (simplified)
    function calculateStateTax(income, state) {
        // Simplified state tax rates (actual rates vary widely)
        const stateRates = {
            'CA': 0.08,
            'TX': 0.00,
            'NY': 0.06,
            'FL': 0.00,
            'IL': 0.0495,
            // Default rate for other states
            'default': 0.05
        };
        
        const rate = stateRates[state] || stateRates['default'];
        return income * rate;
    }
    
    // Update the deductions chart
    function updateDeductionsChart(preTax, taxes, postTax, takeHome) {
        // Create data for deductions chart (could use Chart.js or other library)
        // For now, just update some visual elements
        const total = preTax + taxes + postTax + takeHome;
        
        document.getElementById('preTaxPercent').textContent = ((preTax / total) * 100).toFixed(1) + '%';
        document.getElementById('taxesPercent').textContent = ((taxes / total) * 100).toFixed(1) + '%';
        document.getElementById('postTaxPercent').textContent = ((postTax / total) * 100).toFixed(1) + '%';
        
        document.getElementById('preTaxBar').style.width = ((preTax / total) * 100) + '%';
        document.getElementById('taxesBar').style.width = ((taxes / total) * 100) + '%';
        document.getElementById('postTaxBar').style.width = ((postTax / total) * 100) + '%';
        document.getElementById('takeHomeBar').style.width = ((takeHome / total) * 100) + '%';
    }
    
    // Update the taxes chart
    function updateTaxesChart(federal, socialSecurity, medicare, state) {
        // Create data for taxes chart (could use Chart.js or other library)
        // For now, just update some visual elements
        const totalTaxes = federal + socialSecurity + medicare + state;
        
        document.getElementById('federalTaxPercent').textContent = ((federal / totalTaxes) * 100).toFixed(1) + '%';
        document.getElementById('socialSecurityPercent').textContent = ((socialSecurity / totalTaxes) * 100).toFixed(1) + '%';
        document.getElementById('medicarePercent').textContent = ((medicare / totalTaxes) * 100).toFixed(1) + '%';
        document.getElementById('stateTaxPercent').textContent = ((state / totalTaxes) * 100).toFixed(1) + '%';
        
        document.getElementById('federalTaxBar').style.width = ((federal / totalTaxes) * 100) + '%';
        document.getElementById('socialSecurityBar').style.width = ((socialSecurity / totalTaxes) * 100) + '%';
        document.getElementById('medicareBar').style.width = ((medicare / totalTaxes) * 100) + '%';
        document.getElementById('stateTaxBar').style.width = ((state / totalTaxes) * 100) + '%';
    }
    
    // Helper function to format currency
    function formatCurrency(amount) {
        return '$' + amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
    }
} 
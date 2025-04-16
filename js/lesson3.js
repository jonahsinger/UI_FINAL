// Personal Finance Fundamentals - Lesson 3: Debt Management JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Mark this page as visited in progress tracking
    markLessonVisited(3);
    
    // Set up debt payoff calculator
    setupDebtPayoffCalculator();
});

// Mark the lesson as visited in progress tracking
function markLessonVisited(lessonNumber) {
    // This function just marks that the user has viewed the lesson
    // We'll mark it as completed once they finish the quiz
    console.log(`Lesson ${lessonNumber} visited`);
}

// Set up the debt payoff calculator
function setupDebtPayoffCalculator() {
    // Get DOM elements for debt inputs
    const addDebtButton = document.getElementById('addDebt');
    const debtForm = document.getElementById('debtForm');
    const debtList = document.getElementById('debtList');
    const extraPayment = document.getElementById('extraPayment');
    const calculateButton = document.getElementById('calculatePayoff');
    const strategySelect = document.getElementById('payoffStrategy');
    const resultsContainer = document.getElementById('payoffResults');
    
    if (!addDebtButton) return; // Exit if we're not on the page with the calculator
    
    // Initialize debt counter
    let debtCounter = 0;
    
    // Add event listeners
    addDebtButton.addEventListener('click', addDebtInput);
    calculateButton.addEventListener('click', calculatePayoff);
    
    // Add initial debt input
    addDebtInput();
    
    // Function to add a new debt input row
    function addDebtInput() {
        debtCounter++;
        
        const debtRow = document.createElement('div');
        debtRow.className = 'debt-row mb-3 row';
        debtRow.id = `debt-${debtCounter}`;
        
        debtRow.innerHTML = `
            <div class="col-md-4">
                <input type="text" class="form-control debt-name" placeholder="Debt name (e.g. Credit Card)" required>
            </div>
            <div class="col-md-2">
                <input type="number" class="form-control debt-balance" placeholder="Balance" min="0" step="0.01" required>
            </div>
            <div class="col-md-2">
                <input type="number" class="form-control debt-rate" placeholder="Interest Rate %" min="0" max="100" step="0.01" required>
            </div>
            <div class="col-md-2">
                <input type="number" class="form-control debt-payment" placeholder="Min Payment" min="0" step="0.01" required>
            </div>
            <div class="col-md-2">
                <button type="button" class="btn btn-danger remove-debt" data-debt-id="${debtCounter}">Remove</button>
            </div>
        `;
        
        debtList.appendChild(debtRow);
        
        // Add event listener to remove button
        const removeButton = debtRow.querySelector('.remove-debt');
        removeButton.addEventListener('click', function() {
            const debtId = this.dataset.debtId;
            const debtRow = document.getElementById(`debt-${debtId}`);
            debtRow.remove();
        });
    }
    
    // Function to calculate debt payoff
    function calculatePayoff() {
        // Collect all debt inputs
        const debtRows = document.querySelectorAll('.debt-row');
        const debts = [];
        
        // Validate and collect debt data
        for (const row of debtRows) {
            const name = row.querySelector('.debt-name').value.trim();
            const balance = parseFloat(row.querySelector('.debt-balance').value);
            const rate = parseFloat(row.querySelector('.debt-rate').value);
            const minPayment = parseFloat(row.querySelector('.debt-payment').value);
            
            if (!name || isNaN(balance) || isNaN(rate) || isNaN(minPayment) || 
                balance <= 0 || rate < 0 || minPayment <= 0) {
                alert('Please fill in all debt fields with valid values.');
                return;
            }
            
            debts.push({
                name,
                balance,
                rate,
                minPayment,
                originalBalance: balance
            });
        }
        
        if (debts.length === 0) {
            alert('Please add at least one debt to calculate payoff.');
            return;
        }
        
        // Get extra payment amount
        const additionalPayment = parseFloat(extraPayment.value) || 0;
        
        // Get selected payoff strategy
        const strategy = strategySelect.value;
        
        // Sort debts based on selected strategy
        if (strategy === 'avalanche') {
            // Sort by interest rate (highest first)
            debts.sort((a, b) => b.rate - a.rate);
        } else {
            // Snowball - sort by balance (lowest first)
            debts.sort((a, b) => a.balance - b.balance);
        }
        
        // Calculate payoff
        const results = calculatePayoffPlan(debts, additionalPayment);
        
        // Display results
        displayPayoffResults(results, debts, strategy);
        
        // Show results container
        resultsContainer.style.display = 'block';
        
        // Scroll to results
        resultsContainer.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Calculate debt payoff plan
    function calculatePayoffPlan(debts, additionalPayment) {
        // Clone debts to avoid modifying the original array
        const workingDebts = JSON.parse(JSON.stringify(debts));
        let totalMonths = 0;
        let totalPaid = 0;
        let totalInterestPaid = 0;
        const monthlyPayments = [];
        
        // Continue until all debts are paid off
        while (workingDebts.some(debt => debt.balance > 0)) {
            totalMonths++;
            let monthlyPayment = 0;
            let monthlyInterest = 0;
            let remainingExtra = additionalPayment;
            
            // First, make minimum payments on all debts
            for (const debt of workingDebts) {
                if (debt.balance <= 0) continue;
                
                // Calculate interest for this month
                const interest = (debt.balance * (debt.rate / 100)) / 12;
                monthlyInterest += interest;
                
                // Add interest to balance
                debt.balance += interest;
                
                // Make minimum payment (or pay off if balance is less than minimum)
                const payment = Math.min(debt.balance, debt.minPayment);
                debt.balance -= payment;
                monthlyPayment += payment;
                
                // Round to two decimal places to avoid floating point issues
                debt.balance = Math.round(debt.balance * 100) / 100;
            }
            
            // Apply extra payment to debts according to strategy order
            for (const debt of workingDebts) {
                if (debt.balance <= 0 || remainingExtra <= 0) continue;
                
                // Calculate extra payment (limited by remaining debt)
                const extraPayment = Math.min(debt.balance, remainingExtra);
                debt.balance -= extraPayment;
                monthlyPayment += extraPayment;
                remainingExtra -= extraPayment;
                
                // Round to two decimal places
                debt.balance = Math.round(debt.balance * 100) / 100;
                
                // If debt is paid off, add remaining minimum payment to extra
                if (debt.balance === 0) {
                    remainingExtra += debt.minPayment;
                }
            }
            
            totalPaid += monthlyPayment;
            totalInterestPaid += monthlyInterest;
            
            // Record monthly payment data (could be used for charting)
            monthlyPayments.push({
                month: totalMonths,
                payment: monthlyPayment,
                interest: monthlyInterest,
                remainingBalance: workingDebts.reduce((sum, debt) => sum + debt.balance, 0)
            });
        }
        
        return {
            totalMonths,
            totalPaid,
            totalInterestPaid,
            monthlyPayments,
            payoffDate: getPayoffDate(totalMonths)
        };
    }
    
    // Get payoff date based on number of months from now
    function getPayoffDate(months) {
        const date = new Date();
        date.setMonth(date.getMonth() + months);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    }
    
    // Display payoff results
    function displayPayoffResults(results, debts, strategy) {
        // Display summary results
        document.getElementById('payoffMonths').textContent = results.totalMonths;
        document.getElementById('payoffDate').textContent = results.payoffDate;
        document.getElementById('totalPaid').textContent = formatCurrency(results.totalPaid);
        document.getElementById('totalInterest').textContent = formatCurrency(results.totalInterestPaid);
        
        // Calculate total debt amount
        const totalDebt = debts.reduce((sum, debt) => sum + debt.originalBalance, 0);
        document.getElementById('interestSavings').textContent = 
            formatCurrency(results.totalInterestPaid / totalDebt * 100) + '%';
        
        // Update strategy description
        const strategyDescription = document.getElementById('strategyDescription');
        if (strategy === 'avalanche') {
            strategyDescription.textContent = 'You are using the Avalanche method, which pays off highest interest debts first to minimize interest payments.';
        } else {
            strategyDescription.textContent = 'You are using the Snowball method, which pays off smallest debts first to build momentum and motivation.';
        }
        
        // Create a progress timeline
        createPayoffTimeline(results.monthlyPayments, debts);
        
        // Create bar chart comparing original vs. paid amounts
        createDebtComparisonChart(debts, results.totalInterestPaid);
    }
    
    // Create a visual timeline of debt payoff
    function createPayoffTimeline(monthlyPayments, debts) {
        const timelineContainer = document.getElementById('payoffTimeline');
        timelineContainer.innerHTML = '';
        
        // Create a simplified timeline showing key months
        const totalMonths = monthlyPayments.length;
        const milestones = [
            1,
            Math.ceil(totalMonths * 0.25),
            Math.ceil(totalMonths * 0.5),
            Math.ceil(totalMonths * 0.75),
            totalMonths
        ].filter((value, index, self) => self.indexOf(value) === index); // Remove duplicates
        
        // Create the timeline
        const timeline = document.createElement('div');
        timeline.className = 'progress mb-3';
        
        // Calculate percentage width for each stage
        let lastPosition = 0;
        
        milestones.forEach((month, index) => {
            const position = (month / totalMonths) * 100;
            const width = position - lastPosition;
            
            const stage = document.createElement('div');
            stage.className = `progress-bar ${index % 2 === 0 ? 'bg-primary' : 'bg-info'}`;
            stage.style.width = `${width}%`;
            stage.textContent = `Month ${month}`;
            
            timeline.appendChild(stage);
            lastPosition = position;
        });
        
        timelineContainer.appendChild(timeline);
        
        // Add information about remaining balance at each milestone
        const milestoneInfo = document.createElement('div');
        milestoneInfo.className = 'row justify-content-between text-center my-3';
        
        milestones.forEach(month => {
            const monthData = monthlyPayments[month - 1];
            
            const info = document.createElement('div');
            info.className = 'col';
            info.innerHTML = `
                <div class="font-weight-bold">Month ${month}</div>
                <div>Remaining: ${formatCurrency(monthData.remainingBalance)}</div>
            `;
            
            milestoneInfo.appendChild(info);
        });
        
        timelineContainer.appendChild(milestoneInfo);
    }
    
    // Create a chart comparing original debt vs paid amounts
    function createDebtComparisonChart(debts, totalInterest) {
        const chartContainer = document.getElementById('debtComparisonChart');
        chartContainer.innerHTML = '';
        
        // Calculate totals
        const totalOriginal = debts.reduce((sum, debt) => sum + debt.originalBalance, 0);
        const totalPaid = totalOriginal + totalInterest;
        
        // Create chart bars
        const originalBar = document.createElement('div');
        originalBar.className = 'progress mb-3';
        originalBar.innerHTML = `
            <div class="progress-bar bg-primary" style="width: 100%">
                Original Debt: ${formatCurrency(totalOriginal)}
            </div>
        `;
        
        const paidBar = document.createElement('div');
        paidBar.className = 'progress mb-3';
        paidBar.innerHTML = `
            <div class="progress-bar bg-primary" style="width: ${(totalOriginal/totalPaid)*100}%">
                Principal: ${formatCurrency(totalOriginal)}
            </div>
            <div class="progress-bar bg-danger" style="width: ${(totalInterest/totalPaid)*100}%">
                Interest: ${formatCurrency(totalInterest)}
            </div>
        `;
        
        // Add title and bars to container
        const title = document.createElement('h5');
        title.textContent = 'Original Debt vs. Total Paid';
        chartContainer.appendChild(title);
        chartContainer.appendChild(originalBar);
        chartContainer.appendChild(paidBar);
    }
    
    // Helper function to format currency
    function formatCurrency(amount) {
        return '$' + amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
    }
} 
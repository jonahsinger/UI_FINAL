// Stock Basics 101 - Lesson 1: Diversification JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Mark this page as visited in progress tracking
    markLessonVisited(1);
    
    // Set up interactive portfolio simulator
    setupPortfolioSimulator();
    
    // Set up the random return diversification simulator
    setupRandomReturnSimulator();
});

// Mark the lesson as visited in progress tracking
function markLessonVisited(lessonNumber) {
    // This function just marks that the user has viewed the lesson
    // We'll mark it as completed once they finish the quiz
    console.log(`Lesson ${lessonNumber} visited`);
}

// Set up the portfolio simulator
function setupPortfolioSimulator() {
    // Get slider elements
    const techSlider = document.getElementById('techSlider');
    const healthcareSlider = document.getElementById('healthcareSlider');
    const energySlider = document.getElementById('energySlider');
    
    // Get value display elements
    const techValue = document.getElementById('techValue');
    const healthcareValue = document.getElementById('healthcareValue');
    const energyValue = document.getElementById('energyValue');
    
    // Get return display elements
    const concentratedReturn = document.getElementById('concentratedReturn');
    const diversifiedReturn = document.getElementById('diversifiedReturn');
    const concentratedBar = document.getElementById('concentratedBar');
    const diversifiedBar = document.getElementById('diversifiedBar');
    
    // Fix the tech slider at -5% to demonstrate a tech market downturn
    techSlider.value = -5;
    techSlider.disabled = true;
    
    // Update simulator when sliders change (only for healthcare and energy)
    healthcareSlider.addEventListener('input', updateSimulator);
    energySlider.addEventListener('input', updateSimulator);
    
    // Initial update
    updateSimulator();
    
    // Update simulator based on slider values
    function updateSimulator() {
        // Tech performance is fixed at -5%
        const techPerformance = -5;
        
        // Get values from other sliders
        const healthcarePerformance = parseInt(healthcareSlider.value);
        const energyPerformance = parseInt(energySlider.value);
        
        // Update value displays
        techValue.textContent = formatPercentage(techPerformance);
        healthcareValue.textContent = formatPercentage(healthcarePerformance);
        energyValue.textContent = formatPercentage(energyPerformance);
        
        // Calculate portfolio returns
        const techPortfolioReturn = techPerformance; // 100% tech
        const diversifiedPortfolioReturn = (techPerformance + healthcarePerformance + energyPerformance) / 3; // Equal weights
        
        // Update return displays
        concentratedReturn.textContent = formatPercentage(techPortfolioReturn);
        diversifiedReturn.textContent = formatPercentage(diversifiedPortfolioReturn);
        
        // Update progress bars (scaled for visibility)
        updateProgressBar(concentratedBar, techPortfolioReturn);
        updateProgressBar(diversifiedBar, diversifiedPortfolioReturn);
    }
    
    // Format percentage for display
    function formatPercentage(value) {
        const sign = value >= 0 ? '+' : '';
        return `${sign}${value}%`;
    }
    
    // Update progress bar with appropriate color and width
    function updateProgressBar(bar, value) {
        // Set width based on value (center at 50%)
        const width = 50 + value;
        bar.style.width = `${width}%`;
        
        // Set color based on positive/negative return
        if (value > 0) {
            bar.classList.remove('bg-danger');
            bar.classList.add('bg-success');
        } else if (value < 0) {
            bar.classList.remove('bg-success');
            bar.classList.add('bg-danger');
        } else {
            bar.classList.remove('bg-danger', 'bg-success');
            bar.classList.add('bg-primary');
        }
    }
}

// Set up the random return diversification simulator
function setupRandomReturnSimulator() {
    // Get UI elements
    const runSimulationBtn = document.getElementById('runSimulationBtn');
    
    // Asset return elements
    const assetReturns = [
        document.getElementById('asset1Return'),
        document.getElementById('asset2Return'),
        document.getElementById('asset3Return'),
        document.getElementById('asset4Return'),
        document.getElementById('asset5Return')
    ];
    
    // Asset bars
    const assetBars = [
        document.getElementById('asset1Bar'),
        document.getElementById('asset2Bar'),
        document.getElementById('asset3Bar'),
        document.getElementById('asset4Bar'),
        document.getElementById('asset5Bar')
    ];
    
    // Portfolio return elements
    const singleAssetReturn = document.getElementById('singleAssetReturn');
    const diversifiedAssetReturn = document.getElementById('diversifiedAssetReturn');
    const singleAssetBar = document.getElementById('singleAssetBar');
    const diversifiedAssetBar = document.getElementById('diversifiedAssetBar');
    
    // Add event listener to the Run Simulation button
    runSimulationBtn.addEventListener('click', runSimulation);
    
    // Run the simulation once on page load
    runSimulation();
    
    // Function to run the diversification simulation
    function runSimulation() {
        // Generate random returns for each asset between -5% and 10%
        const returns = [];
        let totalReturn = 0;
        
        for (let i = 0; i < 5; i++) {
            // Generate random number between -5 and 10
            const assetReturn = Math.round((Math.random() * 15 - 5) * 10) / 10;
            returns.push(assetReturn);
            totalReturn += assetReturn;
            
            // Update display
            assetReturns[i].textContent = formatPercentage(assetReturn);
            updateAssetBar(assetBars[i], assetReturn);
        }
        
        // Calculate portfolio returns
        const singleReturn = returns[0]; // Just Asset 1's return
        const diversifiedReturn = totalReturn / 5; // Average of all 5 assets
        
        // Update portfolio return displays
        singleAssetReturn.textContent = formatPercentage(singleReturn);
        diversifiedAssetReturn.textContent = formatPercentage(diversifiedReturn);
        
        // Update portfolio return bars
        updateAssetBar(singleAssetBar, singleReturn);
        updateAssetBar(diversifiedAssetBar, diversifiedReturn);
    }
    
    // Format percentage for display
    function formatPercentage(value) {
        const sign = value >= 0 ? '+' : '';
        return `${sign}${value.toFixed(1)}%`;
    }
    
    // Update an asset's progress bar based on its return
    function updateAssetBar(bar, value) {
        // Scale the bar (center at 50%, min width 35%, max width 65%)
        // This maps -5% to 35% width and +10% to 65% width
        const width = 50 + (value * 1.5);
        bar.style.width = `${width}%`;
        
        // Update the color based on the return
        if (value > 0) {
            bar.classList.remove('bg-danger', 'bg-primary');
            bar.classList.add('bg-success');
        } else if (value < 0) {
            bar.classList.remove('bg-success', 'bg-primary');
            bar.classList.add('bg-danger');
        } else {
            bar.classList.remove('bg-danger', 'bg-success');
            bar.classList.add('bg-primary');
        }
    }
} 
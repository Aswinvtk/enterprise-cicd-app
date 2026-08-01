// Trigger a manual mock deployment status update
function deploy() {
    const statusEl = document.getElementById("status");
    statusEl.innerHTML = "Deployment Rollout Successful";
    statusEl.style.color = "#00E676"; // neon green
}

// Fetch backend health status on page load to verify service connection
window.addEventListener('DOMContentLoaded', () => {
    // Attempt to communicate with the backend running on port 3000
    fetch('http://localhost:3000/health')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'UP') {
                const statusEl = document.getElementById("status");
                statusEl.innerHTML = "Application Connected to Backend API (UP)";
                statusEl.style.color = "#00E676";
            }
        })
        .catch(err => {
            console.log("Running in local frontend standalone sandbox mode.");
        });
});

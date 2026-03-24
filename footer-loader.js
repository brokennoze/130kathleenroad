/**
 * OpenMover Footer Loader
 * Dynamically fetches and injects the global footer
 */
document.addEventListener('DOMContentLoaded', () => {
    const placeholder = document.getElementById('footer-placeholder');
    if (placeholder) {
        fetch('footer.html')
            .then(response => {
                if (!response.ok) throw new Error('Failed to load footer');
                return response.text();
            })
            .then(html => {
                placeholder.innerHTML = html;
                console.log('OpenMover Unified Footer loaded.');
            })
            .catch(error => {
                console.error('Error loading unified footer:', error);
            });
    }
});

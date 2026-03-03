document.getElementById('submit-writing').onclick = function() {
    const reviewInput = document.getElementById('anonymous-review-input');
    const reviewsDiv = document.getElementById('reviews');
    const newReview = document.createElement('div');
    newReview.className = 'review fade-in';
    newReview.innerHTML = `
        <div class="review-header">
            <div class="avatar">A</div>
            <div class="review-user">Anonymous</div>
        </div>
        <div class="review-content">${reviewInput.value}</div>
        <div class="review-actions">
            <span class="like">&#x1F44D; Like</span>
            <span class="share">&#x1F4E3; Share</span>
        </div>
    `;
    reviewsDiv.appendChild(newReview);
    reviewInput.value = '';

    // Smooth scroll to the new review
    newReview.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Fade-in effect for the new review
    setTimeout(() => {
        newReview.classList.add('show');
    }, 10);
};

document.getElementById('modal-close').onclick = function() {
    document.getElementById('anonymous-modal').style.display = 'none';
};

// Show modal when page loads
window.onload = function() {
    document.getElementById('anonymous-modal').style.display = 'block';
};


      // Search popup handlers
      function openPopup() {
        document.getElementById("searchPopup").style.display = "block";
    }

    function closePopup() {
        document.getElementById("searchPopup").style.display = "none";
    }

    window.openPopup = openPopup;
    window.closePopup = closePopup;

  

 
    // Add event listener for form submission
document.getElementById('review-form').addEventListener('submit', (e) => {
  e.preventDefault();

  const reviewText = document.getElementById('review-input').value;
  const userId = 1; // You should replace this with the actual user ID from login session

  fetch('http://localhost:3000/add-review', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user_id: userId,
      review_text: reviewText,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      alert(data.message);
      // Optionally, fetch and display the updated list of reviews
    })
    .catch((error) => {
      console.error('Error:', error);
    });
});


// Function to fetch reviews and display them
function fetchReviews() {
  fetch('http://localhost:3000/reviews')
    .then((response) => response.json())
    .then((data) => {
      const reviewsContainer = document.getElementById('reviews');
      reviewsContainer.innerHTML = ''; // Clear current reviews

      data.reviews.forEach((review) => {
        const reviewElement = document.createElement('div');
        reviewElement.innerHTML = `<strong>${review.username}</strong><p>${review.review_text}</p><small>${review.created_at}</small>`;
        reviewsContainer.appendChild(reviewElement);
      });
    })
    .catch((error) => console.error('Error fetching reviews:', error));
}

// Call the function to display reviews when the page loads
window.onload = fetchReviews;

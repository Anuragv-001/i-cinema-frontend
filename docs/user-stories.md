# I-Cinema User Stories

## US 01: View Movies

As a user, I should be able to view currently screening movies so that I can choose a movie to book.

Acceptance criteria:
- Users can access Movies from the home page.
- Movies show name, genre, language, and image.
- Selecting a movie opens the movie details page.

## US 02: Search Movies

As a user, I should be able to search for a movie by name so that I can quickly find it.

Acceptance criteria:
- Search is visible on the home page.
- Results include name, genre, language, and image.
- Selecting a result opens the related movie details page.
- Users can filter search results by rating, genre, or language.
- Relevant results appear first.
- A clear message appears when no movie is available.

## US 03: Filter Movies

As a user, I want to filter movies by rating, genre, and language so that I can find relevant movies.

Acceptance criteria:
- Users can filter by rating, genre, and language.
- Filter categories are expandable.
- Users can combine multiple filters.
- Filter counts are visible.
- Empty results show a proper message.

## US 04: View Movie Details

As a user, I want to view movie details so that I can decide whether to watch it.

Acceptance criteria:
- Details open from catalog or search results.
- Page includes name, high-quality image, release date, genre, rating, censor rating, description, and rating input.
- Users can navigate back to the movie list.
- A Book My Show button starts booking.

## US 05: Movie Booking

As a user, I should be able to start booking from the movie details page.

Acceptance criteria:
- Book My Show redirects users to theatre/show selection.
- The screen shows theatres and available shows.
- Proper error messages appear for failures.

## US 06: Browse Movie Showtime

As a user, I want to select a theatre, show, and seats so that I can book tickets.

Acceptance criteria:
- Users can view theatres screening the selected movie.
- Users can view available showtimes.
- Users can see price per seat and requested seat count.
- If requested seats exceed availability, show an error and a Book Some Other Show action.
- Fully booked shows display a proper message.

## US 07: Display and Select Seats

As a user, I want a seating chart showing available, booked, and selected seats in different colors.

Acceptance criteria:
- Seat chart appears on the booking page.
- Available seats are green, booked seats are red, selected seats are yellow.
- Hovering over a seat shows seat type and price.
- Clicking available seats selects them.
- Total cost updates before checkout.

## US 08: View Booking Details

As a user, I should see booking pricing details before payment.

Acceptance criteria:
- Users see seat price, convenience fee, GST, and total payment amount.
- Total is calculated from selected seat price, convenience fee, and GST.
- A Pay button proceeds to payment.

## US 09: Make Payment

As a user, I should be able to enter card details and complete payment.

Acceptance criteria:
- Users select credit card or debit card.
- Credit card payment applies a 10% discount.
- Debit card payment applies a 5% discount.
- Card number must be 16 digits.
- Expiration date must be future and in MM/YY format.
- CVV must be 3 digits.
- Users can review details before payment.
- Confirmation appears after successful payment.

## US 10: Rate the Movie

As a user, I want to rate movies from 1 to 5 stars so that other users can make informed decisions.

Acceptance criteria:
- Users can submit a 1 to 5 star rating.
- Average rating appears on the movie page.
- Movies can be filtered by average rating.
- Success and error messages are shown clearly.
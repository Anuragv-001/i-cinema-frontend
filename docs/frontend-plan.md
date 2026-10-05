# I-Cinema Frontend Plan

## Goal

Build the frontend first for a web-based movie ticket booking platform where users can browse movies, search and filter results, view details, choose theatre showtimes, select seats, review booking charges, make payment, and rate movies.

## Recommended Frontend Stack

- React with TypeScript for component-driven UI development.
- Vite for fast local development and production builds.
- Bootstrap 5 can be added later if required by the assignment, but the initial setup uses custom CSS to keep the UI flexible.
- REST API integration layer prepared for Movies, Theatre, Seating, Booking, and Payment microservices.

## Frontend Milestones

1. Project foundation: React, TypeScript, Vite, folder structure, theme, routing plan.
2. Movie catalog: movie list, movie cards/table, search, filters, empty and error states.
3. Movie details: poster, metadata, description, rating input, average rating, Book My Show action.
4. Showtime flow: theatre list, showtime selection, seat count guard, unavailable show messages.
5. Seat selection: seat matrix, available/booked/selected states, hover details, running total.
6. Booking summary: seat price, convenience fee, GST, final amount, Pay action.
7. Payment: card type selection, discount calculation, card validation, review, confirmation.
8. Integration readiness: API service files, DTO types, loading states, error handling.

## Initial Frontend Folder Plan

```text
i-cinema-frontend/
  src/
    components/
    features/
      movies/
      theatres/
      seating/
      bookings/
      payments/
    services/
    types/
    App.tsx
    main.tsx
    styles.css
```

## UI Principles

- Keep catalog and booking screens fast to scan.
- Always show useful empty, loading, and error states.
- Use clear seat colors: available green, booked red, selected yellow.
- Keep payment forms simple, validated, and reviewable before final submission.
- Design mobile layouts first enough that browsing and booking remains usable on phones.
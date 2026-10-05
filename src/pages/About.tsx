import { Film, Heart, Sparkles, Ticket } from "lucide-react";
import { Link } from "react-router-dom";
import "../styles.css";

export default function About() {
  return (
    <div className="about-page">
      <section className="about-hero">
        <div className="about-hero-content">
          <p className="about-label">ABOUT I-CINEMA</p>

          <h1 className="serif">
            Cinema is more
            <br />
            than a movie.
          </h1>

          <p className="about-hero-text">
            I-Cinema is a modern movie booking platform designed to make
            discovering films, choosing seats, and booking tickets simple,
            elegant, and effortless.
          </p>

          <Link to="/" className="about-hero-button">
            Explore Movies →
          </Link>
        </div>

        <div className="about-hero-number">
          <span>01</span>
          <p>OUR STORY</p>
        </div>
      </section>

      <section className="about-story">
        <div className="about-story-heading">
          <p className="about-label">OUR VISION</p>
          <h2 className="serif">
            Making every
            <br />
            movie night memorable.
          </h2>
        </div>

        <div className="about-story-content">
          <p>
            We believe booking a movie ticket should be as enjoyable as
            watching the movie itself. I-Cinema brings movies, theatres,
            showtimes, seat selection, and secure booking together in one
            seamless experience.
          </p>

          <p>
            From discovering your next favourite film to selecting the
            perfect seat, every part of I-Cinema is designed with simplicity
            and convenience in mind.
          </p>
        </div>
      </section>

      <section className="about-values">
        <div className="about-values-header">
          <p className="about-label">WHAT WE OFFER</p>
          <h2 className="serif">Designed around you.</h2>
        </div>

        <div className="about-value-grid">
          <div className="about-value-card">
            <div className="about-icon">
              <Film size={25} />
            </div>
            <h3>Discover Movies</h3>
            <p>
              Explore popular and exciting movies and find something worth
              watching.
            </p>
          </div>

          <div className="about-value-card">
            <div className="about-icon">
              <Ticket size={25} />
            </div>
            <h3>Easy Booking</h3>
            <p>
              Choose your showtime, select your favourite seats, and book
              your tickets in just a few steps.
            </p>
          </div>

          <div className="about-value-card">
            <div className="about-icon">
              <Sparkles size={25} />
            </div>
            <h3>Simple Experience</h3>
            <p>
              A clean and intuitive interface that keeps your movie journey
              simple from start to finish.
            </p>
          </div>

          <div className="about-value-card">
            <div className="about-icon">
              <Heart size={25} />
            </div>
            <h3>Made for Movie Lovers</h3>
            <p>
              Built with attention to detail for people who love discovering
              and experiencing great cinema.
            </p>
          </div>
        </div>
      </section>

      <section className="about-cta">
        <p className="about-label">YOUR NEXT EXPERIENCE</p>

        <h2 className="serif">
          Lights.
          <br />
          Camera.
          <br />
          I-Cinema.
        </h2>

        <Link to="/" className="about-cta-button">
          Browse Movies →
        </Link>
      </section>

      <footer className="about-footer">
        <strong>I-Cinema</strong>
        <span>Discover · Decide · Book</span>
      </footer>
    </div>
  );
}
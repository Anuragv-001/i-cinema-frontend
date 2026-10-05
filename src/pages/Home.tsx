import API_BASE_URL from "../config/api";
import {
  ArrowRight,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import MovieCard from "../components/MovieCard";
import { Movie } from "../types/movie";

export default function Home() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("All");
  const [language, setLanguage] = useState("All");
  const [rating, setRating] = useState("All");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          API_BASE_URL + "/api/movies"
        );

        if (!response.ok) {
          throw new Error("Failed to fetch movies.");
        }

        const data = await response.json();

        setMovies(data);
      } catch {
        setError(
          "Unable to load movies. Please make sure the backend is running."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  const filteredMovies = useMemo(() => {
    return movies.filter((movie) => {
      const searchMatch = movie.title
        .toLowerCase()
        .includes(search.toLowerCase());

      const genreMatch =
        genre === "All" || movie.genre === genre;

      const languageMatch =
        language === "All" ||
        movie.language === language;

      const ratingMatch =
        rating === "All" ||
        movie.rating >= Number(rating);

      return (
        searchMatch &&
        genreMatch &&
        languageMatch &&
        ratingMatch
      );
    });
  }, [movies, search, genre, language, rating]);

  return (
    <main className="bg-[#f4f0e8]">

      <section className="border-b border-black/10">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 lg:grid-cols-2 lg:items-center lg:py-28">

          <div className="home-hero-content">
            <p className="home-fade-up text-sm font-semibold uppercase tracking-[0.25em] text-[#b64b2a]">
              Frontend cinema experience
            </p>

            <h1 className="home-fade-up home-delay-1 serif mt-6 text-7xl leading-[0.9] tracking-tight md:text-8xl">
              I-Cinema
            </h1>

            <p className="home-fade-up home-delay-2 mt-8 max-w-xl text-lg leading-8 text-black/60">
              A frontend-first movie ticket booking experience
              for browsing movies, choosing shows, selecting
              seats, and completing payment.
            </p>

            <div className="home-fade-up home-delay-3 mt-9 flex flex-wrap gap-3">
              <a
                href="#movies"
                className="inline-flex items-center gap-2 rounded-full bg-[#171717] px-7 py-3.5 text-sm font-semibold text-white transition duration-300 hover:bg-[#b64b2a] hover:-translate-y-0.5"
              >
                Browse Movies
                <ArrowRight size={17} />
              </a>

              <a
                href="#experience"
                className="rounded-full border border-black/20 px-7 py-3.5 text-sm font-semibold transition duration-300 hover:-translate-y-0.5 hover:bg-black hover:text-white"
              >
                Our Experience
              </a>
            </div>
          </div>

          <div className="home-hero-panel min-h-[440px] rounded-xl bg-[#171717] p-8 text-[#f4f0e8] md:p-12">
            <p className="text-sm font-semibold text-[#d97845]">
              Tonight
            </p>

            <h2 className="serif mt-6 text-6xl leading-[0.95] md:text-7xl">
              {movies.length} movies
              <br />
              ready.
            </h2>

            <div className="mt-12 border-t border-white/20 pt-6">
              <p className="max-w-md text-lg leading-8 text-white/60">
                Seat maps, pricing, booking summaries and
                secure payment — everything you need for
                your next movie.
              </p>
            </div>

            <div className="mt-10 flex items-center gap-3 text-sm text-white/50">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#d97845]" />
              Discover
              <span>•</span>
              Decide
              <span>•</span>
              Book
            </div>
          </div>

        </div>
      </section>

      <section
        id="experience"
        className="border-b border-black/10"
      >
        <div className="mx-auto max-w-7xl px-6 py-20">

          <div className="home-section-reveal">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#b64b2a]">
              The experience
            </p>

            <h2 className="serif mt-4 text-5xl md:text-6xl">
              Discover. Decide. Book.
            </h2>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-3">

            <div className="home-card-reveal home-delay-1 rounded-xl border border-black/10 p-7 transition duration-300 hover:-translate-y-2 hover:border-[#b64b2a]/40 hover:shadow-lg">
              <div className="h-8 w-8 rounded-full bg-[#d97845] transition duration-300 hover:scale-110" />

              <h3 className="serif mt-8 text-3xl">
                Discover
              </h3>

              <p className="mt-4 leading-7 text-black/60">
                Browse, search and filter movies by rating,
                genre and language.
              </p>
            </div>

            <div className="home-card-reveal home-delay-2 rounded-xl border border-black/10 p-7 transition duration-300 hover:-translate-y-2 hover:border-[#b64b2a]/40 hover:shadow-lg">
              <div className="h-8 w-8 rounded-full bg-[#d97845] transition duration-300 hover:scale-110" />

              <h3 className="serif mt-8 text-3xl">
                Decide
              </h3>

              <p className="mt-4 leading-7 text-black/60">
                Review movie details, ratings, theatre
                options and available show timings.
              </p>
            </div>

            <div className="home-card-reveal home-delay-3 rounded-xl border border-black/10 p-7 transition duration-300 hover:-translate-y-2 hover:border-[#b64b2a]/40 hover:shadow-lg">
              <div className="h-8 w-8 rounded-full bg-[#d97845] transition duration-300 hover:scale-110" />

              <h3 className="serif mt-8 text-3xl">
                Book
              </h3>

              <p className="mt-4 leading-7 text-black/60">
                Select seats, verify pricing, pay securely
                and receive your booking confirmation.
              </p>
            </div>

          </div>
        </div>
      </section>

      <section
        id="movies"
        className="bg-[#171717] text-[#f4f0e8]"
      >
        <div className="mx-auto max-w-7xl px-6 py-20">

          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">

            <div className="home-section-reveal">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#d97845]">
                Now showing
              </p>

              <h2 className="serif mt-3 text-5xl md:text-6xl">
                Find your film.
              </h2>
            </div>

            <div className="home-search-reveal w-full max-w-md border-b border-white/30 pb-2">
              <div className="flex items-center gap-3">
                <Search
                  size={20}
                  className="text-white/50"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Search movies..."
                  className="w-full bg-transparent py-2 text-white outline-none placeholder:text-white/40"
                />
              </div>
            </div>

          </div>

          <div className="home-search-reveal mt-12 flex flex-wrap items-center gap-3">

            <div className="mr-2 flex items-center gap-2 text-sm text-white/50">
              <SlidersHorizontal size={17} />
              Filter
            </div>

            <select
              value={genre}
              onChange={(e) =>
                setGenre(e.target.value)
              }
              className="rounded-full border border-white/20 bg-transparent px-5 py-2.5 text-sm text-white outline-none transition duration-300 hover:border-[#d97845]"
            >
              <option value="All" className="text-black">
                All Genres
              </option>
              <option value="Action" className="text-black">
                Action
              </option>
              <option value="Thriller" className="text-black">
                Thriller
              </option>
              <option value="Sci-Fi" className="text-black">
                Sci-Fi
              </option>
              <option value="Horror" className="text-black">
                Horror
              </option>
              <option value="Comedy" className="text-black">
                Comedy
              </option>
            </select>

            <select
              value={language}
              onChange={(e) =>
                setLanguage(e.target.value)
              }
              className="rounded-full border border-white/20 bg-transparent px-5 py-2.5 text-sm text-white outline-none transition duration-300 hover:border-[#d97845]"
            >
              <option value="All" className="text-black">
                All Languages
              </option>
              <option value="Hindi" className="text-black">
                Hindi
              </option>
              <option value="English" className="text-black">
                English
              </option>
              <option value="Telugu" className="text-black">
                Telugu
              </option>
            </select>

            <select
              value={rating}
              onChange={(e) =>
                setRating(e.target.value)
              }
              className="rounded-full border border-white/20 bg-transparent px-5 py-2.5 text-sm text-white outline-none transition duration-300 hover:border-[#d97845]"
            >
              <option value="All" className="text-black">
                All Ratings
              </option>
              <option value="4" className="text-black">
                4+
              </option>
              <option value="4.5" className="text-black">
                4.5+
              </option>
            </select>

          </div>

          {loading && (
            <div className="py-20 text-center text-white/50">
              Loading movies...
            </div>
          )}

          {error && (
            <div className="py-20 text-center">
              <h3 className="serif text-3xl">
                Unable to load movies.
              </h3>

              <p className="mt-3 text-white/50">
                {error}
              </p>
            </div>
          )}

          {!loading && !error && (
            <>
              <div className="mt-12 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">

                {filteredMovies.map((movie, index) => (
                  <div
                    key={movie.id}
                    className="home-movie-reveal"
                    style={{
                      animationDelay: `${index * 100}ms`,
                    }}
                  >
                    <MovieCard movie={movie} />
                  </div>
                ))}

              </div>

              {filteredMovies.length === 0 && (
                <div className="home-empty-reveal py-20 text-center">
                  <h3 className="serif text-3xl">
                    No movies found.
                  </h3>

                  <p className="mt-3 text-white/50">
                    Try another search or filter.
                  </p>
                </div>
              )}
            </>
          )}

        </div>
      </section>

      <section
        id="about"
        className="border-b border-black/10 bg-[#f4f0e8]"
      >
        <div className="mx-auto max-w-7xl px-6 py-20">

          <div className="grid gap-10 md:grid-cols-2">

            <div className="home-section-reveal">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#b64b2a]">
                About I-Cinema
              </p>

              <h2 className="serif mt-4 text-5xl md:text-6xl">
                Built around
                <br />
                the movie.
              </h2>
            </div>

            <div className="home-section-reveal home-delay-2 flex items-end">
              <p className="max-w-xl text-lg leading-8 text-black/60">
                I-Cinema brings the complete movie booking
                journey into one simple experience — from
                discovering a movie to choosing your seat
                and making a secure payment.
              </p>
            </div>

          </div>
        </div>
      </section>

      <footer className="bg-[#171717] px-6 py-10 text-[#f4f0e8]">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 md:flex-row md:items-center md:justify-between">

          <span className="serif text-2xl">
            I-Cinema
          </span>

          <p className="text-sm text-white/40">
            Discover. Decide. Book.
          </p>

        </div>
      </footer>

    </main>
  );
}
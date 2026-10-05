import { ArrowUpRight, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { Movie } from "../types/movie";

interface MovieCardProps {
  movie: Movie;
}

export default function MovieCard({ movie }: MovieCardProps) {
  const posterUrl =
    (movie as Movie & { posterUrl?: string }).posterUrl ||
    movie.posterUrl;

  return (
    <Link
      to={`/movies/${movie.id}`}
      className="group block"
    >
      <div className="overflow-hidden rounded-xl border border-black/10 bg-white/30 transition duration-300 group-hover:-translate-y-1 group-hover:shadow-xl">

        <div className="relative aspect-[3/4] overflow-hidden bg-black">
          <img
            src={posterUrl}
            alt={movie.title}
            className="h-full w-full object-cover opacity-90 transition duration-500 group-hover:scale-105 group-hover:opacity-100"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />

          <div className="absolute right-3 top-3 flex items-center gap-1 rounded-xl bg-[#171717] px-3 py-1.5 text-sm text-white">
            <Star
              size={13}
              className="fill-[#d97845] text-[#d97845]"
            />
            {movie.rating}
          </div>

          <div className="absolute bottom-0 left-0 right-0 translate-y-full bg-[#171717]/90 p-4 text-white transition duration-300 group-hover:translate-y-0">
            <div className="flex items-center justify-between">
              <span className="text-sm">
                View details
              </span>

              <ArrowUpRight size={18} />
            </div>
          </div>
        </div>

        <div className="p-5">
          <h3 className="serif text-2xl">
            {movie.title}
          </h3>

          <div className="mt-3 flex items-center justify-between text-xs uppercase tracking-wider text-black/50">
            <span>{movie.genre}</span>
            <span>{movie.language}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
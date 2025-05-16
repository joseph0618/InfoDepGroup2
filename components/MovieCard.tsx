import Image from "next/image";
import { useRouter } from "next/navigation";
import { MovieCardProps } from "@/types";
import { Star } from "lucide-react";

function MovieCard({
  movieId,
  title,
  description,
  rating,
  imgUrl,
}: MovieCardProps) {
  const router = useRouter();

  const handleViews = () => {
    router.push(`/movies/${movieId}`, { scroll: true });
  };

  const handleRate = (e: React.MouseEvent) => {
    e.stopPropagation(); 
  };

  return (
    <div
      className="w-[180px] cursor-pointer transition-transform duration-300 ease-in-out transform hover:scale-105"
      onClick={handleViews}
    >
      <div className="flex flex-col bg-[#1a1a1a] rounded-lg overflow-hidden shadow-md">
        <Image
          src={imgUrl}
          alt={title}
          width={180}
          height={270} 
          className="object-cover w-full h-[270px]"
        />
        <div className="p-2 flex flex-col gap-1">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-sm font-bold text-white truncate">{title}</h1>
              <p className="text-xs text-gray-400">
                ⭐ {rating.toFixed(1)} / 10
              </p>
            </div>
            <button
              onClick={handleRate}
              className="ml-2 text-yellow-400 hover:text-yellow-300"
              title="Rate this movie"
            >
              <Star size={18} />
            </button>
          </div>
          <p className="text-xs text-white/70 line-clamp-2">{description}</p>
        </div>
      </div>
    </div>
  );
}

export default MovieCard;
import Image from "next/image";
import { useRouter } from "next/navigation";
import { PodcastCardProps } from "@/types";

function PodcastCard({
  podcastId,
  title,
  description,
  imgUrl,
}: PodcastCardProps) {
  const router = useRouter();

  const handleViews = () => {
    router.push(`/podcasts/${podcastId}`, {
      scroll: true,
    });
  };

  return (
    <div
      className="cursor-pointer transition-transform duration-300 ease-in-out transform hover:scale-105"
      onClick={handleViews}
    >
      <figure className="flex flex-col gap-2">
        <Image
          src={imgUrl}
          alt={title}
          width={174}
          height={174}
          className="aspect-square h-fit w-full rounded-xl 2xl:size-[200px]"
        />
        <div>
          <h1 className="text-16 truncate font-bold text-white-1">{title}</h1>
          <h2 className="text-12 truncate font-normal capitalize text-white-4">
            {description}
          </h2>
        </div>
      </figure>
    </div>
  );
}

export default PodcastCard;

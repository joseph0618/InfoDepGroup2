"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useToast } from "@/components/ui/use-toast";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";

interface StarRatingProps {
  movieId: Id<"movies">;
  initialRating?: number;
  onRatingChange?: (newRating: number) => void;
  size?: number;
  readonly?: boolean;
}

const StarRating = ({
  movieId,
  initialRating = 0,
  onRatingChange,
  size = 20,
  readonly = false
}: StarRatingProps) => {
  const { user } = useUser();
  const { toast } = useToast();
  const [rating, setRating] = useState<number>(initialRating);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const rateMovie = useMutation(api.ratings.rateMovie);

  const handleMouseOver = (index: number) => {
    if (readonly) return;
    setHoverRating(index);
  };

  const handleMouseLeave = () => {
    if (readonly) return;
    setHoverRating(0);
  };

  const handleClick = async (index: number) => {
    if (readonly) return;

    try {
      if (!user) {
        toast({
          title: "Please sign in to rate movies",
          variant: "destructive",
        });
        return;
      }

      setIsSubmitting(true);
      setRating(index);

      if (onRatingChange) {
        onRatingChange(index);
      }



      await rateMovie({
        movieId,
        score: index,
      });

      toast({
        title: "Rating submitted successfully",
        description: `You rated this movie ${index} stars`,
      });
    } catch (error) {
      console.error("Error rating movie:", error);
      toast({
        title: "Failed to submit rating",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });

      // Revert to previous rating on error
      setRating(initialRating);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="flex items-center"
      onMouseLeave={handleMouseLeave}
    >
      {[1, 2, 3, 4, 5].map((index) => (
        <Star
          key={index}
          size={size}
          onClick={() => handleClick(index)}
          onMouseOver={() => handleMouseOver(index)}
          fill={
            (hoverRating >= index || (!hoverRating && rating >= index))
              ? "#FFD700"
              : "transparent"
          }
          stroke={
            (hoverRating >= index || (!hoverRating && rating >= index))
              ? "#FFD700"
              : "#9ca3af"
          }
          className={`cursor-${readonly ? "default" : "pointer"} transition-colors duration-200 ${isSubmitting ? "opacity-50" : ""}`}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
};

export default StarRating;
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useUser } from "@clerk/nextjs";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import GenerateThumbnail from "@/components/GenerateThumbnail";
import { useState } from "react";
import { Id } from "@/convex/_generated/dataModel";

const formSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(2),
  releaseYear: z.string().min(4).max(4),
  genre: z.string().min(2),
  director: z.string().min(2),
  cast: z.string().min(2),
});

const CreateMovie = () => {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();

  const [imagePrompt, setImagePrompt] = useState("");
  const [imageStorageId, setImageStorageId] = useState<Id<"_storage"> | null>(null);
  const [imageUrl, setImageUrl] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const createMovie = useMutation(api.movies.createMovie);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      releaseYear: "",
      genre: "",
      director: "",
      cast: "",
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true);

      if (!user) {
        toast({
          title: "You must be logged in to create a movie",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      if (!imageUrl) {
        toast({
          title: "Please generate movie thumbnail",
        });
        setIsSubmitting(false);
        return;
      }

      await createMovie({
        title: data.title,
        description: data.description,
        releaseYear: Number(data.releaseYear),
        genre: [data.genre],
        director: data.director,
        cast: data.cast.split(",").map(item => item.trim()),
        imageUrl,
        imageStorageId: imageStorageId ?? undefined,
      });

      toast({ title: "Movie created successfully" });
      router.push("/");
    } catch (error) {
      console.error(error);
      toast({
        title: "Error creating movie",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mt-10 flex flex-col">
      <h1 className="text-20 font-bold text-white-1">Create Movie</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-12 flex w-full flex-col">
          <div className="flex flex-col gap-[30px] border-b border-black-5 pb-10">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-2.5">
                  <FormLabel className="text-16 font-bold text-white-1">Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Movie title" className="input-class" {...field} />
                  </FormControl>
                  <FormMessage className="text-white-1" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-2.5">
                  <FormLabel className="text-16 font-bold text-white-1">Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Movie description" className="input-class" {...field} />
                  </FormControl>
                  <FormMessage className="text-white-1" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="releaseYear"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-2.5">
                  <FormLabel className="text-16 font-bold text-white-1">Release Year</FormLabel>
                  <FormControl>
                    <Input placeholder="2023" type="number" className="input-class" {...field} />
                  </FormControl>
                  <FormMessage className="text-white-1" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="genre"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-2.5">
                  <FormLabel className="text-16 font-bold text-white-1">Genre</FormLabel>
                  <FormControl>
                    <Input placeholder="Action, Comedy, Drama" className="input-class" {...field} />
                  </FormControl>
                  <FormMessage className="text-white-1" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="director"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-2.5">
                  <FormLabel className="text-16 font-bold text-white-1">Director</FormLabel>
                  <FormControl>
                    <Input placeholder="Director name" className="input-class" {...field} />
                  </FormControl>
                  <FormMessage className="text-white-1" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cast"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-2.5">
                  <FormLabel className="text-16 font-bold text-white-1">Cast</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Actor 1, Actor 2, Actor 3"
                      className="input-class"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-white-1" />
                </FormItem>
              )}
            />
          </div>

          <div className="flex flex-col pt-10">
            <FormLabel className="text-16 font-bold text-white-1">Upload Image</FormLabel>
            <GenerateThumbnail
              setImage={setImageUrl}
              setImageStorageId={setImageStorageId}
              image={imageUrl}
              imagePrompt={imagePrompt}
              setImagePrompt={setImagePrompt}
            />

            <div className="mt-10 w-full">
              <Button
                type="submit"
                className="text-16 w-full bg-orange-1 py-4 font-extrabold text-white-1 transition-all duration-500 hover:bg-black-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader className="animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Movie"
                )}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </section>
  );
};

export default CreateMovie;

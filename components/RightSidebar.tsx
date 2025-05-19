"use client";

import { SignedIn, useUser, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import Header from "./Header";
import Carousel from "./Carousel";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import LoaderSpiner from "./LoaderSpinner";

function RightSidebar() {
  const router = useRouter();
  const { user } = useUser();
  const topMovieCreators = useQuery(api.users.getTopUsersByMovieCount);

  if (!topMovieCreators) return <LoaderSpiner />;

  return (
    <section className="right_sidebar text-white-1">
      <SignedIn>
        <Link href={`/profile/${user?.id}`} className="flex gap-3 pb-12">
          <UserButton />
          <div className="flex w-full items-center justify-between">
            <h1 className="text-16 truncate font-semibold text-white-1">
              {user?.firstName} {user?.lastName}
            </h1>
            <Image
              src="/icons/right-arrow.svg"
              alt="arrow"
              width={24}
              height={24}
            />
          </div>
        </Link>
      </SignedIn>
      
      <section className="flex flex-col gap-8 pt-12 ">
        <Header headerTitle="Top Movie Creators" />
        <div className="flex flex-col gap-6">
          {topMovieCreators?.slice(0, 4).map((creator) => (
            <div
              key={creator._id}
              className="flex cursor-pointer justify-between transition-transform duration-300 ease-in-out transform hover:scale-105"
              onClick={() => router.push(`/profile/${creator.clerkId}`)}
            >
              <figure className="flex items-center gap-2">
                <Image
                  src={creator.imageUrl}
                  alt={creator.name}
                  width={44}
                  height={44}
                  className="aspect-square rounded-lg"
                />
                <h2 className="text-14 font-semibold text-white-1">
                  {creator.name}
                </h2>
              </figure>
              <div className="flex items-center">
                <p className="text-12 font-normal text-white-1">
                  {creator.totalMovies} movies
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </section>
  );
}

export default RightSidebar;

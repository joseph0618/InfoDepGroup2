"use client";

import { useQuery } from "convex/react";
import ProfileCard from "@/components/ProfileCard";
import LoaderSpinner from "@/components/LoaderSpinner";
import { api } from "@/convex/_generated/api";

const ProfilePage = ({ params }: { params: { profileId: string } }) => {
  const user = useQuery(api.users.getUserById, { clerkId: params.profileId });
  const userData = useQuery(api.users.getTopUsersByMovieCount);

  if (!user || !userData) return <LoaderSpinner />;

  // Find the specific user's data
  const userStats = userData.find((u) => u.clerkId === params.profileId);

  return (
    <section className="mt-9 flex flex-col items-center">
      <h1 className="text-3xl font-bold text-white">User Profile</h1>
      {userStats && (
        <ProfileCard
          user={user}
          totalMovies={userStats.totalMovies}
          topMovies={userStats.topMovies}
        />
      )}
    </section>
  );
};

export default ProfilePage;
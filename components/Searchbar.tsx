"use client";

import Image from "next/image";
import { Input } from "./ui/input";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useDebounce } from "@/lib/useDebounce";

function Searchbar() {
  const [search, setSearch] = useState("");
  const router = useRouter();
  const pathname = usePathname();
  const debounceValue = useDebounce(search, 500);

  useEffect(() => {
    if (debounceValue) {
      router.push(`/discover?search=${debounceValue}`);
    } else if (!debounceValue && pathname === "/discover") {
      router.push("/discover");
    }
  }, [router, pathname, debounceValue]);

  return (
    <div className="relative mt-8 block">
      <Input
        className="input-class py-6 pl-12 focus-visible:ring-offset-orange-1"
        placeholder="Search for podcasts"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onLoad={() => setSearch("")}
      />
      <Image
        src="/icons/search.svg"
        alt="search"
        width={20}
        height={20}
        className="absolute left-4 top-3.5"
      />
    </div>
  );
}

export default Searchbar;

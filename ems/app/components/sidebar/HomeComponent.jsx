"use client";
import React from "react";
import { useRouter, usePathname } from "next/navigation";
import Arrow from "./Utils/Arrow";
import Image from "next/image";
const HomeComponent = ({ showZone, toggleZone }) => {
  const router = useRouter();
  const pathname = usePathname();
  const isZonesPage = pathname === "/nfsddwdmems/zones";

  return (
   <div className="flex items-center justify-between px-4 py-2 hover:bg-gray-100 group sidebar-item">
  {/* HOME → navigate */}
  <div
    className="flex items-center cursor-pointer flex-grow gap-2"
    onClick={() => router.push("/nfsddwdmems")}
  >
    {/* Arrow toggle */}
    <span
      onClick={(e) => {
        e.stopPropagation(); // prevent parent click
        toggleZone();        // only toggle zones
      }}
    >
      <Arrow open={showZone} />
    </span>

    {/* Icon + Text */}
    <div className="flex items-center gap-2">
      <Image
        src="/sound.png"
        width={30}         // adjust width
        height={30}        // match height to text line
        alt="home"
        className="object-contain"
      />
      <h2 className="text-black text-5px">Home(Network)</h2>
    </div>
  </div>

  {/* + ONLY when NOT on /zones */}
  {!isZonesPage && (
    <button
      className="button2 sidebar-button"
      onClick={(e) => {
        e.stopPropagation();
        router.push("/nfsddwdmems/zones");
      }}
    >
      +
    </button>
  )}
</div>

  );
};

export default HomeComponent;

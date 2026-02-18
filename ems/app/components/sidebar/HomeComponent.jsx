import React from "react";
import { useRouter, usePathname } from "next/navigation";
import Arrow from "./Utils/Arrow";

const HomeComponent = ({ showZone, toggleZone }) => {
  const router = useRouter();
  const pathname = usePathname();
  const isZonesPage = pathname === "/nfsddwdmems/zones";

  return (
    <div className="flex items-center justify-between px-4 py-2 hover:bg-gray-100 group sidebar-item">
      {/* HOME → navigate */}
      <div
        className="flex items-center cursor-pointer flex-grow"
        onClick={() => router.push("/nfsddwdmems")}
      >
        <span
          className="mr-2"
          onClick={(e) => {
            e.stopPropagation();  // ✅ prevent Home click
            toggleZone();          // only toggle zones
          }}
        >
          <Arrow open={showZone} />
        </span>
        <span className="text-black">Home(Network)</span>
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

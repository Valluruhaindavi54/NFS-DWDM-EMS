"use client";
import Image from "next/image";
import Link from "next/link";
import React from "react";

interface HeaderProps {
  loggedInUserId: string;
}

const Header: React.FC<HeaderProps> = ({ loggedInUserId }) => {
  return (
    <header className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200 sticky top-0 z-10">
      {/* Left: Logo */}
      <div className="flex items-center min-w-[120px]">
        <Image
          src="https://images.jdmagicbox.com/v2/comp/bangalore/52/080p25252/catalogue/united-telecoms-ltd-mahadevapura-bangalore-telecom-product-dealers-2rth1xd.jpg"
          alt="Logo"
          width={150}
          height={32}
          className="object-contain"
        />
      </div>

      {/* Center: Title */}
      <div className="flex-1 flex justify-center">
        <h1 className="font-bebas text-2xl text-black text-center">
          NFSDWDMEMS
        </h1>
      </div>

      {/* Right: Profile Image */}
      <div className="flex items-center min-w-[50px] justify-end">
        <Link href={`/profile/${loggedInUserId}`}>
          <Image
            src="/profile.png"
            alt="Profile"
            width={40}
            height={40}
            className="rounded-full cursor-pointer"
          />
        </Link>
      </div>
    </header>
  );
};

export default Header;

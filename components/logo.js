import Image from "next/image";
import Link from "next/link";
import React from "react";

const Logo = () => {
  return (
    <Link
      href={"/"}
      className="flex gap-1 items-center justify-center align-middle"
    >
      <Image
        src="/logo.png"
        alt="App Logo"
        className="w-8 h-8"
        width={32}
        height={32}
      />
      <span className="mt-1 font-medium text-black">Grojana Admin</span>
    </Link>
  );
};

export default Logo;

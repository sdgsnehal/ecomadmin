import Nav from "@/components/nav";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState } from "react";
import Image from "next/image";
import Logo from "./logo";

export default function Layout({ children }) {
  const [showNav, setShowNav] = useState(false);
  const { data: session } = useSession();
  if (!session) {
    return (
      <div className="bg-gradient-to-br from-gray-100 to-gray-300 w-screen h-screen flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-10 w-[90%] max-w-md text-center">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Image
              src="/logo.png"
              alt="App Logo"
              className="w-20 h-20 rounded-full shadow-md"
              width={80}
              height={80}
            />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Welcome Back 👋
          </h1>
          <p className="text-gray-500 mb-6">Please login to continue</p>

          {/* Google Button */}
          <button
            onClick={() => signIn("google")}
            className="bg-white p-3 px-6 rounded-lg shadow-md hover:scale-105 transition-transform duration-200 flex items-center gap-2 mx-auto"
          >
            <Image
              src="/google.png"
              alt="Google"
              className="w-6 h-6"
              width={24}
              height={24}
            />
            Login with Google
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="bg-white min-h-screen">
      <div className=" md:hidden  flex items-center p-4">
        <button onClick={() => setShowNav(!showNav)}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          </svg>
        </button>
        <div className="flex grow justify-center mr-6">
          <Logo />
        </div>
      </div>

      <div className=" flex">
        <Nav show={showNav} />
        <div className=" flex-grow p-4">{children}</div>
      </div>
    </div>
  );
}

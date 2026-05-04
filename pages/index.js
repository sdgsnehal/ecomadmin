import Layout from "@/components/layout";
import { useSession } from "next-auth/react";
import Image from "next/image";

const Home = () => {
  const { data: session } = useSession();

  return (
    <Layout>
      <div className="flex justify-between items-center rounded-xl px-3 py-2 md:px-6 md:py-3 sticky top-0 bg-white z-10">
        {/* Greeting Section */}
        <h2 className="text-base md:text-lg font-medium text-gray-800 truncate max-w-[55%] sm:max-w-none">
          Hello,{" "}
          <span className="font-semibold text-blue-700">
            {session?.user?.name}
          </span>
        </h2>

        {/* Profile Section */}
        <div className="flex items-center gap-2 md:gap-3 bg-gray-100 hover:bg-gray-200 transition rounded-full px-2 py-1 md:px-3 cursor-pointer shrink-0">
          <Image
            src={session?.user?.image}
            alt={session?.user?.name}
            width={32}
            height={32}
            className="rounded-full border border-gray-300 w-8 h-8 md:w-9 md:h-9"
          />
          <span className="hidden sm:inline text-sm font-medium text-gray-700">
            {session?.user?.name}
          </span>
        </div>
      </div>
    </Layout>
  );
};

export default Home;

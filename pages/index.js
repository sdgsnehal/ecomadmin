import Layout from "@/components/layout";
import { useSession } from "next-auth/react";
import Image from "next/image";

const Home = () => {
  const { data: session } = useSession();

  return (
    <Layout>
      <div className="flex justify-between items-center rounded-xl px-6 py-3 sticky top-0 bg-white z-10">
        {/* Greeting Section */}
        <h2 className="text-lg font-medium text-gray-800">
          Hello,{" "}
          <span className="font-semibold text-blue-700">
            {session?.user?.name}
          </span>
        </h2>

        {/* Profile Section */}
        <div className="flex items-center gap-3 bg-gray-100 hover:bg-gray-200 transition rounded-full px-3 py-1 cursor-pointer">
          <Image
            src={session?.user?.image}
            alt={session?.user?.name}
            width={36}
            height={36}
            className="rounded-full border border-gray-300"
          />
          <span className="text-sm font-medium text-gray-700">
            {session?.user?.name}
          </span>
        </div>
      </div>
    </Layout>
  );
};

export default Home;

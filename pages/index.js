import Layout from "@/components/layout";
import { useSession } from "next-auth/react";
import Image from "next/image";

const Home = () => {
  const { data: session } = useSession();

  return (
    <Layout>
      <div className="text-blue-900 flex justify-between">
        <h2>
          Hello,<b>{session?.user?.name}</b>
        </h2>
        <div className="flex bg-gray-300 text-black gap-1 overflow-hidden rounded-lg">
          <Image
            src={session?.user?.image}
            alt={session?.user?.name}
            width={25}
            height={25}
            className="rounded-full"
          />
          <span className="py-1 px-2">{session?.user?.name}</span>
        </div>
      </div>
    </Layout>
  );
};

export default Home;

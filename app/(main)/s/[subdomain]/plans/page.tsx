import { PricingTable } from "@clerk/nextjs";

type Props = {};

function page({}: Props) {
  return (
    <div className="mt-24 max-w-2xl mx-auto px-4">
      <div className="bg-white/80 dark:bg-zinc-900/80 rounded-2xl shadow-lg p-8 flex flex-col items-center">
        <h1 className="text-3xl font-bold text-center mb-2">
          Upgrade Your Plan
        </h1>
        <p className="text-zinc-600 dark:text-zinc-300 text-center mb-8 max-w-md">
          Unlock more features and higher limits by upgrading your plan. Choose
          the option that best fits your needs and start creating without
          limits!
        </p>
        <div className="w-full">
          <PricingTable />
        </div>
      </div>
    </div>
  );
}

export default page;

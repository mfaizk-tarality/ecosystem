import BreadCrumb from "@/common_component/BreadCrumb";
import CustomButton from "@/common_component/CustomButton";
import PageTitle from "@/common_component/PageTitle";
import { IconDevicesCheck, IconHelmet, IconSpaces } from "@tabler/icons-react";
import Link from "next/link";
import React from "react";
const breadCrumb = [
  {
    text: "Home",
    href: "/home",
  },
  {
    text: "Ecosystem Subsidy",
    href: "/ecosystem-subsidy",
  },
];
const EcoSystemSubsidy = () => {
  return (
    <div>
      <div className="w-full flex items-end justify-end">
        <BreadCrumb routes={breadCrumb} />
      </div>
      <div className="grid grid-cols-12 my-10">
        <div className="col-span-12  2xl:col-span-8 2xl:col-start-3">
          <div className="col-span-12 md:col-span-6">
            <PageTitle
              title={"Ecosystem Subsidy"}
              subtitle={
                "Earn rewards, stake with purpose, and grow with TAN every transaction drives your success in our ecosystem!"
              }
            />
          </div>
          <div className="w-full grid grid-cols-12 mt-4 rounded-2xl relative gap-4">
            {cardData?.map((item, idx) => {
              return (
                <div
                  key={idx}
                  className="min-h-96 col-span-12 md:col-span-4 flex items-center justify-evenly flex-col p-4 border-2 border-stroke text-center rounded-xl"
                >
                  <item.icon className="text-white text-xl" />
                  <p>{item.label}</p>
                  <p className="text-description">{item.desc}</p>
                  <Link href={item.href}>
                    <CustomButton className={"rounded-sm"}>
                      {item.btnText}
                    </CustomButton>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EcoSystemSubsidy;

const cardData = [
  {
    label: "Stake & Earn Unlock Exclusive Rewards!",
    desc: "The more you stake, the greater your rewards. Grow your holdings and thrive in TAN’s ecosystem.",
    btnText: "Boost Your Rewards",
    icon: IconSpaces,
    href: "/ecosystem-subsidy/stake-earn-reward",
  },
  {
    label: "Become a Validator & Earn More!",
    desc: "Secure the network, validate transactions, and earn by contributing to TAN’s growing ecosystem.",
    btnText: "Earn More Rewards",
    icon: IconDevicesCheck,
    href: "/ecosystem-subsidy/validator-reward",
  },
  {
    label: "Build & Earn Developer Rewards Await!",
    desc: "Innovate, create, and contribute to TAN’s ecosystem. Get rewarded for building the future of blockchain!",
    btnText: "Start Building Today",
    icon: IconHelmet,
    href: "/ecosystem-subsidy/developer-reward",
  },
];

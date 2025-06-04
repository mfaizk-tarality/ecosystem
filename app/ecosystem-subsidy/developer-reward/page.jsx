"use client";
import BreadCrumb from "@/common_component/BreadCrumb";
import CustomButton from "@/common_component/CustomButton";
import PageTitle from "@/common_component/PageTitle";
import {
  developerUserTaskList,
  getDeveloperTaskList,
} from "@/modules/ecosystem-subsidy";
import { formatNice } from "coin-format";
import moment from "moment";
import React, { useMemo, useState } from "react";
import { useAccount, useConfig, useWriteContract } from "wagmi";
import ecoSystemStakeAbi from "@/abi/EcosystemClaimAbi.json";
import { claimContractAddress } from "@/modules/ecosystem-subsidy/config";
import { waitForTransactionReceipt } from "@wagmi/core";
import { toast } from "sonner";
import Link from "next/link";

const breadCrumb = [
  {
    text: "Home",
    href: "/home",
  },
  {
    text: "Ecosystem Subsidy",
    href: "/ecosystem-subsidy",
  },
  {
    text: " Build & Earn Rewards!",
    href: "/ecosystem-subsidy/developer-reward",
  },
];

const DeveloperRewards = () => {
  const { isConnected, address } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [currentSelectedData, setCurrentSelectedData] = useState({});
  const config = useConfig();
  const {
    writeContractAsync,
    isPending: writeContractPending,
    error,
  } = useWriteContract();
  const {
    data: userTaskList,
    isPending: userTaskListPending,
    refetch: userTaskListRefetch,
  } = developerUserTaskList(address);

  const {
    data: developerTaskList,
    isPending: developerTaskListPending,
    refetch: developerTaskListRefetch,
  } = getDeveloperTaskList();

  const claimHandler = async () => {
    try {
      setIsLoading(true);
      const hash = await writeContractAsync({
        abi: ecoSystemStakeAbi,
        address: claimContractAddress,
        functionName: "claim",
        args: ["2", String(currentSelectedData?.userData?.id)],
      });
      const transactionReceipt = await waitForTransactionReceipt(config, {
        hash: hash,
      });
      if (transactionReceipt?.transactionHash) {
        toast.success("Claimed Successfully.");
      } else {
        toast.error("Unable to claim.");
      }

      setTimeout(() => {
        developerTaskListRefetch();
        userTaskListRefetch();
      }, 5000);
    } catch (error) {
      console.log(error);
      toast.error(error?.shortMessage || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  const dataToUse = useMemo(() => {
    return developerTaskList?.data?.result?.map((item, idx) => {
      const data = userTaskList?.data?.result?.find((it) => {
        return it?.taskId == item?.id;
      });

      return {
        ...item,
        userData: data,
      };
    });
  }, [developerTaskList, userTaskList]);

  const buttonToShowHandler = (item) => {
    const isDeadlineCrossed = moment().isAfter(moment(item?.deadLine));
    if (isDeadlineCrossed) {
      return (
        <CustomButton
          isConnected={isConnected}
          className={"rounded-lg"}
          outlined
        >
          Expired
        </CustomButton>
      );
    }

    if (!item?.userData?.status) {
      return (
        <Link href={`/ecosystem-subsidy/developer-reward/${item?.id}`}>
          <CustomButton isConnected={isConnected} className={"rounded-lg"}>
            Submit & Earn
          </CustomButton>
        </Link>
      );
    }

    if (item?.userData?.status == "approved" && !item?.userData?.isClaimed) {
      return (
        <CustomButton
          isConnected={isConnected}
          isLoading={isLoading}
          className={"rounded-lg"}
          clickHandler={() => {
            setCurrentSelectedData(item);
            claimHandler();
          }}
        >
          Claim
        </CustomButton>
      );
    }
    if (item?.userData?.status != "approved" && !item?.userData?.isClaimed) {
      return (
        <CustomButton
          isConnected={isConnected}
          isLoading={isLoading}
          className={"rounded-lg capitalize"}
          outlined
        >
          {item?.userData?.status == "downloading"
            ? "Github Download"
            : item?.userData?.status
            ? item?.userData?.status
            : "--"}
        </CustomButton>
      );
    }
    if (item?.userData?.isClaimed) {
      return (
        <CustomButton
          isConnected={isConnected}
          isLoading={isLoading}
          className={"rounded-lg"}
        >
          Claim
        </CustomButton>
      );
    }

    return <></>;
  };

  return (
    <div>
      <div className="w-full flex items-end justify-end">
        <BreadCrumb routes={breadCrumb} />
      </div>
      <div className="grid grid-cols-12 my-10">
        <div className="col-span-12  ">
          <PageTitle
            title={"Build & Earn Rewards!"}
            subtitle={
              "Innovate, create, and contribute to TAN's ecosystem. Get rewarded for building the future of blockchain!"
            }
          />
          <div className="w-full grid grid-cols-12 mt-4 rounded-2xl relative gap-4 ">
            {dataToUse?.map((item, idx) => {
              return (
                <div
                  className="col-span-12 sm:col-span-6 md:col-span-3 xl:col-span-2 min-h-56 flex border-2 border-stroke p-4 rounded-2xl flex-col justify-between items-center"
                  key={idx}
                >
                  <div className="flex justify-between w-full items-center  ">
                    <p>
                      Incentive:{" "}
                      <span>
                        {item?.amount ? formatNice(item?.amount) : "--"} TAN
                      </span>
                    </p>
                    <div className="text-center border border-stroke p-1">
                      <p className="text-xs ">
                        {moment(item?.deadLine)?.format("ll")}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm">{item?.task ? item?.task : "--"}</p>
                  {buttonToShowHandler(item)}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeveloperRewards;

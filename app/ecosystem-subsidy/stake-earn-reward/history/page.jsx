"use client";
import BreadCrumb from "@/common_component/BreadCrumb";
import ConfirmModal from "@/common_component/ConfirmModal";
import CustomButton from "@/common_component/CustomButton";
import LoadingScreen from "@/common_component/LoadingScreen";
import NoDataFound from "@/common_component/NoDataFound";
import PageTitle from "@/common_component/PageTitle";
import { getParticipationList } from "@/modules/ecosystem-subsidy";
import { claimContractAddress } from "@/modules/ecosystem-subsidy/config";
import { maskValue } from "@/utils";
import { formatNice } from "coin-format";
import moment from "moment";
import React, { useState } from "react";
import { toast } from "sonner";
import { useAccount, useWriteContract } from "wagmi";
import { waitForTransactionReceipt } from "@wagmi/core";
import ecoSystemStakeAbi from "@/abi/EcosystemClaimAbi.json";
import Timer from "@/common_component/Timer";

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
    text: "Stake & Earn items!",
    href: "/ecosystem-subsidy/stake-earn-reward",
  },
  {
    text: "History",
    href: "/ecosystem-subsidy/stake-earn-reward/history",
  },
];

const StakeEarnitemHistory = () => {
  const { address, isConnected } = useAccount();
  const [currentSelectedData, setcurrentSelectedData] = useState({});
  const [confirmModal, setConfirmModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const {
    writeContractAsync,
    isPending: writeContractPending,
    error,
  } = useWriteContract();
  const {
    data: participationList,
    isPending: participationListPending,
    refetch: participationListRefetch,
  } = getParticipationList(address);

  const claimHandler = async () => {
    try {
      setConfirmModal(false);
      setIsLoading(true);
      const hash = await writeContractAsync({
        abi: ecoSystemStakeAbi,
        address: claimContractAddress,
        functionName: "claim",
        args: ["0", String(currentSelectedData?.id)],
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
        if (participationListRefetch) {
          participationListRefetch();
        }
        setIsLoading(false);
      }, 5000);
    } catch (error) {
      console.log(error);
      toast.error(error?.shortMessage || "Something went wrong.");
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="w-full flex items-end justify-end">
        <BreadCrumb routes={breadCrumb} />
      </div>
      <div className="grid grid-cols-12 my-10">
        <div className="col-span-12  2xl:col-span-8 2xl:col-start-3">
          <div className="col-span-12 md:col-span-6 flex justify-between items-end flex-col md:flex-row gap-4 md:gap-0">
            <PageTitle
              title={"History"}
              subtitle={
                "The more you stake, the greater your items. Grow your holdings and thrive in TAN’s ecosystem."
              }
            />
          </div>
          <div className="w-full mt-4 rounded-2xl relative">
            <div className="max-h-[700px] overflow-auto w-full ">
              {participationListPending && isConnected && (
                <LoadingScreen
                  className={"min-h-[400px]"}
                  text={"Getting Token Data..."}
                />
              )}
              {((!participationListPending && participationList?.length == 0) ||
                !isConnected) && (
                <div className="min-h-56">
                  <NoDataFound text={"No Data Found."} />
                </div>
              )}

              {!participationListPending &&
                isConnected &&
                participationList?.length != 0 && (
                  <table className="table table-md table-pin-rows table-pin-cols flex-1 min-w-[1000px] ">
                    <thead>
                      <tr className="bg-stroke">
                        <td>Pool Address</td>
                        <td>Name</td>
                        <td>Transaction Hash</td>
                        <td>Stake Amount</td>
                        <td>Date</td>
                        <td>Incentive</td>
                        <td></td>
                      </tr>
                    </thead>
                    <tbody>
                      {participationList?.map((item, idx) => {
                        return (
                          <tr key={idx}>
                            <td>
                              {maskValue({
                                str: item?.contractAddress
                                  ? item?.contractAddress
                                  : "--",
                                enableCopyButton: true,
                              })}
                            </td>
                            <td>
                              {item?.stackPoolName ? item?.stackPoolName : "--"}
                            </td>
                            <td>
                              {maskValue({
                                str: item?.transactionHash
                                  ? item?.transactionHash
                                  : "--",
                                enableCopyButton: true,
                              })}
                            </td>
                            <td>{formatNice(Number(item?.sendAmount ?? 0))}</td>
                            <td>
                              {item?.createdAt
                                ? moment(item?.createdAt)
                                    .utcOffset(330)
                                    .format("lll")
                                : "--"}
                            </td>
                            <td>
                              {(Number(item?.stackAllocationPlan?.percentage) /
                                100) *
                                Number(item?.sendAmount)}{" "}
                              TAN
                            </td>

                            <td>
                              <div className="flex items-center ">
                                {moment().isBefore(
                                  moment(item?.createdAt).add(
                                    item?.stackAllocationPlan?.coolingPeriod,
                                    "days"
                                  )
                                ) ? (
                                  <div className="flex justify-between">
                                    <Timer
                                      expiryTimestamp={moment(item?.createdAt)
                                        .add(
                                          item?.stackAllocationPlan
                                            ?.coolingPeriod,
                                          "days"
                                        )
                                        .toDate()}
                                      setIsExpired={() => {}}
                                      childClassName={
                                        "border border-tanborder p-2 rounded-xl"
                                      }
                                    />
                                  </div>
                                ) : item?.isClaimed ? (
                                  <CustomButton
                                    className={
                                      "bg-transparent border border-tanborder rounded-lg"
                                    }
                                  >
                                    Claimed
                                  </CustomButton>
                                ) : (
                                  <CustomButton
                                    clickHandler={() => {
                                      // if (
                                      //   moment().isBefore(
                                      //     moment(
                                      //       item?.stackAllocationPlan?.createdAt
                                      //     ).add(
                                      //       item?.stackAllocationPlan
                                      //         ?.coolingPeriod,
                                      //       "days"
                                      //     )
                                      //   )
                                      // ) {
                                      //   toast.error(
                                      //     "Please claim after cooling period over."
                                      //   );
                                      //   return;
                                      // }
                                      // if (!item?.isAllocated) {
                                      //   toast.error(
                                      //     "Amount is not allocated yet, Please try again later."
                                      //   );
                                      //   return;
                                      // }
                                      setcurrentSelectedData(item);
                                      setConfirmModal(true);
                                    }}
                                  >
                                    {currentSelectedData?.id == item?.id &&
                                    isLoading
                                      ? `Executing...`
                                      : `Claim`}
                                  </CustomButton>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
            </div>
          </div>
        </div>
      </div>
      <ConfirmModal
        open={confirmModal}
        setOpen={setConfirmModal}
        title={"Confirm transaction"}
        clickHanlder={claimHandler}
        description={`Do you want to claim this!`}
      />
    </div>
  );
};

export default StakeEarnitemHistory;

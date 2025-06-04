"use client";
import BreadCrumb from "@/common_component/BreadCrumb";
import CustomButton from "@/common_component/CustomButton";
import PageTitle from "@/common_component/PageTitle";
import useStakeData from "@/hooks/useStakeData";
import { getStackPlans, participateInStack } from "@/modules/ecosystem-subsidy";
import { useFormik } from "formik";
import React, { useEffect, useMemo, useState } from "react";
import * as yup from "yup";
import stakingAbi from "@/abi/stakingAbi.json";
import { useAccount, useConfig } from "wagmi";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { getTransaction } from "@wagmi/core";

import moment from "moment";
import { useDebounce } from "@uidotdev/usehooks";
import { ecosystemStakeMethode } from "@/modules/ecosystem-subsidy/config";
import { formatEther } from "ethers";
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
    text: "Stake & Earn Rewards!",
    href: "/ecosystem-subsidy/stake-earn-reward",
  },
];

let StakeEarnRewardSchema = yup.object({
  poolName: yup.string().required("Pool Name is required."),
  poolAddress: yup.string().required("Pool Address is required."),
  transactionHash: yup.string().required("Transaction Hash is required."),
  totalSupply: yup.string().required("Total Supply is required."),
});

const StakeEarnReward = () => {
  const { address, isConnected } = useAccount();
  const [txnLoading, setTxnLoading] = useState(false);
  const config = useConfig();
  const {
    data: planList,
    isPending: planListPending,
    refetch: refetchDbPlan,
  } = getStackPlans({});

  const contractAddressesList = useMemo(
    () => planList?.map((item) => item?.contractAddress),
    [planList, planListPending]
  );
  const { stakeDataList: stakeDataListData, refetchData } = useStakeData(
    contractAddressesList,
    stakingAbi,
    address
  );

  const {
    mutateAsync: participateInStackMutate,
    isPending: participateInStackPending,
  } = useMutation({
    mutationFn: async () => {
      return await participateInStack({
        transactionHash: formik?.values?.transactionHash,
        contractAdress: formik?.values?.poolAddress,
        walletAddress: address,
      });
    },
    onSuccess: (data) => {
      if (data?.status != 200) {
        toast.error(data?.response?.data?.responseMessage);
      } else {
        toast.success(data?.data?.responseMessage);
      }
      participationListRefetch();
    },
    onError: (err) => {
      console.log(err, "err>>>>>>");
    },
  });

  const formik = useFormik({
    initialValues: {
      poolAddress: "",
      transactionHash: "",
      totalSupply: "",
      poolName: "",
    },
    validationSchema: StakeEarnRewardSchema,
    validateOnChange: false,
    onSubmit: participateInStackMutate,
  });

  const currentStakeList = useMemo(() => {
    return stakeDataListData

      ?.map((item) => {
        const dbPlans = planList?.find(
          (dbitem) => dbitem?.contractAddress == item?.contractAddress
        );

        return {
          ...item,
          id: dbPlans?.id,
          startDate: moment
            .utc(dbPlans?.startDate)
            .format("YYYY-MM-DD HH:mm:ss"),
          updatedAt: dbPlans?.updatedAt,
          createdAt: dbPlans?.createdAt,
        };
      })
      ?.filter((item) => {
        return moment()?.isAfter(item?.startDate);
      });
  }, [planList, stakeDataListData]);

  const getTransactionData = async () => {
    try {
      setTxnLoading(true);
      const transaction = await getTransaction(config, {
        hash: formik.values.transactionHash,
      });

      if (
        formik.values.poolAddress !== transaction?.to ||
        transaction?.input !== ecosystemStakeMethode
      ) {
        if (formik.values.poolAddress !== transaction?.to) {
          formik.setErrors({
            transactionHash: "Transaction Hash is not valid.",
          });
          setTxnLoading(false);
          return;
        }
        if (transaction?.input !== ecosystemStakeMethode) {
          formik.setErrors({ transactionHash: "Method id not matched." });
          setTxnLoading(false);
          return;
        }
      } else {
        formik.setErrors({
          transactionHash: "",
        });
        formik.setFieldValue(
          "totalSupply",
          transaction?.value ? formatEther(String(transaction?.value)) : 0
        );
      }
      setTxnLoading(false);
    } catch (error) {
      console.log(error);
      formik.setFieldValue("totalSupply", "");
      setTxnLoading(false);
    }
  };

  useEffect(() => {
    getTransactionData();
  }, [useDebounce(formik.values.transactionHash, 1500)]);

  return (
    <div>
      <div className="w-full flex items-end justify-end">
        <BreadCrumb routes={breadCrumb} />
      </div>
      <div className="grid grid-cols-12 my-10">
        <div className="col-span-12  2xl:col-span-8 2xl:col-start-3">
          <div className="col-span-12 md:col-span-6 flex justify-between items-end flex-col md:flex-row gap-4 md:gap-0">
            <PageTitle
              title={"Stake & Earn Rewards!"}
              subtitle={
                "The more you stake, the greater your rewards. Grow your holdings and thrive in TAN’s ecosystem."
              }
            />

            <Link href={"/ecosystem-subsidy/stake-earn-reward/history"}>
              <CustomButton className={"min-w-40 rounded-sm"}>
                History
              </CustomButton>
            </Link>
          </div>
          <div className="w-full grid grid-cols-12 mt-4 rounded-2xl relative gap-4">
            <form
              className="col-span-12 grid grid-cols-12 border border-stroke md:gap-6 xl:gap-12 p-10 rounded-md"
              onSubmit={formik.handleSubmit}
            >
              <div className="col-span-12 md:col-span-6 flex flex-col gap-2">
                <label htmlFor={"poolName"}>Pool Name</label>
                <select
                  name="poolName"
                  className="outline-0 border border-stroke p-2 rounded-sm w-full bg-background "
                  value={formik.values?.poolName}
                  onChange={(e) => {
                    formik.resetForm();
                    formik.setFieldValue("poolName", e?.target?.value);
                    formik.setFieldValue(
                      "poolAddress",
                      currentStakeList?.[e?.target?.value]?.contractAddress
                    );
                  }}
                >
                  {currentStakeList?.map((item, idx) => {
                    return (
                      <option value={idx} key={idx} className="text-white">
                        {item?.poolName}
                      </option>
                    );
                  })}
                </select>
                <p className="text-error">{formik.errors.poolName}</p>
              </div>
              {fields?.map((item, idx) => {
                return (
                  <div
                    className="col-span-12 md:col-span-6 flex flex-col gap-2 relative"
                    key={idx}
                  >
                    <div className="flex gap-2">
                      <label htmlFor={item.field}>{item.label}</label>
                      {item.field == "transactionHash" && txnLoading && (
                        <span className="loading loading-spinner loading-xs"></span>
                      )}
                    </div>
                    <input
                      id={item.field}
                      name={item.field}
                      type="text"
                      className="border border-stroke p-2 rounded-sm"
                      placeholder={item.placeholder}
                      onChange={(e) => {
                        if (
                          item.field == "poolAddress" ||
                          item?.field == "totalSupply"
                        ) {
                          return;
                        }
                        formik.handleChange(e);
                      }}
                      value={formik.values?.[item.field]}
                    />
                    <p className="text-error">{formik.errors?.[item.field]}</p>
                  </div>
                );
              })}

              <div className="col-span-12 flex items-center justify-center mt-6 md:mt-0">
                <CustomButton
                  className={"min-w-44 rounded-sm"}
                  isLoading={txnLoading || participateInStackPending}
                  isConnected={isConnected}
                  type="submit"
                >
                  Submit
                </CustomButton>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StakeEarnReward;

const fields = [
  {
    field: "poolAddress",
    label: "Pool Address",
    placeholder: "e.g. 0x253c832D8004CfECdC8424e61203f2E97a4d7A53",
  },
  {
    field: "transactionHash",
    label: "Transaction Hash",
    placeholder:
      "e.g. 0xb9e12fe54117e37e32aabd69439595e2f79c36e7dca47a89ccfe502cb2f47a64",
  },
  {
    field: "totalSupply",
    label: "Staked Amount",
    placeholder: "e.g. 100",
  },
];

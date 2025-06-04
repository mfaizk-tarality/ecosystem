"use client";
import BreadCrumb from "@/common_component/BreadCrumb";
import CustomButton from "@/common_component/CustomButton";
import PageTitle from "@/common_component/PageTitle";
import {
  becomeValidator,
  getValidatorPlan,
  participationListValidate,
  validatorBlocks,
} from "@/modules/ecosystem-subsidy";
import {
  claimContractAddress,
  validatorStackContract,
} from "@/modules/ecosystem-subsidy/config";
import { useMutation } from "@tanstack/react-query";
import { useDebounce } from "@uidotdev/usehooks";
import { useFormik } from "formik";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useAccount, useConfig, useWriteContract } from "wagmi";
import * as yup from "yup";
import { getTransaction, waitForTransactionReceipt } from "@wagmi/core";
import { formatEther } from "ethers";
import LoadingScreen from "@/common_component/LoadingScreen";
import { maskValue } from "@/utils";
import ecosystemValidatorAbi from "@/abi/EcosystemClaimAbi.json";

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

let ValidatorRewardSchema = yup.object({
  walletAddress: yup.string().required("Wallet Address is required."),
  stakingContractAddress: yup
    .string()
    .required("Staking Contract Address is required."),
  trxHash: yup.string().required("Transaction Hash is required."),
  totalSupply: yup.string().required("Total Supply is required."),
  blockValidated: yup.string().required("Blocks are required."),
  termsCondition: yup
    .boolean()
    .oneOf([true], "Terms and conditions should be accepted"),
});

const ValidatorReward = () => {
  const { address, isConnected } = useAccount();
  const [termsConditionModal, setTermsConditionModal] = useState(false);
  const config = useConfig();
  const {
    data: participationListData,
    isPending: participationListPending,
    refetch: refetchParticipationListData,
  } = participationListValidate(address);
  const { data: validatorBlocksData } = validatorBlocks(address);
  //   const {
  //     data: validatorPlan,
  //     isPending: validatorPlanPending,
  //     refetch: validatorPlanRefetch,
  //   } = getValidatorPlan();
  const {
    mutateAsync: becomeValidatorMutate,
    isPending: becomeValidatorPending,
  } = useMutation({
    mutationFn: async ({ transactionHash, walletAddress }) => {
      return await becomeValidator(transactionHash, walletAddress);
    },
    onSuccess: (data) => {
      if (data?.status != 200) {
        toast.error(data?.response?.data?.responseMessage);
      } else {
        toast.success(data?.data?.responseMessage);
        refetchParticipationListData();
      }
    },
    onError: (err) => {
      console.log(err, "becomeErr>>>>>");
    },
  });

  const formik = useFormik({
    initialValues: {
      walletAddress: address,
      stakingContractAddress: validatorStackContract,
      trxHash: "",
      totalSupply: "",
      blockValidated: validatorBlocksData?.data?.result?.validations_count,
      termsCondition: false,
    },
    validationSchema: ValidatorRewardSchema,
    validateOnChange: false,
    enableReinitialize: true,
    onSubmit: () => {
      becomeValidatorMutate({
        transactionHash: formik.values.trxHash,
        walletAddress: address,
      });
    },
  });

  const getTransactionData = async () => {
    try {
      const transaction = await getTransaction(config, {
        hash: formik.values.trxHash,
      });
      formik.setFieldValue(
        "totalSupply",
        transaction?.value ? formatEther(String(transaction?.value)) : 0
      );
    } catch (error) {
      console.log(error, "asdasdasdas");
    }
  };

  useEffect(() => {
    getTransactionData();
  }, [useDebounce(formik.values.trxHash, 1500)]);

  if (participationListPending) {
    return (
      <div className="min-h-96 flex items-center justify-center">
        <LoadingScreen />
      </div>
    );
  }

  if (
    participationListData &&
    Object.keys(participationListData?.data?.result)?.length > 0
  ) {
    return <ClaimValidatedComponent />;
  }

  return (
    <div>
      <div className="w-full flex items-end justify-end">
        <BreadCrumb routes={breadCrumb} />
      </div>
      <div className="grid grid-cols-12 my-10">
        <div className="col-span-12  2xl:col-span-8 2xl:col-start-3">
          <PageTitle
            title={"Be a Validator & Earn!"}
            subtitle={
              "Secure the network, validate transactions, and earn by contributing to TAN’s growing ecosystem."
            }
          />
          <div className="w-full grid grid-cols-12 mt-4 rounded-2xl relative gap-4">
            <form
              className="col-span-12 grid grid-cols-12 border border-stroke md:gap-6 xl:gap-12 p-10 rounded-md"
              onSubmit={formik.handleSubmit}
            >
              {fields?.map((item, idx) => {
                return (
                  <div
                    className="col-span-12 md:col-span-6 flex flex-col gap-2 relative"
                    key={idx}
                  >
                    <div className="flex gap-2">
                      <label htmlFor={item.field}>{item.label}</label>
                    </div>
                    <input
                      id={item.field}
                      name={item.field}
                      type="text"
                      className="border border-stroke p-2 rounded-sm"
                      placeholder={item.placeholder}
                      onChange={(e) => {
                        if (item.disable) {
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
              <div className="col-span-12 flex flex-col mt-4 md:mt-0">
                <div className="flex gap-4 items-center">
                  <input
                    type="checkbox"
                    className="checkbox border text-tanborder"
                    checked={formik.values.termsCondition}
                    onChange={(e) => {
                      formik.setFieldValue("termsCondition", e.target.checked);
                    }}
                  />
                  <p className="text-description">
                    By checking this I agree with{" "}
                    <span
                      className="text-white cursor-pointer"
                      onClick={() =>
                        formik.setFieldValue("termsCondition", true)
                      }
                    >
                      Terms & Conditions
                    </span>
                  </p>
                </div>
                <p className="text-error mt-2">
                  {formik.errors?.termsCondition}
                </p>
              </div>

              <div className="col-span-12 flex items-center justify-center mt-6 md:mt-0">
                <CustomButton
                  className={"min-w-44 rounded-sm"}
                  //   isLoading={txnLoading || participateInStackPending}
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

export default ValidatorReward;

const fields = [
  {
    field: "walletAddress",
    label: "Wallet Address",
    placeholder: "e.g. Apha",
    disable: true,
  },
  {
    field: "stakingContractAddress",
    label: "Staking Contract Address",
    placeholder: "e.g. 0x253c832D8004CfECdC8424e61203f2E97a4d7A53",
    disable: true,
  },
  {
    field: "trxHash",
    label: "Transaction Hash",
    placeholder:
      "e.g. 0xb9e12fe54117e37e32aabd69439595e2f79c36e7dca47a89ccfe502cb2f47a64",
    disable: false,
  },
  {
    field: "totalSupply",
    label: "Staked Amount",
    placeholder: "e.g. 100",
    disable: false,
  },
  {
    field: "blockValidated",
    label: "Block Validated",
    placeholder: "e.g. 100",
    disable: true,
  },
];

const ClaimValidatedComponent = () => {
  const { address, isConnected } = useAccount();
  const config = useConfig();
  const { writeContractAsync, isPending: writeContractPending } =
    useWriteContract();
  const [isLoading, setIsLoading] = useState(false);
  const {
    data: validatorPlan,
    isPending: validatorPlanPending,
    refetch: validatorPlanRefetch,
  } = getValidatorPlan();

  const {
    data: participationListData,
    isPending: participationListPending,
    refetch: refetchParticipantList,
  } = participationListValidate(address);
  const { data: validatorBlocksData } = validatorBlocks(address);
  const claimHandler = async () => {
    try {
      setIsLoading(true);

      const hash = await writeContractAsync({
        abi: ecosystemValidatorAbi,
        address: claimContractAddress,
        functionName: "claim",
        args: ["1", String(participationListData?.data?.result?.id)],
      });

      await waitForTransactionReceipt(config, {
        hash: hash,
      });
      await validatorPlanRefetch();
      await refetchParticipantList();
    } catch (error) {
      console.log(error);
      toast.error(error?.shortMessage || "Somehing went wrong");
      await validatorPlanRefetch();
      await refetchParticipantList();
    } finally {
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
          <PageTitle
            title={"Be a Validator & Earn!"}
            subtitle={
              "Secure the network, validate transactions, and earn by contributing to TAN’s growing ecosystem."
            }
          />
          <div className="w-full grid grid-cols-12 mt-4 rounded-2xl relative gap-4">
            <div className="col-span-12 grid grid-cols-12 border border-stroke md:gap-6 xl:gap-12 p-10 rounded-md">
              <div className="md:col-span-6 col-span-12">
                <label className="text-description">Wallet Address</label>
                <p>
                  {maskValue({
                    str: address,
                    enableCopyButton: true,
                    enableMasking: false,
                  })}
                </p>
              </div>
              <div className="md:col-span-6 col-span-12">
                <label className="text-description">
                  Staking Contract Address
                </label>
                <p>
                  {maskValue({
                    str: participationListData?.data?.result?.contractAddress,
                    enableCopyButton: true,
                    enableMasking: false,
                  })}
                </p>
              </div>
              <div className="md:col-span-6 col-span-12">
                <label className="text-description">Transaction Hash</label>
                <p>
                  {maskValue({
                    str: participationListData?.data?.result?.transactionHash,
                    enableCopyButton: true,
                  })}
                </p>
              </div>
              <div className="md:col-span-6 col-span-12">
                <label className="text-description">
                  Staked Amount (in TAN)
                </label>
                <p>{participationListData?.data?.result?.sendAmount || 0}</p>
              </div>
              <div className="md:col-span-6 col-span-12">
                <label className="text-description">Block Validated</label>
                <p>
                  {validatorBlocksData?.data?.result?.validations_count || 0}
                </p>
              </div>
              <div className="md:col-span-6 col-span-12">
                <label className="text-description">Incentive Amount</label>
                <p>
                  {participationListData?.data?.result?.allocatedAmount || 0}
                </p>
              </div>
              <div className="col-span-12 flex items-center justify-center mt-6 md:mt-0">
                {Number(validatorBlocksData?.data?.result?.validations_count) >=
                  Number(validatorPlan?.data?.result?.minBlockValidate) && (
                  <>
                    {!participationListData?.data?.result?.isClaimed && (
                      <CustomButton
                        className={"min-w-44 rounded-sm"}
                        isLoading={isLoading || writeContractPending}
                        isConnected={isConnected}
                        clickHandler={() => {
                          if (
                            !participationListData?.data?.result?.isAllocated
                          ) {
                            toast.error(
                              "Fund is not allocated yet, please try again later."
                            );
                          }
                          claimHandler();
                        }}
                      >
                        Submit
                      </CustomButton>
                    )}
                  </>
                )}
              </div>
            </div>
            <div className="col-span-12 ">
              <h2 className="text-base text-description">
                Note*: Min. {validatorPlan?.data?.result?.minBlockValidate}{" "}
                Block Validate
              </h2>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

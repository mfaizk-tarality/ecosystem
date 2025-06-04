"use client";
import BreadCrumb from "@/common_component/BreadCrumb";
import CustomButton from "@/common_component/CustomButton";
import PageTitle from "@/common_component/PageTitle";
import { useFormik } from "formik";
import React from "react";
import { useAccount } from "wagmi";
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
  {
    text: "Task",
    href: "#",
  },
];

const Task = () => {
  const { isConnected } = useAccount();

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

export default Task;

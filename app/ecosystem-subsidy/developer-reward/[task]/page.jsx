"use client";
import BreadCrumb from "@/common_component/BreadCrumb";
import CustomButton from "@/common_component/CustomButton";
import LoadingScreen from "@/common_component/LoadingScreen";
import PageTitle from "@/common_component/PageTitle";
import {
  becomeDeveloper,
  getDeveloperTaskList,
} from "@/modules/ecosystem-subsidy";
import { IconMinus, IconPlus } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { Field, FieldArray, FormikProvider, useFormik } from "formik";
import { useParams, useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import { useAccount } from "wagmi";
import * as yup from "yup";
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
    text: "Build & Earn Rewards!",
    href: "/ecosystem-subsidy/developer-reward",
  },
  {
    text: "Task",
    href: "#",
  },
];

let TaskSchema = yup.object({
  walletAddress: yup.string().required("Wallet Address is required."),
  githubLink: yup.string().required("Github Link is required."),
  verifiedContract: yup
    .array()
    .of(
      yup.string().min(4, "too short").required("Contract address is required.")
    )
    .required("Verified Contract address is required."),
});

const Task = () => {
  const { isConnected, address } = useAccount();
  const { task } = useParams();
  const router = useRouter();

  const {
    data: developerTaskList,
    isPending: developerTaskListPending,
    refetch: developerTaskListRefetch,
  } = getDeveloperTaskList();

  const selectedTask = useMemo(() => {
    return developerTaskList?.data?.result?.find((item) => item?.id == task);
  }, [developerTaskList, task]);

  const {
    mutateAsync: becomeDeveloperMutate,
    isPending: becomeDeveloperPending,
  } = useMutation({
    mutationFn: async () => {
      return await becomeDeveloper(
        String(task),
        address,
        formik.values.githubLink,
        formik.values.verifiedContract
      );
    },
    onSuccess: (data) => {
      if (data?.status != 200) {
        toast.error(data?.response?.data?.responseMessage);
      } else {
        toast.success(data?.data?.responseMessage);
        formik.resetForm();
        router.back();
      }
    },
    onError: (err) => {
      console.log(err, "err>>>>");
    },
  });

  const formik = useFormik({
    initialValues: {
      walletAddress: address,
      githubLink: "",
      verifiedContract: [""],
    },
    validationSchema: TaskSchema,
    validateOnChange: false,
    enableReinitialize: true,
    onSubmit: becomeDeveloperMutate,
  });
  if (developerTaskListPending) {
    return (
      <div className="min-h-96 flex items-center justify-center">
        <LoadingScreen />
      </div>
    );
  }

  return (
    <FormikProvider value={formik}>
      <div className="w-full flex items-end justify-end">
        <BreadCrumb routes={breadCrumb} />
      </div>
      <div className="grid grid-cols-12 my-10">
        <div className="col-span-12  2xl:col-span-8 2xl:col-start-3">
          <PageTitle
            title={selectedTask?.task || ""}
            subtitle={selectedTask?.description || ""}
          />
          <div className="col-span-12 flex items-center gap-4 py-4">
            <p>Incentive: 10000 TAN</p>
            <p className="p-1 border border-stroke text-xs rounded-sm">
              Feb 06,2025
            </p>
          </div>
          <div className="w-full grid grid-cols-12 mt-4 rounded-2xl relative gap-4">
            <form className="col-span-12 grid grid-cols-12 border border-stroke md:gap-6 xl:gap-12 p-10 rounded-md gap-2">
              {fields?.map((item, idx) => {
                return (
                  <div
                    className="col-span-12 gap-2 relative grid grid-cols-12 items-center"
                    key={idx}
                  >
                    <div className="flex col-span-12 md:col-span-3">
                      <label htmlFor={item.field}>{item.label}</label>
                    </div>
                    <div className="col-span-12 md:col-span-9">
                      <input
                        id={item.field}
                        name={item.field}
                        type="text"
                        className="border border-stroke p-2 rounded-sm w-full"
                        placeholder={item.placeholder}
                        onChange={(e) => {
                          if (item.disable) {
                            return;
                          }
                          formik.handleChange(e);
                        }}
                        value={formik.values?.[item.field]}
                      />
                      <p className="text-error">
                        {formik.errors?.[item.field]}
                      </p>
                    </div>
                  </div>
                );
              })}

              <div className="col-span-12 gap-2 relative grid grid-cols-12 items-center">
                <div className="flex col-span-12 md:col-span-3">
                  <label>Verified Contract Address</label>
                </div>
                <FieldArray
                  name="verifiedContract"
                  render={(arrayHelpers) => (
                    <div className="flex col-span-12 md:col-span-9 flex-col gap-4">
                      {formik?.values.verifiedContract.map((_, index) => {
                        return (
                          <div key={index} className="w-full ">
                            <div className="w-full flex gap-2">
                              <div className="w-full ">
                                <Field
                                  className="w-full border border-stroke  p-2 rounded"
                                  name={`verifiedContract[${index}]`}
                                  placeholder="e.g. 0x38cAA8D44D3DAA1f8FB02941C0C9F906a8E40763"
                                />
                                <p className="text-error">
                                  {formik.errors?.verifiedContract?.[index]}
                                </p>
                              </div>

                              <div>
                                {index ==
                                formik.values?.verifiedContract?.length - 1 ? (
                                  <CustomButton
                                    className={"p-2 rounded-md"}
                                    clickHandler={() => arrayHelpers.push("")}
                                  >
                                    <IconPlus />
                                  </CustomButton>
                                ) : (
                                  <CustomButton
                                    className={"p-2 rounded-md"}
                                    clickHandler={() =>
                                      arrayHelpers.remove(index)
                                    }
                                  >
                                    <IconMinus />
                                  </CustomButton>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                />
              </div>

              <div className="col-span-12 flex items-center justify-center mt-6 md:mt-0">
                <CustomButton
                  className={"min-w-44 rounded-sm"}
                  isConnected={isConnected}
                  isLoading={becomeDeveloperPending}
                  type="button"
                  clickHandler={() => {
                    formik.handleSubmit();
                  }}
                >
                  Submit
                </CustomButton>
              </div>
            </form>

            <div className="col-span-12 flex flex-col gap-2">
              <p className="text-description">Guidelines:</p>
              <div
                dangerouslySetInnerHTML={{ __html: selectedTask?.guideLine }}
              />
            </div>
          </div>
        </div>
      </div>
    </FormikProvider>
  );
};

export default Task;

const fields = [
  {
    field: "walletAddress",
    label: "Wallet Address",
    placeholder: "e.g. Apha",
    disable: true,
  },
  {
    field: "githubLink",
    label: "Github Repo Link",
    placeholder: "e.g. 0x253c832D8004CfECdC8424e61203f2E97a4d7A53",
  },
];

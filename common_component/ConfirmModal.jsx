"use client";
import { IconX } from "@tabler/icons-react";
import React, { useEffect } from "react";
import CustomButton from "./CustomButton";

const ConfirmModal = ({
  open,
  setOpen,
  title,
  description,
  cancelBtnTxt,
  confirmBtnTxt,
  clickHanlder,
  onClose,
}) => {
  useEffect(() => {
    if (open) {
      document.getElementById("modal_common").showModal();
    } else {
      document.getElementById("modal_common").close();
    }
  }, [open]);
  return (
    <dialog id="modal_common" className="modal">
      <div className="modal-box relative bg-background">
        <div className="flex items-center justify-center">
          <p className="font-semibold">{title || ""}</p>
        </div>
        <div className="py-2 flex ">
          <div className="modal-action absolute -top-6 right-0 p-6">
            <button
              className="cursor-pointer"
              onClick={() => {
                setOpen(false);
                document.getElementById("modal_common").close();
              }}
            >
              <IconX />
            </button>
          </div>
        </div>
        <div
          method="dialog "
          className="overflow-x-auto max-h-96 flex justify-center items-center py-10"
        >
          <p className="text-lg font-medium">{description || ""}</p>
        </div>
        <div className="flex flex-row justify-center gap-8">
          <CustomButton
            clickHandler={() => {
              document.getElementById("modal_common").close();
              if (onClose) {
                onClose();
              }
            }}
          >
            {cancelBtnTxt || "Cancel"}
          </CustomButton>
          <CustomButton clickHandler={clickHanlder}>
            {confirmBtnTxt || "Confirm"}
          </CustomButton>
        </div>
      </div>
    </dialog>
  );
};

export default ConfirmModal;

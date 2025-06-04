"use client";

import { cn } from "@/lib/utils";
import React, { Fragment } from "react";
import { useTimer } from "react-timer-hook";

const Timer = ({
  expiryTimestamp,
  setIsExpired,
  containerClassName,
  childClassName,
}) => {
  const {
    totalSeconds,
    seconds,
    minutes,
    hours,
    days,
    isRunning,
    start,
    pause,
    resume,
    restart,
  } = useTimer({
    expiryTimestamp: expiryTimestamp,
    onExpire: () => {
      if (setIsExpired) {
        setIsExpired((p) => !p);
      }
    },
  });

  return (
    <div
      className={cn(
        containerClassName,
        "flex justify-center items-center gap-1"
      )}
    >
      <p className={cn(childClassName)}>{String(days).padStart(2, "0")}</p>:
      <p className={cn(childClassName)}>{String(hours).padStart(2, "0")}</p>:
      <p className={cn(childClassName)}>{String(minutes).padStart(2, "0")}</p>:
      <p className={cn(childClassName)}>{String(seconds).padStart(2, "0")}</p>
    </div>
  );
};

export default Timer;

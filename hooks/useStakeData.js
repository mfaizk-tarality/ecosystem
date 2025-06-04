import { useMemo, useState, useCallback } from "react";
import { useInfiniteReadContracts } from "wagmi";

const useStakeData = (config, stakingAbi, connectedWalletAddress) => {
  const [refreshKey, setRefreshKey] = useState(0);

  const refetchData = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  const fetchContractData = (key, functionName, args = []) => {
    return useInfiniteReadContracts({
      cacheKey: [key, config, refreshKey],
      contracts: (page) =>
        config?.map((address) => ({
          abi: stakingAbi,
          address: address,
          functionName,
          args,
        })),
      query: {
        initialPageParam: 0,
        getNextPageParam: (lastPageParam) => lastPageParam + 1,
      },
    });
  };

  const { data: poolStakeAmount } = fetchContractData(
    "poolStakeAmount",
    "poolStakeAmount"
  );
  const { data: totalDeposited } = fetchContractData(
    "totalDeposited",
    "totalDeposited"
  );
  const { data: fixedAmount } = fetchContractData("fixedAmount", "fixedAmount");
  const { data: commissionRate } = fetchContractData(
    "commissionRate",
    "commissionRate"
  );
  const { data: poolName } = fetchContractData("poolName", "poolName");
  const { data: vacancyAmount } = fetchContractData(
    "vacancyAmount",
    "vacancyAmount"
  );
  const { data: userStakes } = fetchContractData("userStakes", "userStakes", [
    connectedWalletAddress,
  ]);

  const { data: lockAfterPoolCompleted } = fetchContractData(
    "lockPeriod",
    "lockPeriod"
  );

  const { data: poolReachedMaxTimestamp } = fetchContractData(
    "poolReachedMaxTimestamp",
    "poolReachedMaxTimestamp"
  );

  const { data: bufferStakeData } = fetchContractData(
    "bufferStake",
    "bufferStake",
    [connectedWalletAddress]
  );
  const { data: totalRewardDistributedData } = fetchContractData(
    "totalRewardDistributed",
    "totalRewardDistributed"
  );
  const { data: withdrawalAddressesData } = fetchContractData(
    "getWithdrawalAddresses",
    "getWithdrawalAddresses"
  );
  const { data: totalBufferDepositedData } = fetchContractData(
    "totalBufferDeposited",
    "totalBufferDeposited"
  );

  const { data: getDepositedAddressesData } = fetchContractData(
    "getDepositedAddresses",
    "getDepositedAddresses"
  );

  const stakeDataList = useMemo(() => {
    if (!poolStakeAmount?.pages?.[0]) return [];
    return poolStakeAmount?.pages?.[0]?.map((item, idx) => {
      return {
        depositedAddresses:
          getDepositedAddressesData?.pages?.[0]?.[idx]?.result,
        poolStakeAmount: Number(item?.result) / 1e18,
        totalDepositedAmount:
          Number(totalDeposited?.pages?.[0]?.[idx]?.result) / 1e18,
        fixedAmount: Number(fixedAmount?.pages?.[0]?.[idx]?.result) / 1e18,
        commissionRate: Number(commissionRate?.pages?.[0]?.[idx]?.result) / 10,
        poolName: poolName?.pages?.[0]?.[idx]?.result,
        vacancyAmount: vacancyAmount?.pages?.[0]?.[idx]?.result
          ? Number(vacancyAmount?.pages?.[0]?.[idx]?.result) / 1e18
          : 0,
        contractAddress: config?.[idx],
        totalUserStaked:
          Number(userStakes?.pages?.[0]?.[idx]?.result?.[0]) / 1e18,
        userReward: Number(userStakes?.pages?.[0]?.[idx]?.result?.[1]) / 1e18,
        lockPeriod: Number(userStakes?.pages?.[0]?.[idx]?.result?.[2]),

        userWithdrawalRequestAmount: userStakes?.pages?.[0]?.[idx]?.result?.[3]
          ? Number(userStakes?.pages?.[0]?.[idx]?.result?.[3]) / 1e18
          : 0,

        userClaimedAmount: userStakes?.pages?.[0]?.[idx]?.result?.[4]
          ? Number(userStakes?.pages?.[0]?.[idx]?.result?.[4]) / 1e18
          : 0,
        userWithdrawalApprovedStatus:
          userStakes?.pages?.[0]?.[idx]?.result?.[5],
        userClaimStatus: userStakes?.pages?.[0]?.[idx]?.result?.[6],

        lockAfterPoolCompleted: Number(
          lockAfterPoolCompleted?.pages?.[0]?.[idx]?.result
        ),

        poolReachedMaxTimestamp: Number(
          poolReachedMaxTimestamp?.pages?.[0]?.[idx]?.result
        ),
        bufferStake: bufferStakeData?.pages?.[0]?.[idx]?.result?.[1]
          ? Number(bufferStakeData?.pages?.[0]?.[idx]?.result?.[1]) / 1e18
          : 0,
        totalRewardDistributed: totalRewardDistributedData?.pages?.[0]?.[idx]
          ?.result
          ? Number(totalRewardDistributedData?.pages?.[0]?.[idx]?.result) / 1e18
          : 0,
        withdrawalAddresses: withdrawalAddressesData?.pages?.[0]?.[idx]?.result
          ? withdrawalAddressesData?.pages?.[0]?.[idx]?.result
          : 0,
        totalBufferDeposited: totalBufferDepositedData?.pages?.[0]?.[idx]
          ?.result
          ? Number(totalBufferDepositedData?.pages?.[0]?.[idx]?.result) / 1e18
          : 0,
      };
    });
  }, [
    totalBufferDepositedData,
    poolStakeAmount,
    totalDeposited,
    fixedAmount,
    commissionRate,
    poolName,
    vacancyAmount,
    userStakes,
    lockAfterPoolCompleted,
    poolReachedMaxTimestamp,
    bufferStakeData,
    totalRewardDistributedData,
    withdrawalAddressesData,
    getDepositedAddressesData,
  ]);

  return { stakeDataList, refetchData };
};

export default useStakeData;

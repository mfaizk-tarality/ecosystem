import { api, ecoSystem } from "@/services/apiServices";
import { useQuery } from "@tanstack/react-query";

export const getStackPlans = ({ address: address }) => {
  return useQuery({
    queryKey: ["getStackPlans"],
    queryFn: async () => {
      const response = await api({
        method: "GET",
        url: "/admin/getStackPlans",
      });

      return response?.data?.result;
    },
  });
};

export const participateInStack = async ({
  transactionHash,
  walletAddress,
  contractAdress,
}) => {
  try {
    const response = await api({
      url: `${ecoSystem}/stack/participateInStack`,
      method: "POST",
      data: {
        transactionHash,
        walletAddress,
        contractAdress,
      },
    });
    return response;
  } catch (error) {
    return error;
  }
};

export const getParticipationList = (address) => {
  return useQuery({
    queryKey: ["getParticipationList", address],
    queryFn: async () => {
      return api({
        url: `${ecoSystem}/stack/getParticipationList`,
        method: "GET",
        params: {
          walletAddress: address,
        },
      });
    },
    select: (data) => {
      if (data?.data?.responseCode == 200) {
        return data?.data?.result;
      }
      return [];
    },
  });
};

export const participationListValidate = (address) => {
  return useQuery({
    queryKey: ["participationList", address],
    queryFn: async () => {
      console.log(address, "address>>");

      try {
        return api({
          url: `${ecoSystem}/validator/participationList`,
          method: "GET",
          params: {
            walletAddress: address,
          },
        });
      } catch (error) {
        console.log(error, "participate");

        return {};
      }
    },
    select: (data) => {
      return data ? data : {};
    },
    enabled: !!address,
  });
};

export const validatorBlocks = (address) => {
  return useQuery({
    queryKey: ["validatorBlocks", address],
    queryFn: async () => {
      return api({
        url: `${ecoSystem}/validator/validatorBlocks`,
        method: "GET",
        params: {
          walletAddress: address,
        },
      });
    },
    enabled: !!address,
  });
};

export const becomeValidator = async (transactionHash, walletAddress) => {
  try {
    const response = await api({
      url: `${ecoSystem}/validator/becomeValidator`,
      method: "POST",
      data: {
        transactionHash,
        walletAddress,
      },
    });
    return response;
  } catch (error) {
    return error;
  }
};

export const getValidatorPlan = () => {
  return useQuery({
    queryKey: ["getValidatorPlan"],
    queryFn: async () => {
      return await api({
        url: `${ecoSystem}/admin/getValidatorPlan`,
        method: "GET",
      });
    },
  });
};

export const developerUserTaskList = (address) => {
  return useQuery({
    queryKey: ["userTaskList", address],
    queryFn: async () => {
      return api({
        url: `${ecoSystem}/developer/userTaskList`,
        method: "GET",
        params: {
          walletAddress: address,
        },
      });
    },
    enabled: !!address,
  });
};

export const getDeveloperTaskList = () => {
  return useQuery({
    queryKey: ["getDeveloperTaskList"],
    queryFn: async () => {
      return await api({
        url: `${ecoSystem}/admin/getDeveloperTaskList`,
      });
    },
  });
};

export const becomeDeveloper = async (
  taskId,
  walletAddress,
  githubRepoLink,
  contractAddress
) => {
  try {
    const response = await api({
      url: `${ecoSystem}/developer/becomeDeveloper`,
      method: "POST",
      data: {
        taskId,
        walletAddress,
        githubRepoLink,
        contractAddress: contractAddress,
      },
    });
    return response;
  } catch (error) {
    console.log(error);
    return error;
  }
};

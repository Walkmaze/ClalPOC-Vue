import { defineStore } from "pinia";

import type { FundType, UseCase } from "@/domain/ClalPOC/domain/models/common";
import type { Contract } from "@/domain/ClalPOC/domain/models/Contract";
import type { Member } from "@/domain/ClalPOC/domain/models/Member";
import type { Regulation } from "@/domain/ClalPOC/domain/models/Regulation";
import { generateContract, generateMemberData, generateRegulations } from "@/domain/ClalPOC/domain/services/dataGenerators";

import { useRegulationsStore } from "./regulations.store";

interface ScenarioState {
  fundType: FundType;
  useCase: UseCase;
  memberData: Member | null;
  contract: Contract | null;
  regulations: Regulation[];
}

export const useScenarioStore = defineStore("scenario", {
  state: (): ScenarioState => ({
    fundType: "investment",
    useCase: "withdrawal",
    memberData: null,
    contract: null,
    regulations: [],
  }),

  getters: {
    isReady(state): boolean {
      return state.memberData !== null && state.contract !== null;
    },
  },

  actions: {
    setFundType(fundType: FundType) {
      this.fundType = fundType;
    },

    setUseCase(useCase: UseCase) {
      this.useCase = useCase;
    },

    setMemberData(memberData: Member | null) {
      this.memberData = memberData;
    },

    setContract(contract: Contract | null) {
      this.contract = contract;
    },

    setRegulations(regulations: Regulation[]) {
      this.regulations = regulations;
    },

    /**
     * Generate a fresh random scenario. Regulations come from the KB if it
     * has any entries; otherwise fall back to the random generator.
     */
    generate() {
      const regulationsStore = useRegulationsStore();
      const data = generateMemberData(this.fundType, this.useCase);
      const ctr = generateContract(this.fundType, this.useCase, data);
      const kbEntries = regulationsStore.kbEntries;
      const regs = kbEntries.length > 0 ? kbEntries : generateRegulations(this.useCase);

      this.memberData = data;
      this.contract = ctr;
      this.regulations = regs;
    },

    reset() {
      this.memberData = null;
      this.contract = null;
      this.regulations = [];
    },
  },
});

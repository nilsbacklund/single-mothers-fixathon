export interface ApplicationStep {
  id: string;
  labelKey: string;
}

export interface ProgramApplicationData {
  programId: string;
  titleKey: string;
  descriptionKey: string;
  steps: ApplicationStep[];
}

export const applicationStepsData: Record<string, ProgramApplicationData> = {
  "1": {
    programId: "1",
    titleKey: "programs.childcare.title",
    descriptionKey: "programs.childcare.description",
    steps: [
      { id: "income", labelKey: "application.steps.income" },
      { id: "id", labelKey: "application.steps.idDocument" },
      { id: "childcare", labelKey: "application.steps.childcareContract" },
      { id: "digid", labelKey: "application.steps.digid" },
    ],
  },
  "2": {
    programId: "2",
    titleKey: "programs.childBudget.title",
    descriptionKey: "programs.childBudget.description",
    steps: [
      { id: "family", labelKey: "application.steps.familyComposition" },
      { id: "income", labelKey: "application.steps.incomeDetails" },
      { id: "bank", labelKey: "application.steps.bankAccount" },
    ],
  },
  "3": {
    programId: "3",
    titleKey: "programs.healthcare.title",
    descriptionKey: "programs.healthcare.description",
    steps: [
      { id: "insurance", labelKey: "application.steps.insuranceInfo" },
      { id: "income", labelKey: "application.steps.incomeDetails" },
      { id: "bank", labelKey: "application.steps.bankAccount" },
    ],
  },
  "4": {
    programId: "4",
    titleKey: "programs.housing.title",
    descriptionKey: "programs.housing.description",
    steps: [
      { id: "rental", labelKey: "application.steps.rentalContract" },
      { id: "income", labelKey: "application.steps.incomeDetails" },
      { id: "household", labelKey: "application.steps.householdInfo" },
      { id: "bank", labelKey: "application.steps.bankAccount" },
    ],
  },
  "5": {
    programId: "5",
    titleKey: "programs.municipal.title",
    descriptionKey: "programs.municipal.description",
    steps: [
      { id: "situation", labelKey: "application.steps.currentSituation" },
      { id: "expenses", labelKey: "application.steps.expenses" },
      { id: "documents", labelKey: "application.steps.supportingDocs" },
    ],
  },
};

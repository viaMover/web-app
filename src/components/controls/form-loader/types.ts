export type Step = 'Confirm' | 'Process' | 'Success' | 'Reverted';

export type StepData = {
  id: Step;
  title: string;
  subtitle: string;
};

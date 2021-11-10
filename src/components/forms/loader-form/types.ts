export type LoaderStep = 'Confirm' | 'Process' | 'Success' | 'Reverted';

export type StepData = {
  id: LoaderStep;
  title: string;
  subtitle: string;
};

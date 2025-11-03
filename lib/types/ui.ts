// UI component state types

export interface ModalState {
  showAddExercise: boolean;
  showPastExercises: boolean;
  showConfirmation: boolean;
  editingExercise: string | null;
}

export interface FormState {
  newExerciseName: string;
}

export interface LoadingState {
  isSaving: boolean;
  loadingPastExercises: boolean;
}

export interface ErrorState {
  saveError: string | null;
  saveSuccess: boolean;
}

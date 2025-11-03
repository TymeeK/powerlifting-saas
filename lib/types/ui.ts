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

export interface SettingsModalProps {
  modalType: 'email' | 'password' | 'name' | null;
  error: string;
  successMessage: string;
  // Email form props
  newEmail: string;
  password: string;
  onNewEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  // Password form props
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  onCurrentPasswordChange: (value: string) => void;
  onNewPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  // Name form props
  firstName: string;
  lastName: string;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  // Handlers
  onClose: () => void;
  onSubmit: () => void;
}

// Reusable button variant classes for consistent styling
export const buttonVariants = {
  // Primary gradient buttons
  primary:
    'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white cursor-pointer',

  // Floating action buttons
  floating: {
    main: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-2xl hover:shadow-purple-500/25 rounded-full h-14 w-14 p-0 transition-all duration-300 hover:scale-110 cursor-pointer',
    save: 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-2xl hover:shadow-green-500/25 rounded-full h-12 w-12 p-0 transition-all duration-300 hover:scale-110 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
    add: 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-2xl hover:shadow-blue-500/25 rounded-full h-12 w-12 p-0 transition-all duration-300 hover:scale-110 cursor-pointer',
    past: 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-2xl hover:shadow-orange-500/25 rounded-full h-12 w-12 p-0 transition-all duration-300 hover:scale-110 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
  },

  // Action buttons
  action: {
    save: 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer',
    add: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white cursor-pointer',
    past: 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white cursor-pointer',
  },

  // Set completion button
  setComplete: (completed: boolean) =>
    completed
      ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg cursor-pointer'
      : 'border-green-300 hover:border-green-500 hover:bg-green-500/10 text-green-400 cursor-pointer',

  // Add set button
  addSet:
    'w-full border-2 border-purple-300 hover:border-purple-500 hover:bg-purple-500/10 text-purple-400 hover:text-purple-300 mt-4 cursor-pointer',

  // Close button
  close:
    'h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-white/10 cursor-pointer',

  // Edit/Delete buttons
  edit: 'h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-white/10 cursor-pointer',
  delete:
    'h-8 w-8 p-0 text-gray-400 hover:text-red-400 hover:bg-red-500/10 cursor-pointer',
} as const;

// Input field variants
export const inputVariants = {
  // Number input for sets
  number:
    'w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-center focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',

  // Text input for exercise forms
  text: 'w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500',
} as const;

// Card variants
export const cardVariants = {
  // Main card styling
  main: 'bg-white/10 backdrop-blur-sm border-white/20',

  // Set card styling
  set: (completed: boolean) =>
    completed
      ? 'bg-green-500/10 border-green-500/30 shadow-lg shadow-green-500/10'
      : 'bg-white/5 border-white/10 hover:bg-white/10',

  // Past exercise card
  pastExercise:
    'bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer',
} as const;

// Badge variants
export const badgeVariants = {
  exerciseCount: 'bg-purple-500/20 text-purple-200 border-purple-500/30',
  setCount: 'bg-green-500/20 text-green-200 border-green-500/30',
} as const;

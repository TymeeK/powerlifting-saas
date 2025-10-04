// Shared CSS classes for testing authentication pages

export const CSS_CLASSES = {
  responsive: {
    heading: ['text-2xl', 'sm:text-3xl', 'md:text-4xl', 'lg:text-5xl'],
    mainPadding: ['px-4', 'sm:px-6', 'lg:px-8', 'py-8'],
    container: ['max-w-sm', 'sm:max-w-md', 'lg:max-w-lg', 'xl:max-w-xl'],
    formSpacing: ['space-y-4', 'sm:space-y-6'],
    formFields: ['space-y-3', 'sm:space-y-4'],
    input: ['px-3', 'sm:px-4', 'py-2.5', 'sm:py-3', 'text-sm', 'sm:text-base'],
    button: ['px-4', 'sm:px-6', 'py-2.5', 'sm:py-3', 'text-sm', 'sm:text-base'],
    rememberMeContainer: [
      'flex-col',
      'sm:flex-row',
      'sm:items-center',
      'sm:justify-between',
      'space-y-3',
      'sm:space-y-0',
    ],
  },
  gradients: {
    main: [
      'bg-gradient-to-br',
      'from-slate-900',
      'via-purple-900',
      'to-slate-900',
    ],
    heading: [
      'bg-gradient-to-r',
      'from-white',
      'to-purple-200',
      'bg-clip-text',
      'text-transparent',
    ],
    button: [
      'bg-gradient-to-r',
      'from-purple-500',
      'to-pink-500',
      'hover:from-purple-600',
      'hover:to-pink-600',
    ],
  },
  error: {
    container: [
      'mt-4',
      'p-3',
      'bg-red-500/10',
      'border',
      'border-red-500/20',
      'rounded-lg',
    ],
    text: ['text-sm', 'text-red-400', 'flex', 'items-center'],
    icon: ['w-4', 'h-4', 'mr-2'],
  },
  success: {
    container: [
      'mt-4',
      'p-3',
      'bg-green-500/10',
      'border',
      'border-green-500/20',
      'rounded-lg',
    ],
    text: ['text-sm', 'text-green-400', 'flex', 'items-center'],
    icon: ['w-4', 'h-4', 'mr-2'],
  },
  separator: ['flex-1', 'bg-purple-400/30'],
  orText: ['px-3', 'sm:px-4', 'text-purple-200', 'text-xs', 'sm:text-sm'],
  hover: {
    button: ['hover:shadow-purple-500/25', 'transition-all', 'duration-200'],
    link: ['hover:text-white', 'transition-colors', 'duration-200'],
  },
  disabled: [
    'disabled:from-gray-400',
    'disabled:to-gray-500',
    'disabled:cursor-not-allowed',
  ],
} as const;

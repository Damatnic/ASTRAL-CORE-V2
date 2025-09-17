/**
 * UI Types for ASTRAL_CORE 2.0 Mental Health Crisis Intervention Platform
 * Comprehensive type definitions for UI components, themes, and interactions
 */

// ============================================================================
// THEME AND DESIGN SYSTEM TYPES
// ============================================================================

export interface ThemeConfig {
  colors: ColorPalette;
  typography: Typography;
  spacing: SpacingScale;
  breakpoints: Breakpoints;
  shadows: ShadowScale;
  borderRadius: BorderRadiusScale;
  transitions: TransitionConfig;
  zIndex: ZIndexScale;
}

export interface ColorPalette {
  primary: ColorScale;
  secondary: ColorScale;
  accent: ColorScale;
  neutral: ColorScale;
  semantic: SemanticColors;
  crisis: CrisisColors;
  accessibility: AccessibilityColors;
}

export interface ColorScale {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
}

export interface SemanticColors {
  success: ColorScale;
  warning: ColorScale;
  error: ColorScale;
  info: ColorScale;
}

export interface CrisisColors {
  low: string;
  moderate: string;
  high: string;
  severe: string;
  imminent: string;
  emergency: string;
}

export interface AccessibilityColors {
  focus: string;
  contrast: string;
  highContrast: string;
  altText: string;
}

export interface Typography {
  fontFamilies: FontFamilies;
  fontSizes: FontSizeScale;
  fontWeights: FontWeightScale;
  lineHeights: LineHeightScale;
  letterSpacing: LetterSpacingScale;
}

export interface FontFamilies {
  heading: string;
  body: string;
  mono: string;
  display: string;
}

export interface FontSizeScale {
  xs: string;
  sm: string;
  base: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  '4xl': string;
  '5xl': string;
  '6xl': string;
  '7xl': string;
  '8xl': string;
  '9xl': string;
}

export interface FontWeightScale {
  thin: number;
  light: number;
  normal: number;
  medium: number;
  semibold: number;
  bold: number;
  extrabold: number;
  black: number;
}

export interface LineHeightScale {
  none: number;
  tight: number;
  snug: number;
  normal: number;
  relaxed: number;
  loose: number;
}

export interface LetterSpacingScale {
  tighter: string;
  tight: string;
  normal: string;
  wide: string;
  wider: string;
  widest: string;
}

export interface SpacingScale {
  0: string;
  px: string;
  0.5: string;
  1: string;
  1.5: string;
  2: string;
  2.5: string;
  3: string;
  3.5: string;
  4: string;
  5: string;
  6: string;
  7: string;
  8: string;
  9: string;
  10: string;
  11: string;
  12: string;
  14: string;
  16: string;
  20: string;
  24: string;
  28: string;
  32: string;
  36: string;
  40: string;
  44: string;
  48: string;
  52: string;
  56: string;
  60: string;
  64: string;
  72: string;
  80: string;
  96: string;
}

export interface Breakpoints {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
}

export interface ShadowScale {
  none: string;
  sm: string;
  base: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  inner: string;
}

export interface BorderRadiusScale {
  none: string;
  sm: string;
  base: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  full: string;
}

export interface TransitionConfig {
  duration: TransitionDuration;
  easing: TransitionEasing;
}

export interface TransitionDuration {
  none: string;
  fast: string;
  normal: string;
  slow: string;
}

export interface TransitionEasing {
  linear: string;
  in: string;
  out: string;
  inOut: string;
  bounce: string;
}

export interface ZIndexScale {
  hide: number;
  auto: string;
  base: number;
  docked: number;
  dropdown: number;
  sticky: number;
  banner: number;
  overlay: number;
  modal: number;
  popover: number;
  skipLink: number;
  toast: number;
  tooltip: number;
  emergency: number;
}

// ============================================================================
// COMPONENT PROP TYPES
// ============================================================================

export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
  testId?: string;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  role?: string;
  id?: string;
}

export interface InteractiveComponentProps extends BaseComponentProps {
  disabled?: boolean;
  loading?: boolean;
  onClick?: (event: React.MouseEvent) => void;
  onFocus?: (event: React.FocusEvent) => void;
  onBlur?: (event: React.FocusEvent) => void;
  onKeyDown?: (event: React.KeyboardEvent) => void;
  tabIndex?: number;
}

export interface FormComponentProps extends InteractiveComponentProps {
  name?: string;
  value?: any;
  defaultValue?: any;
  onChange?: (value: any) => void;
  onValidate?: (value: any) => ValidationResult;
  required?: boolean;
  readOnly?: boolean;
  error?: string;
  helpText?: string;
  placeholder?: string;
}

// ============================================================================
// BUTTON TYPES
// ============================================================================

export interface ButtonProps extends InteractiveComponentProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  color?: ButtonColor;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  iconOnly?: boolean;
  type?: 'button' | 'submit' | 'reset';
  form?: string;
  autoFocus?: boolean;
}

export type ButtonVariant = 
  | 'primary' 
  | 'secondary' 
  | 'outline' 
  | 'ghost' 
  | 'link' 
  | 'emergency'
  | 'crisis';

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export type ButtonColor = 
  | 'primary' 
  | 'secondary' 
  | 'success' 
  | 'warning' 
  | 'error' 
  | 'info'
  | 'crisis'
  | 'emergency';

// ============================================================================
// INPUT TYPES
// ============================================================================

export interface InputProps extends FormComponentProps {
  type?: InputType;
  size?: InputSize;
  variant?: InputVariant;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
  mask?: string;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  autoComplete?: string;
  autoFocus?: boolean;
  spellCheck?: boolean;
}

export type InputType = 
  | 'text' 
  | 'email' 
  | 'password' 
  | 'tel' 
  | 'url' 
  | 'search'
  | 'number'
  | 'date'
  | 'time'
  | 'datetime-local';

export type InputSize = 'sm' | 'md' | 'lg';

export type InputVariant = 'outline' | 'filled' | 'flushed' | 'unstyled';

export interface TextareaProps extends FormComponentProps {
  rows?: number;
  cols?: number;
  resize?: 'none' | 'both' | 'horizontal' | 'vertical';
  minHeight?: string;
  maxHeight?: string;
  autoGrow?: boolean;
}

export interface SelectProps extends FormComponentProps {
  options: SelectOption[];
  multiple?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  loading?: boolean;
  noOptionsText?: string;
  loadingText?: string;
  size?: InputSize;
}

export interface SelectOption {
  label: string;
  value: any;
  disabled?: boolean;
  group?: string;
  description?: string;
}

// ============================================================================
// MODAL AND OVERLAY TYPES
// ============================================================================

export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  size?: ModalSize;
  variant?: ModalVariant;
  closeOnOverlayClick?: boolean;
  closeOnEsc?: boolean;
  preventBodyScroll?: boolean;
  preserveScrollBarGap?: boolean;
  returnFocusOnClose?: boolean;
  initialFocusRef?: React.RefObject<HTMLElement>;
  finalFocusRef?: React.RefObject<HTMLElement>;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  isCentered?: boolean;
  scrollBehavior?: 'inside' | 'outside';
}

export type ModalSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | 'full';

export type ModalVariant = 'standard' | 'crisis' | 'emergency' | 'success' | 'warning' | 'error';

export interface DrawerProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  placement?: DrawerPlacement;
  size?: DrawerSize;
  closeOnOverlayClick?: boolean;
  closeOnEsc?: boolean;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export type DrawerPlacement = 'top' | 'right' | 'bottom' | 'left';

export type DrawerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface PopoverProps extends BaseComponentProps {
  isOpen?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  trigger?: PopoverTrigger;
  placement?: PopoverPlacement;
  offset?: [number, number];
  gutter?: number;
  preventOverflow?: boolean;
  boundary?: 'clippingParents' | 'viewport' | HTMLElement;
  strategy?: 'absolute' | 'fixed';
  modifiers?: any[];
  matchWidth?: boolean;
  returnFocusOnClose?: boolean;
  closeOnBlur?: boolean;
  closeOnEsc?: boolean;
  arrowSize?: number;
  arrowShadowColor?: string;
  header?: React.ReactNode;
  body?: React.ReactNode;
  footer?: React.ReactNode;
}

export type PopoverTrigger = 'click' | 'hover' | 'focus' | 'manual';

export type PopoverPlacement = 
  | 'auto'
  | 'auto-start'
  | 'auto-end'
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'right'
  | 'right-start'
  | 'right-end'
  | 'left'
  | 'left-start'
  | 'left-end';

// ============================================================================
// NAVIGATION TYPES
// ============================================================================

export interface NavigationItem {
  id: string;
  label: string;
  href?: string;
  icon?: React.ReactNode;
  badge?: string | number;
  children?: NavigationItem[];
  isActive?: boolean;
  isDisabled?: boolean;
  onClick?: () => void;
  requiredRole?: string[];
  crisisLevel?: number;
}

export interface TabsProps extends BaseComponentProps {
  defaultIndex?: number;
  index?: number;
  onChange?: (index: number) => void;
  orientation?: 'horizontal' | 'vertical';
  variant?: TabsVariant;
  size?: TabsSize;
  colorScheme?: string;
  isLazy?: boolean;
  lazyBehavior?: 'keepMounted' | 'unmount';
}

export type TabsVariant = 'line' | 'enclosed' | 'enclosed-colored' | 'soft-rounded' | 'solid-rounded' | 'unstyled';

export type TabsSize = 'sm' | 'md' | 'lg';

export interface BreadcrumbProps extends BaseComponentProps {
  separator?: React.ReactNode;
  spacing?: string;
  items: BreadcrumbItem[];
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  isCurrentPage?: boolean;
  onClick?: () => void;
}

// ============================================================================
// FEEDBACK TYPES
// ============================================================================

export interface AlertProps extends BaseComponentProps {
  status?: AlertStatus;
  variant?: AlertVariant;
  addRole?: boolean;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  isClosable?: boolean;
  onClose?: () => void;
}

export type AlertStatus = 'info' | 'warning' | 'success' | 'error' | 'crisis' | 'emergency';

export type AlertVariant = 'subtle' | 'left-accent' | 'top-accent' | 'solid';

export interface ToastProps {
  id?: string;
  title?: string;
  description?: string;
  status?: ToastStatus;
  variant?: ToastVariant;
  duration?: number;
  isClosable?: boolean;
  onClose?: () => void;
  position?: ToastPosition;
  render?: (props: any) => React.ReactNode;
  containerStyle?: React.CSSProperties;
}

export type ToastStatus = 'info' | 'warning' | 'success' | 'error' | 'crisis' | 'emergency';

export type ToastVariant = 'solid' | 'subtle' | 'left-accent' | 'top-accent';

export type ToastPosition = 
  | 'top'
  | 'top-left'
  | 'top-right'
  | 'bottom'
  | 'bottom-left'
  | 'bottom-right';

export interface ProgressProps extends BaseComponentProps {
  value?: number;
  min?: number;
  max?: number;
  size?: ProgressSize;
  colorScheme?: string;
  hasStripe?: boolean;
  isAnimated?: boolean;
  isIndeterminate?: boolean;
  label?: string;
  valueText?: string;
}

export type ProgressSize = 'xs' | 'sm' | 'md' | 'lg';

export interface SkeletonProps extends BaseComponentProps {
  height?: string;
  width?: string;
  startColor?: string;
  endColor?: string;
  isLoaded?: boolean;
  fadeDuration?: number;
  speed?: number;
}

// ============================================================================
// DATA DISPLAY TYPES
// ============================================================================

export interface TableProps extends BaseComponentProps {
  variant?: TableVariant;
  size?: TableSize;
  colorScheme?: string;
  data: any[];
  columns: TableColumn[];
  sortable?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (column: string, order: 'asc' | 'desc') => void;
  selectable?: boolean;
  selectedRows?: string[];
  onSelectRows?: (rows: string[]) => void;
  pagination?: TablePagination;
  loading?: boolean;
  emptyState?: React.ReactNode;
  stickyHeader?: boolean;
}

export type TableVariant = 'simple' | 'striped' | 'unstyled';

export type TableSize = 'sm' | 'md' | 'lg';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: any) => React.ReactNode;
  headerRender?: () => React.ReactNode;
}

export interface TablePagination {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
  showTotal?: boolean;
}

export interface CardProps extends BaseComponentProps {
  variant?: CardVariant;
  size?: CardSize;
  colorScheme?: string;
  header?: React.ReactNode;
  body?: React.ReactNode;
  footer?: React.ReactNode;
  isHoverable?: boolean;
  isClickable?: boolean;
  onClick?: () => void;
}

export type CardVariant = 'outline' | 'filled' | 'elevated' | 'unstyled';

export type CardSize = 'sm' | 'md' | 'lg';

export interface StatProps extends BaseComponentProps {
  label: string;
  value: string | number;
  helpText?: string;
  type?: StatType;
  icon?: React.ReactNode;
  trend?: StatTrend;
  trendValue?: string;
  colorScheme?: string;
}

export type StatType = 'number' | 'percent' | 'currency' | 'duration';

export interface StatTrend {
  direction: 'up' | 'down' | 'neutral';
  value?: string;
  isGood?: boolean;
}

// ============================================================================
// CRISIS-SPECIFIC TYPES
// ============================================================================

export interface CrisisChatProps extends BaseComponentProps {
  sessionId: string;
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isTyping?: boolean;
  typingUser?: string;
  emergencyActions?: EmergencyAction[];
  crisisLevel: number;
  canEscalate?: boolean;
  onEscalate?: () => void;
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: ChatSender;
  timestamp: Date;
  type: MessageType;
  metadata?: MessageMetadata;
}

export interface ChatSender {
  id: string;
  name: string;
  role: 'person_in_crisis' | 'volunteer' | 'supervisor' | 'system';
  avatar?: string;
}

export type MessageType = 'text' | 'system' | 'emergency' | 'escalation' | 'resource';

export interface MessageMetadata {
  isEncrypted?: boolean;
  containsRisk?: boolean;
  riskLevel?: number;
  resources?: Resource[];
  interventions?: string[];
}

export interface EmergencyAction {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  onClick: () => void;
  requiresConfirmation?: boolean;
  confirmationText?: string;
}

export interface CrisisHelpButtonProps extends BaseComponentProps {
  variant?: 'floating' | 'inline' | 'sidebar';
  size?: 'sm' | 'md' | 'lg';
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  alwaysVisible?: boolean;
  pulseAnimation?: boolean;
  emergencyMode?: boolean;
  onActivate: () => void;
}

export interface CrisisAssessmentProps extends BaseComponentProps {
  questions: AssessmentQuestion[];
  onComplete: (responses: AssessmentResponse[]) => void;
  onSkip?: () => void;
  allowSkip?: boolean;
  showProgress?: boolean;
  crisisMode?: boolean;
}

export interface AssessmentQuestion {
  id: string;
  text: string;
  type: QuestionType;
  required: boolean;
  options?: QuestionOption[];
  riskWeight?: number;
  followUpQuestions?: string[];
}

export type QuestionType = 'text' | 'radio' | 'checkbox' | 'scale' | 'boolean';

export interface QuestionOption {
  value: string;
  label: string;
  riskLevel?: number;
}

export interface AssessmentResponse {
  questionId: string;
  value: any;
  timestamp: Date;
}

// ============================================================================
// LAYOUT TYPES
// ============================================================================

export interface LayoutProps extends BaseComponentProps {
  variant?: LayoutVariant;
  sidebar?: React.ReactNode;
  sidebarWidth?: string;
  sidebarCollapsible?: boolean;
  sidebarCollapsed?: boolean;
  onSidebarToggle?: () => void;
  header?: React.ReactNode;
  headerHeight?: string;
  headerSticky?: boolean;
  footer?: React.ReactNode;
  footerHeight?: string;
  footerSticky?: boolean;
  main?: React.ReactNode;
  crisisMode?: boolean;
  emergencyBanner?: React.ReactNode;
}

export type LayoutVariant = 'default' | 'dashboard' | 'crisis' | 'mobile';

export interface GridProps extends BaseComponentProps {
  columns?: number | GridColumns;
  gap?: string;
  rowGap?: string;
  columnGap?: string;
  autoFlow?: 'row' | 'column' | 'dense' | 'row dense' | 'column dense';
  autoRows?: string;
  autoColumns?: string;
  templateRows?: string;
  templateColumns?: string;
  templateAreas?: string;
  alignItems?: 'start' | 'end' | 'center' | 'stretch';
  justifyItems?: 'start' | 'end' | 'center' | 'stretch';
  alignContent?: 'start' | 'end' | 'center' | 'stretch' | 'space-around' | 'space-between' | 'space-evenly';
  justifyContent?: 'start' | 'end' | 'center' | 'stretch' | 'space-around' | 'space-between' | 'space-evenly';
}

export interface GridColumns {
  base?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
  '2xl'?: number;
}

export interface FlexProps extends BaseComponentProps {
  direction?: FlexDirection | ResponsiveValue<FlexDirection>;
  wrap?: FlexWrap | ResponsiveValue<FlexWrap>;
  align?: FlexAlign | ResponsiveValue<FlexAlign>;
  justify?: FlexJustify | ResponsiveValue<FlexJustify>;
  gap?: string | ResponsiveValue<string>;
}

export type FlexDirection = 'row' | 'column' | 'row-reverse' | 'column-reverse';

export type FlexWrap = 'nowrap' | 'wrap' | 'wrap-reverse';

export type FlexAlign = 'stretch' | 'flex-start' | 'flex-end' | 'center' | 'baseline';

export type FlexJustify = 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';

export interface ResponsiveValue<T> {
  base?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  '2xl'?: T;
}

// ============================================================================
// ACCESSIBILITY TYPES
// ============================================================================

export interface AccessibilityProps {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-haspopup'?: boolean | 'false' | 'true' | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog';
  'aria-hidden'?: boolean;
  'aria-live'?: 'off' | 'assertive' | 'polite';
  'aria-atomic'?: boolean;
  'aria-relevant'?: 'additions' | 'removals' | 'text' | 'all';
  'aria-busy'?: boolean;
  'aria-controls'?: string;
  'aria-current'?: boolean | 'false' | 'true' | 'page' | 'step' | 'location' | 'date' | 'time';
  'aria-disabled'?: boolean;
  'aria-invalid'?: boolean | 'false' | 'true' | 'grammar' | 'spelling';
  'aria-pressed'?: boolean | 'false' | 'true' | 'mixed';
  'aria-selected'?: boolean;
  'aria-checked'?: boolean | 'false' | 'true' | 'mixed';
  'aria-required'?: boolean;
  'aria-readonly'?: boolean;
  'aria-multiline'?: boolean;
  'aria-autocomplete'?: 'none' | 'inline' | 'list' | 'both';
  'aria-orientation'?: 'horizontal' | 'vertical';
  'aria-valuemin'?: number;
  'aria-valuemax'?: number;
  'aria-valuenow'?: number;
  'aria-valuetext'?: string;
  'aria-level'?: number;
  'aria-setsize'?: number;
  'aria-posinset'?: number;
  'aria-owns'?: string;
  'aria-activedescendant'?: string;
  'aria-flowto'?: string;
  'aria-dropeffect'?: 'none' | 'copy' | 'execute' | 'link' | 'move' | 'popup';
  'aria-grabbed'?: boolean;
  role?: string;
  tabIndex?: number;
}

export interface ScreenReaderProps {
  srOnly?: boolean;
  srOnlyFocusable?: boolean;
  announce?: string;
  announceDelay?: number;
  priority?: 'polite' | 'assertive';
}

// ============================================================================
// VALIDATION TYPES
// ============================================================================

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings?: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  severity: 'error' | 'warning';
}

export interface ValidationWarning {
  field: string;
  message: string;
  code: string;
}

export interface FormValidationRules {
  required?: boolean | string;
  minLength?: number | { value: number; message: string };
  maxLength?: number | { value: number; message: string };
  min?: number | { value: number; message: string };
  max?: number | { value: number; message: string };
  pattern?: RegExp | { value: RegExp; message: string };
  validate?: (value: any) => boolean | string | Promise<boolean | string>;
  custom?: ValidationRule[];
}

export interface ValidationRule {
  test: (value: any) => boolean;
  message: string;
  code: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface Resource {
  id: string;
  title: string;
  description: string;
  url?: string;
  type: ResourceType;
  category: string;
  isEmergency?: boolean;
  phoneNumber?: string;
  availability?: string;
}

export type ResourceType = 'article' | 'video' | 'audio' | 'hotline' | 'website' | 'app' | 'book';

export interface ComponentSize {
  width?: string | number;
  height?: string | number;
  minWidth?: string | number;
  maxWidth?: string | number;
  minHeight?: string | number;
  maxHeight?: string | number;
}

export interface ComponentPosition {
  top?: string | number;
  right?: string | number;
  bottom?: string | number;
  left?: string | number;
  position?: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';
  zIndex?: number;
}

export interface AnimationProps {
  animate?: boolean;
  animationType?: AnimationType;
  duration?: number;
  delay?: number;
  easing?: string;
  loop?: boolean | number;
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both';
}

export type AnimationType = 
  | 'fade'
  | 'slide'
  | 'scale'
  | 'rotate'
  | 'bounce'
  | 'pulse'
  | 'shake'
  | 'flip'
  | 'zoom'
  | 'elastic';

// ============================================================================
// EVENT HANDLER TYPES
// ============================================================================

export interface EventHandlers {
  onClick?: (event: React.MouseEvent) => void;
  onDoubleClick?: (event: React.MouseEvent) => void;
  onMouseDown?: (event: React.MouseEvent) => void;
  onMouseUp?: (event: React.MouseEvent) => void;
  onMouseEnter?: (event: React.MouseEvent) => void;
  onMouseLeave?: (event: React.MouseEvent) => void;
  onMouseMove?: (event: React.MouseEvent) => void;
  onKeyDown?: (event: React.KeyboardEvent) => void;
  onKeyUp?: (event: React.KeyboardEvent) => void;
  onKeyPress?: (event: React.KeyboardEvent) => void;
  onFocus?: (event: React.FocusEvent) => void;
  onBlur?: (event: React.FocusEvent) => void;
  onChange?: (event: React.ChangeEvent) => void;
  onInput?: (event: React.FormEvent) => void;
  onSubmit?: (event: React.FormEvent) => void;
  onReset?: (event: React.FormEvent) => void;
  onScroll?: (event: React.UIEvent) => void;
  onWheel?: (event: React.WheelEvent) => void;
  onTouchStart?: (event: React.TouchEvent) => void;
  onTouchMove?: (event: React.TouchEvent) => void;
  onTouchEnd?: (event: React.TouchEvent) => void;
  onDragStart?: (event: React.DragEvent) => void;
  onDrag?: (event: React.DragEvent) => void;
  onDragEnd?: (event: React.DragEvent) => void;
  onDragEnter?: (event: React.DragEvent) => void;
  onDragLeave?: (event: React.DragEvent) => void;
  onDragOver?: (event: React.DragEvent) => void;
  onDrop?: (event: React.DragEvent) => void;
}

// ============================================================================
// MOBILE-SPECIFIC TYPES
// ============================================================================

export interface MobileProps {
  swipeEnabled?: boolean;
  swipeThreshold?: number;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  touchGestures?: boolean;
  hapticFeedback?: boolean;
  orientationLock?: 'portrait' | 'landscape' | 'auto';
}

export interface ResponsiveDesign {
  hideOn?: BreakpointHide[];
  showOn?: BreakpointShow[];
  responsiveProps?: ResponsiveProps;
}

export type BreakpointHide = 'base' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type BreakpointShow = 'base' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface ResponsiveProps {
  [key: string]: ResponsiveValue<any>;
}

// ============================================================================
// CRISIS INTERVENTION SPECIFIC UI TYPES
// ============================================================================

export interface CrisisLevelIndicatorProps extends BaseComponentProps {
  level: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  animated?: boolean;
  variant?: 'badge' | 'bar' | 'circle' | 'icon';
}

export interface EmergencyModeProps {
  isActive: boolean;
  onToggle: (active: boolean) => void;
  autoTriggerLevel?: number;
  warningMessage?: string;
  emergencyActions?: EmergencyAction[];
}

export interface VolunteerStatusProps extends BaseComponentProps {
  status: 'available' | 'busy' | 'away' | 'offline';
  workload?: number;
  nextAvailable?: Date;
  specializations?: string[];
  showDetails?: boolean;
}

export interface TetherConnectionProps extends BaseComponentProps {
  isConnected: boolean;
  connectionStrength: number;
  lastHeartbeat?: Date;
  onReconnect: () => void;
  emergencyMode?: boolean;
}

// ============================================================================
// EXPORT ALL TYPES
// ============================================================================

import * as React from 'react';

// Re-export commonly used types for convenience
export type ComponentProps<T = any> = BaseComponentProps & T;
export type UIComponent<T = {}> = React.FC<ComponentProps<T>>;
export type UIEvent = React.SyntheticEvent;
export type UIEventHandler<T = Element> = React.EventHandler<React.SyntheticEvent<T>>;
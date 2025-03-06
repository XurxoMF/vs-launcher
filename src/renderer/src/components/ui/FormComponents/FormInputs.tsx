import { Input, Switch } from "@headlessui/react"
import clsx from "clsx"

const INPUT_BASE_STYLES = `h-8 px-2 py-1 rounded-md placeholder:text-zinc-200/15 overflow-hidden outline-hidden backdrop-blur-xs bg-zinc-950/50 border border-zinc-400/5`
const INPUT_INVALID_STYLES = "invalid:border invalid:border-red-800 invalid:bg-red-800/20"
const INPUT_VALID_STYLES = ""
const INPUT_ENABLED_STYLES = "enabled:shadow-sm enabled:shadow-zinc-950/50 enabled:hover:shadow-none"
const INPUT_DISABLED_STYLES = "disabled:text-zinc-500"

/**
 * Input with type text and validation for minimum and maximum length.
 *
 * @param {object} props - The component props.
 * @param {string} [props.className] - Additional class names for styling.
 * @param {string} props.value - The current value of the input field.
 * @param {(e: React.ChangeEvent<HTMLInputElement>) => void} props.onChange - The function to be called on input value change.
 * @param {number} [props.minLength] - The minimum length of the input value.
 * @param {number} [props.maxLength] - The maximum length of the input value.
 * @param {string} [props.placeholder] - Placeholder text to display when the input is empty.
 * @param {boolean} [props.disabled] - If the input is disabled.
 * @returns {JSX.Element} A JSX element representing the input field with specified styles and validation.
 */
export function FormInputText({
  className,
  value,
  onChange,
  minLength,
  maxLength,
  placeholder,
  disabled
}: {
  className?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  minLength?: number
  maxLength?: number
  placeholder?: string
  disabled?: boolean
}): JSX.Element {
  return (
    <Input
      type="text"
      className={clsx(INPUT_BASE_STYLES, INPUT_INVALID_STYLES, INPUT_VALID_STYLES, INPUT_DISABLED_STYLES, INPUT_ENABLED_STYLES, className)}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      minLength={minLength}
      maxLength={maxLength}
      disabled={disabled}
    />
  )
}

/**
 * Input with type text and validation for minimum and maximum length but disabled.
 *
 * @param {object} props - The component props.
 * @param {string} [props.className] - Additional class names for styling.
 * @param {string} props.value - The text to be displayed within the non-editable input field.
 * @param {boolean} [props.disabled] - If the input is disabled.
 * @returns {JSX.Element} A JSX element representing the non-editable input field with specified styles.
 */
export function FormInputTextNotEditable({
  className,
  value,
  minLength,
  maxLength,
  placeholder,
  disabled
}: {
  className?: string
  value: string
  minLength?: number
  maxLength?: number
  placeholder?: string
  disabled?: boolean
}): JSX.Element {
  return (
    <Input
      type="text"
      className={clsx(INPUT_BASE_STYLES, INPUT_INVALID_STYLES, INPUT_VALID_STYLES, INPUT_DISABLED_STYLES, INPUT_ENABLED_STYLES, className)}
      value={value}
      placeholder={placeholder}
      minLength={minLength}
      maxLength={maxLength}
      disabled={disabled}
      readOnly
    />
  )
}

/**
 * Input with type number and validation for minimum and maximum value.
 *
 * @param {object} props - The component props.
 * @param {string} [props.className] - Additional class names for styling.
 * @param {number} props.value - The current value of the input field.
 * @param {(e: React.ChangeEvent<HTMLInputElement>) => void} props.onChange - The function to be called on input value change.
 * @param {number} [props.min] - The minimum valie of the input value.
 * @param {number} [props.max] - The maximum value of the input value.
 * @param {string} [props.placeholder] - Placeholder text to display when the input is empty.
 * @param {boolean} [props.disabled] - If the input is disabled.
 * @returns {JSX.Element} A JSX element representing the input field with specified styles and validation.
 */
export function FormInputNumber({
  className,
  value,
  onChange,
  min,
  max,
  placeholder,
  disabled
}: {
  className?: string
  value: number
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  min?: number
  max?: number
  placeholder?: string
  disabled?: boolean
}): JSX.Element {
  return (
    <Input
      type="number"
      className={clsx(INPUT_BASE_STYLES, INPUT_INVALID_STYLES, INPUT_VALID_STYLES, INPUT_DISABLED_STYLES, INPUT_ENABLED_STYLES, className)}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      min={min}
      max={max}
      disabled={disabled}
    />
  )
}

/**
 * Input with type number and validation for minimum and maximum value but disabled.
 *
 * @param {object} props - The component props.
 * @param {string} [props.className] - Additional class names for styling.
 * @param {number} props.value - The current value of the input field.
 * @param {number} [props.min] - The minimum valie of the input value.
 * @param {number} [props.max] - The maximum value of the input value.
 * @param {string} [props.placeholder] - Placeholder text to display when the input is empty.
 * @param {boolean} [props.disabled] - If the input is disabled.
 * @returns {JSX.Element} A JSX element representing the input field with specified styles and validation.
 */
export function FormInputNumberNotEditable({
  className,
  value,
  min,
  max,
  placeholder,
  disabled
}: {
  className?: string
  value: number
  min?: number
  max?: number
  placeholder?: string
  disabled?: boolean
}): JSX.Element {
  return (
    <Input
      type="number"
      className={clsx(INPUT_BASE_STYLES, INPUT_INVALID_STYLES, INPUT_VALID_STYLES, INPUT_DISABLED_STYLES, INPUT_ENABLED_STYLES, className)}
      value={value}
      placeholder={placeholder}
      min={min}
      max={max}
      disabled={disabled}
      readOnly
    />
  )
}

/**
 * Input with type password and validation for minimum and maximum length.
 *
 * @param {object} props - The component props.
 * @param {string} [props.className] - Additional class names for styling.
 * @param {string} props.value - The current value of the input field.
 * @param {(e: React.ChangeEvent<HTMLInputElement>) => void} props.onChange - The function to be called on input value change.
 * @param {number} [props.minLength] - The minimum length of the input value.
 * @param {number} [props.maxLength] - The maximum length of the input value.
 * @param {string} [props.placeholder] - Placeholder text to display when the input is empty.
 * @param {boolean} [props.disabled] - If the input is disabled.
 * @returns {JSX.Element} A JSX element representing the input field with specified styles and validation.
 */
export function FormInputPassword({
  className,
  value,
  onChange,
  minLength,
  maxLength,
  placeholder,
  disabled
}: {
  className?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  minLength?: number
  maxLength?: number
  placeholder?: string
  disabled?: boolean
}): JSX.Element {
  return (
    <Input
      type="password"
      className={clsx(INPUT_BASE_STYLES, INPUT_INVALID_STYLES, INPUT_VALID_STYLES, INPUT_DISABLED_STYLES, INPUT_ENABLED_STYLES, className)}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      minLength={minLength}
      maxLength={maxLength}
      disabled={disabled}
    />
  )
}

/**
 * Input with type password and validation for minimum and maximum length but disabled.
 *
 * @param {object} props - The component props.
 * @param {string} [props.className] - Additional class names for styling.
 * @param {string} props.value - The text to be displayed within the non-editable input field.
 * @param {boolean} [props.disabled] - If the input is disabled.
 * @returns {JSX.Element} A JSX element representing the non-editable input field with specified styles.
 */
export function FormInputPasswordNotEditable({
  className,
  value,
  minLength,
  maxLength,
  placeholder,
  disabled
}: {
  className?: string
  value: string
  minLength?: number
  maxLength?: number
  placeholder?: string
  disabled?: boolean
}): JSX.Element {
  return (
    <Input
      type="text"
      className={clsx(INPUT_BASE_STYLES, INPUT_INVALID_STYLES, INPUT_VALID_STYLES, INPUT_DISABLED_STYLES, INPUT_ENABLED_STYLES, className)}
      value={value}
      placeholder={placeholder}
      minLength={minLength}
      maxLength={maxLength}
      disabled={disabled}
      readOnly
    />
  )
}

/**
 * Toggle input with animation.
 *
 * @param {object} props - The component props.
 * @param {number} props.value - The current value of the input field.
 * @returns {JSX.Element} A JSX element representing the input field with specified styles and validation.
 */
export function FormToggle({ value, title, onChange }: { className?: string; value: boolean; title: string; onChange: (e: boolean) => void }): JSX.Element {
  return (
    <Switch
      checked={value}
      onChange={onChange}
      title={title}
      className="group relative flex h-fit w-12 enabled:cursor-pointer backdrop-blur-xs rounded-full border border-zinc-400/5 bg-zinc-950/50 p-1 enabled:shadow-sm enabled:shadow-zinc-950/50 enabled:hover:shadow-none transition-colors duration-100 ease-in-out focus:outline-hidden data-focus:outline-1 data-focus:outline-white data-checked:bg-vs"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none inline-block size-4 translate-x-0 rounded-full bg-zinc-500 group-data-checked:bg-zinc-200 ring-0 shadow-lg transition duration-100 ease-in-out group-data-checked:translate-x-6"
      />
    </Switch>
  )
}

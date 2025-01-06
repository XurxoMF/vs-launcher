import { Input } from "@headlessui/react"
import clsx from "clsx"

const INPUT_BASE_STYLES = "h-8 px-2 py-1 rounded-md shadow shadow-zinc-900 hover:shadow-none"
const INPUT_INVALID_STYLES = "border border-red-800 bg-red-800/10"
const INPUT_VALID_STYLES = "bg-zinc-850"
const INPUT_DISABLED_STYLES = "text-zinc-500"

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
 * @returns {JSX.Element} A JSX element representing the input field with specified styles and validation.
 */
export function FormInputText({
  className,
  value,
  onChange,
  minLength,
  maxLength,
  placeholder
}: {
  className?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  minLength?: number
  maxLength?: number
  placeholder?: string
}): JSX.Element {
  return (
    <Input
      type="text"
      className={clsx(
        INPUT_BASE_STYLES,
        (minLength && value.length < minLength) || (maxLength && value.length > maxLength) ? INPUT_INVALID_STYLES : INPUT_VALID_STYLES,
        value.length === 0 && INPUT_DISABLED_STYLES,
        className
      )}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      minLength={minLength}
      maxLength={maxLength}
    />
  )
}

/**
 * Div with the same styles as the FormInputText. Simulates an Input buth with not editable content.
 *
 * @param {object} props - The component props.
 * @param {string} [props.className] - Additional class names for styling.
 * @param {string} props.value - The text to be displayed within the non-editable input field.
 * @returns {JSX.Element} A JSX element representing the non-editable input field with specified styles.
 */
export function FormInputTextNotEditable({
  className,
  value,
  minLength,
  maxLength,
  placeholder
}: {
  className?: string
  value: string
  minLength?: number
  maxLength?: number
  placeholder?: string
}): JSX.Element {
  return (
    <div
      className={clsx(
        INPUT_BASE_STYLES,
        (minLength && value.length < minLength) || (maxLength && value.length > maxLength) ? INPUT_INVALID_STYLES : INPUT_VALID_STYLES,
        value.length === 0 && INPUT_DISABLED_STYLES,
        className
      )}
    >
      {value ? value : placeholder ? placeholder : ""}
    </div>
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
 * @returns {JSX.Element} A JSX element representing the input field with specified styles and validation.
 */
export function FormInputNumber({
  className,
  value,
  onChange,
  min,
  max,
  placeholder
}: {
  className?: string
  value: number
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  min?: number
  max?: number
  placeholder?: string
}): JSX.Element {
  return (
    <Input
      type="number"
      className={clsx(INPUT_BASE_STYLES, (min && value < min) || (max && value > max) ? INPUT_INVALID_STYLES : INPUT_VALID_STYLES, !value && INPUT_DISABLED_STYLES, className)}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      min={min}
      max={max}
    />
  )
}

/**
 * Div with the same styles as the FormInputNumber. Simulates an Input buth with not editable content.
 *
 * @param {object} props - The component props.
 * @param {string} [props.className] - Additional class names for styling.
 * @param {number} props.value - The current value of the input field.
 * @param {number} [props.min] - The minimum valie of the input value.
 * @param {number} [props.max] - The maximum value of the input value.
 * @param {string} [props.placeholder] - Placeholder text to display when the input is empty.
 * @returns {JSX.Element} A JSX element representing the input field with specified styles and validation.
 */
export function FormInputNumberNoteditable({ className, value, min, max, placeholder }: { className?: string; value: number; min?: number; max?: number; placeholder?: string }): JSX.Element {
  return (
    <div className={clsx(INPUT_BASE_STYLES, (min && value < min) || (max && value > max) ? INPUT_INVALID_STYLES : INPUT_VALID_STYLES, !value && INPUT_DISABLED_STYLES, className)}>
      {value ? value : placeholder ? placeholder : ""}
    </div>
  )
}

import * as React from 'react'

import { Input } from './input'

export interface InputNumberProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /**
   * Limit the number of fractional digits. When undefined, any length is allowed.
   */
  decimalScale?: number
}

export const InputNumber = React.forwardRef<HTMLInputElement, InputNumberProps>(
  (
    {
      decimalScale,
      onChange,
      inputMode = 'decimal',
      pattern = '[0-9]*\\.?[0-9]*',
      type = 'text',
      ...props
    },
    ref
  ) => {
    const handleChange = React.useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = event.target.value

        // Allow empty string so users can clear input.
        if (rawValue === '') {
          onChange?.(event)
          return
        }

        const match = rawValue.match(/^(\d*)(?:\.(\d*))?$/)
        if (!match) return

        const [, integerPart = '', decimalPart = ''] = match
        const limitedDecimalPart =
          typeof decimalScale === 'number'
            ? decimalPart.slice(0, decimalScale)
            : decimalPart
        const sanitizedValue = `${integerPart}${
          limitedDecimalPart ? `.${limitedDecimalPart}` : ''
        }`

        if (sanitizedValue !== rawValue) {
          event.target.value = sanitizedValue
        }

        onChange?.(event)
      },
      [decimalScale, onChange]
    )

    return (
      <Input
        ref={ref}
        type={type}
        inputMode={inputMode}
        pattern={pattern}
        onChange={handleChange}
        {...props}
      />
    )
  }
)

InputNumber.displayName = 'InputNumber'

import { InputProps } from './types'

import {
  StyledInput,
  IconUnitsContainer,
  InputContainer,
  UnitsText,
  IconWrapper,
} from './styles'
import { ChangeEvent, forwardRef, useEffect, useRef, useState } from 'react'

/**
 * @name Input component
 * @typedef InputProps
 *
 * @prop {boolean} [disabled] - whether component is disabled or not
 * @prop {string} [type] - input type
 * @prop {string} [value] - input text value
 * @prop {string} [placeholder] - placeholder text
 * @prop {string} [inputUnits] - optional units text, e.g. 'MB' on right-hand side of input field
 * @prop {ReactNode} [inputIcon] - optional icon rendered inside input field
 * @prop {() => void} [onIconClick] - icon click event
 * @prop {(value: string) => void} [onChange] - text change event handler
 * @prop {string} [testId] - for testing purposes
 * @prop {CSSProperties} [style] - styles for actual input element
 * @prop {CSSProperties} [containerStyle] - styles for input container
 */

const Input = (
  {
    autoFocus,
    type = 'text',
    value,
    disabled,
    placeholder,
    inputIcon,
    inputUnits,
    onIconClick,
    onChange,
    testId,
    style,
    containerStyle,
  }: InputProps,
  ref?: React.ForwardedRef<HTMLInputElement>,
) => {
  const iconsRef = useRef<HTMLDivElement>(null)
  const [iconWrapperWidth, setIconWrapperWidth] = useState(22)

  useEffect(() => {
    if (iconsRef.current) {
      setIconWrapperWidth((iconsRef.current as HTMLDivElement).offsetWidth)
    }
  }, [inputIcon])

  const onChangeTextLocal = (event: ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(event.target.value)
    }
  }

  return (
    <InputContainer disabled={disabled} style={containerStyle}>
      <StyledInput
        autoFocus={autoFocus}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        onChange={val => onChangeTextLocal(val)}
        value={value}
        spellCheck={false}
        data-testid={testId || 'input-cmp'}
        style={style}
        ref={ref}
      />
      <IconUnitsContainer $iconWrapperWidth={iconWrapperWidth}>
        {inputIcon && (
          <IconWrapper
            onClick={disabled ? undefined : onIconClick}
            data-testid='icon-test'
            ref={iconsRef}
          >
            {inputIcon}
          </IconWrapper>
        )}{' '}
        {inputUnits && (
          <UnitsText type='smallMedium' data-testid='units-test'>
            {inputUnits}
          </UnitsText>
        )}
      </IconUnitsContainer>
    </InputContainer>
  )
}

export default forwardRef(Input)

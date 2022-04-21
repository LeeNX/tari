import { ReactNode } from 'react'

export type SelectInternalProps = {
  inverted?: boolean
  children?: ReactNode
  open?: boolean
}

type Option = { value: string; label: string; key: string }
export type SelectProps = {
  inverted?: boolean
  label: string
  value: Option
  options: Option[]
  onChange: (option: Option) => void
}

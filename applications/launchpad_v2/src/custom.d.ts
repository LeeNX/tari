import 'styled-components'

declare module '*.svg' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const content: any
  export default content
}

declare module '*.otf'

declare module 'styled-components' {
  export interface DefaultTheme {
    spacing: (count?: number) => string
    spacingHorizontal: (count?: number) => string
    spacingVertical: (count?: number) => string
    borderRadius: (count?: number) => string
    tightBorderRadius: (count?: number) => string
    primary: string
    secondary: string
    background: string
    backgroundSecondary: string
    backgroundImage: string
    accent: string
    accentDark: string
    disabledText: string
    tariGradient: string
    borderColor: string
    actionBackground: string
    resetBackground: string
    resetBackgroundDark: string

    titleBar: string

    controlBackground: string
    info: string
    infoText: string
    on: string
    onText: string
    onTextLight: string
    warning: string
    warningText: string
    expert: string
    expertText: string

    inverted: {
      controlBackground: string
      primary: string
      secondary: string
      background: string
      backgroundSecondary: string
      backgroundImage: string
      accent: string
      accentDark: string
      disabledText: string
      tariGradient: string
      info: string
      infoText: string
      on: string
      onText: string
      onTextLight: string
      warning: string
      warningText: string
      expert: string
      expertText: string
    }
  }
}

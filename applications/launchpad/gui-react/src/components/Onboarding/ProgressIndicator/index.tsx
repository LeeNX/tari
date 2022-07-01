import { useEffect, useState } from 'react'
import BarSegment from './BarSegment'
import { StyledContainer } from './styles'
import { ProgressIndicatorProps } from './types'

const ProgressIndicator = ({ overallFill }: ProgressIndicatorProps) => {
  const [fillOne, setFillOne] = useState<number | undefined>(0.0001)
  const [fillTwo, setFillTwo] = useState<number | undefined>(0.0001)
  const [fillThree, setFillThree] = useState<number | undefined>(0.0001)
  const [fillFour, setFillFour] = useState<number | undefined>(0.0001)

  // Bar one logic
  useEffect(() => {
    if (overallFill) {
      if (overallFill <= 0.25) {
        setFillOne(overallFill * 4)
        // setFillTwo(0.0001)
        // setFillThree(0.0001)
        // setFillFour(0.0001)
      }
      if (overallFill >= 0.25) {
        setFillOne(1)
      }
      if (overallFill > 0.25 && overallFill <= 0.5) {
        setTimeout(() => {
          setFillTwo((overallFill - 0.25) * 4)
          setFillThree(0.0001)
          setFillFour(0.0001)
        }, 300)
      }
      if (overallFill >= 0.5) {
        setFillTwo(1)
      }
      if (overallFill > 0.5 && overallFill <= 0.75) {
        setTimeout(() => {
          setFillThree((overallFill - 0.5) * 4)
          setFillFour(0.0001)
        }, 300)
      }
      if (overallFill >= 0.75) {
        setFillThree(1)
        setTimeout(() => {
          setFillFour((overallFill - 0.75) * 4)
        }, 300)
      }
    }
  }, [overallFill])

  return (
    <StyledContainer>
      <BarSegment fill={fillOne} />
      <BarSegment fill={fillTwo} />
      <BarSegment fill={fillThree} />
      <BarSegment fill={fillFour} />
    </StyledContainer>
  )
}

export default ProgressIndicator

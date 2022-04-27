import { useTheme } from 'styled-components'

import Box from '../../components/Box'
import Text from '../../components/Text'
import Button from '../../components/Button'
import Loading from '../../components/Loading'

import { TariBackgroundSignet } from './styles'

const PasswordBox = ({
  onSubmit,
}: {
  onSubmit: (password: string) => void
}) => {
  const theme = useTheme()
  const password = 'placeholderPassword'
  const disabled = false
  const loading = false

  return (
    <Box style={{ position: 'relative' }}>
      <TariBackgroundSignet />
      <Text type='header' style={{ marginBottom: theme.spacing() }}>
        Enter Password
      </Text>
      <Text>to access your wallet:</Text>
      <Box border={false} style={{ padding: 0 }}>
        placeholder for input
      </Box>
      <Button
        disabled={disabled}
        variant={disabled ? 'disabled' : undefined}
        rightIcon={<Loading loading={loading} />}
        onClick={() => onSubmit(password)}
      >
        <Text type='defaultMedium' style={{ lineHeight: '100%' }}>
          Continue
        </Text>
      </Button>
    </Box>
  )
}

export default PasswordBox

import { useTheme } from 'styled-components'

import Box from '../../components/Box'
import Text from '../../components/Text'
import Tag from '../../components/Tag'
import t from '../../locales'

import { TariBackgroundSignet } from './styles'

const TariWallet = ({ address }: { address: string }) => {
  const theme = useTheme()

  return (
    <Box
      border={false}
      style={{
        background: theme.tariGradient,
        position: 'relative',
      }}
    >
      <TariBackgroundSignet style={{ color: theme.accentDark }} />
      <Tag type='running'>
        <Text type='smallMedium'>{t.common.adjectives.running}</Text>
      </Tag>
      <Text
        type='header'
        style={{
          marginBottom: theme.spacing(),
          color: theme.inverted.primary,
          marginTop: theme.spacing(0.5),
        }}
      >
        Tari Wallet
      </Text>
      <span>{address}</span>
    </Box>
  )
}

export default TariWallet

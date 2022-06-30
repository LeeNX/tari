import { useTheme } from 'styled-components'

import Select from '../../components/Select'
import Text from '../../components/Text'
import Box from '../../components/Box'
import Button from '../../components/Button'
import Tag from '../../components/Tag'
import t from '../../locales'

import { BaseNodeProps, Network } from './types'
import { networkOptions } from './constants'
import SvgSetting2 from '../../styles/Icons/Setting2'
import { useAppDispatch } from '../../store/hooks'
import { actions as settingsActions } from '../../store/settings'
import { Settings } from '../../store/settings/types'
import BaseNodeQRModal from '../BaseNodeQRModal'
import { useState } from 'react'

const BaseNode = ({
  running,
  pending,
  startNode,
  stopNode,
  tariNetwork,
  setTariNetwork,
}: BaseNodeProps) => {
  const theme = useTheme()
  const dispatch = useAppDispatch()

  const [openQRModal, setOpenQRModal] = useState(false)

  return (
    <>
      <Box
        border={!running}
        gradient={
          running
            ? { start: theme.actionBackground, end: theme.accent }
            : undefined
        }
      >
        <Text
          type='header'
          style={{
            margin: 0,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
          color={running ? theme.inverted.primary : undefined}
        >
          {t.baseNode.title}
          {running && (
            <Tag type='running' variant='large'>
              {t.common.adjectives.running}
            </Tag>
          )}
        </Text>
        <Box
          border={false}
          style={{
            minWidth: 0,
            width: 'auto',
            padding: 0,
            background: running ? 'transparent' : undefined,
          }}
        >
          <Select
            inverted={running}
            disabled={running}
            value={networkOptions.find(({ value }) => value === tariNetwork)}
            options={networkOptions}
            onChange={({ value }) => setTariNetwork(value as Network)}
            label={t.baseNode.tari_network_label}
          />
        </Box>
        {!running && (
          <Button disabled={pending} onClick={startNode} loading={pending}>
            {t.baseNode.start}
          </Button>
        )}
        {running && (
          <Button
            onClick={stopNode}
            disabled={pending}
            loading={pending}
            style={{
              color: theme.inverted.primary,
              background: theme.resetBackground,
              border: 'none',
            }}
          >
            {t.common.verbs.stop}
          </Button>
        )}
      </Box>

      <Box
        border={false}
        style={{ background: theme.backgroundSecondary, marginTop: 0 }}
      >
        <Tag>{t.common.adjectives.recommended}</Tag>
        <Text style={{ marginTop: theme.spacingVertical(1.2) }}>
          <Button variant='button-in-text' onClick={() => setOpenQRModal(true)}>
            {t.baseNode.aurora.connectYourAurora}
          </Button>{' '}
          <Text as='span'>{t.baseNode.aurora.withBaseNode}</Text>
        </Text>
        <Text
          type='smallMedium'
          style={{ marginTop: theme.spacingVertical(0.67) }}
          color={theme.secondary}
        >
          {t.baseNode.aurora.description}
        </Text>
      </Box>
      <BaseNodeQRModal
        open={openQRModal}
        onClose={() => setOpenQRModal(false)}
      />
      <div style={{ width: '100%' }}>
        <Button
          autosizeIcons={false}
          variant='text'
          leftIcon={<SvgSetting2 width='1.5rem' height='1.5rem' />}
          style={{
            paddingLeft: 0,
          }}
          onClick={() =>
            dispatch(settingsActions.open({ toOpen: Settings.BaseNode }))
          }
        >
          {t.baseNode.viewActions.baseNodeSettings}
        </Button>
      </div>
    </>
  )
}

export default BaseNode

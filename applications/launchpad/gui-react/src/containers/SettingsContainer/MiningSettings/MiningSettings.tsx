import { Controller, Control, UseFormSetValue } from 'react-hook-form'
import { useTheme } from 'styled-components'
import Button from '../../../components/Button'
import IconButton from '../../../components/IconButton'

import Input from '../../../components/Inputs/Input'
import { Label } from '../../../components/Inputs/Input/styles'
import SettingsSectionHeader from '../../../components/SettingsSectionHeader'
import Text from '../../../components/Text'
import MiningConfig from '../../../config/mining'

import t from '../../../locales'
import SvgShieldCheck from '../../../styles/Icons/ShieldCheck'
import SvgTrash2 from '../../../styles/Icons/Trash2'
import { RowSpacedBetween, SettingsHeader } from '../styles'
import { SettingsInputs } from '../types'
import MoneroURLs from './MoneroURLs'
import { AddressDescription, NarrowInlineInput } from './styles'

const isAuthenticationApplied = (values: SettingsInputs): boolean => {
  const { authentication } = values.mining.merged

  return Boolean(
    authentication && (authentication.username || authentication.password),
  )
}

const MiningSettings = ({
  control,
  values,
  setValue,
  setOpenMiningAuthForm,
}: {
  control: Control<SettingsInputs>
  values: SettingsInputs
  setValue: UseFormSetValue<SettingsInputs>
  setOpenMiningAuthForm: (value: boolean) => void
}) => {
  const theme = useTheme()

  return (
    <>
      <SettingsHeader>
        <Text type='header' as='h1'>
          {t.mining.settings.title}
        </Text>
      </SettingsHeader>

      <div style={{ width: '70%' }}>
        <Controller
          name='mining.merged.address'
          control={control}
          rules={{ required: true, minLength: 1 }}
          render={({ field }) => (
            <Input
              placeholder={t.mining.setup.addressPlaceholder}
              label={t.mining.settings.moneroAddressLabel}
              testId='address-input'
              value={field.value?.toString()}
              onChange={v => field.onChange(v)}
              autoFocus
            />
          )}
        />
      </div>

      <AddressDescription>
        <Text type='smallMedium'>
          {t.mining.settings.moneroAddressDesc1}
          <br />
          {t.mining.settings.moneroAddressDesc2}
        </Text>
      </AddressDescription>

      <SettingsSectionHeader noBottomMargin>
        {t.common.nouns.expert}
      </SettingsSectionHeader>

      <NarrowInlineInput>
        <Label>{t.mining.settings.threadsLabel}</Label>
        <Controller
          name='mining.merged.threads'
          control={control}
          rules={{ required: true, minLength: 1 }}
          render={({ field }) => (
            <Input
              testId='mining-merged-threads-input'
              onChange={value => {
                // convert string into number
                const stripped = value.replace(/\D/g, '')
                let val = !stripped
                  ? ''
                  : Math.abs(Math.round(parseInt(stripped)))

                // limit the number of threads to maxThreads
                if (val > MiningConfig.maxThreads) {
                  val = MiningConfig.maxThreads
                }
                field.onChange(val)
              }}
              value={field?.value?.toString() || ''}
              containerStyle={{ maxWidth: 96 }}
            />
          )}
        />
      </NarrowInlineInput>

      {isAuthenticationApplied(values) ? (
        <RowSpacedBetween>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <SvgShieldCheck
              color={theme.success}
              width='16'
              height='16'
              style={{
                marginBottom: 4,
                marginRight: theme.spacingHorizontal(0.2),
              }}
            />{' '}
            <Label $noMargin>{t.mining.settings.moneroAuthApplied}</Label>
          </div>
          <IconButton
            onClick={() =>
              setValue('mining.merged.authentication', undefined, {
                shouldDirty: true,
              })
            }
            style={{ color: theme.warningDark }}
          >
            <SvgTrash2 width='16' height='16' color={theme.warningDark} />
          </IconButton>
        </RowSpacedBetween>
      ) : (
        <RowSpacedBetween>
          <Label $noMargin>{t.mining.settings.moneroNodeAuthLabel}</Label>
          <Button size='small' onClick={() => setOpenMiningAuthForm(true)}>
            {t.common.verbs.apply}
          </Button>
        </RowSpacedBetween>
      )}

      <div>
        <MoneroURLs control={control} />
      </div>
    </>
  )
}

export default MiningSettings

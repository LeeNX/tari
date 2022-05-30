import { createAsyncThunk } from '@reduxjs/toolkit'

import { MiningNodeType, ScheduleId } from '../../types/general'
import { selectContainerStatus } from '../containers/selectors'
import { actions as containersActions } from '../containers'
import { actions as miningActions } from './index'
import { Container } from '../containers/types'
import { RootState } from '..'

import { MiningActionReason } from './types'
import { selectTariSetupRequired, selectMergedSetupRequired } from './selectors'

const checkSetup: Record<MiningNodeType, (state: RootState) => void> = {
  tari: state => {
    const setupRequired = selectTariSetupRequired(state)

    if (setupRequired) {
      throw setupRequired
    }
  },
  merged: state => {
    const setupRequired = selectMergedSetupRequired(state)

    if (setupRequired) {
      throw setupRequired
    }
  },
}

/**
 * Start given mining node. It spawns all dependencies if needed.
 * @prop {NodeType} node - the node name, ie. 'tari', 'merged'
 * @returns {Promise<void>}
 */
export const startMiningNode = createAsyncThunk<
  void,
  { node: MiningNodeType; reason: MiningActionReason; schedule?: ScheduleId },
  { state: RootState }
>('mining/startNode', async ({ node, reason, schedule }, thunkApi) => {
  try {
    const rootState = thunkApi.getState()

    checkSetup[node](rootState)

    const miningSession = rootState.mining[node].session
    const scheduledMiningWasStoppedManually =
      miningSession?.finishedAt &&
      miningSession?.reason === MiningActionReason.Manual &&
      miningSession?.schedule
    if (
      scheduledMiningWasStoppedManually &&
      miningSession.schedule === schedule
    ) {
      return
    }

    const torStatus = selectContainerStatus(Container.Tor)(rootState)
    const baseNodeStatus = selectContainerStatus(Container.BaseNode)(rootState)
    const walletStatus = selectContainerStatus(Container.Wallet)(rootState)

    if (!torStatus.running && !torStatus.pending) {
      await thunkApi.dispatch(containersActions.start(Container.Tor)).unwrap()
    }

    if (!baseNodeStatus.running && !baseNodeStatus.pending) {
      await thunkApi
        .dispatch(containersActions.start(Container.BaseNode))
        .unwrap()
    }

    if (!walletStatus.running && !walletStatus.pending) {
      await thunkApi
        .dispatch(containersActions.start(Container.Wallet))
        .unwrap()
    }

    if (node === 'tari') {
      const minerStatus = selectContainerStatus(Container.SHA3Miner)(rootState)
      if (!minerStatus.running && !minerStatus.pending) {
        await thunkApi
          .dispatch(containersActions.start(Container.SHA3Miner))
          .unwrap()
        thunkApi.dispatch(
          miningActions.startNewSession({ node, reason, schedule }),
        )
      }
    }

    switch (node) {
      case 'merged':
        await thunkApi
          .dispatch(containersActions.start(Container.MMProxy))
          .unwrap()
        await thunkApi
          .dispatch(containersActions.start(Container.XMrig))
          .unwrap()
        thunkApi.dispatch(
          miningActions.startNewSession({ node, reason, schedule }),
        )
        break
      default:
        break
    }
  } catch (e) {
    return thunkApi.rejectWithValue(e)
  }
})

/**
 * Stop containers of a given mining node (ie. tari, merged).
 * It doesn't stop common containers, like Tor, Wallet, and BaseNode.
 * @prop {{ node: MiningNodeType }} node - the mining node, ie. 'tari'
 * @returns {Promise<void>}
 */
export const stopMiningNode = createAsyncThunk<
  void,
  {
    node: MiningNodeType
    reason: MiningActionReason
  },
  { state: RootState }
>('mining/stopNode', async ({ node, reason }, thunkApi) => {
  try {
    const promises = []

    const { getState } = thunkApi
    const state = getState()

    const miningSession = state.mining[node].session
    if (
      reason === MiningActionReason.Schedule &&
      miningSession?.startedAt &&
      !miningSession?.finishedAt &&
      miningSession?.reason === MiningActionReason.Manual
    ) {
      return
    }

    switch (node) {
      case 'tari':
        promises.push(
          thunkApi.dispatch(containersActions.stopByType(Container.SHA3Miner)),
        )
        break
      case 'merged':
        promises.push(
          thunkApi.dispatch(containersActions.stopByType(Container.MMProxy)),
        )
        promises.push(
          thunkApi.dispatch(containersActions.stopByType(Container.XMrig)),
        )
        promises.push(
          thunkApi.dispatch(containersActions.stopByType(Container.Monerod)),
        )
        break
    }

    thunkApi.dispatch(miningActions.stopSession({ node, reason }))

    await Promise.all(promises)
  } catch (e) {
    return thunkApi.rejectWithValue(e)
  }
})

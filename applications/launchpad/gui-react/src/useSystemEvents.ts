import { useEffect } from 'react'
import { invoke } from '@tauri-apps/api/tauri'
import { listen } from '@tauri-apps/api/event'

import { AppDispatch } from './store'
import { actions } from './store/containers'

enum SystemEventType {
  Container = 'container',
}

export const useSystemEvents = ({ dispatch }: { dispatch: AppDispatch }) => {
  useEffect(() => {
    invoke('events')
  }, [])

  useEffect(() => {
    let unsubscribe

    const listenToSystemEvents = async () => {
      unsubscribe = await listen(
        'tari://docker-system-event',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (event: any) => {
          if (event.payload.Type === SystemEventType.Container) {
            const containerId = event.payload.Actor.ID
            const action = event.payload.Action
            const image = event.payload.Actor.Attributes.image
            if (!image.startsWith('quay.io/tarilabs')) {
              return
            }

            dispatch(actions.updateStatus({ containerId, action }))

            return
          }
        },
      )
    }

    listenToSystemEvents()

    return unsubscribe
  }, [])
}

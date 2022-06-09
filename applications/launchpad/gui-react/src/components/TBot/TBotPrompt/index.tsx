import { useState, useEffect, useRef, ReactNode, useMemo } from 'react'

import { config, useSpring } from 'react-spring'

import SvgClose from '../../../styles/Icons/Close'
import TBot from '..'

import { useAppDispatch } from '../../../store/hooks'
import { tbotactions } from '../../../store/tbot'
import { TBotPromptProps } from './types'

import {
  ContentRow,
  PromptContainer,
  StyledCloseIcon,
  TBotContainer,
  MessageContainer,
  StyledCloseContainer,
  ContentContainer,
  FadeOutSection,
  MessageWrapper,
  ScrollWrapper,
  HeightAnimationWrapper,
} from './styles'

import ChatDots from '../DotsComponent'
import MessageBox from './MessageBox'

// The default time between rendering messages
const WAIT_TIME = 2800

/**
 * @name TBotPrompt
 *
 * @prop {boolean} open - controls rendering of prompt component
 * @prop {() => void} [onClose] - callback on close action of prompt
 * @prop {ReactNode} [children] - content rendered inside prompt component
 * @prop {string} [testid] - for testing
 * @prop {number} [currentIndex] -
 * @prop {boolean} [closeIcon] - controls rendering of close button
 */
const TBotPrompt = ({
  open,
  floating,
  testid,
  messages,
  currentIndex = 1,
  closeIcon = true,
  mode = 'help',
}: TBotPromptProps) => {
  const dispatch = useAppDispatch()

  const lastMsgRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const messageWrapperRef = useRef<HTMLDivElement>(null)
  const currentIndexRef = useRef<number>(currentIndex)

  const [messageLoading, setMessageLoading] = useState<boolean>(false)
  const [count, setCount] = useState(currentIndex || 0)
  const [height, setHeight] = useState(100)
  const [tickle, setTickle] = useState(true)

  const promptAnim = useSpring({
    from: {
      opacity: floating ? 1 : 0,
    },
    opacity: 1,
    config: config.wobbly,
  })

  const heightAnim = useSpring({
    maxHeight: height,
    duration: 50,
  })

  const scrollToBottom = () => {
    if (scrollRef.current !== null) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      })
    }
  }

  const close = () => {
    return dispatch(tbotactions.close())
  }

  useEffect(() => {
    // Update internal 'count' if parent changes the currentIndex
    if (currentIndex || currentIndex === 0) {
      setCount(currentIndex)
    }

    // If new currentIndex value is different, it means that we need to 'skip' next messages
    // and scroll to the bottom.
    if (currentIndexRef?.current && currentIndexRef?.current !== count) {
      setTimeout(() => scrollToBottom(), 800)
    }
  }, [currentIndex])

  // The following timer increases the 'count' - the messages indexer.
  // This way, tbot goes through the array of messages.
  useEffect(() => {
    let counter = count
    let timeout: NodeJS.Timeout

    if (messages && counter >= messages.length) {
      setMessageLoading(false)
    } else if (messages && messages.length > 0) {
      setMessageLoading(true)

      // use custom waiting time, if previous message has 'wait' field.
      const lastMsg = counter > 1 ? messages[counter - 1] : undefined
      let wait = WAIT_TIME
      if (
        lastMsg &&
        typeof lastMsg !== 'string' &&
        typeof lastMsg !== 'number' &&
        typeof lastMsg !== 'boolean' &&
        'wait' in lastMsg &&
        lastMsg.wait
      ) {
        wait = lastMsg.wait
      }

      // show loading dots, and then increase count which results in rendering next message.
      timeout = setTimeout(() => {
        setMessageLoading(false)
        setCount(count => count + 1)
        counter++
      }, wait)
    }

    return () => {
      clearTimeout(timeout)
      setMessageLoading(false)
    }
  }, [messages, count])

  // It will animate the list max-height. The timeout is needed, bc app has to render new content first,
  // so then we can learn what is the current list height, and animate the max-height of wrapping component.
  useEffect(() => {
    setTimeout(
      () => setHeight(messageWrapperRef?.current?.offsetHeight || 100),
      200,
    )
  }, [messageLoading, count])

  // Tickle tbot whenever the app shows new message
  useEffect(() => {
    if (messageLoading) {
      setTimeout(() => {
        scrollToBottom()
      }, 400)
    } else {
      setTickle(true)
      setTimeout(() => {
        setTickle(false)
      }, 100)
    }
  }, [messageLoading])

  // Automatically scroll to the new message. Timeout is used to allow make some animations meanwhile.
  useEffect(() => {
    setTimeout(() => {
      if (lastMsgRef?.current) {
        lastMsgRef?.current.scrollIntoView({ block: 'start' })
      }
    }, 3000)
  }, [lastMsgRef, lastMsgRef?.current])

  // Build messages list
  const renderedMessages = useMemo(() => {
    return messages?.slice(0, count).map((msg, idx) => {
      const skipButtonCheck = count === idx + 1
      if (
        typeof msg !== 'string' &&
        typeof msg !== 'number' &&
        typeof msg !== 'boolean' &&
        msg
      ) {
        // if message is complete functional component
        if ('content' in msg && typeof msg.content === 'function') {
          const TempMsg = msg.content
          return (
            <MessageBox
              animate={count === idx + 1}
              ref={count === idx + 1 ? lastMsgRef : null}
              skipButton={mode === 'onboarding' && skipButtonCheck}
            >
              <TempMsg />
            </MessageBox>
          )
        }
        return (
          <MessageBox
            animate={count === idx + 1}
            ref={count === idx + 1 ? lastMsgRef : null}
            skipButton={mode === 'onboarding' && skipButtonCheck}
          >
            {'content' in msg ? (msg.content as ReactNode | string) : msg}
          </MessageBox>
        )
      }

      return (
        <MessageBox
          key={idx}
          animate={count === idx + 1}
          ref={count === idx + 1 ? lastMsgRef : null}
          skipButton={mode === 'onboarding' && skipButtonCheck}
        >
          {msg}
        </MessageBox>
      )
    })
  }, [messages, count]) as ReactNode

  if (!open) {
    return null
  }

  return (
    <PromptContainer
      style={promptAnim}
      $floating={floating}
      data-testid={testid || 'tbotprompt-cmp'}
    >
      <ContentRow>
        <ContentContainer $floating={floating}>
          <FadeOutSection $floating={floating} />
          {closeIcon && (
            <StyledCloseContainer>
              <StyledCloseIcon>
                <SvgClose fontSize={20} onClick={close} />
              </StyledCloseIcon>
            </StyledCloseContainer>
          )}
          <MessageContainer>
            <ScrollWrapper ref={scrollRef}>
              <HeightAnimationWrapper style={heightAnim}>
                <MessageWrapper ref={messageWrapperRef}>
                  {renderedMessages}
                  {messageLoading && <ChatDots />}
                </MessageWrapper>
              </HeightAnimationWrapper>
            </ScrollWrapper>
          </MessageContainer>
        </ContentContainer>
      </ContentRow>
      <TBotContainer>
        <TBot animate={tickle} />
      </TBotContainer>
    </PromptContainer>
  )
}

export default TBotPrompt

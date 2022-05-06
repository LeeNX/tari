import * as React from 'react'
import { SVGProps } from 'react'

const SvgStar = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width='1em'
    height='1em'
    viewBox='0 0 24 24'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    data-testid='svg-star'
    {...props}
  >
    <path
      d='M12.877 16.168c.152-.414.76-.414.913 0l.417 1.134a.476.476 0 0 0 .294.285l1.176.401c.43.147.43.734 0 .88l-1.176.403a.476.476 0 0 0-.294.284l-.417 1.134c-.152.415-.76.415-.913 0l-.417-1.134a.476.476 0 0 0-.295-.284l-1.176-.402a.462.462 0 0 1 0-.88l1.176-.402a.476.476 0 0 0 .295-.285l.417-1.134ZM14.64 3.473c.231-.63 1.156-.63 1.387 0l.794 2.16c.074.202.239.36.448.432l2.24.766a.702.702 0 0 1 0 1.338l-2.24.766a.724.724 0 0 0-.448.432l-.794 2.16c-.231.63-1.156.63-1.388 0l-.793-2.16a.723.723 0 0 0-.448-.432l-2.241-.766a.702.702 0 0 1 0-1.338l2.24-.766a.723.723 0 0 0 .448-.432l.794-2.16ZM6.486 9.363a.545.545 0 0 1 1.028 0l.468 1.323a.545.545 0 0 0 .332.332l1.323.468a.545.545 0 0 1 0 1.028l-1.323.468a.545.545 0 0 0-.332.332l-.468 1.323a.545.545 0 0 1-1.028 0l-.468-1.323a.545.545 0 0 0-.332-.332l-1.323-.468a.545.545 0 0 1 0-1.028l1.323-.468a.545.545 0 0 0 .332-.332l.468-1.323Z'
      stroke='currentColor'
      strokeWidth={1}
      strokeLinejoin='round'
    />
  </svg>
)

export default SvgStar

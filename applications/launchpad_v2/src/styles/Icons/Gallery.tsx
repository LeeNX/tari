import * as React from 'react'
import { SVGProps } from 'react'

const SvgGallery = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <rect
      x={13}
      y={7}
      width={4}
      height={4}
      rx={2}
      stroke="currentColor"
      strokeWidth={1.5}
    />
    <path
      d="m3.353 15.05-.73.17.73-.17Zm0-6.1-.73-.17.73.17Zm17.294 0-.73.172.73-.172Zm0 6.1-.73-.172.73.172Zm-5.597 5.597-.172-.73.172.73Zm-6.1 0 .172-.73-.172.73Zm0-17.294.172.73-.172-.73Zm6.1 0-.172.73.172-.73ZM4.188 16.67a.75.75 0 0 0 1.06 1.06l-1.06-1.06Zm2.269-1.208-.53-.53.53.53Zm5.885 0-.53.53.53-.53Zm2.443 1.034.53.53-.53-.53Zm1.366 3.835a.75.75 0 0 0 1.06-1.06l-1.06 1.06Zm3.238-3.626-.576.48.576-.48Zm-.163.976a.75.75 0 1 0 1.152-.96l-1.152.96ZM4.083 14.877a12.604 12.604 0 0 1 0-5.756l-1.46-.343a14.104 14.104 0 0 0 0 6.442l1.46-.343Zm15.834-5.756a12.603 12.603 0 0 1 0 5.756l1.46.343a14.104 14.104 0 0 0 0-6.442l-1.46.343Zm-5.039 10.795a12.603 12.603 0 0 1-5.756 0l-.343 1.46c2.119.497 4.323.497 6.442 0l-.343-1.46ZM9.122 4.083a12.604 12.604 0 0 1 5.756 0l.343-1.46a14.103 14.103 0 0 0-6.442 0l.343 1.46Zm0 15.834a6.761 6.761 0 0 1-5.039-5.039l-1.46.343a8.261 8.261 0 0 0 6.156 6.156l.343-1.46Zm6.099 1.46a8.261 8.261 0 0 0 6.156-6.156l-1.46-.343a6.761 6.761 0 0 1-5.039 5.039l.343 1.46Zm-.343-17.294a6.761 6.761 0 0 1 5.039 5.039l1.46-.343a8.261 8.261 0 0 0-6.156-6.156l-.343 1.46ZM8.78 2.623a8.261 8.261 0 0 0-6.156 6.156l1.46.343a6.761 6.761 0 0 1 5.039-5.039l-.343-1.46ZM5.25 17.732l1.738-1.74-1.06-1.06-1.74 1.739 1.061 1.06Zm6.562-1.74 1.74 1.74 1.06-1.061-1.739-1.739-1.06 1.06Zm2.8 1.74.704-.705-1.06-1.06-.705.704 1.06 1.06Zm-1.06 0 2.6 2.6 1.06-1.06-2.6-2.601-1.06 1.06Zm5.262-.546.413.495 1.152-.96-.413-.495-1.152.96Zm-3.498-.159a2.371 2.371 0 0 1 3.498.159l1.152-.96a3.87 3.87 0 0 0-5.71-.26l1.06 1.061Zm-8.328-1.034a3.411 3.411 0 0 1 4.824 0l1.061-1.06a4.911 4.911 0 0 0-6.945 0l1.06 1.06Z"
      fill="currentColor"
    />
  </svg>
)

export default SvgGallery

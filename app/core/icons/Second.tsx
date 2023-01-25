import * as React from "react"
import { SVGProps, memo } from "react"

const Seconds = ({ fill = "#ff", color = "#fff", ...props }: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 303.31 238.69"
    color={color}
    fill={fill}
    {...props}
  >
    <g id="Layer_2" data-name="Layer 2">
      <g id="Layer_1-2" data-name="Layer 1">
        <path
          id="Trapezoid"
          fill={fill}
          color={color}
          d="M277.6 38.3 242.55 68c-1.47 1.38-6.68 5.5-6.53 13.77 1.12 37.55.16 72.69 0 75.24-.15 8.27 5.06 12.38 6.53 13.76l35.05 29.66c14.45 13.52 25.71 7.31 25.71-11.08V49.38c0-18.38-11.26-24.59-25.71-11.08Z"
        />
        <path
          fill={fill}
          color={color}
          d="M113.5 0h-.5C72.71 0 46.64 3.76 29.83 14h72.6a7 7 0 0 1 7 7 7 7 0 0 1-7 7H14.86a60 60 0 0 0-7.07 14h116.05a7 7 0 0 1 7 7 7 7 0 0 1-7 7H4q-1.3 6.56-2.09 14h146a7 7 0 0 1 7 7 7 7 0 0 1-7 7H.78Q.41 90.95.22 98.29h106.42a7 7 0 0 1 7 7 7 7 0 0 1-7 7H0v14h128.23a7 7 0 0 1 7 7 7 7 0 0 1-7 7H.22c.12 4.9.31 9.57.56 14h112.38a7 7 0 0 1 7 7 7 7 0 0 1-7 7H1.92c.53 5 1.22 9.67 2.09 14H137.3a7 7 0 0 1 7 7 7 7 0 0 1-7 7H7.79a60 60 0 0 0 7.07 14h89.88a7 7 0 0 1 7 7 7 7 0 0 1-7 7H29.83c16.81 10.28 42.88 14 83.21 14h.46c102.92 0 113-24.48 113-119.34S216.42 0 113.5 0Z"
        />
      </g>
    </g>
  </svg>
)

export default memo(Seconds)

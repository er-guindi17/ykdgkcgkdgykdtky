import * as React from "react";
import { SVGProps } from "react";

const SpotifyIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    viewBox="0 0 35 35"
    fill="none"
    {...props}
  >
    <g clipPath="url(#clip0_87_297)">
      <path
        d="M17.5 0C7.835 0 0 7.835 0 17.5S7.835 35 17.5 35 35 27.165 35 17.5 27.165 0 17.5 0Zm8.03 25.232a1.093 1.093 0 0 1-1.503.365c-4.118-2.518-9.294-3.092-15.383-1.704a1.09 1.09 0 0 1-.489-2.125c6.54-1.505 12.192-.852 16.65 2.009a1.093 1.093 0 0 1 .725 1.455Zm2.14-4.756a1.364 1.364 0 0 1-1.875.456c-4.717-2.894-11.91-3.732-17.496-2.056a1.366 1.366 0 0 1-.768-2.618c6.258-1.838 14.135-.923 19.507 2.285.64.393.841 1.23.458 1.933h.174ZM28.37 15.57c-5.65-3.352-14.998-3.663-20.39-2.037a1.637 1.637 0 1 1-.928-3.145c6.2-1.827 16.492-1.47 22.972 2.367a1.637 1.637 0 0 1-1.654 2.814Z"
        fill="white"
      />
    </g>
    <defs>
      <clipPath id="clip0_87_297">
        <path fill="#fff" d="M0 0h35v35H0z" />
      </clipPath>
    </defs>
  </svg>
);

export default SpotifyIcon;

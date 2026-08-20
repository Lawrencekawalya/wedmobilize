import type { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg
            {...props}
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            <circle
                cx="21.5"
                cy="24"
                r="14.5"
                stroke="currentColor"
                strokeWidth="2.4"
            />
            <path
                d="M7.8 19.3H35.2M7.8 28.7H35.2M21.5 9.5C17.9 13.4 16.1 18.2 16.1 24C16.1 29.8 17.9 34.6 21.5 38.5M21.5 9.5C25.1 13.4 26.9 18.2 26.9 24C26.9 29.8 25.1 34.6 21.5 38.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
            />
            <path
                d="M5.5 33.8C13.2 42.4 32.1 43.4 42.2 31.2"
                stroke="#00bf83"
                strokeWidth="2.6"
                strokeLinecap="round"
            />
            <path
                d="M39 28.4L43.6 29.4L42.5 34"
                stroke="#00bf83"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <g transform="rotate(-18 36 13.5)">
                <rect
                    x="28.5"
                    y="8.5"
                    width="15"
                    height="10"
                    rx="2.2"
                    fill="#f8fdff"
                    stroke="#00bf83"
                    strokeWidth="2.2"
                />
                <path
                    d="M30.5 11L36 15.1L41.5 11"
                    stroke="#00bf83"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </g>
        </svg>
    );
}

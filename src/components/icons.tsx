import type { SVGProps } from "react";

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 50"
      width="140"
      height="35"
      {...props}
    >
      <text
        x="10"
        y="35"
        fontFamily="var(--font-serif)"
        fontWeight="700"
        fontSize="30"
        fill="currentColor"
        className="font-headline"
      >
        EVO
      </text>
      <text
        x="80"
        y="35"
        fontFamily="var(--font-serif)"
        fontWeight="700"
        fontSize="30"
        fill="hsl(var(--primary))"
        className="font-headline"
      >
        .in
      </text>
    </svg>
  );
}

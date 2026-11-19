import type { ReactNode } from "react"

interface ContentProps{
  className?: string,
  children: ReactNode,
}

export function SectionContent({ className, children }: ContentProps) {
  return(
    <>
      <div className={`container-fluid d-flex flex-wrap justify-content-center align-items-center ${className}`}>
        {children}
      </div>
    </>
  )
}
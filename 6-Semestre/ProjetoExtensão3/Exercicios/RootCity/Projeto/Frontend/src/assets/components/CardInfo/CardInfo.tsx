import './CardInfo.css';
import type { PropsWithChildren, ReactNode } from "react";

interface CardProps {
  icon?: ReactNode;
  number?: string;
  title: string;
  text?: string;
  className?: string;
  children?: ReactNode;
}

export function CardInfo({ icon, number, title, text, className, children }: PropsWithChildren<CardProps>) {
  return (
    <div className={`cardInfo p-4 rounded-4 ${className || ''}`}>
      
      <div className="d-flex justify-content-between align-items-center mb-3">
        <span className="icon rounded-circle p-2">
          {icon}
        </span>

        <span className="number align-self-start">
          {number}
        </span>
      </div>

      <div className="cardText flex-grow-1">
        <h3>{title}</h3>
        {text}
      </div>

      {children}

    </div>
  );
}
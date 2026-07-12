import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface Props {
  children: React.ReactNode;
}

export default function Portal({ children }: Props) {
  const [el] = useState(() => document.createElement('div'));

  useEffect(() => {
    document.body.appendChild(el);
    
    return () => {
      document.body.removeChild(el);
    };
  }, [el]);

  return createPortal(children, el);
}
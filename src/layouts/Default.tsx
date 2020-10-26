import React, { FunctionComponent, ReactNode } from 'react';

type Props = {
  children: ReactNode;
}

const Default: FunctionComponent<Props> = ({ children }) => {
  return (
    <div className="container">
      {children}
    </div>
  );
}

export default Default;

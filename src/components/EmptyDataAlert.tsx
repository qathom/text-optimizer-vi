import React, { FunctionComponent } from 'react';
import { Alert } from 'react-bootstrap';

const EmptyDataAlert: FunctionComponent = () => {
  return (
    <Alert variant="info">Please write some text in the editor.</Alert>
  );
};

export default EmptyDataAlert;

import React, { FunctionComponent, useEffect , useState } from 'react';

import { Button, Modal } from 'react-bootstrap';
import { TimelineChartData } from '../../types';
import TimelineChart from './TimelineChart';

type Props = {
  show: boolean,
  chartData: TimelineChartData,
  colorBlindness: boolean,
  handleClose: () => void,
};

const TimelineModal: FunctionComponent<Props> = ({ show, chartData, handleClose, colorBlindness }) => {
  const [showModal, setShow] = useState(show);

  useEffect(() => {
    setShow(show);
  }, [show])

  const handleModalClose = () => handleClose();

  return (
    <Modal
      show={showModal}
      onHide={handleModalClose}
      backdrop
      size="lg"
    >
      <Modal.Header closeButton>
        <Modal.Title>Sentiment timeline</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <TimelineChart
          colorBlindness={colorBlindness}
          data={chartData.data}
          onLabelClicked={chartData.onLabelClicked}
        />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleModalClose}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default TimelineModal;

import React, { FunctionComponent, ReactNode, useEffect, useState } from 'react';
import {
  Row,
  Col,
  Tabs,
  Tab,
  Button,
  Form,
} from 'react-bootstrap';
import { Metrics } from '../../types';
import Editor from '../components/Editor';
import TimelineChart from '../components/TimelineChart';
import { Hints } from 'intro.js-react';
import TimelineModal from '../components/TimelineModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExpandAlt } from '@fortawesome/free-solid-svg-icons'
import LanguagesBarChart from '../components/LanguagesBarChart';
import EmptyDataAlert from '../components/EmptyDataAlert';
import { Hint } from 'intro.js';

type Props = {
  children: ReactNode;
};

enum TabKey {
  GENERAL = 'General',
  LANGUAGES = 'Languages',
}

const GridContainer: FunctionComponent<Props> = () => {
  const [hints, setHints] = useState<Hint[]>([
    {
      element: '.timeline-chart-container',
      hint: 'The sentiment score is between -1 (negative) and 1 (positive). The value 0 represents a perfect neutrality score.',
      hintPosition: 'top-left',
    },
    {
      element: '.timeline-chart-container',
      hint: 'Click on a blue and square point to focus the item in the editor.',
      hintPosition: 'middle-middle',
    },
  ]);
  const [tabKey, setTabKey] = useState<TabKey|null>(TabKey.GENERAL);
  const [showTimelineModal, setShowTimelineModal] = useState<boolean>(false);
  const [enableColorBlindness, setColorBlindness] = useState<boolean>(false);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [highlightSequence, setHighlightSequence] = useState<number>(-1);

  const onUpdateMetrics = (newMetrics) => {
    setMetrics(newMetrics);
  };

  const onHighlightLabel = (labelIndex: number) => {
    setHighlightSequence(labelIndex);
  };

  const updateHints = (index: number) => {
    const newHints = [...hints];

    console.log('HINTS', newHints);

    newHints.splice(index, 1);

    setHints(newHints);
  };

  console.log('UPDATED HINTS', hints);

  return (
    <>
      {metrics && (
        <TimelineModal show={showTimelineModal} handleClose={() => setShowTimelineModal(false)} chartData={{
          data: metrics.sentiments,
          onLabelClicked: onHighlightLabel,
        }} />
      )}

      <Hints
        enabled={metrics !== null && tabKey === TabKey.GENERAL}
        hints={hints}
        onClose={(index) => updateHints(index)}
      />

      <div className="d-flex align-items-center justify-content-between mt-5 mb-3">
        <h3 className="text-muted">Text optimizer</h3>

        <Form.Check
          type="switch"
          id="switch-accessibility"
          onChange={() => setColorBlindness(!enableColorBlindness)}
          value={enableColorBlindness ? 'checked' : ''}
          label="Enable color blindness helper"
        />
      </div>

      <main className={enableColorBlindness ? 'enable-color-blindness' : ''}>
        <Row className="bg-white p-3">
          <Col>
            <Editor
              onUpdateMetrics={onUpdateMetrics}
              highlight={highlightSequence}
            />
          </Col>
          <Col>
            <Tabs defaultActiveKey={TabKey.GENERAL} activeKey={tabKey} onSelect={(k) => setTabKey(k as TabKey)}>
              <Tab eventKey={TabKey.GENERAL} title={TabKey.GENERAL}>
                {!metrics && (
                  <EmptyDataAlert />
                )}

                <div className="p-3">
                  {metrics && (
                    <>
                      <Button className="float-right" variant="link" size="sm" onClick={() => setShowTimelineModal(true)}>
                        Increase chart size
                        <FontAwesomeIcon className="ml-1" icon={faExpandAlt} />
                      </Button>

                      <TimelineChart
                        data={metrics.sentiments}
                        onLabelClicked={onHighlightLabel}
                      />
                      <Row className="text-center mt-5">
                        <Col className="col-separator">
                          <h3 className="text-muted">{metrics.countWords}</h3>
                          Words
                        </Col>
                        <Col>
                          <h3 className="text-muted">{metrics.neutralityScore.toLocaleString(undefined, {maximumFractionDigits:2})}</h3>
                          Neutrality score
                        </Col>
                        <Col className="col-separator">
                          <h3 className="text-muted">{metrics.varianceScore.toLocaleString(undefined, {maximumFractionDigits:2})}</h3>
                          Neutrality variance
                        </Col>
                      </Row>
                    </>
                  )}
                </div>
              </Tab>

              <Tab eventKey={TabKey.LANGUAGES} title={TabKey.LANGUAGES}>
                {!metrics && (
                  <EmptyDataAlert />
                )}
                {metrics && (
                  <LanguagesBarChart data={metrics.languages} />
                )}
              </Tab>
            </Tabs>
          </Col>
        </Row>
      </main>
    </>
  );
};

export default GridContainer;

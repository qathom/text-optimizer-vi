import React, { FunctionComponent, ReactNode, useState } from 'react';
import {
  Row,
  Col,
  Tabs,
  Tab,
  Button,
  Form,
  OverlayTrigger,
  Tooltip,
} from 'react-bootstrap';
import { Steps } from 'intro.js-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExpandAlt, faGrimace, faQuestionCircle, faSmile } from '@fortawesome/free-solid-svg-icons'
import { Metrics } from '../../types';
import Editor from '../components/Editor';
import TimelineChart from '../components/TimelineChart';
import TimelineModal from '../components/TimelineModal';
import LanguagesBarChart from '../components/LanguagesBarChart';
import EmptyDataAlert from '../components/EmptyDataAlert';
import isTextNeutral from '../utils/text';

type Props = {
  children?: ReactNode;
};

enum TabKey {
  GENERAL = 'General',
  LANGUAGES = 'Languages',
}

const GridContainer: FunctionComponent<Props> = () => {
  const [showGuide, setShowGuide] = useState<boolean>(true);
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

  
  const steps = [
    {
      element: '.timeline-chart-container',
      intro: 'The sentiment score is negative when it is below 0 and positive when the score is above 0. The value 0 represents a perfect neutrality score.',
      position: 'top',
    },
    {
      element: '.timeline-chart-container',
      intro: 'Click on a square point to focus the item in the editor.',
      position: 'left',
    },
    {
      element: '.timeline-chart-container',
      intro: 'Scroll in the chart to zoom in or zoom out.',
      position: 'top',
    },
    {
      element: '.neutrality-score',
      intro: 'The overall neutrality score is displayed here.',
      position: 'top',
    },
    {
      element: '.neutrality-variance',
      intro: 'The variance measures how far a set of numbers is spread out from their average value.',
      position: 'top',
    },
    {
      element: '[data-rb-event-key="Languages"]',
      intro: 'Let\'s move to the language tab',
      position: 'top',
    },
    {
      element: '.languages-tab',
      intro: 'Here we detect the languages. You can identify words used in different languages.',
      position: 'top',
    },
    {
      element: '.custom-switch',
      intro: 'Finally, you might want to enable coloring for colorblindness',
      position: 'top',
    },
  ];

  const textIsNeutral = isTextNeutral(metrics?.neutralityScore ?? 0);

  const onStepChange = (nextStepIndex: number) => {
    if (nextStepIndex >= 5) {
      if (tabKey !== TabKey.LANGUAGES) {
        setTabKey(TabKey.LANGUAGES);
      }

      return;
    }

    if (TabKey.GENERAL !== tabKey) {
      setTabKey(TabKey.GENERAL);
    }
  };

  const onExit = () => {
    setShowGuide(false);
    setTabKey(TabKey.GENERAL);
  };

  return (
    <>
      {metrics && (
        <TimelineModal
          show={showTimelineModal}
          colorBlindness={enableColorBlindness}
          handleClose={() => setShowTimelineModal(false)} chartData={{
          data: metrics.sentiments,
          onLabelClicked: onHighlightLabel,
        }} />
      )}

      <Steps
        enabled={metrics !== null && showGuide}
        steps={steps}
        initialStep={0}
        onExit={onExit}
        onBeforeChange={onStepChange}
      />

      <h3 className="mt-5 mb-3 text-muted">
        Compose neutral text easily
      </h3>

      <main className={enableColorBlindness ? 'enable-color-blindness' : ''}>
        <div className="d-flex align-items-center justify-content-between">
          <OverlayTrigger
            key="overlay-help"
            placement="top"
            overlay={
              <Tooltip id="tooltip-overlay-help">
                {metrics === null && (
                  <>Start by writing some text below!</>
                )}
                {metrics !== null && (
                  <>Follow our guide!</>
                )}
              </Tooltip>
            }
          >
            <Button variant="light" disabled={metrics === null} onClick={() => setShowGuide(true)}>
              <FontAwesomeIcon icon={faQuestionCircle} onClick={() => setShowGuide(true)} />
              <span className="ml-3">Help</span>
            </Button>
          </OverlayTrigger>

          <Form.Check
            type="switch"
            id="switch-accessibility"
            onChange={() => setColorBlindness(!enableColorBlindness)}
            value={enableColorBlindness ? 'checked' : ''}
            label="Enable coloring for colorblindness"
          />
        </div>

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
                        colorBlindness={enableColorBlindness}
                        data={metrics.sentiments}
                        onLabelClicked={onHighlightLabel}
                      />
                      <Row className="text-center mt-5">
                        <Col className="col-separator">
                          <h3 className="text-muted">{metrics.countWords}</h3>
                          Words
                        </Col>
                        <Col className="neutrality-score col-separator">
                          <h3 className="text-muted">
                            {metrics.neutralityScore}
                            <FontAwesomeIcon className={textIsNeutral ? 'ml-2 icon-success' : 'icon-warning'} icon={textIsNeutral ? faSmile : faGrimace } />
                          </h3>
                          Neutrality score
                        </Col>
                        <Col className="neutrality-variance">
                          <h3 className="text-muted">{metrics.varianceScore}</h3>
                          Neutrality variance
                        </Col>
                      </Row>
                    </>
                  )}
                </div>
              </Tab>

              <Tab className="languages-tab" eventKey={TabKey.LANGUAGES} title={TabKey.LANGUAGES}>
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

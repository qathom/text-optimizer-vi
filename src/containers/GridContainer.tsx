import React, { FunctionComponent, ReactNode, useState } from 'react';
import {
  Row,
  Col,
  Tabs,
  Tab,
  Table,
  Button,
  ProgressBar,
  Form,
} from 'react-bootstrap';
import { v4 as uuidv4 } from 'uuid';
import { Metrics } from '../../types';
import Editor from '../components/Editor';
import TimelineChart from '../components/TimelineChart';
import { Hints } from 'intro.js-react';

type Props = {
  children: ReactNode;
};

const progressBarTypes = ['success', 'info', 'warning', 'danger'];

const GridContainer: FunctionComponent<Props> = () => {
  const [enableColorBlindness, setColorBlindness] = useState<boolean>(false);
  const [showHints, setShowHints] = useState<boolean>(true);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [highlightSequence, setHighlightSequence] = useState<number>(-1);

  const onUpdateMetrics = (newMetrics) => {
    setMetrics(newMetrics);
  };

  const onHighlightLabel = (labelIndex: number) => {
    setHighlightSequence(labelIndex);
  };

  const hints = [
    {
      element: '.timeline-chart-container',
      hint: 'Click on a blue and square point to focus the item in the editor.',
      hintPosition: 'middle-middle',
    },
  ];

  return (
    <>
      <Hints
        enabled={metrics !== null && showHints}
        hints={hints}
        onClose={() => setShowHints(false)}
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
            <Tabs defaultActiveKey="general">
              <Tab eventKey="general" title="General">
                <div className="p-3">
                  {metrics && (
                    <>
                      <TimelineChart
                        data={metrics.sentiments}
                        onLabelClicked={onHighlightLabel}
                      />

                      <Row className="text-center mt-5">
                        <Col className="col-separator">
                          <h3 className="text-muted">{metrics.countCharacters}</h3>
                          Chars
                        </Col>
                        <Col className="col-separator">
                          <h3 className="text-muted">{metrics.countWords}</h3>
                          Words
                        </Col>
                        <Col>
                          <h3 className="text-muted">{metrics.neutralityScore}</h3>
                          Neutrality score
                        </Col>
                      </Row>
                    </>
                  )}
                </div>
              </Tab>
              <Tab eventKey="raw" title="Raw">
                {metrics && (
                  <>
                    <Button variant="primary" className="float-right" size="sm">
                      Download
                    </Button>
                    <Table size="sm">
                      <thead>
                        <tr>
                          <th># sentence</th>
                          <th>Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {metrics.sentiments.map((sentiment, i) => (
                          <tr key={uuidv4()}>
                            <td>{i + 1}</td>
                            <td>{sentiment}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </>
                )}
              </Tab>
              <Tab eventKey="languages" title="Languages">
                {metrics && (
                  <>
                    <ProgressBar>
                      {Array.from(metrics.languages).map(
                        ([lang, percentage], idx) => (
                          <ProgressBar
                            variant={progressBarTypes[idx]}
                            key={lang}
                            now={percentage * 100}
                            label={lang}
                          />
                        )
                      )}
                    </ProgressBar>
                  </>
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

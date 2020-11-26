import React, { FunctionComponent, ReactNode, useState } from "react";
import {
  Row,
  Col,
  Tabs,
  Tab,
  Table,
  Button,
  Alert,
  ProgressBar,
} from "react-bootstrap";
import { Metrics } from "../../types";
import Editor from "../components/Editor";
import TimelineChart from "../components/TimelineChart";

type Props = {
  children: ReactNode;
};

const GridContainer: FunctionComponent<Props> = () => {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [highlightSequence, setHighlightSequence] = useState<number>(-1);

  const onUpdateMetrics = (newMetrics) => {
    setMetrics(newMetrics);
  };

  const onHighlightLabel = (labelIndex: number) => {
    setHighlightSequence(labelIndex);
  };

  return (
    <Row className="bg-white p-3 mt-5">
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
                  <ProgressBar>
                    <ProgressBar variant="success" now={35} key={1} />
                    <ProgressBar variant="warning" now={20} key={2} />
                    <ProgressBar variant="danger" now={10} key={3} />
                  </ProgressBar>

                  <div>Chars: {metrics.countCharacters}</div>
                  <div>Words: {metrics.countWords}</div>
                  <div>Neutrality: {metrics.neutralityScore}</div>

                  <Alert
                    variant={
                      metrics.neutralityScore >= -0.1 &&
                      metrics.neutralityScore <= 0.1
                        ? "success"
                        : "danger"
                    }
                  >
                    Neutrality
                  </Alert>

                  <TimelineChart
                    data={metrics.sentiments}
                    onLabelClicked={onHighlightLabel}
                  />
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
                      <tr key={i}>
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
                  {Array.from(metrics.languages).map(([lang, percentage]) => (
                      <ProgressBar variant="success" key={lang} now={percentage}  />
                  ))}
                </ProgressBar>
              </>
              )}
          </Tab>
        </Tabs>
      </Col>
    </Row>
  );
};

export default GridContainer;

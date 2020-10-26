import React, { ChangeEvent, FunctionComponent, ReactNode, useEffect, useState } from 'react';
import { Row, Col, Form, Tabs, Tab, Table } from 'react-bootstrap';
import TimelineChart from '../components/TimelineChart';
const natural = require('natural');

const Analyzer = natural.SentimentAnalyzer;
const stemmer = natural.PorterStemmer;
const wordTokenizer = new natural.WordTokenizer();
const sentenceTokenizer = new natural.SentenceTokenizer();
const analyzer = new Analyzer('English', stemmer, 'afinn');

export type Metrics = {
  countWords: number,
  countCharacters: number,
  sentiments: number[],
};

type Props = {
  children: ReactNode;
}

const GridContainer: FunctionComponent<Props> = () => {
  const [content, setContent] = useState<string>('First sentence is cool! Second sentence is sad. :(');
  const [metrics, setMetrics] = useState<Metrics|null>(null);
  const [lastEdit, setLastEdit] = useState<Date|null>(null);
  const [timeout, setEditTimeout] = useState<NodeJS.Timeout|null>(null);

  const computeMetrics = () => {
    const wordTokens: string[] = wordTokenizer.tokenize(content);
    const sentenceTokens: string[] = sentenceTokenizer.tokenize(content);

    setMetrics({
      countWords: wordTokens.length,
      countCharacters: content.length,
      sentiments: sentenceTokens.map((s) => analyzer.getSentiment(wordTokenizer.tokenize(s))),
    })
  };

  useEffect(() => {
    // Delete previous timeout
    if (timeout) {
      clearTimeout(timeout);
      setEditTimeout(null);
    }

    const newTimeout = setTimeout(() => {
      const lastEditTime = lastEdit ? lastEdit.getTime() : 2000;
      const diff = new Date().getTime() - lastEditTime;
      const threshold = 500;

      if (lastEdit && diff > threshold) {
        computeMetrics();
      }
      
      if (timeout) {
        clearTimeout(timeout);
      }
      setEditTimeout(null);
    }, 2000);

    setEditTimeout(newTimeout)

    setLastEdit(new Date());
  }, [content]);

  return (
    <Row className="bg-white p-3 mt-5">
      <Col>
        <Form.Group controlId="exampleForm.ControlTextarea1">
          <Form.Control
            as="textarea"
            placeholder="Start writing your content here!"
            onChange={(event: ChangeEvent<HTMLInputElement>) => setContent(event.target.value)}
            value={content}
            rows={10}
          />

          {timeout && (
            <Form.Text className="text-muted">
              Metrics are calculated once you stop writing
            </Form.Text>
          )}
        </Form.Group>

      </Col>
      <Col>
        <Tabs defaultActiveKey="general">
          <Tab eventKey="general" title="General">
            <div className="p-3">
              {metrics && (
                <>
                  <div>Chars: {metrics.countCharacters}</div>
                  <div>Words: {metrics.countWords}</div>
                  <div>Sentiment per sentence:</div>
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

                  <TimelineChart data={metrics.sentiments} />
                </>
              )}
            </div>
          </Tab>
        </Tabs>
      </Col>
    </Row>
  );
}

export default GridContainer;

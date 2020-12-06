import React, { FunctionComponent, useEffect, useState } from 'react';
import { Form } from 'react-bootstrap';
import natural from 'natural';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import Highlight from '@ckeditor/ckeditor5-highlight/src/highlight';
import { scrollViewportToShowTarget } from '@ckeditor/ckeditor5-utils/src/dom/scroll';
import franc from 'franc';
import { Metrics } from '../../types';
import round from '../utils/round';
import isTextNeutral from '../utils/text';

const Analyzer = natural.SentimentAnalyzer;
const stemmer = natural.PorterStemmer;
const wordTokenizer = new natural.WordTokenizer();
const sentenceTokenizer = new natural.TreebankWordTokenizer();
const analyzer = new Analyzer('English', stemmer, 'afinn');

type Props = {
  onUpdateMetrics: (metrics: Metrics) => void;
  highlight: number;
};

const Editor: FunctionComponent<Props> = ({ onUpdateMetrics, highlight }) => {
  const [editor, setEditor] = useState<any>(null);
  const [selectNode, setSelectNode] = useState<number>(highlight);
  const [content, setContent] = useState<string>('');
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [timeout, setEditTimeout] = useState<NodeJS.Timeout | null>(null);
  const [lastEdit, setLastEdit] = useState<Date | null>(null);
  const [ready, setReady] = useState<boolean>(false);
  const [pasteDate, setPasteDate] = useState<Date|null>(null);

  const getPlainText = (formattedText: string) => {
    const div: HTMLElement = document.createElement('div');
    div.innerHTML = formattedText;
    return div.innerText;
  };

  const extractParagraphs = (): string[] => {
    const paragraphs: string[] = [];
    const matches = [...content.matchAll(/p>(.*?)<\/p/g)];
    const exclude: string[] = ['&nbsp;'];

    matches.forEach((match) => {
      const sentence = getPlainText((match[1] ?? '')).trim();
      if (sentence.length > 0 && !exclude.includes(sentence)) {
        paragraphs.push(sentence);
      }
    });

    return paragraphs;
  };

  const computeMetrics = () => {
    const paragraphTokens: string[] = extractParagraphs();
    const plainContent = getPlainText(content);

    const wordTokens: string[] = wordTokenizer.tokenize(plainContent);
    const sentiments: number[] = paragraphTokens.map(
      (s) => round(analyzer.getSentiment(wordTokenizer.tokenize(s)) || 0)
    );
    const languages = new Map<string, number[]>([
      ['eng', []],
      ['deu', []],
      ['fra', []],
      ['ita', []],
    ]);

    paragraphTokens.forEach((paragraph) => {
      [...languages.keys()].forEach((key) => {
        languages.set(key, [0]);
      });

      // sentenceTokens.For each sentence
      const sentences: string[] = sentenceTokenizer.tokenize(paragraph);
      let consirederSentencesNumber = sentences.length;

      sentences.forEach((sentence) => {
        const lang = franc(sentence, {
          minLength: 5,
          only: ['fra', 'eng', 'deu', 'ita'],
        });

        console.log(`lang: ${lang}`);

        if (languages.has(lang)) {
          const currentArray = languages.get(lang) ?? [];
          currentArray[currentArray.length-1 ?? -1] += 1;
        } else {
          // undefined returned
          consirederSentencesNumber -= 1;
        }
      });

      /*
      // [!!] Generator usage
      for (const [, nb] of languages) {
        console.log('AAA', nb);
        nb[nb.length-1] = nb[nb.length-1] / consirederSentencesNumber;
      }
      */

      [...languages.keys()].forEach((lang) => {
        const values = [...languages.get(lang) ?? []];
        values[values.length - 1] = values[values.length - 1] / consirederSentencesNumber;
        languages.set(lang, values);
      });
    });

    const mean = sentiments.reduce( ( firstSentiment, secondsentiment ) => firstSentiment+ secondsentiment, 0 ) / sentiments.length;
    const meanTot = sentiments.map((sentiment) => (sentiment - mean) ** 2);
    const variance = meanTot.reduce((val, val2) => val+val2,0) / sentiments.length ?? 0;

    setMetrics({
      countWords: wordTokens.length,
      varianceScore: round(variance),
      sentiments,
      neutralityScore: round(sentiments.reduce((acc, sentiment) => acc + sentiment, 0) / sentiments.length ?? 0),
      languages, // TODO  alex
    });
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
        // onUpdate(getPlainText(content));
        computeMetrics();
      }

      if (timeout) {
        clearTimeout(timeout);
      }
      setEditTimeout(null);
    }, 1000);

    setEditTimeout(newTimeout);

    setLastEdit(new Date());
  }, [content]);

  useEffect(() => {
    if (!metrics) {
      return;
    }

    onUpdateMetrics(metrics);
  }, [metrics]);

  const setNodeSelection = () => {
    // Triggers model change (https://ckeditor.com/docs/ckeditor5/latest/framework/guides/deep-dive/ui/focus-tracking.html)
    editor.editing.view.focus();

    editor.model.change((writer) => {
      const root = editor.model.document.getRoot();
      const child = root.getChild(highlight);
      const start = writer.createPositionAt(child, 0);
      const end = writer.createPositionAt(child, 'end');
      const range = writer.createRange(start, end);

      writer.setSelection(range);

      setSelectNode(highlight);

      const viewRange = editor.editing.mapper.toViewRange(range);

      scrollViewportToShowTarget({
        target: editor.editing.view.domConverter.viewRangeToDom(viewRange),
        viewportOffset: 0,
      });
    });
  };

  useEffect(() => {
    if (selectNode === highlight) {
      return;
    }

    setNodeSelection();
  }, [highlight]);

  const highlightNode = (localEditor, writer, node, color: string, startPos: number|string = 0, startEnd: number|string = 'end') => {
    const start = writer.createPositionAt(node, startPos);
    const end = writer.createPositionAt(node, startEnd);

    writer.setSelection(writer.createRange(start, end));

    localEditor.execute('highlight', {
      value: `${color}Marker`,
    });
  };

  const removeHighlight = (localEditor, writer, node, startPos: number|string = 0, startEnd: number|string = 'end') => {
    const start = writer.createPositionAt(node, startPos);
    const end = writer.createPositionAt(node, startEnd);

    writer.setSelection(writer.createRange(start, end));

    localEditor.execute('highlight');
  };

  const applyHighlight = (localEditor, localWriter, providedIndex: number|null = null) => {
    const root = localEditor.model.document.getRoot();
    const currentPosition = localEditor.model.document.selection.getFirstPosition();

    let index = providedIndex || 0;

    while (index !== null) {
      const child = root.getChild(index);

      if (!child) {
        break;
      }

      const text = [...child?.getChildren()].reduce((acc, item) => acc + item.data, '');
      const words = wordTokenizer.tokenize(text ?? '');

      words.forEach((word, i) => {
        const wordScore = analyzer.getSentiment([word]) ?? 0;
        const start = text.indexOf(word);
        const end = start + word.length;

        if (isTextNeutral(wordScore)) {
          // Reset
          removeHighlight(localEditor, localWriter, child, start, end);
          return;
        }
  
        // Apply color
        highlightNode(localEditor, localWriter, child, wordScore < 0 ? 'pink' : 'green', start, end);
      });

      index += 1;

      if (providedIndex !== null) {
        break;
      }
    }

    // Re-apply current cursor position
    localWriter.setSelection(currentPosition, 'end');
  };

  const applyHighlightToAll = () => {
    // On change will be triggered
    setPasteDate(new Date());
  }

  const onChange = (_event, localEditor) => {
    localEditor.model.change((writer) => {
      if (pasteDate) {
        const isPasteAction = new Date().getTime() - pasteDate.getTime() < 500;

        if (isPasteAction) {
          applyHighlight(localEditor, writer);
          return;
        }
      }

      const currentPos = localEditor.model.document.selection.getFirstPosition();

      applyHighlight(localEditor, writer, currentPos.path[0])
    });

    const data = editor.getData();

    setContent(data);
  };

  useEffect(() => {
    if (editor) {
      setReady(true);
    }

    if (editor && !ready) {
      editor.editing.view.document.on('clipboardInput', applyHighlightToAll);
    }
  }, [editor]);

  return (
    <Form.Group controlId="editor">
      <CKEditor
        editor={ClassicEditor}
        onReady={(ed) => setEditor(ed)}
        config={{
          plugins: [Essentials, Bold, Italic, Paragraph, Heading, Highlight],
          toolbar: ['heading', '|', 'bold', 'italic'],
          placeholder: 'Write your text',
        }}
        data={content}
        onChange={onChange}
      />

      {timeout && (
        <Form.Text className="text-muted">
          Metrics are calculated once you stop writing
        </Form.Text>
      )}
    </Form.Group>
  );
};

export default Editor;

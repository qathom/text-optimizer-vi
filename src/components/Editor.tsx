import React, { FunctionComponent, useEffect, useState } from "react";
import { Form } from "react-bootstrap";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-editor-classic/src/classiceditor";
import Essentials from "@ckeditor/ckeditor5-essentials/src/essentials";
import Bold from "@ckeditor/ckeditor5-basic-styles/src/bold";
import Italic from "@ckeditor/ckeditor5-basic-styles/src/italic";
import Paragraph from "@ckeditor/ckeditor5-paragraph/src/paragraph";
import Heading from "@ckeditor/ckeditor5-heading/src/heading";
import Highlight from "@ckeditor/ckeditor5-highlight/src/highlight";
import { scrollViewportToShowTarget } from "@ckeditor/ckeditor5-utils/src/dom/scroll";
import { Metrics } from "../../types";

// naturalJs
const natural = require("natural");
const Analyzer = natural.SentimentAnalyzer;
const stemmer = natural.PorterStemmer;
const wordTokenizer = new natural.WordTokenizer();
const sentenceTokenizer = new natural.SentenceTokenizer();
const analyzer = new Analyzer("English", stemmer, "afinn");

var franc = require("franc");

type Props = {
  onUpdateMetrics: (metrics: Metrics) => void;
  highlight: number;
};

const Editor: FunctionComponent<Props> = ({ onUpdateMetrics, highlight }) => {
  const [editor, setEditor] = useState<any>(null);
  const [selectNode, setSelectNode] = useState<number>(highlight);
  const [content, setContent] = useState<string>("");
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [timeout, setEditTimeout] = useState<NodeJS.Timeout | null>(null);
  const [lastEdit, setLastEdit] = useState<Date | null>(null);

  const getPlainText = (formattedText: string) => {
    const div: HTMLElement = document.createElement("div");
    div.innerHTML = formattedText;
    return div.innerText;
  };

  const extractParagraphs = (): string[] => {
    const paragraphs: string[] = [];
    const matches = [...content.matchAll(/>(.*?)</g)];
    const exclude: string[] = ["&nbsp;"];

    matches.forEach((match) => {
      const sentence = match[1];
      if (
        typeof sentence === "string" &&
        sentence.length > 0 &&
        !exclude.includes(sentence)
      ) {
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
      (s) => analyzer.getSentiment(wordTokenizer.tokenize(s)) || 0
    );
    var languages: Map<string, number[]> = new Map([
      ["eng", []],
      ["deu", []],
      ["fra", []],
      ["ita", []],
    ]);
    console.log(languages);
    let analyzedWords = paragraphTokens.length;
    paragraphTokens.forEach((paragraph) => {
      languages.get("eng")?.push(0);
      languages.get("deu")?.push(0);
      languages.get("fra")?.push(0);
      languages.get("ita")?.push(0);
      console.log(paragraph);
      //sentenceTokens.For each sentence
      const sentences: string[] = sentenceTokenizer.tokenize(paragraph);
      sentences.forEach((sentence) => {
        const lang = franc(sentence, {
          minLength: 5,
          only: ["fra", "eng", "deu", "ita"],
        });
        console.log("lang:" + lang);

        if (languages.has(lang)) {
          const currentArray = languages.get(lang) ?? [];
          currentArray[currentArray.length-1 ?? -1] += 1;
        } else {
          // undefined returned
          analyzedWords--;
        }
      });
      for (let [lang, nb] of languages) {
        nb[nb.length-1] = nb[nb.length-1] / analyzedWords;
      }
    });


    setMetrics({
      countWords: wordTokens.length,
      countCharacters: plainContent.length,
      sentiments,
      neutralityScore:
        sentiments.reduce((acc, sentiment) => acc + sentiment, 0) /
        sentiments.length,
      languages: languages, //TODO  alex
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
    console.log("SET NODE SELECTION");

    // Triggers model change (https://ckeditor.com/docs/ckeditor5/latest/framework/guides/deep-dive/ui/focus-tracking.html)
    editor?.editing?.view?.focus();

    editor.model.change((writer) => {
      const root = editor.model.document.getRoot();
      const child = root.getChild(highlight);
      const start = writer.createPositionAt(child, 0);
      const end = writer.createPositionAt(child, "end");
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

  const findActiveNode = (editor, currentPos) => {
    const root = editor.model.document.getRoot();
    const currentNode = root.getChild(currentPos.path[0]);
    return currentNode;
  };

  const highlightNode = (editor, writer, node, color: string) => {
    const start = writer.createPositionAt(node, 0);
    const end = writer.createPositionAt(node, "end");

    writer.setSelection(writer.createRange(start, end));

    editor.execute("highlight", {
      value: `${color}Marker`,
    });
  };

  const removeHighlight = (editor, writer, node) => {
    const start = writer.createPositionAt(node, 0);
    const end = writer.createPositionAt(node, "end");

    writer.setSelection(writer.createRange(start, end));

    editor.execute("highlight");
  };

  const onChange = (_event, editor) => {
    editor.model.change((writer) => {
      const currentPosition = editor.model.document.selection.getFirstPosition();
      const node = findActiveNode(editor, currentPosition);
      const textNode = node?.getChildren()?.next()?.value;
      const text = textNode?.data;

      if (!text) {
        return;
      }

      const res = analyzer.getSentiment(wordTokenizer.tokenize(text));

      const isNegative = res < -0.2;
      const isPositive = res > 0.2;

      // DEBUG
      // console.log(textNode, '=>', res);

      if (isNegative || isPositive) {
        highlightNode(editor, writer, node, isPositive ? "green" : "pink");
      } else {
        removeHighlight(editor, writer, node);
      }

      // Re-apply current cursor position
      writer.setSelection(currentPosition, "end");
    });

    const data = editor.getData();
    //console.log(data);
    setContent(data);
  };

  return (
    <Form.Group controlId="editor">
      <CKEditor
        editor={ClassicEditor}
        onReady={(ed) => setEditor(ed)}
        config={{
          plugins: [Essentials, Bold, Italic, Paragraph, Heading, Highlight],
          toolbar: ["heading", "|", "bold", "italic"],
          placeholder: "Write your text",
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

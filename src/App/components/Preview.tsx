import fs from "fs";
import type CSS from "csstype";
import classnames from "classnames";
import _ from "lodash";
import { toJS } from "mobx";
import { useObserver } from "mobx-react";
import React from "react";
import { Flex, Box } from "reflexbox";
import styled from "styled-components";
import { BackgroundSettings } from "../../../main/models/animationSettings.model";
import { TEXT_LOCATION } from "../constants";
import { useStores } from "../store";
import AnimatedVisibility from "./AnimatedVisibility";
import { BackgroundEditor, FontEditor, SpeechBubbleEditor } from "./Editors";
import TextLocationToggle from "./TextLocationToggle";

const PREVIEW_WIDTH = "720px";
const PREVIEW_HEIGHT = "480px";

const Editable = styled(Flex)`
  position: relative;
`;

const Background = styled(Editable)`
  border: 1px solid grey;
  overflow: hidden;
  background-size: cover;
  transform: scale(1);
  width: ${PREVIEW_WIDTH};
  height: ${PREVIEW_HEIGHT};
`;

const PreviewVideo = styled.video.attrs({
  loop: true,
  autoPlay: true,
  muted: true,
  width: PREVIEW_WIDTH,
  height: PREVIEW_HEIGHT,
})`
  position: absolute;
  z-index: -2;
  object-fit: cover;
`;

const Verses = styled(Box).attrs({
  mt: "175px",
})`
  &.subtitle {
    position: absolute;
    width: 100%;
    bottom: 35px;
  }
`;

const Verse = styled.div`
  position: relative;
  line-height: 2;
  letter-spacing: 0.05em;
  margin: 0px 46px;
  padding: 15px 10px;
  &.hide {
    display: none;
  }
`;

const SpeechBubbleBackground = styled(Box)`
  z-index: -1;
  border-radius: 10px;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
`;

const PreviewWord = styled.div`
  padding: 0 5px;
  margin: 0 -5px;
  display: inline-block;
  ${(prop: { isHighlighted: boolean; highlightColor: string }): string => {
    return `background-color: ${prop.isHighlighted ? prop.highlightColor || "transparent" : "transparent"};`;
  }}
`;

const HIGHLIGHT_VERSE_INDEX = 0;
const HIGHLIGHT_WORD_INDEXES = [0, 1, 2];

const getImageSrc = _.memoize((file: string): string => {
  if (!file) {
    return "";
  }
  try {
    const ext: string = file.split(".").pop() || "";
    if (["png", "jpg", "jpeg", "gif"].includes(ext.toLowerCase())) {
      const img = fs.readFileSync(file).toString("base64");
      return `url(data:image/${ext};base64,${img})`;
    }
  } catch (err) {
    console.log(`Failed to load image from '${file}'`);
  }
  return "";
});

const PreviewVerse = (prop: { verse: string; highlightVerse: boolean; highlightColor: string }): JSX.Element => {
  return (
    <>
      {prop.verse.split(" ").map((word, index) => {
        const isHighlighted = prop.highlightVerse && HIGHLIGHT_WORD_INDEXES.includes(index);
        return (
          <React.Fragment key={index}>
            <PreviewWord highlightColor={prop.highlightColor} isHighlighted={isHighlighted}>
              {word}
            </PreviewWord>
            &nbsp;
          </React.Fragment>
        );
      })}
    </>
  );
};

const getViewBlob = (background: BackgroundSettings): string => {
  if (!background.file) {
    return "";
  }
  const URL = window.URL || window.webkitURL;
  let video = null;
  try {
    video = fs.readFileSync(background.file);
    const fileURL = URL.createObjectURL(new Blob([video], { type: "video/mp4" }));
    return fileURL;
  } catch (err) {
    return "";
  }
};

const Preview = (): JSX.Element => {
  const { appState } = useStores();
  return useObserver(() => {
    const firstChapter = _.get(appState, ["projects", "firstSelectedChapter"]);
    const { verses, background, speechBubble, text, textLocation } = appState;
    const styleHeading: CSS.Properties = {
      color: text.color || "#CCC",
      fontFamily: text.fontFamily || "Arial",
      fontSize: `${text.fontSize}pt` || "20px",
      fontWeight: "bold",
      fontStyle: text.italic ? "italic" : undefined,
    };

    const styleVerse: CSS.Properties = {
      color: text.color || "#CCC",
      fontFamily: text.fontFamily || "Arial",
      fontSize: `${text.fontSize}pt` || "20px",
      fontWeight: text.bold ? "bold" : undefined,
      fontStyle: text.italic ? "italic" : undefined,
    };

    const styles = {
      background: {
        backgroundColor: background.color || "transparent",
        backgroundImage: getImageSrc(toJS(appState.background.file)),
      },
      speechBubble: {
        opacity: speechBubble.opacity,
        backgroundColor: speechBubble.color || "transparent",
      },
    };

    const file: string = getViewBlob(background);
    const versesClassName: string = classnames({
      subtitle: textLocation.location === TEXT_LOCATION.subtitle,
    });
    const getVerseClassName = (index: number): string =>
      classnames({
        hide: textLocation.location === TEXT_LOCATION.subtitle && index !== HIGHLIGHT_VERSE_INDEX,
      });

    return (
      <AnimatedVisibility visible={!!firstChapter}>
        <Background className="preview" style={styles.background}>
          <BackgroundEditor />
          {background.type === "video" && <PreviewVideo src={file} id="myVideo" />}
          <Verses className={versesClassName}>
            {verses.map((verse: any, index: number) => (
              <Verse
                key={index}
                className={getVerseClassName(index)}
                style={verse.indexOf("<strong>") > -1 ? styleHeading : styleVerse}
              >
                {index === HIGHLIGHT_VERSE_INDEX && (
                  <React.Fragment>
                    <TextLocationToggle top="calc(50% - 15px)" right="-35px" />
                    <FontEditor mr={2} top="-8px" right="24px" />
                    <SpeechBubbleEditor top="-8px" right="4px" />
                    <SpeechBubbleBackground style={styles.speechBubble} />
                  </React.Fragment>
                )}
                <PreviewVerse
                  verse={verse.replace("<strong>", "").replace("</strong>", "")}
                  highlightVerse={index === HIGHLIGHT_VERSE_INDEX}
                  highlightColor={text.highlightColor}
                />
              </Verse>
            ))}
          </Verses>
        </Background>
      </AnimatedVisibility>
    );
  });
};

export default Preview;

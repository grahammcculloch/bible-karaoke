import React from 'react';
import './Preview.scss';

const HIGHLIGHT_VERSE_INDEX = 0;
const HIGHLIGHT_WORD_INDEX = 3;

const PreviewVerse = ({ verse, highlightVerse, highlightStyle }) => {
  console.log(verse);
  return verse.split(' ').map((word, index) => {
    const isHighlighted = highlightVerse && index === HIGHLIGHT_WORD_INDEX;
    return (
      <React.Fragment key={index}>
        <div
          className={`preview__word${
            isHighlighted ? ' preview__highlight' : ''
          }`}
          style={isHighlighted ? highlightStyle : undefined}
        >
          {word}
        </div>
        &nbsp;
      </React.Fragment>
    );
  });
};

const Preview = ({ verses, background, text, speechBubble }) => {
  const styles = {
    background: {
      backgroundColor: background.color || 'transparent',
      backgroundImage:
        background.type === 'image' ? `url(${background.imageSrc})` : '',
    },
    speechBubble: {
      opacity: speechBubble.opacity,
      backgroundColor: speechBubble.color || 'transparent',
    },
    verse: {
      color: text.color || '#CCC',
      fontFamily: text.fontFamily || 'Arial',
      fontSize: `${text.fontSize}pt` || '20px',
      fontWeight: text.bold ? 'bold' : undefined,
      fontStyle: text.italic ? 'italic' : undefined,
    },
    heading: {
        color: text.color || '#CCC',
        fontFamily: text.fontFamily || 'Arial',
        fontSize: `${text.fontSize}pt` || '20px',
        fontWeight: 'bold',
        fontStyle: text.italic ? 'italic' : undefined,
    },
    highlight: {
      backgroundColor: text.highlightColor || 'transparent',
    },
  };
  let file = "file:"+background.file;
  console.log(verses);
  return (
    <div className='preview' style={styles.background}>
      {background.type === 'video' ? (
        <video
          src={file}
          loop
          autoPlay
          width='720'
          height='480'
          className='preview__video'
          id='myVideo'
        />
      ) : null}
      <div className='preview__verses'>
        {verses.map((verse, index) => (
          <div key={index} className='preview__verse' style={verse.indexOf("<strong>") > -1 ? styles.heading : styles.verse}>
            {index === HIGHLIGHT_VERSE_INDEX ? (
              <div
                className='preview__speech-bubble-bg'
                style={styles.speechBubble}
              />
            ) : null}
            <PreviewVerse
              verse={verse.replace("<strong>", "").replace("</strong>", "")}
              highlightVerse={index === HIGHLIGHT_VERSE_INDEX}
              highlightStyle={styles.highlight}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Preview;
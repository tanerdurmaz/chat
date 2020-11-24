import "./App.css";

import { IEmoji, IMessageEvent } from "./types";
import { IconButton, Tooltip } from "@material-ui/core";
import Picker, { IEmojiData } from "emoji-picker-react";
import React, { useCallback, useEffect, useRef, useState } from "react";

import { Board } from "./components/Board";
import { ChevronLeft } from "@material-ui/icons";
import { IMusicNoteProps } from "./components/MusicNote";
import { Panel } from "./components/Panel";
//@ts-ignore
import drumBeat from "./assets/drumbeat.mp3";
import io from "socket.io-client";
import { v4 as uuidv4 } from "uuid";

const isDebug = false;

const socketURL =
  window.location.hostname === "localhost"
    ? "ws://localhost:8000"
    : "wss://yeeplayer.herokuapp.com";

isDebug && console.log("socket url = ", socketURL);

const socket = io(socketURL, { transports: ["websocket"] });

const generateRandomXY = () => {
  const randomX = Math.random() * window.innerWidth;
  const randomY = Math.random() * window.innerHeight;
  return { x: randomX, y: randomY };
};

function App() {
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [musicNotes, setMusicNotes] = useState<IMusicNoteProps[]>([]);
  const [emojis, setEmojis] = useState<IEmoji[]>([]);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);

  const audio = useRef<HTMLAudioElement>(new Audio(drumBeat));

  const playEmoji = useCallback((type: string) => {
    const { x, y } = generateRandomXY();

    setEmojis((emojis) =>
      emojis.concat({ top: x, left: y, key: uuidv4(), type })
    );
  }, []);

  const playSound = useCallback(() => {
    if (!audio || !audio.current) return;

    const randomX = Math.random() * window.innerWidth;
    const randomY = Math.random() * window.innerHeight;

    setMusicNotes((notes) =>
      notes.concat({ top: randomY, left: randomX, key: uuidv4() })
    );

    audio.current.currentTime = 0;
    audio.current.play();
  }, [audio]);

  const onClickPanelItem = (key: string) => {
    switch (key) {
      case "sound":
        playSound();

        socket.emit("event", {
          key: "sound",
        });
        break;

      case "emoji":
        setIsEmojiPickerOpen(!isEmojiPickerOpen);

        break;
    }
  };

  useEffect(() => {
    function onConnect() {
      isDebug && console.log("connected to socket");
    }

    const onMessageEvent = (message: IMessageEvent) => {
      switch (message.key) {
        case "sound":
          playSound();
          break;
        case "emoji":
          if (message.value) {
            playEmoji(message.value);
          }
      }
    };

    socket.on("connect", onConnect);

    socket.on("event", onMessageEvent);

    return () => {
      socket.off("connect", onConnect);
      socket.off("event", onMessageEvent);
    };
  }, [playEmoji, playSound]);

  const onEmojiClick = (_: MouseEvent, emojiData: IEmojiData) => {
    playEmoji(emojiData.emoji);
    socket.emit("event", {
      key: "emoji",
      value: emojiData.emoji,
    });
  };

  return (
    <div className="app" style={{ minHeight: window.innerHeight - 10 }}>
      <Board
        musicNotes={musicNotes}
        updateNotes={setMusicNotes}
        emojis={emojis}
        updateEmojis={setEmojis}
      />

      <div className="open-panel-button">
        {!isPanelOpen && (
          <Tooltip title="open panel">
            <IconButton
              onClick={() => {
                setIsPanelOpen(true);
              }}
            >
              <ChevronLeft />
            </IconButton>
          </Tooltip>
        )}
      </div>
      <Panel
        onClick={onClickPanelItem}
        isOpen={isPanelOpen}
        onClose={() => {
          setIsPanelOpen(false);
        }}
      />
      {isEmojiPickerOpen && (
        <div className="picker-container">
          <Picker onEmojiClick={onEmojiClick} />
        </div>
      )}
    </div>
  );
}

export default App;

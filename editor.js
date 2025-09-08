import React, { useEffect, useRef, useState } from "react";
import Codemirror from "codemirror";
import "./edit.css";

import "codemirror/lib/codemirror.css";
import "codemirror/theme/dracula.css";
import "codemirror/theme/material.css";
import "codemirror/theme/eclipse.css";
import "codemirror/theme/monokai.css";
import "codemirror/theme/ayu-dark.css";

import "codemirror/mode/javascript/javascript";
import "codemirror/mode/htmlmixed/htmlmixed";
import "codemirror/mode/css/css";
import "codemirror/mode/python/python";
import "codemirror/mode/clike/clike";
import "codemirror/mode/sql/sql";

import "codemirror/addon/edit/closetag";
import "codemirror/addon/edit/closebrackets";

import ACTIONS from "../Actions";

const Editor = ({ socketRef, roomId, onCodeChange, value }) => {
  const textareaRef = useRef(null);
  const codeMirrorInstance = useRef(null);

  const [language, setLanguage] = useState("htmlmixed");
  const [theme, setTheme] = useState("dracula");

  // Initialize CodeMirror
  useEffect(() => {
    if (!codeMirrorInstance.current && textareaRef.current) {
      codeMirrorInstance.current = Codemirror.fromTextArea(textareaRef.current, {
        mode: language,
        theme,
        autoCloseTags: true,
        autoCloseBrackets: true,
        lineNumbers: true,
        tabSize: 2,
        indentUnit: 2,
        lineWrapping: true,
      });

      // Local change handler
      codeMirrorInstance.current.on("change", (instance, changes) => {
        const { origin } = changes;
        const code = instance.getValue();

        if (origin !== "setValue" && socketRef?.current) {
          socketRef.current.emit(ACTIONS.CODE_CHANGE, {
            roomId,
            code,
          });
        }

        if (typeof onCodeChange === "function") {
          onCodeChange(code);
        }
      });
    }
  }, []);

  // External value -> update editor
  useEffect(() => {
    if (codeMirrorInstance.current && value !== undefined) {
      const currentCode = codeMirrorInstance.current.getValue();
      if (currentCode !== value) {
        codeMirrorInstance.current.setValue(value);
      }
    }
  }, [value]);

  // Listen for remote code + language + theme
  useEffect(() => {
    if (socketRef?.current) {
      const handleCodeChange = ({ code }) => {
        if (code != null && codeMirrorInstance.current) {
          const currentCode = codeMirrorInstance.current.getValue();
          if (currentCode !== code) {
            codeMirrorInstance.current.setValue(code);
          }
        }
      };

      const handleLangChange = ({ language }) => {
        if (language) {
          setLanguage(language);
          codeMirrorInstance.current?.setOption("mode", language);
        }
      };

      const handleThemeChange = ({ theme }) => {
        if (theme) {
          setTheme(theme);
          codeMirrorInstance.current?.setOption("theme", theme);
        }
      };

      socketRef.current.on(ACTIONS.CODE_CHANGE, handleCodeChange);
      socketRef.current.on(ACTIONS.LANGUAGE_CHANGE, handleLangChange);
      socketRef.current.on(ACTIONS.THEME_CHANGE, handleThemeChange);

      return () => {
        socketRef.current.off(ACTIONS.CODE_CHANGE, handleCodeChange);
        socketRef.current.off(ACTIONS.LANGUAGE_CHANGE, handleLangChange);
        socketRef.current.off(ACTIONS.THEME_CHANGE, handleThemeChange);
      };
    }
  }, [socketRef]);

  // Language change (local + broadcast)
  useEffect(() => {
    if (codeMirrorInstance.current) {
      codeMirrorInstance.current.setOption("mode", language);
    }
    if (socketRef?.current) {
      socketRef.current.emit(ACTIONS.LANGUAGE_CHANGE, { roomId, language });
    }
  }, [language]);

  // Theme change (local + broadcast)
  useEffect(() => {
    if (codeMirrorInstance.current) {
      codeMirrorInstance.current.setOption("theme", theme);
    }
    if (socketRef?.current) {
      socketRef.current.emit(ACTIONS.THEME_CHANGE, { roomId, theme });
    }
  }, [theme]);

  return (
    <div className="editorWrap">
      <div className="editorControls">
        <div>
          <label>Language:</label>
          <select value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="htmlmixed">HTML</option>
            <option value="javascript">JavaScript</option>
            <option value="css">CSS</option>
            <option value="python">Python</option>
            <option value="text/x-java">Java</option>
            <option value="sql">SQL</option>
          </select>
        </div>

        <div>
          <label>Theme:</label>
          <select value={theme} onChange={(e) => setTheme(e.target.value)}>
            <option value="dracula">Dracula</option>
            <option value="material">Material</option>
            <option value="eclipse">Eclipse</option>
            <option value="monokai">Monokai</option>
            <option value="ayu-dark">Ayu Dark</option>
          </select>
        </div>
      </div>

      <textarea ref={textareaRef} className="hidden-textarea" />
    </div>
  );
};

export default Editor;

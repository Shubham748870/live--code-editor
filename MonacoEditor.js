import React, { useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import ACTIONS from "../Actions";

const MonacoEditor = ({ socketRef, roomId, onCodeChange, value }) => {
  const editorRef = useRef(null);
  const isRemoteUpdate = useRef(false); // 🔑 flag for remote updates

  // Editor mount hone par ref set
  function handleEditorDidMount(editor) {
    editorRef.current = editor;
  }

  // Local typing → emit
  function handleChange(val) {
    if (isRemoteUpdate.current) {
      // ignore changes triggered by remote setValue
      isRemoteUpdate.current = false;
      return;
    }

    if (socketRef?.current) {
      socketRef.current.emit(ACTIONS.CODE_CHANGE, {
        roomId,
        code: val,
      });
    }

    if (typeof onCodeChange === "function") {
      onCodeChange(val);
    }
  }

  // Listen for remote code
  useEffect(() => {
    if (!socketRef?.current) return;

    const handleCodeChange = ({ code }) => {
      if (code != null && editorRef.current) {
        const currentCode = editorRef.current.getValue();
        if (currentCode !== code) {
          isRemoteUpdate.current = true; // mark as remote
          editorRef.current.setValue(code);
        }
      }
    };

    socketRef.current.on(ACTIONS.CODE_CHANGE, handleCodeChange);

    return () => {
      socketRef.current.off(ACTIONS.CODE_CHANGE, handleCodeChange);
    };
  }, [socketRef]);

  // External value (DB se first load)
  useEffect(() => {
    if (editorRef.current && value !== undefined) {
      const current = editorRef.current.getValue();
      if (current !== value) {
        isRemoteUpdate.current = true;
        editorRef.current.setValue(value);
      }
    }
  }, [value]);

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <Editor
        height="100vh"
        defaultLanguage="html"
        theme="vs-dark"
        value={value}
        onMount={handleEditorDidMount}
        onChange={handleChange}
      />
    </div>
  );
};

export default MonacoEditor;

import React, { useMemo } from "react";

const LivePreview = ({ html = "", css = "", js = "" }) => {
  const srcDoc = useMemo(() => {
    return `
      <!doctype html>
      <html>
        <head>
          <style>${css}</style>
        </head>
        <body>
          ${html}
          <script>
            try { ${js} } catch (e) { console.error(e); }
          </script>
        </body>
      </html>
    `;
  }, [html, css, js]);

  return (
    <iframe
      title="Live Preview"
      style={{ width: "100%", height: "100%", border: "0" }}
      sandbox="allow-scripts allow-same-origin"
      srcDoc={srcDoc}
    />
  );
};

export default LivePreview;

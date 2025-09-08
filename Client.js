// src/components/Client.js
import React from "react";


const Client = ({ username }) => {
  return (
    <div className="client">
      <div className="client-avatar">
        {username.charAt(0).toUpperCase()}
      </div>
      <span className="client-name">{username}</span>
    </div>
  );
};

export default Client;
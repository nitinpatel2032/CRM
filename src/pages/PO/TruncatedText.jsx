import React, { useState } from "react";
import { ChevronsRight ,ChevronsLeft } from 'lucide-react';

const TruncatedText = ({ text, limit = 30 }) => {
  const [expanded, setExpanded] = useState(false);

  if (!text) return null;

  const toggleExpanded = () => setExpanded(!expanded);

  return (
    <span>
      {expanded ? text : text.length > limit ? text.slice(0, limit) + "..." : text}
      {text.length > limit && (
        <button
          onClick={toggleExpanded}
          className="text-blue-600 text-xs"
        >
          {expanded ?  <ChevronsLeft className="w-4 h-4"/>: <ChevronsRight className="w-4 h-4"/>}
        </button>
      )}
    </span>
  );
};

export default TruncatedText;

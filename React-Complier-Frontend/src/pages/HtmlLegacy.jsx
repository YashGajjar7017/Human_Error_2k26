import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function HtmlLegacy(){
  const { name } = useParams();
  const [html, setHtml] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchHtml(){
      try {
        const res = await fetch(`/views/${encodeURIComponent(name)}.html`);
        if (!res.ok) throw new Error('Not found');
        const text = await res.text();
        setHtml(text);
      } catch (err) {
        console.error('HtmlLegacy fetch error:', err);
        setError('Page not found');
      }
    }
    fetchHtml();
  }, [name]);

  if (error) return <div style={{padding:20}}> {error} </div>;
  if (!html) return <div style={{padding:20}}> Loading... </div>;

  // Render exact HTML for parity (scripts/styles execute as in original page)
  return <div className="legacy-html" dangerouslySetInnerHTML={{ __html: html }} />;
}

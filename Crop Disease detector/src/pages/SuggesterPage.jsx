import React from 'react';
import { useNavigate } from 'react-router-dom';
import CropSuggester from '../components/CropSuggester';
import { useAgriContext } from '../context/AgriContext';

export default function SuggesterPage() {
  const navigate = useNavigate();
  const { setPendingChatQuery } = useAgriContext();

  const handleAskAgronomistAboutCrop = (query) => {
    setPendingChatQuery(query);
    navigate('/chatbot');
  };

  return (
    <div className="animate-in fade-in duration-300">
      <CropSuggester onAskAgronomistAboutCrop={handleAskAgronomistAboutCrop} />
    </div>
  );
}

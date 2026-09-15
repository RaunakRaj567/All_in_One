import React, { useEffect, useState } from 'react';
import FarmerChatbot from '../components/FarmerChatbot';
import { useAgriContext } from '../context/AgriContext';

export default function ChatbotPage() {
  const { activeScan, pendingChatQuery, setPendingChatQuery } = useAgriContext();
  const [initialQuery, setInitialQuery] = useState('');

  useEffect(() => {
    if (pendingChatQuery) {
      setInitialQuery(pendingChatQuery);
      setPendingChatQuery(''); // consume query after passing
    }
  }, [pendingChatQuery, setPendingChatQuery]);

  return (
    <div className="animate-in fade-in duration-300">
      <FarmerChatbot
        initialQuery={initialQuery}
        activeScanContext={activeScan}
        apiEndpoint="http://127.0.0.1:8001/api/chat/stream"
      />
    </div>
  );
}

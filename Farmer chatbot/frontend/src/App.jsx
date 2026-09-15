import React from 'react';
import FarmerChatbot from './components/FarmerChatbot';

export default function App() {
  return (
    <div className="min-h-screen bg-[#F6F4EE] text-[#1C251B] py-6 px-3 sm:px-6">
      <FarmerChatbot apiEndpoint="http://127.0.0.1:8001/api/chat/stream" />
    </div>
  );
}

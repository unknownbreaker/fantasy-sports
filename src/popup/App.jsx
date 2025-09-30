import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useState, useEffect } from 'react';
import browser from 'webextension-polyfill';
import MessageForm from './components/MessageForm';
import MessagesTable from './components/MessagesTable';
import PageInfo from './components/PageInfo';

function App() {
  const [messages, setMessages] = useState([]);
  const queryClient = useQueryClient();

  // Fetch page info using React Query
  const { data: pageInfo, isLoading } = useQuery({
    queryKey: ['pageInfo'],
    queryFn: async () => {
      const tabs = await browser.tabs.query({
        active: true,
        currentWindow: true,
      });
      const response = await browser.tabs.sendMessage(tabs[0].id, {
        type: 'GET_PAGE_INFO',
      });
      return response;
    },
    retry: false,
  });

  // Mutation for sending messages to content script
  const sendMessageMutation = useMutation({
    mutationFn: async (message) => {
      const tabs = await browser.tabs.query({
        active: true,
        currentWindow: true,
      });
      return await browser.tabs.sendMessage(tabs[0].id, {
        type: 'FROM_POPUP',
        data: message,
      });
    },
    onSuccess: (data) => {
      console.log('Message sent successfully:', data);
    },
    onError: (error) => {
      console.error('Error sending message:', error);
    },
  });

  // Listen for messages from content script
  useEffect(() => {
    const messageListener = (message, sender) => {
      if (message.type === 'FROM_CONTENT') {
        const newMessage = {
          id: Date.now(),
          timestamp: new Date().toLocaleTimeString(),
          content: message.data,
          sender: 'content',
        };
        setMessages((prev) => [newMessage, ...prev]);
      }
    };

    browser.runtime.onMessage.addListener(messageListener);

    return () => {
      browser.runtime.onMessage.removeListener(messageListener);
    };
  }, []);

  const handleSendMessage = (message) => {
    sendMessageMutation.mutate(message);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>⚽ My Firefox Addon</h1>
      </header>

      <div className="app-content">
        <section className="section">
          <h2>Send to Page</h2>
          <MessageForm
            onSend={handleSendMessage}
            isLoading={sendMessageMutation.isPending}
          />
        </section>

        <section className="section">
          <h2>Messages from Page</h2>
          <MessagesTable messages={messages} />
        </section>

        <section className="section">
          <h2>Page Information</h2>
          <PageInfo pageInfo={pageInfo} isLoading={isLoading} />
        </section>
      </div>
    </div>
  );
}

export default App;

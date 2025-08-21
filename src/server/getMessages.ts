// Placeholder API function for getting messages
export default async function getMessages(conversationId?: string) {
  // Mock delay to simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));

  // Mock messages data
  const messages = [
    {
      id: '1',
      senderId: 'user1',
      receiverId: 'user2',
      content: 'Hey, how was your day?',
      timestamp: new Date().toISOString(),
      isRead: true,
    },
    {
      id: '2',
      senderId: 'user2',
      receiverId: 'user1',
      content: 'It was great! Thanks for asking. How about yours?',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      isRead: false,
    },
  ];

  return {
    success: true,
    data: messages,
    total: messages.length,
  };
}
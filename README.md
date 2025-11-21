# Real-Time Chat Application with Socket.io

This assignment focuses on building a real-time chat application using Socket.io, implementing bidirectional communication between clients and server.

## Assignment Overview

You will build a chat application with the following features:
1. Real-time messaging using Socket.io
2. User authentication and presence
3. Multiple chat rooms or private messaging
4. Real-time notifications
5. Advanced features like typing indicators and read receipts

## Project Structure

```
socketio-chat/
├── client/                 # React front-end
│   ├── public/             # Static files
│   ├── src/                # React source code
│   │   ├── components/     # UI components
│   │   ├── context/        # React context providers
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Page components
│   │   ├── socket/         # Socket.io client setup
│   │   └── App.jsx         # Main application component
│   └── package.json        # Client dependencies
├── server/                 # Node.js back-end
│   ├── config/             # Configuration files
│   ├── controllers/        # Socket event handlers
│   ├── models/             # Data models
│   ├── socket/             # Socket.io server setup
│   ├── utils/              # Utility functions
│   ├── server.js           # Main server file
│   └── package.json        # Server dependencies
└── README.md               # Project documentation
```

## Getting Started

1. Accept the GitHub Classroom assignment invitation
2. Clone your personal repository that was created by GitHub Classroom
3. Follow the setup instructions in the `Week5-Assignment.md` file
4. Complete the tasks outlined in the assignment

## Files Included

- `Week5-Assignment.md`: Detailed assignment instructions
- Starter code for both client and server:
  - Basic project structure
  - Socket.io configuration templates
  - Sample components for the chat interface

## Requirements

- Node.js (v18 or higher)
- npm or yarn
- Modern web browser
- Basic understanding of React and Express

## Submission

Your work will be automatically submitted when you push to your GitHub Classroom repository. Make sure to:

1. Complete both the client and server portions of the application
2. Implement the core chat functionality
3. Add at least 3 advanced features
4. Document your setup process and features in the README.md
5. Include screenshots or GIFs of your working application
6. Optional: Deploy your application and add the URLs to your README.md

## Resources

- [Socket.io Documentation](https://socket.io/docs/v4/)
- [React Documentation](https://react.dev/)
- [Express.js Documentation](https://expressjs.com/)
- [Building a Chat Application with Socket.io](https://socket.io/get-started/chat) 

### API endpoints
```
-UserRoutes.js
("/api/user")

## GET
("/api/user")
## POST
("/api/user")
## PUT
("/api/user/:id")
## DELETE
("/api/user/:id")

`````````````````````-ChatRoutes
("/api/chat")

# GET all chats by a user
("/api/chat?userId=<userId>
")

#Get a single ChatRoom by Id
("/api/chat/<roomId>")


## POST- create a chatRoom
("/api/chat")
{
  "roomType": "group",
  "roomName": "Project Team",
  "participants": ["<userId1>", "<userId2>"]
}


##POST -add a message to chat
("/api/chat/chatId/messages)
{
  "messageId": "<messageId>"
}


## PUT
("/apichat/<roomId>/rename")
{
  "newName": "New Chat Name"
}

##PUT -rename a group chat
("/api/chat/<roomId>/rename")

{
  "newName": "New Chat Name"
}

##PUT -add/Remove Participants
("/api/chat/<roomId>/participants")
{
  "userId": "<newUserId>",
  "action": "add"
}
{
  "userId": "<userIdToRemove>",
  "action": "remove"
}

## DELETE
("/api/chat/<roomId>")

````````````````````````````````````````````````-MessageRoutes
##GET
("/api/message/:chatId")
JWT TOKEN

##POST
("/api/message")
JWT TOKEN

eg. : {
  "chatId": "679f3a2b5a34c616b8a66a91",
  "text": "Hello, this is a test!"
}


##PUT
-marks as read
("/api/message/:messageId/read")

eg. :http://localhost:5000/api/messages/67a01253dbd9f0c59c8bd2b0/read

JWT TOKEN

## DELETE A MESSAGE
("/api/messages/:messageId")

http://localhost:5000/api/messages/67a01253dbd9f0c59c8bd2b0

Bearer JWT Token
```
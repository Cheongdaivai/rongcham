<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

This is a Next.js food ordering system project with the following structure and technologies:

## Tech Stack
- Frontend Framework: Next.js (App Router)
- Styling/UI: Shadcn UI with Tailwind CSS
- State Management: React Context
- Real-time Communication: Socket.IO for WebSockets
- TypeScript for type safety

## Project Structure
- Customer-facing menu page for browsing and ordering food
- Shopping cart functionality with add/remove items
- Checkout process that sends orders to chef dashboard
- Chef dashboard for receiving and managing orders in real-time
- WebSocket integration for real-time order updates

## Key Features
1. Customer menu with food items (image, title, price, add to cart)
2. Shopping cart with quantity controls and total calculation
3. Checkout process that submits orders
4. Real-time chef dashboard showing incoming orders
5. Order management system

## Code Style
- Use TypeScript for all components and utilities
- Follow Next.js App Router conventions
- Use Shadcn UI components consistently
- Implement proper error handling and loading states
- Use React Context for global state management
- Follow responsive design principles

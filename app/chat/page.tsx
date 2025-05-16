'use client';
import ChatArea from "./components/ChatArea";
import { generateUUID } from './lib/utils';

export default function ChatHomePage() {
    const id  = generateUUID();
    return (
        <div className="h-full w-full flex">
            <ChatArea 
                activeSessionId={id} 
                initialMessages={[]}
            />
        </div>
    );
}

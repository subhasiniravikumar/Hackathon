import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bot, User } from 'lucide-react';

interface ChatMessageProps {
  sender: 'user' | 'bot';
  text: string;
  isLoading?: boolean;
}

export function ChatMessage({ sender, text, isLoading }: ChatMessageProps) {
  const isBot = sender === 'bot';
  return (
    <div
      className={cn(
        'flex items-end gap-2 my-3',
        isBot ? 'justify-start' : 'justify-end'
      )}
    >
      {isBot && (
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary text-primary-foreground">
            <Bot className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          'max-w-[70%] p-3 rounded-xl shadow',
          isBot
            ? 'bg-secondary text-secondary-foreground rounded-bl-none'
            : 'bg-primary text-primary-foreground rounded-br-none'
        )}
      >
        {isLoading ? (
          <div className="flex items-center space-x-1">
            <span className="h-2 w-2 bg-current rounded-full animate-pulse delay-0"></span>
            <span className="h-2 w-2 bg-current rounded-full animate-pulse delay-200"></span>
            <span className="h-2 w-2 bg-current rounded-full animate-pulse delay-400"></span>
          </div>
        ) : (
          <p className="text-sm whitespace-pre-wrap">{text}</p>
        )}
      </div>
      {!isBot && (
         <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-accent text-accent-foreground">
            <User className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}

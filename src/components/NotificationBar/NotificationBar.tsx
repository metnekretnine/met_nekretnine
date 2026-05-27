import * as React from "react";
import { XIcon } from "lucide-react";

import { Dispatch, SetStateAction } from "react";

interface NotificationBarProps {
  message: string;
  setIsVisible: Dispatch<SetStateAction<boolean>>;
}

export const NotificationBar: React.FC<NotificationBarProps> = ({
  message,
  setIsVisible,
}) => {
  if (!message) {
    return null;
  }

  return (
    <div className="bg-foreground text-background p-3 pr-6 text-md flex items-center justify-between">
      <span className="flex-grow text-center mr-4">{message}</span>
      <button
        onClick={() => setIsVisible(false)}
        className="text-background hover:opacity-70"
        aria-label="Close notification"
      >
        <XIcon size={20} />
      </button>
    </div>
  );
};

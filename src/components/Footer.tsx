import { FaGithub, FaLinkedin } from "react-icons/fa";

import { AiFillHeart } from "react-icons/ai";

const VERSION = "2.2.0";

export function Footer() {
  return (
    <footer className="flex flex-col items-center justify-center gap-2 py-3 mt-4 border-t border-border text-sm text-muted-foreground">
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1">
          made with <AiFillHeart className="h-3 w-3 text-red-500" /> by{" "}
          <span className="font-medium text-foreground">Yosef Sabag</span>
        </span>
        <div className="flex items-center gap-2 ml-2">
          <a
            href="https://github.com/YosefHayim"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-foreground transition-colors"
            aria-label="GitHub profile"
          >
            <FaGithub className="h-4 w-4" />
          </a>
          <a
            href="https://www.linkedin.com/in/yosef-hayim-sabag/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-foreground transition-colors"
            aria-label="LinkedIn profile"
          >
            <FaLinkedin className="h-4 w-4" />
          </a>
        </div>
      </div>
      <span className="text-xs text-muted-foreground">v{VERSION}</span>
    </footer>
  );
}

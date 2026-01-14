import { FaGithub, FaLinkedin, FaCoffee, FaStar, FaBug } from "react-icons/fa";
import { AiFillHeart } from "react-icons/ai";

const VERSION = "2.5.0";
const CHROME_STORE_URL =
  "https://chromewebstore.google.com/detail/sora-auto-queue-prompts/kbpbdckjechbjmnjagfkgcplmhdkkgph";
const GITHUB_ISSUES_URL =
  "https://github.com/YosefHayim/extension-sora-auto-queue-prompts/issues";

export function Footer() {
  return (
    <footer className="flex flex-col items-center justify-center gap-2 py-3 mt-4 border-t border-border text-sm text-muted-foreground">
      <div className="flex items-center gap-2 flex-wrap justify-center">
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
          <a
            href="https://buymeacoffee.com/yosefhayim"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-yellow-500 transition-colors"
            aria-label="Buy me a coffee"
          >
            <FaCoffee className="h-4 w-4" />
          </a>
        </div>
      </div>

      <div className="flex items-center gap-3 text-xs">
        <a
          href={CHROME_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 hover:text-yellow-500 transition-colors"
          aria-label="Rate on Chrome Web Store"
        >
          <FaStar className="h-3 w-3" />
          <span>Rate</span>
        </a>
        <span className="text-muted-foreground/50">|</span>
        <a
          href={GITHUB_ISSUES_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 hover:text-foreground transition-colors"
          aria-label="Report a bug"
        >
          <FaBug className="h-3 w-3" />
          <span>Report Bug</span>
        </a>
        <span className="text-muted-foreground/50">|</span>
        <span>v{VERSION}</span>
      </div>
    </footer>
  );
}

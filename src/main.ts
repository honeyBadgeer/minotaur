import './reset.css';
import './style.css';
import GameController from './core/controllers/GameController/GameController';
import { Entry } from './ui/components/Entry/Entry';
import { isPortrait } from './services/lib/isPortrait';

let controller: GameController | null = null;
const entry = new Entry();

let resizeTimeout: number | null = null;

const handleOnOrintation = () => {
  if (isPortrait()) {
    entry.handleShowRotatePrompt();

    if (controller) {
      controller.destroy();
      controller = null;
    }
  } else {
    if (!controller) {
      entry.handleHideRotatePrompt();
      controller = new GameController();
      controller.init(entry);
    }
  }
};

handleOnOrintation();

const handleOnResize = () => {
  if (resizeTimeout) {
    clearTimeout(resizeTimeout);
  }

  resizeTimeout = window.setTimeout(() => {
    handleOnOrintation();
  }, 200);
};

window.addEventListener('resize', handleOnResize);

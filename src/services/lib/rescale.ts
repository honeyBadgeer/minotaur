export function resizeCanvas(game: Phaser.Game) {
  const canvas = game.canvas;
  let timeoutId: number | null = null;

  const scale = () => {
    const windowWidth = window.visualViewport?.width || window.innerWidth;
    const windowHeight = window.visualViewport?.height || window.innerHeight;
    const gameRatio =
      (game.config.width as number) / (game.config.height as number);
    const windowRatio = windowWidth / windowHeight;

    let newWidth = windowWidth;
    let newHeight = windowHeight;

    if (windowRatio > gameRatio) {
      newHeight = windowHeight;
      newWidth = newHeight * gameRatio;
    } else {
      newWidth = windowWidth;
      newHeight = newWidth / gameRatio;
    }

    canvas.style.width = `${newWidth}px`;
    canvas.style.height = `${newHeight}px`;

    canvas.style.position = 'absolute';
    canvas.style.left = `${(windowWidth - newWidth) / 2}px`;
    canvas.style.top = `${(windowHeight - newHeight) / 2}px`;
  };

  scale();

  window.addEventListener('resize', () => {
    scale();

    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = window.setTimeout(() => {
      scale();
    }, 500);
  });
}

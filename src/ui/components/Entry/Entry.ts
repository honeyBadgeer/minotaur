export class Entry {
  public rotateOverlayElement: HTMLElement | null = null;
  private timeoutId: number | null = null;

  constructor() {
    const rotateTemplate = document.getElementById(
      'rotate-template'
    ) as HTMLTemplateElement;
    if (!rotateTemplate) throw new Error('rotate-template не найден');

    const htmlRotateElement =
      rotateTemplate.content.firstElementChild!.cloneNode(true) as HTMLElement;
    document.body.appendChild(htmlRotateElement);
    this.rotateOverlayElement = htmlRotateElement;
  }

  public handleShowRotatePrompt() {
    this.cleanup();

    this.timeoutId = window.setTimeout(() => {
      if (!this.rotateOverlayElement) return;
      const scale = this.updateScale();

      this.rotateOverlayElement.style.transform = `translate(-50%, -50%) scale(${scale})`;
      if (!this.rotateOverlayElement)
        throw new Error('fullscreen-template не найден');

      this.rotateOverlayElement.style.visibility = 'visible';
    }, 200);
  }

  public handleHideRotatePrompt() {
    this.cleanup();

    if (this.rotateOverlayElement)
      this.rotateOverlayElement.style.visibility = 'hidden';
  }

  private updateScale() {
    const winW = window.innerWidth;
    const winH = window.innerHeight;

    const scaleX = winW / 1080;
    const scaleY = winH / 1920;

    const scale = Math.min(scaleX, scaleY);

    return scale;
  }

  private cleanup() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}

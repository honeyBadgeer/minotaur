import { iosVersion } from './iosVersion';

function isPortrait(): boolean {
  const iosVer = iosVersion();

  if (iosVer && iosVer < 16) {
    const numberOrientation =
      window.orientation === 0 || window.orientation === 180;

    return numberOrientation || window.innerHeight > window.innerWidth;
  }

  const orientation =
    window.screen.orientation &&
    window.screen.orientation.type.startsWith('portrait');

  const matchMedia = window.matchMedia('(orientation: portrait)').matches;

  return orientation || matchMedia || window.innerHeight > window.innerWidth;
}

export { isPortrait };

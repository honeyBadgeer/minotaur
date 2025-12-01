function isLandscape() {
  return (
    (window.screen.orientation &&
      window.screen.orientation.type.startsWith('landscape')) ||
    window.innerWidth > window.innerHeight
  );
}
export { isLandscape };

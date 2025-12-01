function centeredAt(
  gameObject: Phaser.GameObjects.Container,
  baseX: number,
  targetCenterWidth: number
) {
  const actualWidth = gameObject.list.reduce((acc, cur) => {
    if ('displayWidth' in cur && typeof cur.displayWidth === 'number') {
      return acc + cur.displayWidth;
    }
    return acc;
  }, 0);

  const offsetX = (actualWidth - targetCenterWidth) / 2;
  gameObject.setX(baseX - offsetX);
}

export { centeredAt };

import { GameObjects, type Scene } from 'phaser';
import { MoneyText } from '../MoneyText/MoneyText';
import { centeredAt } from './lib/centeredAt';
import { textStyle } from './lib/textStyle';
import { t } from '@/i18n';
import { characters } from '@/services/constants';
import { mdeToNormal } from '@/services/lib/mdeToNormal';
import { formatNumber } from '@/services/lib/formatNumber';

export class StatisticBar extends GameObjects.Container {
  private playerIcon: GameObjects.Image | null = null;
  private possibleBets: MoneyText | null = null;
  private mainPrizeValue: MoneyText | null = null;
  private playerText: GameObjects.Text | null = null;
  private playerTextContainer: GameObjects.Container | null = null;
  public currentCharacter: keyof typeof characters = 'newbie';

  constructor(scene: Scene) {
    super(scene);
    this.scene = scene;
    this.scene.add.existing(this);
    this.name = 'StatisticBar';
  }

  createBackground() {
    const controlBarBackground = this.scene.add
      .image(0, 0, 'statisticBarBackground')
      .setOrigin(0.5, 1);

    this.setPosition(
      this.scene.sys.canvas.width / 2,
      controlBarBackground.height + 11
    );

    this.add(controlBarBackground);

    this.scene.tweens.add({
      targets: this,
      scaleX: { from: 0, to: 1 },
      duration: 300,
      ease: 'Quad.Out',
    });
  }

  createText() {
    this.possibleBets = new MoneyText(
      this.scene,
      characters[this.currentCharacter].possibleBets
    );
    this.mainPrizeValue = new MoneyText(this.scene, 0);

    this.playerText = this.scene.add.text(
      0,
      0,
      t(`characters.${this.currentCharacter}.label`),
      textStyle
    );
    this.playerTextContainer = this.scene.add.container(0, 0);
    this.playerTextContainer.add(this.playerText);

    const mainPrize = this.scene.add.text(
      0,
      0,
      t('common.mainPrize'),
      textStyle
    );
    const mainPrizeTextContainer = this.scene.add.container(0, 0);
    mainPrizeTextContainer.add(mainPrize);

    centeredAt(this.possibleBets, -200, 86);
    centeredAt(this.mainPrizeValue, 120, 86);
    centeredAt(mainPrizeTextContainer, 120, 86);
    centeredAt(this.playerTextContainer, -204, 102);

    this.possibleBets.setY(-36);
    this.mainPrizeValue.setY(-36);
    mainPrizeTextContainer.setY(-65);
    this.playerTextContainer.setY(-65);
    this.add([
      this.possibleBets,
      this.mainPrizeValue,
      this.playerTextContainer,
      mainPrizeTextContainer,
    ]);
  }

  createPlayerIcon() {
    const playerIcon = this.scene.add
      .image(0, -44, characters[this.currentCharacter].img)
      .setOrigin(0.5);
    this.playerIcon = playerIcon;

    this.add(playerIcon);
  }

  updatePlayer() {
    if (
      this.playerIcon &&
      this.possibleBets &&
      this.playerText &&
      this.playerTextContainer
    ) {
      this.playerIcon?.setTexture(characters[this.currentCharacter].img);

      this.possibleBets.updateText(
        characters[this.currentCharacter].possibleBets
      );
      centeredAt(this.possibleBets, -200, 86);
      this.possibleBets.setY(-36);

      this.playerText.setText(t(`characters.${this.currentCharacter}.label`));
      centeredAt(this.playerTextContainer, -204, 102);
      this.playerTextContainer.setY(-65);
    }
  }

  showStatisticBar() {
    this.createBackground();
    this.createText();
    this.createPlayerIcon();
  }

  public handleSetMainPrize(value: number) {
    if (!this.mainPrizeValue) return;

    this.mainPrizeValue.updateText(String(formatNumber(mdeToNormal(value))));
    centeredAt(this.mainPrizeValue, 120, 86);
    this.mainPrizeValue.setY(-36);
  }
}

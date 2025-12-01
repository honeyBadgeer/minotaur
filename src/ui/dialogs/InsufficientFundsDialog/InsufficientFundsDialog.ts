import { t } from '@/i18n';
import { SmallDialog } from '../SmallDialog';

export class InsufficientFundsDialog extends SmallDialog {
  constructor(
    scene: Phaser.Scene,
    data: {
      onClick?: () => void;
      onClose?: () => void;
    }
  ) {
    super(
      scene,
      t('dialogs.insufficientFunds.title'),
      t('dialogs.insufficientFunds.message'),
      t('dialogs.insufficientFunds.button'),
      data.onClick,
      data.onClose
    );
  }
}

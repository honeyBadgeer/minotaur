import { SmallDialog } from '../SmallDialog';
import { t } from '@/i18n';

export class ConfirmDialog extends SmallDialog {
  constructor(
    scene: Phaser.Scene,
    data: {
      amount: number;
      onConfirm?: () => void;
      onClose?: () => void;
    }
  ) {
    super(
      scene,
      t('dialogs.confirm.title'),
      [
        {
          text: t('dialogs.confirm.message'),
          style: {},
        },
        {
          text: `${data.amount} ₸`,
          style: { fontSize: '40px' },
        },
      ],
      t('dialogs.confirm.button'),
      data.onConfirm,
      data.onClose
    );
  }
}

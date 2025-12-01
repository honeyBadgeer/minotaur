import { SmallDialog } from '../SmallDialog';
import { t } from '@/i18n';
export class ErrorDialog extends SmallDialog {
  constructor(
    scene: Phaser.Scene,
    data: {
      message: string;
      onConfirm?: () => void;
      onClose?: () => void;
    }
  ) {
    super(
      scene,
      t('error'),
      [
        {
          text: data.message,
          style: { fontSize: '24px', color: '#ff4444' },
        },
      ],
      '',
      data.onConfirm,
      data.onClose
    );
  }
}

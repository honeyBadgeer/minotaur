import { SmallDialog } from '../SmallDialog';
import { t } from '@/i18n';

export class UnauthorizedDialog extends SmallDialog {
  constructor(
    scene: Phaser.Scene,
    data: { onClose?: () => void; onLogin?: () => void }
  ) {
    super(
      scene,
      t('dialogs.unauthorized.title'),
      t('dialogs.unauthorized.message'),
      t('dialogs.unauthorized.button'),
      data.onLogin,
      data.onClose
    );
  }
}

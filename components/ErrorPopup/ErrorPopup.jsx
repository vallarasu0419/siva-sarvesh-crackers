import { faCircleExclamation } from '@fortawesome/free-solid-svg-icons';
import StatusDialog from '../Modal/StatusDialog';

/** Red error popup. Replaces alert() for errors and validation messages. */
export default function ErrorPopup({ open, onClose, title = 'Something needs your attention', message, actionLabel = 'OK', onAction }) {
  return (
    <StatusDialog open={open} onClose={onClose} tone="danger" icon={faCircleExclamation} title={title} message={message} actionLabel={actionLabel} onAction={onAction} />
  );
}

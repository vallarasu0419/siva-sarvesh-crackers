import { faCircleCheck } from '@fortawesome/free-solid-svg-icons';
import StatusDialog from '../Modal/StatusDialog';

/** Green confirmation popup. Replaces alert() for success messages. */
export default function SuccessPopup({ open, onClose, title = 'Done', message, actionLabel = 'OK', onAction }) {
  return (
    <StatusDialog open={open} onClose={onClose} tone="success" icon={faCircleCheck} title={title} message={message} actionLabel={actionLabel} onAction={onAction} />
  );
}

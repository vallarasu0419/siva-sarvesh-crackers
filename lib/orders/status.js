export const ORDER_STATUSES = ['PENDING', 'PICKED_UP', 'DELIVERED', 'REJECTED'];

export const STATUS_LABELS = {
  PENDING: 'Pending',
  PICKED_UP: 'Picked Up',
  DELIVERED: 'Delivered',
  REJECTED: 'Rejected',
};

export const INITIAL_ORDER_STATUS = 'PENDING';

export function isValidStatus(status) {
  return ORDER_STATUSES.includes(status);
}

export const STATUS_OPTIONS = ORDER_STATUSES.map((value) => ({ value, label: STATUS_LABELS[value] }));

import { WorkOrderKind, WorkOrderPriority, WorkOrderStatus } from '../../core/graphql/generated';

export const WORK_ORDER_KINDS: readonly WorkOrderKind[] = ['PREVENTIVE', 'REPAIR', 'INSPECTION'];
export const WORK_ORDER_PRIORITIES: readonly WorkOrderPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
export const WORK_ORDER_STATUSES: readonly WorkOrderStatus[] = ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

export const KIND_ICONS: Record<WorkOrderKind, string> = {
  PREVENTIVE: 'event_repeat',
  REPAIR: 'car_repair',
  INSPECTION: 'fact_check',
};

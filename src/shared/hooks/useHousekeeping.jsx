import { useQuery, useMutation } from './useQuery.jsx';
import {
  setHousekeepingStatus,
  listHousekeepingTasks,
  createHousekeepingTask,
  updateHousekeepingTaskStatus,
  listCamaristas,
} from '../api/housekeeping.js';

const TASKS_KEY = 'hotel.housekeeping_tasks';
const CAMARISTAS_KEY = 'public.staff.camaristas';

export function useHousekeepingTasks() {
  const q = useQuery(TASKS_KEY, listHousekeepingTasks);
  const create = useMutation(createHousekeepingTask, { invalidate: [TASKS_KEY] });
  const updateStatus = useMutation(
    ({ id, status }) => updateHousekeepingTaskStatus(id, status),
    { invalidate: [TASKS_KEY] },
  );

  return {
    tasks: q.data || [],
    loading: q.loading,
    error: q.error,
    refresh: q.refresh,
    createTask: create.mutate,
    setTaskStatus: (id, status) => updateStatus.mutate({ id, status }),
    saving: create.loading || updateStatus.loading,
  };
}

export function useCamaristas() {
  const q = useQuery(CAMARISTAS_KEY, listCamaristas);
  return { camaristas: q.data || [], loading: q.loading, error: q.error };
}

export function useRoomHousekeeping(roomsKey = 'hotel.rooms') {
  const setStatus = useMutation(
    ({ roomId, status }) => setHousekeepingStatus(roomId, status),
    { invalidate: [roomsKey] },
  );
  return { setStatus: (roomId, status) => setStatus.mutate({ roomId, status }), saving: setStatus.loading };
}

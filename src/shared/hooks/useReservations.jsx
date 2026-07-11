import { useMemo } from 'react';
import { useQuery, useMutation } from './useQuery.jsx';
import {
  listReservations,
  listReservationsInRange,
  listArrivals,
  listInHouse,
  listDepartures,
  listReservationsByGuest,
  createReservation,
} from '../api/reservations.js';

export function useReservations() {
  const q = useQuery('hotel.reservations', listReservations);
  return { reservations: q.data || [], loading: q.loading, error: q.error, refresh: q.refresh };
}

export function useReservationsInRange(fromIso, toIso) {
  const key = fromIso && toIso ? `hotel.reservations.range:${fromIso}:${toIso}` : null;
  const fetcher = useMemo(() => () => listReservationsInRange(fromIso, toIso), [fromIso, toIso]);
  const q = useQuery(key, fetcher, { enabled: !!key });
  return { reservations: q.data || [], loading: q.loading, error: q.error, refresh: q.refresh };
}

export function useArrivals(dateIso) {
  const key = dateIso ? `hotel.reservations.arrivals:${dateIso}` : null;
  const fetcher = useMemo(() => () => listArrivals(dateIso), [dateIso]);
  const q = useQuery(key, fetcher, { enabled: !!key });
  return { arrivals: q.data || [], loading: q.loading, error: q.error, refresh: q.refresh };
}

export function useInHouse(dateIso) {
  const key = dateIso ? `hotel.reservations.inhouse:${dateIso}` : null;
  const fetcher = useMemo(() => () => listInHouse(dateIso), [dateIso]);
  const q = useQuery(key, fetcher, { enabled: !!key });
  return { inHouse: q.data || [], loading: q.loading, error: q.error, refresh: q.refresh };
}

export function useDepartures(dateIso) {
  const key = dateIso ? `hotel.reservations.departures:${dateIso}` : null;
  const fetcher = useMemo(() => () => listDepartures(dateIso), [dateIso]);
  const q = useQuery(key, fetcher, { enabled: !!key });
  return { departures: q.data || [], loading: q.loading, error: q.error, refresh: q.refresh };
}

export function useReservationsByGuest(guestId) {
  const key = guestId ? `hotel.reservations.guest:${guestId}` : null;
  const fetcher = useMemo(() => () => listReservationsByGuest(guestId), [guestId]);
  const q = useQuery(key, fetcher, { enabled: !!key });
  return { reservations: q.data || [], loading: q.loading, error: q.error, refresh: q.refresh };
}

export function useCreateReservation() {
  const m = useMutation(createReservation, { invalidate: ['hotel.reservations'] });
  return { createReservation: m.mutate, creating: m.loading, error: m.error };
}

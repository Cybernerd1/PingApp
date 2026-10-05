import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { locationApi } from '../api/location';
import { LocationCoordinates } from '../api/types';

export function useLocation() {
  const [isSharing, setIsSharing] = useState<boolean>(false);

  const startSharingMutation = useMutation({
    mutationFn: (coords: LocationCoordinates) => locationApi.startLocationSharing(coords),
    onSuccess: res => {
      if (res.status === 'success') {
        setIsSharing(true);
      }
    },
  });

  const stopSharingMutation = useMutation({
    mutationFn: () => locationApi.stopLocationSharing(),
    onSuccess: res => {
      if (res.status === 'success') {
        setIsSharing(false);
      }
    },
  });

  return {
    isSharing,
    startLocationSharing: startSharingMutation.mutateAsync,
    isStartingLocation: startSharingMutation.isPending,
    stopLocationSharing: stopSharingMutation.mutateAsync,
    isStoppingLocation: stopSharingMutation.isPending,
  };
}

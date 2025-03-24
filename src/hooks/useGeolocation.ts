import { useState, useEffect } from 'react';

interface GeolocationState {
  loading: boolean;
  error: string | null;
  position: {
    lat: number;
    lon: number;
  } | null;
  permissionDenied: boolean;
}

export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    loading: true,
    error: null,
    position: null,
    permissionDenied: false
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({
        loading: false,
        error: 'Trình duyệt của bạn không hỗ trợ định vị.',
        position: null,
        permissionDenied: false
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          loading: false,
          error: null,
          position: {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          },
          permissionDenied: false
        });
      },
      (error) => {
        let errorMessage = 'Không thể xác định vị trí của bạn.';
        let denied = false;
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Bạn đã từ chối quyền truy cập vị trí.';
            denied = true;
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Thông tin vị trí không khả dụng.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Yêu cầu vị trí đã hết thời gian chờ.';
            break;
        }
        
        setState({
          loading: false,
          error: errorMessage,
          position: null,
          permissionDenied: denied
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, []);

  return state;
};

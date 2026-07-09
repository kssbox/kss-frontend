export enum DeviceType {
  MOBILE = 'mobile',
  TABLET = 'tablet',
  DESKTOP = 'desktop',
}

export function getDeviceType(): DeviceType {
  if (typeof window === 'undefined') {
    return DeviceType.DESKTOP
  }

  const width = window.innerWidth

  if (width < 640) {
    return DeviceType.MOBILE
  } else if (width >= 640 && width < 1024) {
    return DeviceType.TABLET
  } else {
    return DeviceType.DESKTOP
  }
}

export function isMobile(): boolean {
  return getDeviceType() === DeviceType.MOBILE
}

export function isTablet(): boolean {
  return getDeviceType() === DeviceType.TABLET
}

export function isDesktop(): boolean {
  return getDeviceType() === DeviceType.DESKTOP
}

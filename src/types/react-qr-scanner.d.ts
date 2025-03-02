declare module 'react-qr-scanner' {
  import { Component } from 'react';

  export interface QrScannerProps {
    delay?: number;
    style?: React.CSSProperties;
    onError?: (error: Error) => void;
    onScan?: (data: { text: string } | null) => void;
    constraints?: MediaTrackConstraints | boolean;
    facingMode?: string;
    resolution?: number;
    chooseDeviceId?: () => string;
    legacyMode?: boolean;
    maxImageSize?: number;
    showViewFinder?: boolean;
  }

  export default class QrScanner extends Component<QrScannerProps> {}
} 
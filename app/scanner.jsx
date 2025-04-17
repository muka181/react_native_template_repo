// app/scanner.jsx

import React, { useEffect, useRef, useState } from 'react';
import { Alert, Platform, Text, SafeAreaView, Button, View, StyleSheet } from 'react-native';
import { request, PERMISSIONS, openSettings, RESULTS } from 'react-native-permissions';
import { Commands, ReactNativeScannerView } from '@pushpendersingh/react-native-scanner';

export default function ScannerScreen() {
  const scannerRef = useRef(null);
  const [isCameraPermissionGranted, setIsCameraPermissionGranted] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [scannedData, setScannedData] = useState(null);

  useEffect(() => {
    checkCameraPermission();
  }, []);

  const handleBarcodeScanned = (event) => {
    const { data, bounds, type } = event?.nativeEvent;
    setScannedData({ data, bounds, type });
    console.log('Scanned:', data, bounds, type);
    Alert.alert('Scanned', `Data: ${data}\nType: ${type}`);
  };

  const checkCameraPermission = async () => {
    request(
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.CAMERA
        : PERMISSIONS.ANDROID.CAMERA,
    ).then((result) => {
      switch (result) {
        case RESULTS.GRANTED:
          setIsCameraPermissionGranted(true);
          break;
        case RESULTS.DENIED:
        case RESULTS.BLOCKED:
          Alert.alert('Permission Needed', 'Camera access is required', [
            { text: 'Open Settings', onPress: openSettings },
            { text: 'Cancel', style: 'cancel' },
          ]);
          break;
      }
    });
  };

  if (!isCameraPermissionGranted) {
    return <Text style={styles.permissionText}>Grant camera permission to continue</Text>;
  }

  return (
    <SafeAreaView style={styles.container}>
      {isActive && (
        <ReactNativeScannerView
          ref={scannerRef}
          style={styles.scanner}
          onQrScanned={handleBarcodeScanned}
          pauseAfterCapture={true}
          isActive={isActive}
          showBox={true}
        />
      )}
      <View style={styles.controls}>
        <Button title="Stop Scanning" onPress={() => { Commands.stopScanning(scannerRef.current); setIsActive(false); }} />
        <Button title="Resume Scanning" onPress={() => { Commands.resumeScanning(scannerRef.current); setIsActive(true); }} />
        <Button title="Flash On" onPress={() => Commands.enableFlashlight(scannerRef.current)} />
        <Button title="Flash Off" onPress={() => Commands.disableFlashlight(scannerRef.current)} />
      </View>

      {scannedData && (
        <View style={styles.result}>
          <Text style={styles.resultText}>Data: {scannedData.data}</Text>
          <Text style={styles.resultText}>Type: {scannedData.type}</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scanner: { flex: 1 },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    marginVertical: 10,
  },
  result: {
    margin: 16,
    padding: 12,
    backgroundColor: '#e0f7fa',
    borderRadius: 8,
  },
  resultText: { fontSize: 16, marginVertical: 4 },
  permissionText: {
    fontSize: 20,
    color: 'red',
    textAlign: 'center',
    marginTop: 50,
  },
});

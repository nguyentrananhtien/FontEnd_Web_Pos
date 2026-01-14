import { Camera, CameraView } from 'expo-camera';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

export default function CheckIn() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const onBarcodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);

    // QR code chứa tableCode (string)
    router.replace({
      pathname: '/screen/Food',
      params: { tableCode: data },
    });
  };

  if (hasPermission === null) {
    return <Text>Xin quyền camera...</Text>;
  }
  if (hasPermission === false) {
    return <Text>Không có quyền camera</Text>;
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={onBarcodeScanned}
      />
      <View style={styles.bottom}>
        <Button title="Quét lại" onPress={() => setScanned(false)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bottom: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
  },
});
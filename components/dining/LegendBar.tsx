import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function LegendBar() {
  return (
    <View style={styles.legend}>
      <Text style={{ color: '#4CAF50' }}>● Available</Text>
      <Text style={{ color: '#F44336' }}>● Occupied</Text>
      <Text style={{ color: '#FF9800' }}>● Reserved</Text>
      <Text style={{ color: '#838383' }}>● Pending</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
});

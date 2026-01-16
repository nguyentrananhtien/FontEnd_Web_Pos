import { STATUS_COLOR_MAP } from '@/constants/STATUS_COLOR';
import { TableCardProps } from '@/services/types';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function TableCard({ id, pax, status, onPress }: TableCardProps) {
  const color = STATUS_COLOR_MAP[status];

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {/* Hàng ghế trên */}
        <View style={styles.seatRow}>
          {[...Array(2)].map((_, i) => (
            <View key={`top-${i}`} style={[styles.seat, { backgroundColor: color }]} />
          ))}
        </View>

        <View style={styles.row}>
          <View style={styles.sideSeats}>
            <View style={[styles.seat, { backgroundColor: color }]} />
          </View>

          <View style={[styles.card, { backgroundColor: color }]}>
            <Text style={styles.tableId}>{id}</Text>
            <Text style={styles.tablePax}>Chairs: {pax}</Text>
          </View>

          <View style={styles.sideSeats}>
            <View style={[styles.seat, { backgroundColor: color }]} />
          </View>
        </View>

        <View style={styles.seatRow}>
          {[...Array(2)].map((_, i) => (
            <View key={`bottom-${i}`} style={[styles.seat, { backgroundColor: color }]} />
          ))}
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '48%',              // 2 cột đều nhau
    marginBottom: 16,
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seatRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 4,
    gap: 12,
  },
  sideSeats: {
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  seat: {
    width: 8,
    height: 8,
    borderRadius: 3,
    opacity: 0.6,
  },
  card: {
    width: '50%',
    height: 70,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  tableId: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  tablePax: {
    color: '#fff',
    fontSize: 12,
    marginTop: 2,
    opacity: 0.9,
  },
});

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface FilterTabsProps {
  filters: string[];
  activeFilter: string;
  onSelect: (filter: string) => void;
}

export default function FilterTabs({ filters, activeFilter, onSelect }: FilterTabsProps) {
  return (
    <View style={styles.container}>
      {filters.map((filter) => (
        <TouchableOpacity
          key={filter}
          onPress={() => onSelect(filter)}
          style={[styles.button, activeFilter === filter && styles.activeButton]}
        >
          <Text style={[styles.text, activeFilter === filter && styles.activeText]}>
            {filter}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginVertical: 8,
  },
  button: {
    backgroundColor: '#FFE0B2',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    margin: 4,
  },
  text: {
    color: '#E65100',
    fontSize: 12,
  },
  activeButton: {
    backgroundColor: '#E65100',
  },
  activeText: {
    color: '#fff',
  },
});

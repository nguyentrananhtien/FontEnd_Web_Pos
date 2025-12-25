import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

interface SearchBarProps {
  value: string;
  onChange: (text: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <View style={styles.container}>
      <Ionicons name="search" size={18} color="#999" />
      <TextInput
        placeholder="Search tables"
        value={value}
        onChangeText={onChange}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f3f3',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginVertical: 8,
  },
  input: {
    flex: 1,
    padding: 8,
  },
});

// screens/DiningScreen.tsx
import FilterTabs from '@/components/dining/FilterTabs';
import LegendBar from '@/components/dining/LegendBar';
import SearchBar from '@/components/dining/SearchBar';
import TableCard from '@/components/dining/TableCard';
import { useTables } from '@/hooks/useTables';
import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function DiningScreen() {
  const { tables, areas, loading } = useTables();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const filteredTables = tables.filter((t) => {
    const matchesSearch = t.tableCode.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = activeFilter === 'All' || t.area === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const mapStatus = (status: string) => {
    switch (status) {
      case 'Available':
        return 'available';
      case 'Occupied':
        return 'occupied';
      case 'Reserved':
        return 'reserved';
      case 'Pending':
        return 'pending';
      default:
        return 'available';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dining</Text>
      <SearchBar value={search} onChange={setSearch} />
      <FilterTabs filters={areas} activeFilter={activeFilter} onSelect={setActiveFilter} />

      <LegendBar />

      {loading ? (
        <ActivityIndicator size="large" color="#E65100" />
      ) : (
        <ScrollView contentContainerStyle={styles.grid}>
          {filteredTables.map((t) => (
            <TableCard
              key={t.tableId}
              id={t.tableCode}
              pax={t.seatingCapacity}
              status={mapStatus(t.status) as any}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});

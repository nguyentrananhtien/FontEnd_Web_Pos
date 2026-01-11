import { TableListProps } from "@/props/TableListProps";
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import FilterTabs from "../components/FilterTabs";
import { LegendBar } from "../components/LegendBar";
import SearchBar from "../components/SearchBar";
import TableCard from "../components/TableCard";

export default function TableListModal({
  visible,
  onClose,
  search,
  onSearch,
  areas,
  selectedArea,
  onSelectArea,
  tables,
  tableLoading,
  onTableSelect
}: TableListProps) {
  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { height: "85%" }]}>
          <Text style={styles.modalTitle}>Danh sách bàn</Text>
          <SearchBar value={search} onChange={onSearch} />
          <FilterTabs filters={areas} activeFilter={selectedArea} onSelect={onSelectArea} />
          <LegendBar />

          {tableLoading ? (
            <ActivityIndicator size="large" color="#E65100" />
          ) : (
            <ScrollView>
              <View style={styles.grid}>
                {tables.map((table) => (
                  <TableCard
                    key={table.tableId}
                    id={table.tableCode}
                    pax={table.seatingCapacity}
                    status={table.status === 'EMPTY' ? 'available' : 'occupied'}
                    disabled={table.status === 'OCCUPIED'}
                    onPress={() => {
                      if (table.status === 'EMPTY') {
                        onTableSelect(table.tableCode);
                      }
                    }}
                  />
                ))}
              </View>

              {tables.length === 0 && (
                <Text style={styles.empty}>Không tìm thấy bàn phù hợp</Text>
              )}
            </ScrollView>
          )}

          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelText}>Trở về</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  empty: {
    textAlign: "center",
    marginTop: 20,
    color: "#777"
  },
  cancelButton: {
    backgroundColor: "#E0E0E0",
    paddingVertical: 12,
    marginTop: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  cancelText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "600"
  },
});
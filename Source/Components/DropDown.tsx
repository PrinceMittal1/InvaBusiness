// Components/Dropdown.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
} from 'react-native';
import Colors from '../Keys/colors';
import AppFonts from '../Functions/Fonts';

interface DropdownProps {
  options: string[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  containerStyle?:any;
  label?: string;
  removeItem?: any;
  alreadySelectedOptions ?: any;
  selectedTextStyle?:any;
}

const Dropdown: React.FC<DropdownProps> = ({
  options,
  selectedValue,
  onValueChange,
  containerStyle,
  removeItem,
  alreadySelectedOptions,
  selectedTextStyle,
  label,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const handleSelect = (value: string) => {
    onValueChange(value);
    setModalVisible(false);
  };

  const removeItems = (value: string) =>{
    removeItem(value);
    setModalVisible(false);
  }


  const selectedOrNot = (item) =>{
    if(!alreadySelectedOptions || alreadySelectedOptions?.length == 0) return false
    if(alreadySelectedOptions?.includes(item)) return true
    return false
  }

  return (
    <View style={[styles.container, containerStyle]}>

      <TouchableOpacity
        style={styles.dropdown}
        onPress={() => setModalVisible(true)}
      >
        <Text style={[styles.selectedText, selectedTextStyle]}>{selectedValue || label || 'Select an option'}</Text>
      </TouchableOpacity>

      <Modal transparent visible={modalVisible} animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <FlatList
              data={options}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={selectedOrNot(item) ? styles.optionSelected : styles?.option}
                  onPress={() => {selectedOrNot(item) ? removeItems(item) : handleSelect(item) }}
                >
                  <Text>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default Dropdown;

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    width: '100%',
  },
  label: {
    fontSize: 16,
    marginBottom: 4,
    color: '#333',
  },
  dropdown: {
    padding: 12,
    borderWidth: 1,
    borderColor: Colors?.buttonPrimaryColor,
    borderRadius: 8,
  },
  selectedText: {
    fontSize: 16,
    color: Colors?.DarkText,
    fontFamily:AppFonts.Regular
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#00000080',
  },
  modalContainer: {
    marginHorizontal: 40,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    maxHeight: '50%',
  },
  option: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  optionSelected : {
    padding: 12,
    borderBottomWidth: 1,
    backgroundColor:'red',
    borderBottomColor: '#eee',
  },
});

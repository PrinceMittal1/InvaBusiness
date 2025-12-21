// Components/Dropdown.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  TextInput,
} from 'react-native';
import Colors from '../Keys/colors';
import AppFonts from '../Functions/Fonts';
import { wp } from '../Keys/dimension';
import FastImage from '@d11/react-native-fast-image';
import Images from '../Keys/Images';

function searchItems(query, arr) {
  if (!query) return arr;

  query = query.toLowerCase();

  return arr
    .filter(item => item.toLowerCase().includes(query)) 
    .sort((a, b) => {
      let aLower = a.toLowerCase();
      let bLower = b.toLowerCase();

      let aStarts = aLower.startsWith(query);
      let bStarts = bLower.startsWith(query);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;

      return aLower.indexOf(query) - bLower.indexOf(query);
    });
}

interface DropdownProps {
  options: string[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  containerStyle?: any;
  label?: string;
  removeItem?: any;
  alreadySelectedOptions?: any;
  selectedTextStyle?: any;
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
  const [tempoptions, setTempOptions] = useState(options);
  const [searchVal, setSearchVal] = useState('')

  const handleSelect = (value: string) => {
    onValueChange(value);
    setModalVisible(false);
  };

  const removeItems = (value: string) => {
    removeItem(value);
    setModalVisible(false);
  }

  useEffect(()=>{
    if(!searchVal || searchVal?.length == 0){
      setTempOptions(options)
    }else{
      const result = searchItems(searchVal, tempoptions)
      setTempOptions(result)
    }
  },[searchVal])


  useEffect(()=>{
    setTempOptions(options)
  },[options])
    
  const selectedOrNot = (item) => {
    if (!alreadySelectedOptions || alreadySelectedOptions?.length == 0) return false
    if (alreadySelectedOptions?.includes(item)) return true
    return false
  }

  return (
    <View style={[styles.container, containerStyle]}>

      <TouchableOpacity
        style={[styles.dropdown]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={[styles.selectedText, selectedTextStyle]}>{selectedValue || label || 'Select an option'}</Text>
        <FastImage
          source={Images?.downArrow}
          style={styles.arrowIcon}
          tintColor={Colors?.buttonPrimaryColor}
          resizeMode="contain"
        />
      </TouchableOpacity>

      <Modal transparent visible={modalVisible} animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={{ borderWidth: 1, paddingHorizontal: wp(2), flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderColor: Colors.buttonPrimaryColor, borderRadius: wp(2) }}>
              <TextInput
                value={searchVal}
                onChangeText={setSearchVal}
                style={{ fontSize: 16, flex: 1 }}
              />
              <FastImage
                source={Images.Cancel}
                style={{ width: wp(4), height: wp(4) }}
                resizeMode='contain' />
            </View>
            <FlatList
              data={tempoptions}
              keyExtractor={(item) => item}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  style={[selectedOrNot(item) ? styles.optionSelected : styles?.option, index == 0 && {marginTop:6}, index == tempoptions?.length - 1 && {borderBottomWidth:0}]}
                  onPress={() => { selectedOrNot(item) ? removeItems(item) : handleSelect(item) }}
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
    width: '100%',
  },
  label: {
    fontSize: 16,
    marginBottom: 4,
    color: '#333',
  },
  dropdown: {
    height: wp(12),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors?.buttonPrimaryColor,
    borderRadius: 8,
  },
  selectedText: {
    fontSize: 16,
    color: Colors?.DarkText,
    fontFamily: AppFonts.Regular
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
  optionSelected: {
    padding: 12,
    borderBottomWidth: 1,
    borderRadius:10,
    backgroundColor: Colors?.buttonPrimaryColor,
    borderBottomColor: '#eee',
  },
  arrowIcon: {
    width: wp(5),
    height: wp(5),
  }
});

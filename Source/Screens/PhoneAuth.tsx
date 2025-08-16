import React, { useState } from 'react';
import { View, TextInput, Button, Text } from 'react-native';
import auth from '@react-native-firebase/auth';

export default function PhoneAuth() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [confirm, setConfirm] = useState(null);
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');

  // Step 1: Send verification code to phone
  async function signInWithPhoneNumber(phoneNumber) {
    try {
        console.log("code is 2 1")
      const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
       console.log("code is 2", confirmation)
      setConfirm(confirmation);
      setMessage('Code has been sent!');
    } catch (error) {
      setMessage(`Sign In Error: ${error.message}`);
    }
  }

  // Step 2: Confirm code
  async function confirmCode() {
    try {
      await confirm.confirm(code);
      setMessage('Phone authentication successful!');
    } catch (error) {
      setMessage(`Code confirmation error: ${error.message}`);
    }
  }

  console.log("code is 1", phoneNumber)
  if (!confirm) {
    return (
      <View style={{}}>
        <TextInput
          placeholder="+1234567890"
          onChangeText={text => setPhoneNumber(text)}
          keyboardType="phone-pad"
          autoComplete="tel"
          value={phoneNumber}
          style={{borderBottomWidth:1, marginBottom:10}}
        />
        <Button title="Send Code" onPress={() => signInWithPhoneNumber(phoneNumber)} />
        {message ? <Text>{message}</Text> : null}
      </View>
    );
  }

  // Show code input & confirm button
  return (
    <View style={{backgroundColor:'red'}}>
      <TextInput
        placeholder="Enter verification code"
        onChangeText={text => setCode(text)}
        keyboardType="number-pad"
        value={code}
        style={{borderBottomWidth:1, marginBottom:10}}
      />
      <Button title="Confirm Code" onPress={() => confirmCode()} />
      {message ? <Text>{message}</Text> : null}
    </View>
  );
}

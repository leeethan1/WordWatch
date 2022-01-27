import React, { useState, useEffect } from 'react';
import { Avatar, Button, Card, Title, Paragraph, TextInput, Dialog, Portal, Modal } from 'react-native-paper';
import { StyleSheet, Text, View } from 'react-native';
import { Audio } from 'expo-av';
import S3FileUpload from 'react-s3';
import Styles from './Styles';
import { RNS3 } from 'react-native-aws3';
import {
  S3Client,
  CreateBucketCommand,
  PutObjectCommand,
  GetObjectCommand,
  DeleteBucketCommand,
  GetBucketPolicyCommand,
} from "@aws-sdk/client-s3";

import { Stopwatch, Timer } from 'react-native-stopwatch-timer';
import { CognitoIdentityClient } from "@aws-sdk/client-cognito-identity";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-provider-cognito-identity";
import "react-native-get-random-values";
import "react-native-url-polyfill/auto";

import * as FileSystem from 'expo-file-system';

global.Buffer = global.Buffer || require('buffer').Buffer;

export default function Content() {
  const [recording, setRecording] = useState();
  const [isRecording, setIsRecording] = useState(false);
  const [stopwatchStart, setStopwatchStart] = useState(false);
  const [stopwatchReset, setStopwatchReset] = useState(false);
  const [visible, setVisible] = useState(false);
  const [input, setInput] = useState("");
  const [curr, setCurr] = useState(0);

  const bucketName = "ladsjfklds32847238";
  const region = "us-east-1";
  const client = new S3Client({
    region,
    credentials: fromCognitoIdentityPool({
      client: new CognitoIdentityClient({ region }),
      identityPoolId: "us-east-1:0f8760b9-8bd8-40cb-b02d-b9bd704664a0",
    }),
  });

  // const createBucket = async () => {
  //   try {
  //     await client.send(new CreateBucketCommand({ Bucket: bucketName }));
  //     console.log(`Bucket "${bucketName}" created.`);
  //   } catch (e) {
  //     console.log(e);
  //   }
  // };

  const uploadToBucket = async (uri) => {
    try {
      let time = new Date().getTime();
      setCurr(time);
      let data = await readFile(uri);
      console.log(data);
      const file = {
        Bucket: "word-watch-bucket",
        Key: `${time}.m4a`,
        Body: data
      }
      await client.send(new PutObjectCommand(file));
      console.log("lets goo");
    } catch (e) {
      console.log(e);
    }
  };

  const fetchFromBucket = async () => {
    // let data = await client.send(new PutObjectCommand({Bucket: 'word-watch-output',
    //   Key: "WWTranscribeJob" + time_val + ".json"}));
    try {
      function downloadBlob(blob, name = `test.csv`) {
          // Convert your blob into a Blob URL (a special url that points to an object in the browser's memory)
          const blobUrl = URL.createObjectURL(blob);
          // Create a link element

      }
      console.log('fetching');
      let data = await client.send(new GetObjectCommand({ Bucket: 'word-watch-output', Key: "WWTranscribeJob1642913270820.json"}));
      let csvBlob = new Blob([data.Body.toString()], {
        type: 'text/csv;charset=utf-8;',
      });
      downloadBlob(csvBlob, `test`);
      console.log(JSON.stringify(data));
    }
    catch (e) {
      console.log(e);
    }
  };


  async function readFile(uri) {
    let data = await FileSystem.readAsStringAsync(uri, {encoding: FileSystem.EncodingType.Base64});
    console.log(uri);
    // console.log(data);
    return data;
  }

  async function startRecording() {
    if (input !== "") {
      try {
        console.log('Requesting permissions..');
        await Audio.requestPermissionsAsync();
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        }); 
        console.log('Starting recording..');
        const { recording } = await Audio.Recording.createAsync(
          Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
        );
        setRecording(recording);
        console.log('Recording started');
        setStopwatchReset(true);
        setStopwatchReset(false);
        setStopwatchStart(true);
        setIsRecording(true);
      } catch (err) {
        console.error('Failed to start recording', err);
      }
    }
    else {
      setVisible(true);
      // fetchFromBucket();
    }
  }

  async function stopRecording() {
    console.log('Stopping recording..');
    setStopwatchStart(false);
    setRecording(undefined);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI(); 
    console.log('Recording stopped and stored at', uri);
    console.log("test");
    // uploadDocument(uri);
    uploadToBucket(uri);
    // createBucket();
    setIsRecording(false);
  }

  // async function uploadDocument(uri) {
  //   const file = {
  //     uri: uri,
  //     name: "ethan.m4a",
  //     type: "audio/mp4"
  //   }
  //   const options = {
  //     bucket: 'word-watch-bucket',
  //     region: 'us-east-1',
  //     accessKey: 'AKIAVILI6HXNPLU5BXYO',
  //     secretKey: '{secret-key}',
  //     successActionStatus: 201
  //   }
     
  //   RNS3.put(file, options).then(response => {
  //     if (response.status !== 201) {
  //       console.log('status code: ', response.status);
  //       console.log(response);
  //     }
  //     else {
  //       console.log(response.body);
  //     }
    
  //   });
  // }

  function displayButton() {
    if (!isRecording) {
      return (
        <Button style={Styles.button} mode="contained" icon="record" onPress={startRecording}>
        RECORD
        </Button>
      )
    }
    else {
      return (
        <Button style={Styles.button} icon="stop" mode="outlined" onPress={stopRecording}>
          STOP
        </Button>
      )
    }
  }
  return (
    <Card style={Styles.card}>
      <Text style={Styles.title}>WordWatch</Text>
      <Portal>
        <Modal visible={visible} onDismiss={() => setVisible(false)}>
          <View style={Styles.background}>
            <Text style={Styles.title}>Please enter word</Text>
          </View>
        </Modal>
        {/* <Dialog visible={visible} onDismiss={() => setVisible(false)}>
              <Dialog.Title>Alert</Dialog.Title>
              <Dialog.Content>
                <Paragraph>Please enter input</Paragraph>
              </Dialog.Content>
              <Dialog.Actions>
                <Button onPress={() => setVisible(false)}>Done</Button>
              </Dialog.Actions>
        </Dialog> */}
      </Portal>
      <TextInput
        label="Word to find..."
        value={input}
        onChangeText={text => setInput(text)}
        mode='outlined'
        style={Styles.input}
      />
      <Stopwatch laps msecs start={stopwatchStart}
        reset={stopwatchReset}
        options={options}
       />
      {displayButton()}
    </Card>
  )
}

const options = {
  container: {
    backgroundColor: '#000',
    padding: 5,
    borderRadius: 5,
    width: 235,
    marginLeft: 'auto',
    marginRight: 'auto',
    marginBottom: 20,
    marginTop: 100
  },
  text: {
    fontSize: 30,
    color: '#FFF',
    marginLeft: 7,
  }
};
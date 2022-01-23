import React, { useState, useEffect } from 'react';
import { Avatar, Button, Card, Title, Paragraph } from 'react-native-paper';
import { StyleSheet, Text, View } from 'react-native';
import { Audio } from 'expo-av';
import S3FileUpload from 'react-s3';
import Styles from './Styles';
import { RNS3 } from 'react-native-aws3';
import {
  S3Client,
  CreateBucketCommand,
  PutObjectCommand,
  DeleteBucketCommand,
} from "@aws-sdk/client-s3";

import { CognitoIdentityClient } from "@aws-sdk/client-cognito-identity";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-provider-cognito-identity";
import "react-native-get-random-values";
import "react-native-url-polyfill/auto";

global.Buffer = global.Buffer || require('buffer').Buffer

export default function Content() {
  const [recording, setRecording] = useState();
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState('00:00:00');
  // const [recordSecs, setRecordSecs] = useState(0);

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
      const file = {
        Bucket: "word-watch-bucket",
        Key: "ethan.m4a",
        Body: uri
      }
      await client.send(new PutObjectCommand(file));
      console.log("lets goo");
    } catch (e) {
      console.log(e);
    }
  };

  async function startRecording() {
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
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }

  async function stopRecording() {
    console.log('Stopping recording..');
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
  //     secretKey: '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',
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
      <Title style={Styles.title}>{recordTime}</Title>
      {displayButton()}
    </Card>
  )
}
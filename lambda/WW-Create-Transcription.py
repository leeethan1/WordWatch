import json
import boto3
import base64

def lambda_handler(event, context):
    
    s3client = boto3.client('s3')
    transcribeclient = boto3.client('transcribe')

    
    # print(json.dumps(event, indent=2))
    
    awsregion = 'us-east-1'
    bucketname = event['Records'][0]['s3']['bucket']['name']
    keyprefix = ''
    objectkey = event['Records'][0]['s3']['object']['key']
    name = 'WWTranscribeJob:' + objectkey[:objectkey.find('.')]
    name = name.replace(':', '')
    
    
    # https://s3-us-east-1.amazonaws.com/examplebucket/example.mp4
    
    # https://s3-us-east-1.amazonaws.com/my-s3-bucket/HappyFace.jpg
    
    # object = client.get_object(Bucket='word-watch-output', Key=objectkey, Range='bytes=0-1024')
    
    print(objectkey)
    
    object = s3client.get_object(Bucket='word-watch-bucket', Key=objectkey)
    
    text = object["Body"].read()
    # print(size())
    
    obj_binary = base64.b64decode(text)
    
    filename = objectkey[:objectkey.find('.')] + '.mp4'
    s3client.put_object(Body=obj_binary, Bucket='word-watch-converted', Key=filename)
    
    if keyprefix != '':
        uri = 'https://s3-' + awsregion + '.amazonaws.com/word-watch-converted/' + keyprefix + '/' + filename
    else:
        uri = 'https://s3-' + awsregion + '.amazonaws.com/word-watch-converted/' + filename
    
    print(uri)
    
    
    response = transcribeclient.start_transcription_job(
        TranscriptionJobName=name,
        LanguageCode='en-US',
        MediaSampleRateHertz=44100,
        MediaFormat='mp4',
        Media={
            'MediaFileUri': uri
        },
        OutputBucketName='word-watch-output'
    )
    
    print(response)
        
    
    
    # # TODO implement
    # return {
    #     'statusCode': 200,
    #     'body': json.dumps('Hello from Lambda!')
    # }

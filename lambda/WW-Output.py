import json
import boto3
import zipfile

def lambda_handler(event, context):
    resource = boto3.resource('s3')
    client = boto3.client('s3')

    
    # print(event['Records'][0]['s3']['object']['key'])
    
    awsregion = 'us-east-1'
    bucketname = event['Records'][0]['s3']['bucket']['name']
    keyprefix = ''
    objectkey = event['Records'][0]['s3']['object']['key']
    # print(json.dumps(event, indent=2))
    
    if keyprefix != '':
        uri = 'https://s3-' + awsregion + '.amazonaws.com/' + bucketname + '/' + keyprefix + '/' + objectkey
    else:
        uri = 'https://s3-' + awsregion + '.amazonaws.com/' + bucketname + '/' + objectkey
        
        
    # client.download_file(Bucket=bucketname, Key=objectkey, Filename= '/tmp/' + objectkey)
    # print(open('/tmp/' + objectkey).read())

    
    # print(uri)
    
    object = client.get_object(Bucket='word-watch-output', Key=objectkey)
    

    # print (object)
    text = object["Body"].read().decode('utf-')
    transcription_json = json.loads(text[:text.find('\"items\"')-1] + '}}')
    transcript = transcription_json['results']['transcripts'][0]['transcript']
    print(transcript)
    
    searchstring = 'the'

    count = transcript.lower().count(searchstring)
    print(transcript.lower().count(searchstring))
    
    filename = objectkey[:objectkey.find('.')] + '.txt'
    binary = bin(count)
    client.put_object(Body=binary, Bucket='word-watch-results', Key=filename)
    

    # response = s3_client.upload_file(filename, bucket, object_name)


    
    
    # file_content = object.get()['Body'].read().decode('utf-8')
    # json_content = json.loads(file_content)
    

    # print(json.dumps(json_content, indent=2))
    
    return {
        'statusCode': 200,
        'body': json.dumps('Hello from Lambda!')
    }
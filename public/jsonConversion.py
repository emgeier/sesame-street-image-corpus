import boto3
import json
import os
from decimal import Decimal
from datetime import datetime

s3 = boto3.client('s3')
dynamodb = boto3.resource('dynamodb')

def convert_to_decimal(item):
    """ Recursively convert float values to Decimal in the given item. """
    if isinstance(item, list):
        return [convert_to_decimal(i) for i in item]
    elif isinstance(item, dict):
        return {k: convert_to_decimal(v) for k, v in item.items()}
    elif isinstance(item, float):
        return Decimal(str(item))
    return item
    
def separate_filename(filename: str) -> tuple[str, str]:
    """
    Separates the filename into episode_id and image_id components.

    Args:
    filename (str): The input filename, assumed to be in the format "episode_id_image_id.ext".

    Returns:
    tuple: A tuple containing episode_id and image_id.
    """
    try:
        episode_id, image_id_with_ext = filename.split('_', 1)  # Split only on the first underscore
        image_id = image_id_with_ext.split('.')[0]  # Remove the file extension from image_id
        return episode_id, image_id
    except ValueError:
        raise ValueError("Filename format should be 'episode_id_image_id.ext'")
        
def extract_title_and_season_from_key(key):
    # Extract the folder name from the path and split by underscores
    folder_removed_name = os.path.basename(key)
    parts = folder_removed_name.split('_')
    season = parts[0][1:]   # e.g., 'S48'
    title = ' '.join(parts[1:]).replace('-', ' ')  # e.g., 'Rosita And Elmo Teach Yoga'
    return title, season        

def lambda_handler(event, context):
    print(f"Event received: {event}")
    image_table_name = os.environ['IMAGES_TABLE']
    annotation_table_name = os.environ['ANNOTATIONS_TABLE']
    image_table = dynamodb.Table(image_table_name)
    annotation_table = dynamodb.Table(annotation_table_name)

    # Get the S3 bucket and object key
    bucket = os.environ['BUCKET']
    key = event['Records'][0]['s3']['object']['key']

    # Get the JSON file from S3
    response = s3.get_object(Bucket=bucket, Key=key)
    json_data = json.loads(response['Body'].read().decode('utf-8'))

    print(f"Parsed JSON data: {json_data}")
    
    # This table can be pared down if sources and sizes and image type same
    # Can add episode table if necessary
    title, season = extract_title_and_season_from_key(key)

    def insert_image_to_dynamodb(image_data):
        try:
            episode_id, image_id = separate_filename(image_data['filename'])
            print(f"image item: {image_data['filename']}")
            print(f"episode id: {episode_id}")
            print(f"image id : {image_id}")
            current_time = datetime.utcnow().isoformat() + 'Z'
            image_item = {
                'episode_id': episode_id,
                'image_id': image_id,
                'isRestricted': False,  # or set appropriately
                'source': image_data['source'],
                'height': image_data['size']['height'],
                'width': image_data['size']['width'],
                'createdAt': current_time,
                'updatedAt': current_time,
                'season': '48',
                'epidsode_title': 'Rosie and Elmo Teach Yoga'
            }
            image_table.put_item(Item=image_item)

            return image_data['filename']
        except Exception as e:
            print(f"Error inserting image data: {e}")
            return None

    def insert_annotations_to_dynamodb(image_id, annotations):
        try:
            with annotation_table.batch_writer() as batch:
                for annotation in annotations:
                    print(f"imageId: {image_id}")
                    print(f"annotation: {annotation['id']}")
                    current_time = datetime.utcnow().isoformat() + 'Z'
                    annotation_item = {
                        'annotation_id': (annotation['id']),
                        'image_id': image_id,
                        'category': annotation['name'],
                        'deleted': annotation['deleted'],
                        'verified': annotation['verified'],
                        'occluded': annotation['occluded'],
                        'polygon': annotation['polygon'],
                        'attributes': annotation['attributes'],
                        'createdAt': current_time,
                        'updatedAt': current_time
                    }
                    # Only include relevant attributes
                    for key, value in annotation['attributes'].items():
                        annotation_item[key] = value
                    batch.put_item(Item=convert_to_decimal(annotation_item))
                    
            return True
        except Exception as e:
            print(f"Error inserting annotation data: {e}")
            return False

    if 'images' in json_data:
        for item in json_data['images']:
            print(f"Processing item: {item}")
            image_id = insert_image_to_dynamodb(item)
            # if image_id:
                # print(f"Processing item: {item['annotations']}")
                # success = insert_annotations_to_dynamodb(image_id, item['annotations'])
                # if not success:
                    # print(f"Failed to insert annotations for image_id: {image_id}")

    return {
        'statusCode': 200,
        'body': json.dumps('Data inserted successfully.')
    }

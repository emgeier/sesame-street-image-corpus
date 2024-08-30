import boto3
import pandas as pd
import os

# Initialize the session using your profile
session = boto3.Session(profile_name='ssa')

# Initialize the DynamoDB resource using the session
dynamodb = session.resource('dynamodb')

# Specify the DynamoDB table name
dev_table_name = 'Image-s2dybmsrjrh3hompflad27gwna-NONE'
table_name = 'Image-k7d2eq3he5azraxnohjwkepcem-NONE'

table = dynamodb.Table(table_name)

# Load the CSV file into a DataFrame
csv_file_path = os.path.expanduser('~/Documents/air_years.csv')
data = pd.read_csv(csv_file_path)

# Function to update air_year in the DynamoDB table
def update_air_year_for_episode(episode_id, air_year):
    try:
        # Query to get all items for the episode_id
        response = table.query(
            KeyConditionExpression=boto3.dynamodb.conditions.Key('episode_id').eq(episode_id)
        )
        items = response['Items']

       # Update each item with the air_year
        for item in items:
            table.update_item(
                Key={'episode_id': episode_id, 'image_id': item['image_id']},
                UpdateExpression='SET air_year = :air_year',
                ExpressionAttributeValues={':air_year': air_year}
            )
        print(f"Updated all items for episode_id {episode_id} with air_year {air_year}")
    except Exception as e:
        print(f"Error updating items for episode_id {episode_id}: {e}")

# Iterate over each row in the DataFrame and update the DynamoDB table
for index, row in data.iterrows():
    episode_id = str(row['episode_id'])
    air_year = int(row['air_year'])
    update_air_year_for_episode(episode_id, air_year)

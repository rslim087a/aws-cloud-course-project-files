import json
import boto3
import uuid
from datetime import datetime
import os

# Initialize DynamoDB
dynamodb = boto3.resource('dynamodb')
table_name = os.environ.get('TABLE_NAME', 'CloudTaskTable')
table = dynamodb.Table(table_name)

def lambda_handler(event, context):
    """
    Lambda function to create a new task
    """
    try:
        # Parse request body
        body = json.loads(event['body'])
        title = body.get('title', '').strip()
        
        if not title:
            return {
                'statusCode': 400,
                'headers': get_cors_headers(),
                'body': json.dumps({'error': 'Task title is required'})
            }
        
        # Get user ID from Cognito authorizer
        user_id = event['requestContext']['authorizer']['claims']['sub']
        
        # Generate unique task ID
        task_id = str(uuid.uuid4())
        
        # Create task item
        item = {
            'userId': user_id,
            'taskId': task_id,
            'title': title,
            'completed': False,
            'createdAt': datetime.now().isoformat()
        }
        
        # Save to DynamoDB
        table.put_item(Item=item)
        
        return {
            'statusCode': 200,
            'headers': get_cors_headers(),
            'body': json.dumps(item)
        }
        
    except KeyError as e:
        print(f"Missing key: {e}")
        return {
            'statusCode': 401,
            'headers': get_cors_headers(),
            'body': json.dumps({'error': 'Unauthorized - Invalid token'})
        }
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': get_cors_headers(),
            'body': json.dumps({'error': 'Internal server error'})
        }

def get_cors_headers():
    """
    Return CORS headers for API responses
    """
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,PUT,DELETE'
    }

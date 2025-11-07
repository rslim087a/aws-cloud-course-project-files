import json
import boto3
import os

# Initialize DynamoDB
dynamodb = boto3.resource('dynamodb')
table_name = os.environ.get('TABLE_NAME', 'CloudTaskTable')
table = dynamodb.Table(table_name)

def lambda_handler(event, context):
    """
    Lambda function to delete a task
    """
    try:
        # Get user ID from Cognito authorizer
        user_id = event['requestContext']['authorizer']['claims']['sub']
        
        # Get task ID from path parameters
        task_id = event['pathParameters']['taskId']
        
        # Delete task from DynamoDB
        table.delete_item(
            Key={
                'userId': user_id,
                'taskId': task_id
            }
        )
        
        return {
            'statusCode': 200,
            'headers': get_cors_headers(),
            'body': json.dumps({'message': 'Task deleted successfully'})
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

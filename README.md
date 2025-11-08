# AWS Cloud Tutorial

This repository contains the project files for the AWS Cloud Youtube course.

## JSONs for DynamoDB Test Items (Before Lambda)

```json
{
  "userId": "demo-user-123",
  "taskId": "task-001",
  "title": "Buy groceries",
  "completed": true,
  "createdAt": "2025-11-07T10:30:00.000Z"
}
```

```json
{
  "userId": "demo-user-123",
  "taskId": "task-002",
  "title": "Finish AWS tutorial",
  "completed": false,
  "createdAt": "2025-11-07T14:15:00.000Z"
}
```

```json
{
  "userId": "demo-user-123",
  "taskId": "task-003",
  "title": "Schedule dentist appointment",
  "completed": false,
  "createdAt": "2025-11-07T16:45:00.000Z"
}
```

```json
{
  "userId": "different-user-456",
  "taskId": "task-004",
  "title": "Call mom",
  "completed": false,
  "createdAt": "2025-11-07T09:00:00.000Z"
}
```

## JSONs for Lambda Test Events (Before API Gateway)

### **CreateTask Lambda - Test Event**
```json
{
  "body": "{\"title\": \"Test task from Lambda console\"}",
  "requestContext": {
    "authorizer": {
      "claims": {
        "sub": "test-user-123"
      }
    }
  }
}
```

### **GetTasks Lambda - Test Event**
```json
{
  "requestContext": {
    "authorizer": {
      "claims": {
        "sub": "test-user-123"
      }
    }
  }
}
```

### **UpdateTask Lambda - Test Event**
```json
{
  "body": "{\"completed\": true}",
  "pathParameters": {
    "taskId": "PUT-ACTUAL-TASK-ID-HERE"
  },
  "requestContext": {
    "authorizer": {
      "claims": {
        "sub": "test-user-123"
      }
    }
  }
}
```

### **DeleteTask Lambda - Test Event**
```json
{
  "pathParameters": {
    "taskId": "PUT-ACTUAL-TASK-ID-HERE"
  },
  "requestContext": {
    "authorizer": {
      "claims": {
        "sub": "test-user-123"
      }
    }
  }
}
```

---

## Part 2: API Gateway CURL Commands (Before Cognito)

**⚠️ IMPORTANT:** When you first create API Gateway endpoints **WITHOUT** Cognito authorizer, they'll work with these curl commands. Once you add Cognito, these will fail with 401 Unauthorized.

### **1. Create a Task (POST /tasks)**
```bash
curl -X POST https://YOUR-API-ID.execute-api.us-east-1.amazonaws.com/prod/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Buy groceries"}'
```

**Expected Response:**
```json
{
  "userId": "test-user-123",
  "taskId": "abc-123-xyz",
  "title": "Buy groceries",
  "completed": false,
  "createdAt": "2025-11-07T12:34:56.789Z"
}
```

### **2. Get All Tasks (GET /tasks)**
```bash
curl -X GET https://YOUR-API-ID.execute-api.us-east-1.amazonaws.com/prod/tasks
```

**Expected Response:**
```json
[
  {
    "userId": "test-user-123",
    "taskId": "abc-123-xyz",
    "title": "Buy groceries",
    "completed": false,
    "createdAt": "2025-11-07T12:34:56.789Z"
  }
]
```

### **3. Update a Task (PUT /tasks/{taskId})**
```bash
# Replace TASK-ID with actual taskId from create response
curl -X PUT https://YOUR-API-ID.execute-api.us-east-1.amazonaws.com/prod/tasks/TASK-ID \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'
```

**Expected Response:**
```json
{
  "message": "Task updated successfully",
  "task": {
    "userId": "test-user-123",
    "taskId": "abc-123-xyz",
    "title": "Buy groceries",
    "completed": true,
    "createdAt": "2025-11-07T12:34:56.789Z"
  }
}
```

### **4. Delete a Task (DELETE /tasks/{taskId})**
```bash
# Replace TASK-ID with actual taskId
curl -X DELETE https://YOUR-API-ID.execute-api.us-east-1.amazonaws.com/prod/tasks/TASK-ID
```

**Expected Response:**
```json
{
  "message": "Task deleted successfully"
}
```

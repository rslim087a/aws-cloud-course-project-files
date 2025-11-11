# AWS Cloud Tutorial

This repository contains the project files for the AWS Cloud [Youtube](https://youtu.be/rO5C4LJ-iNE) and [Written](https://rayanslim.com/course/aws-cloud-course) course.

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

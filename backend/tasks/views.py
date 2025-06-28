from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from bson import ObjectId
from pymongo import MongoClient

client = MongoClient("mongodb+srv://pavithrakihub:pavithrakihub123@cluster0.emiseef.mongodb.net/")
db = client["todo_db"]
collection = db["tasks"]

def serialize_task(task):
    task["_id"] = str(task["_id"])
    return task

@csrf_exempt
def task_list(request):
    if request.method == "GET":
        tasks = list(collection.find())
        return JsonResponse([serialize_task(t) for t in tasks], safe=False)

    if request.method == "POST":
        data = json.loads(request.body)
        task = {"title": data["title"], "completed": data.get("completed", False)}
        result = collection.insert_one(task)
        return JsonResponse(serialize_task(collection.find_one({"_id": result.inserted_id})), status=201)

@csrf_exempt
def task_detail(request, task_id):
    task = collection.find_one({"_id": ObjectId(task_id)})
    if not task:
        return JsonResponse({"error": "Task not found"}, status=404)

    if request.method == "GET":
        return JsonResponse(serialize_task(task))

    if request.method == "PUT":
        data = json.loads(request.body)
        updated = {
            "title": data.get("title", task["title"]),
            "completed": data.get("completed", task["completed"]),
        }
        collection.update_one({"_id": ObjectId(task_id)}, {"$set": updated})
        return JsonResponse(serialize_task(collection.find_one({"_id": ObjectId(task_id)})))

    if request.method == "DELETE":
        collection.delete_one({"_id": ObjectId(task_id)})
        return JsonResponse({"message": "Task deleted"}, status=204)

    return JsonResponse({"error": "Invalid method"}, status=405)
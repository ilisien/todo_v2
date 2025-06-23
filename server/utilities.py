def patch_task_by_id(blob,id,patch):
    for task in blob:
        if task.get('id') == id:
            task.update(patch)
            return True
        elif patch_task_by_id(task.get('children'),id,patch):
            return True
    return False
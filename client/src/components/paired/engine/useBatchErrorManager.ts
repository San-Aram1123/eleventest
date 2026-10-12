import { useState, useRef } from 'react';
import { BatchErrorItem } from '../BatchErrorInspector';
import { FailedBatchTask } from './types';

export function useBatchErrorManager() {
  const [errorList, setErrorList] = useState<BatchErrorItem[]>([]);
  const [failedTasks, setFailedTasks] = useState<FailedBatchTask[]>([]);
  const failedTasksMapRef = useRef<Map<string, FailedBatchTask>>(new Map());

  const recordFailedTask = (task: FailedBatchTask) => {
    failedTasksMapRef.current.set(task.id, task);
    setFailedTasks(Array.from(failedTasksMapRef.current.values()));
    setErrorList(prev => [...prev, {
      timestamp: new Date().toLocaleTimeString(),
      familyId: task.familyId,
      emotion: task.emotion,
      error: task.error
    }]);
  };

  const recordTaskSuccess = (taskId: string, familyId: string, emotion: string) => {
    if (failedTasksMapRef.current.has(taskId)) {
      failedTasksMapRef.current.delete(taskId);
      setFailedTasks(Array.from(failedTasksMapRef.current.values()));
      setErrorList(prev => prev.filter(e => !(e.familyId === familyId && e.emotion === emotion)));
    }
  };

  const clearErrors = () => {
    setErrorList([]);
    failedTasksMapRef.current.clear();
    setFailedTasks([]);
  };

  const resetForFreshRun = () => {
    failedTasksMapRef.current.clear();
    setFailedTasks([]);
    setErrorList([]);
  };

  return {
    errorList,
    setErrorList,
    failedTasks,
    setFailedTasks,
    failedTasksMapRef,
    recordFailedTask,
    recordTaskSuccess,
    clearErrors,
    resetForFreshRun
  };
}

import { Test } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { TaskRepository } from './task.repository';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { TaskStatus } from './task-status.enum';
import { CreateTaskDto } from './dto/create-task.dto';
import { NotFoundException } from '@nestjs/common';

const mockUser = { username: 'Tester', id: 12 };

const mockTaskRepository = () => ({
  getTasks: jest.fn(),
  findOne: jest.fn(),
  createTask: jest.fn(),
  delete: jest.fn()
});

describe('TasksService', () => {
   let tasksService;
   let taskRepository;

   beforeEach(async () => {
     const module = await Test.createTestingModule({
       providers: [
         TasksService,
         { provide: TaskRepository, useFactory: mockTaskRepository }
       ]
     }).compile();

     tasksService = module.get<TasksService>(TasksService)
     taskRepository = module.get<TaskRepository>(TaskRepository)
   })

  describe('getTasks', () => {
    it('gets all tasks from the repository', async () => {
      taskRepository.getTasks.mockResolvedValue('someValue');

      expect(taskRepository.getTasks).not.toHaveBeenCalled();

      const filters: GetTasksFilterDto = {
        status: TaskStatus.IN_PROGRESS,
        search: 'Some search string'
      }

      const result = await tasksService.getTasks(filters, mockUser)

      expect(taskRepository.getTasks).toHaveBeenCalled();
      expect(taskRepository.getTasks).toHaveBeenCalledWith(filters, mockUser);

      expect(result).toEqual('someValue')
    })
  })

  describe('getTaskById', () => {
    it('calls taskRepository.findOne() and successfully retrieve and return the result', async () => {
      const desiredResult = { title: 'test title', description: 'test description' };

      taskRepository.findOne.mockResolvedValue(desiredResult)

      const result = await tasksService.getTaskById(1, mockUser);

      expect(result).toEqual(desiredResult);
      expect(taskRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1, userId: mockUser.id }
      })
    })

    it('throws an error if task not found', async () => {
      taskRepository.findOne.mockResolvedValue(null)

      const action = async () => {
        await tasksService.getTaskById(1, mockUser);
      };

      await expect(action()).rejects.toThrow(NotFoundException);
    })
  })

  describe('CreateTask', () => {
    it('should create task', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'test title',
        description: 'test description'
      }

      const desiredResult = {
        title: createTaskDto.title,
        description:  createTaskDto.description,
        status: TaskStatus.OPEN,
      }

      taskRepository.createTask.mockResolvedValue(desiredResult);

      const result = await tasksService.createTask(createTaskDto, mockUser);

      expect(taskRepository.createTask).toHaveBeenCalledWith(createTaskDto, mockUser);
      expect(result).toEqual(desiredResult);
    })
  })

  describe('deleteTask', () => {
    it('calls taskRepository.deleteTask',  async() => {
      const idToDelete= 10;

      taskRepository.delete.mockResolvedValue({ affected: 1 });

      await tasksService.deleteTask(idToDelete, mockUser)

      expect(taskRepository.delete).toHaveBeenCalledWith({
        id: idToDelete,
        userId: mockUser.id
      })
    })

    it('throw an error if task was not found', async () => {
      const idToDelete= 10;

      taskRepository.delete.mockResolvedValue({ affected: 0 });

      const action = async () => {
        await tasksService.deleteTask(idToDelete, mockUser);
      };

      await expect(action()).rejects.toThrow(NotFoundException);
    })
  })

  describe('updateTaskStatus', () => {
    it('should update task status', async () => {
      const desiredResult = {
        title: 'title',
        description:  'description',
        status: TaskStatus.OPEN,
        save: jest.fn().mockResolvedValue(true)
      }

      const desiredId = 10;
      const desiredStatus = TaskStatus.DONE;

      tasksService.getTaskById = jest.fn().mockResolvedValue(desiredResult);

      const result = await tasksService.updateTaskStatus(desiredId, desiredStatus, mockUser);

      expect(tasksService.getTaskById).toHaveBeenCalled();
      expect(tasksService.getTaskById).toHaveBeenCalledWith(desiredId, mockUser);

      expect(result).toEqual({
        ...desiredResult,
        status: desiredStatus
      })
    })
  })
})

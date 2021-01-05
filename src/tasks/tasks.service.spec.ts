import { Test } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { TaskRepository } from './task.repository';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { TaskStatus } from './task-status.enum';

const mockUser = { username: 'Tester' };

const mockTaskRepository = () => ({
  getTasks: jest.fn()
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
})

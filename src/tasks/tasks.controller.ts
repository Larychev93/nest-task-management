import {
  Body,
  Controller,
  Delete,
  Get, Logger,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query, UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { TaskStatusValidationPipe } from './pipes/task-status-validation.pipe';
import { Task } from './task.entity';
import { TaskStatus } from './task-status.enum';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../auth/user.entity';
import { GetUserDecorator } from '../auth/decorators/get-user.decorator';

@Controller('tasks')
@UseGuards(AuthGuard())
export class TasksController {
  private logger = new Logger('TasksController')

  constructor(private tasksService: TasksService) {}

  @Get()
  getTasks(
    @Query(ValidationPipe) filterDto: GetTasksFilterDto,
    @GetUserDecorator() user: User
  ): any {
    this.logger.verbose(`User ${user.username} retrieving all tasks. Filters ${JSON.stringify(filterDto)}`)

    return this.tasksService.getTasks(filterDto, user);
  }

  @Get('/:id')
  getTaskById(
    @Param('id', ParseIntPipe) id: number,
    @GetUserDecorator() user: User
  ): Promise<Task> {
    return this.tasksService.getTaskById(id, user)
  }

  @Post()
  createTask(
    @Body() createTaskDto: CreateTaskDto,
    @GetUserDecorator() user: User
  ): Promise<Task> {
    this.logger.verbose(`User ${user.username} creating new task. Data ${JSON.stringify(createTaskDto)}`)

    return this.tasksService.createTask(createTaskDto, user)
  }

  @Patch('/:id/status')
  updateTaskStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status', TaskStatusValidationPipe) status: TaskStatus,
    @GetUserDecorator() user: User
  ): Promise<Task> {
    return this.tasksService.updateTaskStatus(id, status, user)
  }

  @Delete('/:id')
  deleteTask(
    @Param('id', ParseIntPipe) id: number,
    @GetUserDecorator() user: User
  ): Promise<void> {
    return this.tasksService.deleteTask(id, user)
  }
}

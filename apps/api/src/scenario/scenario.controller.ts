import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RunScenarioDto } from './dto/run-scenario.dto';
import { ScenarioService } from './scenario.service';

@ApiTags('scenarios')
@Controller('scenarios')
export class ScenarioController {
  constructor(private readonly scenarioService: ScenarioService) {}

  @Post('run')
  @ApiOperation({ summary: 'Run a scenario (PRD 002)' })
  run(@Body() dto: RunScenarioDto) {
    return this.scenarioService.run(dto);
  }

  @Get('history')
  @ApiOperation({ summary: 'Last scenario runs' })
  history() {
    return this.scenarioService.recentRuns();
  }
}

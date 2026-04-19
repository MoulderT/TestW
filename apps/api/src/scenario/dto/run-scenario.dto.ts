import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export const SCENARIO_TYPES = [
  'success',
  'validation_error',
  'system_error',
  'slow_request',
  'teapot',
] as const;

export type ScenarioType = (typeof SCENARIO_TYPES)[number];

export class RunScenarioDto {
  @ApiProperty({ enum: SCENARIO_TYPES })
  @IsString()
  @IsIn([...SCENARIO_TYPES])
  type!: ScenarioType;

  @ApiPropertyOptional({ description: 'Optional label for the run' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;
}

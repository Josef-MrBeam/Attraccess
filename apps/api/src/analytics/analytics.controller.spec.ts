import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { DateRangeValue } from './dtos/dateRangeValue';

describe('AnalyticsController', () => {
  let controller: AnalyticsController;
  let service: AnalyticsService;

  const mockAnalyticsService = {
    getResourceUsageHoursInDateRange: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnalyticsController],
      providers: [
        {
          provide: AnalyticsService,
          useValue: mockAnalyticsService,
        },
      ],
    }).compile();

    controller = module.get<AnalyticsController>(AnalyticsController);
    service = module.get<AnalyticsService>(AnalyticsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getResourceUsageHoursInDateRange', () => {
    it('should call service method with date range parameters', async () => {
      const dateRange: DateRangeValue = {
        start: new Date('2023-01-01'),
        end: new Date('2023-01-31'),
      };

      const mockUser = { id: 1, name: 'User 1' };
      const mockResource = { id: 1, name: 'Resource 1' };

      const expectedResult = [
        {
          id: 1,
          resourceId: 1,
          userId: 1,
          startTime: new Date('2023-01-15'),
          endTime: new Date('2023-01-15T02:00:00Z'),
          startNotes: 'Starting session',
          endNotes: 'Ending session',
          usageInMinutes: 120,
          user: mockUser,
          resource: mockResource,
        },
      ];

      mockAnalyticsService.getResourceUsageHoursInDateRange.mockResolvedValue(expectedResult);

      const result = await controller.getResourceUsageHoursInDateRange(dateRange);

      expect(service.getResourceUsageHoursInDateRange).toHaveBeenCalledWith(dateRange);
      expect(result).toEqual(expectedResult);
    });

    it('should return empty array when no usage data is found', async () => {
      const dateRange: DateRangeValue = {
        start: new Date('2023-02-01'),
        end: new Date('2023-02-28'),
      };

      mockAnalyticsService.getResourceUsageHoursInDateRange.mockResolvedValue([]);

      const result = await controller.getResourceUsageHoursInDateRange(dateRange);

      expect(service.getResourceUsageHoursInDateRange).toHaveBeenCalledWith(dateRange);
      expect(result).toEqual([]);
    });

    it('should handle service errors appropriately', async () => {
      const dateRange: DateRangeValue = {
        start: new Date('2023-03-01'),
        end: new Date('2023-03-31'),
      };

      const error = new Error('Database error');
      mockAnalyticsService.getResourceUsageHoursInDateRange.mockRejectedValue(error);

      await expect(controller.getResourceUsageHoursInDateRange(dateRange)).rejects.toThrow(error);
      expect(service.getResourceUsageHoursInDateRange).toHaveBeenCalledWith(dateRange);
    });
  });
});

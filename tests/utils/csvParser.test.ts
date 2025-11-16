import { CSVParser } from '~utils/csvParser';

describe('CSVParser', () => {
  describe('parseContent', () => {
    it('should parse simple CSV content', () => {
      const content = 'prompt\nFirst prompt\nSecond prompt';
      const prompts = CSVParser.parseContent(content);

      expect(prompts).toEqual(['First prompt', 'Second prompt']);
    });

    it('should handle quoted prompts', () => {
      const content = 'prompt\n"A prompt with, comma"\n"Another prompt"';
      const prompts = CSVParser.parseContent(content);

      expect(prompts).toEqual(['A prompt with, comma', 'Another prompt']);
    });

    it('should handle escaped quotes', () => {
      const content = 'prompt\n"A prompt with ""quotes"""';
      const prompts = CSVParser.parseContent(content);

      expect(prompts).toEqual(['A prompt with "quotes"']);
    });

    it('should skip empty lines', () => {
      const content = 'prompt\nFirst prompt\n\n\nSecond prompt\n';
      const prompts = CSVParser.parseContent(content);

      expect(prompts).toEqual(['First prompt', 'Second prompt']);
    });

    it('should skip header row', () => {
      const content = 'Prompt\nActual prompt';
      const prompts = CSVParser.parseContent(content);

      expect(prompts).toEqual(['Actual prompt']);
    });

    it('should handle empty content', () => {
      const prompts = CSVParser.parseContent('');

      expect(prompts).toEqual([]);
    });
  });

  describe('parseFile', () => {
    it('should parse valid CSV file', async () => {
      const content = 'prompt\nTest prompt 1\nTest prompt 2';
      const file = new File([content], 'test.csv', { type: 'text/csv' });

      const result = await CSVParser.parseFile(file);

      expect(result.success).toBe(true);
      expect(result.prompts).toEqual(['Test prompt 1', 'Test prompt 2']);
    });

    it('should handle empty CSV file', async () => {
      const file = new File([''], 'test.csv', { type: 'text/csv' });

      const result = await CSVParser.parseFile(file);

      expect(result.success).toBe(false);
      expect(result.error).toBe('No valid prompts found in CSV file');
    });
  });

  describe('exportToCSV', () => {
    it('should export prompts to CSV format', () => {
      const prompts = ['First prompt', 'Second prompt'];
      const csv = CSVParser.exportToCSV(prompts);

      expect(csv).toBe('prompt\n"First prompt"\n"Second prompt"');
    });

    it('should escape quotes in prompts', () => {
      const prompts = ['Prompt with "quotes"'];
      const csv = CSVParser.exportToCSV(prompts);

      expect(csv).toBe('prompt\n"Prompt with ""quotes"""');
    });

    it('should handle empty array', () => {
      const csv = CSVParser.exportToCSV([]);

      expect(csv).toBe('prompt\n');
    });
  });

  describe('downloadCSV', () => {
    it('should create download link with correct attributes', () => {
      const prompts = ['Test prompt'];
      const createElementSpy = jest.spyOn(document, 'createElement');
      const clickSpy = jest.fn();

      CSVParser.downloadCSV(prompts, 'test.csv');

      expect(createElementSpy).toHaveBeenCalledWith('a');
    });
  });
});

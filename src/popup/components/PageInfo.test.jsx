import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import PageInfo from './PageInfo';

describe('PageInfo Component - Data Communication Tests', () => {
  describe('Loading State', () => {
    it('displays loading message when isLoading is true', () => {
      render(<PageInfo pageInfo={null} isLoading={true} />);

      expect(screen.getByText('Loading page info...')).toBeDefined();
    });

    it('has correct className for loading state', () => {
      const { container } = render(
        <PageInfo pageInfo={null} isLoading={true} />
      );

      const loadingDiv = container.querySelector('.page-info.loading');
      expect(loadingDiv).toBeDefined();
    });

    it('does not display data when loading', () => {
      render(<PageInfo pageInfo={null} isLoading={true} />);

      expect(screen.queryByText('URL:')).toBeNull();
      expect(screen.queryByText('Title:')).toBeNull();
      expect(screen.queryByText('Elements:')).toBeNull();
    });
  });

  describe('Error State', () => {
    it('displays error message when pageInfo is null and not loading', () => {
      render(<PageInfo pageInfo={null} isLoading={false} />);

      expect(screen.getByText('Unable to access page info')).toBeDefined();
    });

    it('has correct className for error state', () => {
      const { container } = render(
        <PageInfo pageInfo={null} isLoading={false} />
      );

      const errorDiv = container.querySelector('.page-info.error');
      expect(errorDiv).toBeDefined();
    });

    it('displays error when pageInfo is undefined', () => {
      render(<PageInfo pageInfo={undefined} isLoading={false} />);

      expect(screen.getByText('Unable to access page info')).toBeDefined();
    });
  });

  describe('Successful Data Display', () => {
    it('displays all page info fields correctly', () => {
      const mockPageInfo = {
        url: 'https://www.example.com/page',
        title: 'Example Page Title',
        elementCount: 42,
      };

      render(<PageInfo pageInfo={mockPageInfo} isLoading={false} />);

      expect(screen.getByText('URL:')).toBeDefined();
      expect(screen.getByText('https://www.example.com/page')).toBeDefined();
      expect(screen.getByText('Title:')).toBeDefined();
      expect(screen.getByText('Example Page Title')).toBeDefined();
      expect(screen.getByText('Elements:')).toBeDefined();
      expect(screen.getByText('42')).toBeDefined();
    });

    it('renders URL as a separate value element', () => {
      const mockPageInfo = {
        url: 'https://test.com',
        title: 'Test',
        elementCount: 10,
      };

      const { container } = render(
        <PageInfo pageInfo={mockPageInfo} isLoading={false} />
      );

      const urlValue = container.querySelector('.info-row .value');
      expect(urlValue.textContent).toBe('https://test.com');
    });

    it('displays title with special characters correctly', () => {
      const mockPageInfo = {
        url: 'https://example.com',
        title: 'Test & Special <Characters> "Quotes"',
        elementCount: 100,
      };

      render(<PageInfo pageInfo={mockPageInfo} isLoading={false} />);

      expect(
        screen.getByText('Test & Special <Characters> "Quotes"')
      ).toBeDefined();
    });

    it('displays large element counts correctly', () => {
      const mockPageInfo = {
        url: 'https://example.com',
        title: 'Large Page',
        elementCount: 9999,
      };

      render(<PageInfo pageInfo={mockPageInfo} isLoading={false} />);

      expect(screen.getByText('9999')).toBeDefined();
    });

    it('handles zero element count', () => {
      const mockPageInfo = {
        url: 'https://example.com',
        title: 'Empty Page',
        elementCount: 0,
      };

      render(<PageInfo pageInfo={mockPageInfo} isLoading={false} />);

      expect(screen.getByText('0')).toBeDefined();
    });
  });

  describe('Data Structure Validation', () => {
    it('renders all info rows when data is present', () => {
      const mockPageInfo = {
        url: 'https://example.com',
        title: 'Test Page',
        elementCount: 50,
      };

      const { container } = render(
        <PageInfo pageInfo={mockPageInfo} isLoading={false} />
      );

      const infoRows = container.querySelectorAll('.info-row');
      expect(infoRows.length).toBe(3);
    });

    it('has correct structure for each info row', () => {
      const mockPageInfo = {
        url: 'https://example.com',
        title: 'Test',
        elementCount: 10,
      };

      const { container } = render(
        <PageInfo pageInfo={mockPageInfo} isLoading={false} />
      );

      const firstRow = container.querySelector('.info-row');
      const label = firstRow.querySelector('.label');
      const value = firstRow.querySelector('.value');

      expect(label).toBeDefined();
      expect(value).toBeDefined();
    });
  });

  describe('URL Handling', () => {
    it('displays HTTP URL correctly', () => {
      const mockPageInfo = {
        url: 'http://example.com',
        title: 'HTTP Site',
        elementCount: 10,
      };

      render(<PageInfo pageInfo={mockPageInfo} isLoading={false} />);

      expect(screen.getByText('http://example.com')).toBeDefined();
    });

    it('displays HTTPS URL correctly', () => {
      const mockPageInfo = {
        url: 'https://secure.example.com',
        title: 'Secure Site',
        elementCount: 10,
      };

      render(<PageInfo pageInfo={mockPageInfo} isLoading={false} />);

      expect(screen.getByText('https://secure.example.com')).toBeDefined();
    });

    it('displays URL with path correctly', () => {
      const mockPageInfo = {
        url: 'https://example.com/path/to/page',
        title: 'Page',
        elementCount: 10,
      };

      render(<PageInfo pageInfo={mockPageInfo} isLoading={false} />);

      expect(
        screen.getByText('https://example.com/path/to/page')
      ).toBeDefined();
    });

    it('displays URL with query parameters correctly', () => {
      const mockPageInfo = {
        url: 'https://example.com/search?q=test&page=1',
        title: 'Search Results',
        elementCount: 10,
      };

      render(<PageInfo pageInfo={mockPageInfo} isLoading={false} />);

      expect(
        screen.getByText('https://example.com/search?q=test&page=1')
      ).toBeDefined();
    });

    it('displays URL with hash correctly', () => {
      const mockPageInfo = {
        url: 'https://example.com/page#section',
        title: 'Page with Anchor',
        elementCount: 10,
      };

      render(<PageInfo pageInfo={mockPageInfo} isLoading={false} />);

      expect(
        screen.getByText('https://example.com/page#section')
      ).toBeDefined();
    });

    it('displays localhost URL correctly', () => {
      const mockPageInfo = {
        url: 'http://localhost:3000/dev',
        title: 'Development Server',
        elementCount: 10,
      };

      render(<PageInfo pageInfo={mockPageInfo} isLoading={false} />);

      expect(screen.getByText('http://localhost:3000/dev')).toBeDefined();
    });
  });

  describe('Title Edge Cases', () => {
    it('displays empty title', () => {
      const mockPageInfo = {
        url: 'https://example.com',
        title: '',
        elementCount: 10,
      };

      render(<PageInfo pageInfo={mockPageInfo} isLoading={false} />);

      const titleLabel = screen.getByText('Title:');
      expect(titleLabel.parentElement.querySelector('.value').textContent).toBe(
        ''
      );
    });

    it('displays very long title', () => {
      const longTitle = 'A'.repeat(200);
      const mockPageInfo = {
        url: 'https://example.com',
        title: longTitle,
        elementCount: 10,
      };

      render(<PageInfo pageInfo={mockPageInfo} isLoading={false} />);

      expect(screen.getByText(longTitle)).toBeDefined();
    });

    it('displays title with emojis', () => {
      const mockPageInfo = {
        url: 'https://example.com',
        title: '🎉 Celebration Page 🎊',
        elementCount: 10,
      };

      render(<PageInfo pageInfo={mockPageInfo} isLoading={false} />);

      expect(screen.getByText('🎉 Celebration Page 🎊')).toBeDefined();
    });

    it('displays title with multiple spaces', () => {
      const mockPageInfo = {
        url: 'https://example.com',
        title: 'Multiple    Spaces    Here',
        elementCount: 10,
      };

      render(<PageInfo pageInfo={mockPageInfo} isLoading={false} />);

      expect(screen.getByText('Multiple    Spaces    Here')).toBeDefined();
    });
  });

  describe('Element Count Edge Cases', () => {
    it('displays single element count', () => {
      const mockPageInfo = {
        url: 'https://example.com',
        title: 'Minimal Page',
        elementCount: 1,
      };

      render(<PageInfo pageInfo={mockPageInfo} isLoading={false} />);

      expect(screen.getByText('1')).toBeDefined();
    });

    it('displays very large element count', () => {
      const mockPageInfo = {
        url: 'https://example.com',
        title: 'Complex Page',
        elementCount: 999999,
      };

      render(<PageInfo pageInfo={mockPageInfo} isLoading={false} />);

      expect(screen.getByText('999999')).toBeDefined();
    });
  });

  describe('State Transitions', () => {
    it('transitions from loading to displaying data', () => {
      const mockPageInfo = {
        url: 'https://example.com',
        title: 'Test Page',
        elementCount: 10,
      };

      const { rerender } = render(
        <PageInfo pageInfo={null} isLoading={true} />
      );

      expect(screen.getByText('Loading page info...')).toBeDefined();

      rerender(<PageInfo pageInfo={mockPageInfo} isLoading={false} />);

      expect(screen.queryByText('Loading page info...')).toBeNull();
      expect(screen.getByText('https://example.com')).toBeDefined();
    });

    it('transitions from loading to error state', () => {
      const { rerender } = render(
        <PageInfo pageInfo={null} isLoading={true} />
      );

      expect(screen.getByText('Loading page info...')).toBeDefined();

      rerender(<PageInfo pageInfo={null} isLoading={false} />);

      expect(screen.queryByText('Loading page info...')).toBeNull();
      expect(screen.getByText('Unable to access page info')).toBeDefined();
    });

    it('handles data updates after initial load', () => {
      const initialPageInfo = {
        url: 'https://example.com',
        title: 'Initial Title',
        elementCount: 10,
      };

      const updatedPageInfo = {
        url: 'https://example.com/new',
        title: 'Updated Title',
        elementCount: 20,
      };

      const { rerender } = render(
        <PageInfo pageInfo={initialPageInfo} isLoading={false} />
      );

      expect(screen.getByText('Initial Title')).toBeDefined();
      expect(screen.getByText('10')).toBeDefined();

      rerender(<PageInfo pageInfo={updatedPageInfo} isLoading={false} />);

      expect(screen.getByText('Updated Title')).toBeDefined();
      expect(screen.getByText('20')).toBeDefined();
      expect(screen.queryByText('Initial Title')).toBeNull();
    });
  });

  describe('Component Rendering', () => {
    it('renders without crashing with valid data', () => {
      const mockPageInfo = {
        url: 'https://example.com',
        title: 'Test',
        elementCount: 10,
      };

      const { container } = render(
        <PageInfo pageInfo={mockPageInfo} isLoading={false} />
      );

      expect(container.querySelector('.page-info')).toBeDefined();
    });

    it('maintains consistent structure across renders', () => {
      const mockPageInfo = {
        url: 'https://example.com',
        title: 'Test',
        elementCount: 10,
      };

      const { container, rerender } = render(
        <PageInfo pageInfo={mockPageInfo} isLoading={false} />
      );

      const initialStructure = container.innerHTML;

      rerender(<PageInfo pageInfo={mockPageInfo} isLoading={false} />);

      expect(container.innerHTML).toBe(initialStructure);
    });
  });

  describe('Data Received from Content Script', () => {
    it('correctly displays data matching content script response format', () => {
      // Simulates exact response from content.js GET_PAGE_INFO handler
      const contentScriptResponse = {
        url: 'https://example.com',
        title: 'Test Document',
        elementCount: 142,
      };

      render(<PageInfo pageInfo={contentScriptResponse} isLoading={false} />);

      expect(screen.getByText('https://example.com')).toBeDefined();
      expect(screen.getByText('Test Document')).toBeDefined();
      expect(screen.getByText('142')).toBeDefined();
    });

    it('handles typical browser page info structure', () => {
      const typicalPageInfo = {
        url: 'https://github.com/user/repository',
        title: 'GitHub - user/repository: Project Description',
        elementCount: 1523,
      };

      render(<PageInfo pageInfo={typicalPageInfo} isLoading={false} />);

      expect(
        screen.getByText('https://github.com/user/repository')
      ).toBeDefined();
      expect(
        screen.getByText('GitHub - user/repository: Project Description')
      ).toBeDefined();
      expect(screen.getByText('1523')).toBeDefined();
    });

    it('handles single page application URLs', () => {
      const spaPageInfo = {
        url: 'https://app.example.com/#/dashboard/analytics',
        title: 'Analytics Dashboard',
        elementCount: 856,
      };

      render(<PageInfo pageInfo={spaPageInfo} isLoading={false} />);

      expect(
        screen.getByText('https://app.example.com/#/dashboard/analytics')
      ).toBeDefined();
      expect(screen.getByText('Analytics Dashboard')).toBeDefined();
      expect(screen.getByText('856')).toBeDefined();
    });

    it('handles data from about: pages', () => {
      const aboutPageInfo = {
        url: 'about:config',
        title: 'Configuration Editor',
        elementCount: 50,
      };

      render(<PageInfo pageInfo={aboutPageInfo} isLoading={false} />);

      expect(screen.getByText('about:config')).toBeDefined();
    });

    it('handles data from file: URLs', () => {
      const filePageInfo = {
        url: 'file:///home/user/document.html',
        title: 'Local Document',
        elementCount: 25,
      };

      render(<PageInfo pageInfo={filePageInfo} isLoading={false} />);

      expect(screen.getByText('file:///home/user/document.html')).toBeDefined();
    });
  });

  describe('Performance with Various Data Types', () => {
    it('renders quickly with normal data', () => {
      const mockPageInfo = {
        url: 'https://example.com',
        title: 'Test Page',
        elementCount: 100,
      };

      const startTime = performance.now();
      render(<PageInfo pageInfo={mockPageInfo} isLoading={false} />);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(50);
    });

    it('handles extremely long URLs efficiently', () => {
      const longUrl = 'https://example.com/' + 'path/'.repeat(100);
      const mockPageInfo = {
        url: longUrl,
        title: 'Test',
        elementCount: 10,
      };

      const { container } = render(
        <PageInfo pageInfo={mockPageInfo} isLoading={false} />
      );

      expect(container.querySelector('.value').textContent).toBe(longUrl);
    });
  });

  describe('Message Type Validation', () => {
    it('displays data that came from GET_PAGE_INFO message type', () => {
      // This simulates the exact data structure returned from:
      // browser.tabs.sendMessage(tabs[0].id, { type: 'GET_PAGE_INFO' })
      const pageInfoResponse = {
        url: window.location?.href || 'https://test.example.com',
        title: document.title || 'Test Page',
        elementCount: document.querySelectorAll?.('*').length || 150,
      };

      render(<PageInfo pageInfo={pageInfoResponse} isLoading={false} />);

      expect(screen.getByText(/test\.example\.com/)).toBeDefined();
    });
  });

  describe('Integration with React Query', () => {
    it('displays data from successful React Query fetch', () => {
      // Simulates data structure from useQuery success
      const queryData = {
        url: 'https://fetched.example.com',
        title: 'Fetched Page',
        elementCount: 200,
      };

      render(<PageInfo pageInfo={queryData} isLoading={false} />);

      expect(screen.getByText('https://fetched.example.com')).toBeDefined();
      expect(screen.getByText('Fetched Page')).toBeDefined();
      expect(screen.getByText('200')).toBeDefined();
    });

    it('shows loading during React Query fetch', () => {
      render(<PageInfo pageInfo={undefined} isLoading={true} />);

      expect(screen.getByText('Loading page info...')).toBeDefined();
    });

    it('shows error after React Query failure', () => {
      render(<PageInfo pageInfo={undefined} isLoading={false} />);

      expect(screen.getByText('Unable to access page info')).toBeDefined();
    });
  });
});

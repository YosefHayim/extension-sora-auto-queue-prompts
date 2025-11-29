import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../src/components/ui/tabs';

describe('Tabs', () => {
  it('should render tabs with default value', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    );

    expect(screen.getByText('Tab 1')).toBeInTheDocument();
    expect(screen.getByText('Tab 2')).toBeInTheDocument();
    expect(screen.getByText('Content 1')).toBeInTheDocument();
    expect(screen.queryByText('Content 2')).not.toBeInTheDocument();
  });

  it('should switch tabs when clicked', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    );

    const tab2 = screen.getByText('Tab 2');
    fireEvent.click(tab2);

    expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
    expect(screen.getByText('Content 2')).toBeInTheDocument();
  });

  it('should use controlled value when provided', () => {
    const { rerender } = render(
      <Tabs defaultValue="tab1" value="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    );

    expect(screen.getByText('Content 1')).toBeInTheDocument();

    rerender(
      <Tabs defaultValue="tab1" value="tab2">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    );

    expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
    expect(screen.getByText('Content 2')).toBeInTheDocument();
  });

  it('should call onValueChange when tab is clicked', () => {
    const handleValueChange = jest.fn();
    render(
      <Tabs defaultValue="tab1" onValueChange={handleValueChange}>
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    );

    const tab2 = screen.getByText('Tab 2');
    fireEvent.click(tab2);

    expect(handleValueChange).toHaveBeenCalledWith('tab2');
  });

  it('should call onClick handler on TabsTrigger', () => {
    const handleClick = jest.fn();
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1" onClick={handleClick}>Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
      </Tabs>
    );

    const tab1 = screen.getByText('Tab 1');
    fireEvent.click(tab1);

    expect(handleClick).toHaveBeenCalled();
  });

  it('should apply active styles to active tab', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    );

    const tab1 = screen.getByText('Tab 1');
    expect(tab1).toHaveClass('bg-background');
  });

  it('should apply className to Tabs component', () => {
    const { container } = render(
      <Tabs defaultValue="tab1" className="custom-class">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
      </Tabs>
    );

    const tabsContainer = container.firstChild;
    expect(tabsContainer).toHaveClass('custom-class');
  });

  it('should apply className to TabsList', () => {
    const { container } = render(
      <Tabs defaultValue="tab1">
        <TabsList className="custom-list-class">
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
      </Tabs>
    );

    const tabsList = container.querySelector('.custom-list-class');
    expect(tabsList).toBeInTheDocument();
  });

  it('should apply className to TabsTrigger', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1" className="custom-trigger-class">Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
      </Tabs>
    );

    const tab1 = screen.getByText('Tab 1');
    expect(tab1).toHaveClass('custom-trigger-class');
  });

  it('should apply className to TabsContent', () => {
    const { container } = render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1" className="custom-content-class">Content 1</TabsContent>
      </Tabs>
    );

    const content = container.querySelector('.custom-content-class');
    expect(content).toBeInTheDocument();
  });

  it('should render multiple tabs correctly', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          <TabsTrigger value="tab3">Tab 3</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
        <TabsContent value="tab3">Content 3</TabsContent>
      </Tabs>
    );

    expect(screen.getByText('Tab 1')).toBeInTheDocument();
    expect(screen.getByText('Tab 2')).toBeInTheDocument();
    expect(screen.getByText('Tab 3')).toBeInTheDocument();
    expect(screen.getByText('Content 1')).toBeInTheDocument();
  });
});


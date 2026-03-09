/// <reference types="@testing-library/jest-dom" />
import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import ServiceCard from './ServiceCard.svelte';
import type { Service } from '@cwygoda/service-catalog/domain';

describe('ServiceCard', () => {
  const baseService: Service = {
    id: 'test-service',
    name: 'Test Service',
    description: 'A test service description',
    type: 'web-service',
    lifecycle: 'active',
  };

  it('renders service name', () => {
    render(ServiceCard, { props: { service: baseService } });
    expect(screen.getByText('Test Service')).toBeInTheDocument();
  });

  it('renders service description', () => {
    render(ServiceCard, { props: { service: baseService } });
    expect(screen.getByText('A test service description')).toBeInTheDocument();
  });

  it('links to service detail page', () => {
    render(ServiceCard, { props: { service: baseService } });
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/services/test-service');
  });

  it('shows service type shield with tooltip', () => {
    render(ServiceCard, { props: { service: baseService } });
    expect(screen.getByTitle('Web Service')).toBeInTheDocument();
    expect(screen.getByRole('tooltip')).toHaveTextContent('Web Service');
  });

  it('shows lifecycle badge when not active', () => {
    const deprecatedService: Service = {
      ...baseService,
      lifecycle: 'deprecated',
    };
    render(ServiceCard, { props: { service: deprecatedService } });
    expect(screen.getByText('deprecated')).toBeInTheDocument();
  });

  it('does not show lifecycle badge when active', () => {
    render(ServiceCard, { props: { service: baseService } });
    expect(screen.queryByText('active')).not.toBeInTheDocument();
  });
});

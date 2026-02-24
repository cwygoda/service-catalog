/// <reference types="@testing-library/jest-dom" />
import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import ServiceCard from './ServiceCard.svelte';
import type { Service } from '@cwygoda/service-catalog-core/domain';

describe('ServiceCard', () => {
  const baseService: Service = {
    id: 'test-service',
    name: 'Test Service',
    description: 'A test service description',
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

  it('shows version badge when metadata has version', () => {
    const serviceWithVersion: Service = {
      ...baseService,
      metadata: { version: '1.2.3' },
    };
    render(ServiceCard, { props: { service: serviceWithVersion } });
    expect(screen.getByText('v1.2.3')).toBeInTheDocument();
  });

  it('does not show version badge when no metadata', () => {
    render(ServiceCard, { props: { service: baseService } });
    expect(screen.queryByText(/^v\d/)).not.toBeInTheDocument();
  });
});

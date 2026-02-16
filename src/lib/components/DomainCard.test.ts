/// <reference types="@testing-library/jest-dom" />
import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import DomainCard from './DomainCard.svelte';
import type { Domain } from '../../core/domain/index.js';

describe('DomainCard', () => {
  const baseDomain: Domain = {
    id: 'commerce',
    name: 'Commerce',
    description: 'E-commerce domain',
  };

  it('renders domain name', () => {
    render(DomainCard, { props: { domain: baseDomain, useCaseCount: 2, serviceCount: 3 } });
    expect(screen.getByText('Commerce')).toBeInTheDocument();
  });

  it('renders domain description', () => {
    render(DomainCard, { props: { domain: baseDomain, useCaseCount: 2, serviceCount: 3 } });
    expect(screen.getByText('E-commerce domain')).toBeInTheDocument();
  });

  it('links to domain detail page', () => {
    render(DomainCard, { props: { domain: baseDomain, useCaseCount: 2, serviceCount: 3 } });
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/domains/commerce');
  });

  it('shows use case count', () => {
    render(DomainCard, { props: { domain: baseDomain, useCaseCount: 2, serviceCount: 3 } });
    expect(screen.getByText('2 use cases')).toBeInTheDocument();
  });

  it('shows singular use case for count of 1', () => {
    render(DomainCard, { props: { domain: baseDomain, useCaseCount: 1, serviceCount: 3 } });
    expect(screen.getByText('1 use case')).toBeInTheDocument();
  });

  it('shows service count', () => {
    render(DomainCard, { props: { domain: baseDomain, useCaseCount: 2, serviceCount: 3 } });
    expect(screen.getByText('3 services')).toBeInTheDocument();
  });

  it('shows singular service for count of 1', () => {
    render(DomainCard, { props: { domain: baseDomain, useCaseCount: 2, serviceCount: 1 } });
    expect(screen.getByText('1 service')).toBeInTheDocument();
  });

  it('shows zero counts correctly', () => {
    render(DomainCard, { props: { domain: baseDomain, useCaseCount: 0, serviceCount: 0 } });
    expect(screen.getByText('0 use cases')).toBeInTheDocument();
    expect(screen.getByText('0 services')).toBeInTheDocument();
  });
});
